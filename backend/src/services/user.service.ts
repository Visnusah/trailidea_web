import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDto } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bycryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { CLIENT_URL, SECRET_KEY } from "../configs/constant";
import { sendEmail } from "../configs/email";

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
        const user = await userRepository.createUser(userData);
        return user;
    }

    async loginUser(loginData: LoginUserDTO){
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(400, "Invalid email");
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
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
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
}

