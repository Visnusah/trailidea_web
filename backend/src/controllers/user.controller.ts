import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDto } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";
import { UserMongoRepository } from "../repositories/user.repository";

const userService = new UserService();
const userRepo = new UserMongoRepository();

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

            // Handle both single file and fields upload
            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            const profilePicFile = files?.["profile_pic"]?.[0];
            const coverPicFile = files?.["cover_pic"]?.[0];

            // Also handle legacy single file upload
            const singleFile = req.file;

            // Parse preferredTerrains from JSON string if sent via FormData
            let bodyToParse = { ...req.body };
            if (bodyToParse.preferredTerrains && typeof bodyToParse.preferredTerrains === "string") {
                try {
                    bodyToParse.preferredTerrains = JSON.parse(bodyToParse.preferredTerrains);
                } catch {
                    bodyToParse.preferredTerrains = [];
                }
            }

            const parseResult = UpdateUserDto.safeParse(bodyToParse);
            if (!parseResult.success) {
                return ApiResponseHelper.error(
                    res,
                    parseResult.error.errors.map(e => e.message).join(", "),
                    400
                );
            }

            const updateData: any = {
                ...parseResult.data,
            };

            // Set profile pic URL
            const profilePicFilename = profilePicFile?.filename || singleFile?.filename;
            if (profilePicFilename) {
                updateData.imageUrl = "/uploads/" + profilePicFilename;
            }

            // Set cover pic URL
            if (coverPicFile?.filename) {
                updateData.coverImageUrl = "/uploads/" + coverPicFile.filename;
            }

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

    /**
     * POST /api/v1/auth/users/:id/follow
     * Toggle follow/unfollow a user.
     */
    async toggleFollow(req: Request, res: Response) {
        try {
            const currentUserId = req.user?._id?.toString();
            if (!currentUserId) {
                throw new HttpException(401, "Unauthorized");
            }
            const { id: targetUserId } = req.params;
            if (currentUserId === targetUserId) {
                throw new HttpException(400, "You cannot follow yourself");
            }
            const result = await userRepo.toggleFollow(targetUserId, currentUserId);
            return ApiResponseHelper.success(
                res,
                result,
                result.isFollowing ? "Followed successfully" : "Unfollowed successfully"
            );
        } catch (e: any) {
            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to toggle follow",
                e.status || 500
            );
        }
    }

    /**
     * GET /api/v1/auth/users/profile/:username
     * Get public profile by username, along with their posts.
     */
    async getPublicProfile(req: Request, res: Response) {
        try {
            const { username } = req.params;
            const profile = await userRepo.getProfileByUsername(username);
            if (!profile) {
                throw new HttpException(404, "User not found");
            }

            // Also fetch the user's posts
            const { posts, total } = await userRepo.getPostsByAuthor(
                profile._id.toString(),
                1,
                20
            );

            return ApiResponseHelper.success(res, {
                user: profile,
                posts,
                totalPosts: total,
                followersCount: profile.followers?.length || 0,
                followingCount: profile.following?.length || 0,
            }, "Profile fetched successfully");
        } catch (e: any) {
            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to fetch profile",
                e.status || 500
            );
        }
    }

    /**
     * GET /api/v1/auth/users/me/saved
     * Get authenticated user's saved posts.
     */
    async getSavedPosts(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }
            const savedPosts = await userRepo.getSavedPosts(userId);
            return ApiResponseHelper.success(res, savedPosts, "Saved posts fetched successfully");
        } catch (e: any) {
            return ApiResponseHelper.error(
                res,
                e?.message || "Failed to fetch saved posts",
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
