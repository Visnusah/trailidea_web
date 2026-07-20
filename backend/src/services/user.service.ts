import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDto } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bycryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { CLIENT_URL, SECRET_KEY } from "../configs/constant";
import { sendEmail, sendOTPEmail, sendPasswordResetEmail } from "../configs/email";

const userRepository = new UserMongoRepository();

export class UserService {
    async createUser(userData: CreateUserDTO): Promise<IUser> {
        // validation
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        const existingUsername = await userRepository.getUserByUsername(userData.username);
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }
        // hash password
        const hashedPassword = await bycryptjs.hash(userData.password, 10);
        userData.password = hashedPassword;

        // OTP Generation
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
        const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        const userToCreate = {
            ...userData,
            isVerified: false,
            otpCode,
            otpExpiresAt,
        };

        const user = await userRepository.createUser(userToCreate);

        // Send OTP asynchronously
        sendOTPEmail(user.email, otpCode).catch(console.error);

        return user;
    }

    async loginUser(loginData: LoginUserDTO){
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(400, "Invalid email");
        }
        if (!user.isVerified) {
            // Automatically resend OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 mins
            await userRepository.update(user._id.toString(), {
                otpCode,
                otpExpiresAt,
            });
            sendOTPEmail(user.email, otpCode).catch(console.error);

            throw new HttpException(403, "Please verify your email address to log in");
        }
        const isPasswordValid = await bycryptjs.compare(
            loginData.password,  // client password
            user.password // database password
        );
        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid password");
        }
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, // payload
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        return { user, token }
    }

    async updateUser(id: string, updateData: UpdateUserDto) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        if (updateData.email && updateData.email !== user.email) {
            const existingUserByEmail = await userRepository.getUserByEmail(updateData.email);
            if (existingUserByEmail) {
                throw new HttpException(400, "Email already exists");
            }
        }
        if (updateData.username && updateData.username !== user.username) {
            const existingUserByUsername = await userRepository.getUserByUsername(updateData.username);
            if (existingUserByUsername) {
                throw new HttpException(400, "Username already exists");
            }
        }
        if (updateData.password) {
            updateData.password = await bycryptjs.hash(updateData.password, 10);
        }
        const updatedUser = await userRepository.update(id, updateData);
        return updatedUser;
    }


    async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpException(400, "Email is required");
        }
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '15m' }); // 15 min expiry
        const resetLink = `${CLIENT_URL}/reset-password/${token}`;
        
        await sendPasswordResetEmail(user.email, resetLink);
        return { user, token };

    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpException(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, SECRET_KEY);
            const userId = decoded.id;
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new HttpException(404, "User not found");
            }
            const hashedPassword = await bycryptjs.hash(newPassword, 10);
            await userRepository.update(userId, { password: hashedPassword });
            return user;
        } catch (error) {
            throw new HttpException(400, "Invalid or expired token");
        }
    }

    async verifyOTP(email: string, otpCode: string) {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        if (user.isVerified) {
            throw new HttpException(400, "User is already verified");
        }
        if (user.otpCode !== otpCode) {
            throw new HttpException(400, "Invalid OTP code");
        }
        if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
            throw new HttpException(400, "OTP code has expired");
        }

        // Mark as verified and clear OTP fields
        const updatedUser = await userRepository.update(user._id.toString(), {
            isVerified: true,
            $unset: { otpCode: 1, otpExpiresAt: 1 }
        } as any);

        const token = jwt.sign(
            { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );

        return { user: updatedUser, token };
    }

    async resendOTP(email: string) {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        if (user.isVerified) {
            throw new HttpException(400, "User is already verified");
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 mins

        await userRepository.update(user._id.toString(), {
            otpCode,
            otpExpiresAt,
        });

        // Send asynchronously
        sendOTPEmail(user.email, otpCode).catch(console.error);

        return { message: "OTP resent successfully" };
    }
}

