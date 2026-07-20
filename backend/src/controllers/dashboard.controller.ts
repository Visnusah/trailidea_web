import { Request, Response } from "express";
import mongoose from "mongoose";
import { PostModel } from "../models/post.model";
import { UserModel } from "../models/user.model";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

export class DashboardController {
    /**
     * GET /api/v1/dashboard/sidebar
     * Returns aggregated sidebar data:
     * - trendingPosts: Top 5 posts by upvote count from the past 7 days
     * - whoToFollow: 5 users with highest followers that the current user doesn't follow
     */
    async getSidebar(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }

            // ── Trending Posts: top 5 by upvote count from last 7 days ──
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const trendingPosts = await PostModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sevenDaysAgo },
                    },
                },
                {
                    $addFields: {
                        upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
                        downvoteCount: { $size: { $ifNull: ["$downvotes", []] } },
                        engagement: {
                            $subtract: [
                                { $size: { $ifNull: ["$upvotes", []] } },
                                { $size: { $ifNull: ["$downvotes", []] } },
                            ],
                        },
                    },
                },
                { $sort: { engagement: -1, createdAt: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "users",
                        localField: "author",
                        foreignField: "_id",
                        as: "authorData",
                    },
                },
                { $unwind: "$authorData" },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        imageUrls: 1,
                        upvoteCount: 1,
                        engagement: 1,
                        createdAt: 1,
                        "author._id": "$authorData._id",
                        "author.firstName": "$authorData.firstName",
                        "author.lastName": "$authorData.lastName",
                        "author.username": "$authorData.username",
                        "author.imageUrl": "$authorData.imageUrl",
                    },
                },
            ]);

            // ── Who to Follow: 5 users with most followers that current user doesn't follow ──
            const currentUser = await UserModel.findById(userId).select("following");
            const followingIds = currentUser?.following?.map((id) => id.toString()) || [];
            // Also exclude self
            const excludeIds = [...followingIds, userId];

            const whoToFollow = await UserModel.aggregate([
                {
                    $match: {
                        _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
                    },
                },
                {
                    $addFields: {
                        followerCount: { $size: { $ifNull: ["$followers", []] } },
                    },
                },
                { $sort: { followerCount: -1, createdAt: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        username: 1,
                        imageUrl: 1,
                        bio: 1,
                        followerCount: 1,
                    },
                },
            ]);

            return ApiResponseHelper.success(
                res,
                { trendingPosts, whoToFollow },
                "Sidebar data fetched successfully",
                200
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
