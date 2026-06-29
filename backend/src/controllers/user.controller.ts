import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDto } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";
const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, userData.error.errors.map(e => e.message).join(", "), 400);
            }
            const user = await userService.createUser(userData.data);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
    
    async loginUser(req: Request, res: Response) {
        try{
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper
                    .error(res, parsedData.error.errors.map(e => e.message).join(", "), 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        }catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }
            const filename = req.file?.filename;
            const parseResult = UpdateUserDto.safeParse(req.body);
            if (!parseResult.success) {
                return ApiResponseHelper.error(
                    res,
                    parseResult.error.errors.map(e => e.message).join(", "),
                    400
                );
            }
            const updateData = {
                ...parseResult.data,
                ...(filename && { imageUrl: "/uploads/" + filename })
            };
            const updatedUser = await userService.updateUser(userId, updateData);
            return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        } catch (e: any) {
            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to update user",
                e.status || 500
            );
        }
    }

    async whoami(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                throw new HttpException(401, "Unauthorized");
            }
            return ApiResponseHelper.success(res, user, "User info retrieved");
        } catch (e: any) {
            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to get user info",
                e.status || 500
            );
        }
    }


    async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const email = req.body.email;
            // can be replaced with DTO
            if (!email) {
                throw new HttpException(400, "Email is required");
            }
            const { token, user } = await userService.sendResetPasswordEmail(email);
            return ApiResponseHelper.success(res,
                { token, user }, "Reset password email sent successfully", 200);
        } catch (error: Error | any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
    async resetPassword(req: Request, res: Response) {
        try {
            const token = req.params.token as string;
            const { newPassword } = req.body;
            // can be replaced with DTO
            if (!token || !newPassword) {
                throw new HttpException(400, "Token and new password are required");
            }
            const updatedUser = await userService.resetPassword(token, newPassword);
            return ApiResponseHelper.success(res, updatedUser, "Password reset successfully", 200);
        } catch (error: Error | any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
