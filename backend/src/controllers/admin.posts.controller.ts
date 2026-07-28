import { Request, Response } from "express";
import { PostModel } from "../models/post.model";
import { CommentModel } from "../models/comment.model";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

export class AdminPostsController {
    /**
     * GET /api/v1/admin/posts
     * Paginated list of all posts with author info, upvote/downvote/comment counts.
     * Query params: page, limit, search (by title), filter (all|map|images|edited)
     */
    async listPosts(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
            const search = ((req.query.search as string) || "").trim();
            const filter = (req.query.filter as string) || "all";
            const skip = (page - 1) * limit;

            // Build match stage
            const matchStage: Record<string, any> = {};
            if (search) {
                matchStage.title = { $regex: search, $options: "i" };
            }
            if (filter === "map") {
                matchStage["mapData.coordinates"] = { $exists: true, $not: { $size: 0 } };
            } else if (filter === "images") {
                matchStage.imageUrls = { $not: { $size: 0 } };
            } else if (filter === "edited") {
                matchStage.isEdited = true;
            }

            const [posts, total] = await Promise.all([
                PostModel.aggregate([
                    { $match: matchStage },
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "users",
                            localField: "author",
                            foreignField: "_id",
                            as: "authorData",
                        },
                    },
                    {
                        $unwind: {
                            path: "$authorData",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "postId",
                            as: "comments",
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            description: 1,
                            imageUrls: 1,
                            isEdited: 1,
                            createdAt: 1,
                            upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
                            downvoteCount: { $size: { $ifNull: ["$downvotes", []] } },
                            commentCount: { $size: "$comments" },
                            hasMap: {
                                $cond: [
                                    {
                                        $and: [
                                            { $ifNull: ["$mapData.coordinates", false] },
                                            { $gt: [{ $size: { $ifNull: ["$mapData.coordinates", []] } }, 0] },
                                        ],
                                    },
                                    true,
                                    false,
                                ],
                            },
                            "author._id": "$authorData._id",
                            "author.firstName": "$authorData.firstName",
                            "author.lastName": "$authorData.lastName",
                            "author.username": "$authorData.username",
                            "author.imageUrl": "$authorData.imageUrl",
                        },
                    },
                ]),
                PostModel.countDocuments(matchStage),
            ]);

            const totalPages = Math.ceil(total / limit);
            return ApiResponseHelper.success(
                res,
                posts,
                "Posts fetched successfully",
                200,
                { page, limit, total, totalPages }
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * DELETE /api/v1/admin/posts/:id
     * Admin force-delete any post and its comments.
     */
    async deletePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const post = await PostModel.findById(id);
            if (!post) {
                throw new HttpException(404, "Post not found");
            }

            // Delete all comments for this post and the post itself in parallel
            await Promise.all([
                CommentModel.deleteMany({ postId: id }),
                PostModel.findByIdAndDelete(id),
            ]);

            return ApiResponseHelper.success(res, null, "Post and its comments deleted successfully", 200);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
