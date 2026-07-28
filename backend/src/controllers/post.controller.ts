import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { CreatePostDTO, VoteDTO, FeedPaginationQueryDTO, EditPostDTO } from "../dtos/post.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { CreateCommentDTO } from "../dtos/comment.dto";
import { CommentMongoRepository } from "../repositories/comment.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { PostMongoRepository } from "../repositories/post.repository";

const postService = new PostService();
const commentRepo = new CommentMongoRepository();
const userRepo = new UserMongoRepository();
const postRepo = new PostMongoRepository();

export class PostController {
    /**
     * POST /api/v1/posts
     * Create a new post with optional image uploads.
     * Expects multipart/form-data with fields + images.
     */
    async createPost(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }

            // Parse and validate text fields
            // Handle links: parse JSON string if sent as string from FormData
            let linksArray: string[] = [];
            if (req.body.links) {
                try {
                    linksArray = typeof req.body.links === "string"
                        ? JSON.parse(req.body.links)
                        : req.body.links;
                } catch {
                    linksArray = [];
                }
            }

            const bodyToParse = {
                ...req.body,
                links: linksArray,
            };

            // Parse mapData from JSON string (sent via FormData)
            if (bodyToParse.mapData && typeof bodyToParse.mapData === "string") {
                try {
                    bodyToParse.mapData = JSON.parse(bodyToParse.mapData);
                } catch {
                    delete bodyToParse.mapData;
                }
            }

            const parsed = CreatePostDTO.safeParse(bodyToParse);
            if (!parsed.success) {
                return ApiResponseHelper.error(
                    res,
                    parsed.error.errors.map((e) => e.message).join(", "),
                    400
                );
            }

            // Extract uploaded file paths
            const files = req.files as Express.Multer.File[] | undefined;
            const imageUrls = files
                ? files.map((file) => "/uploads/" + file.filename)
                : [];

            const post = await postService.createPost(userId, parsed.data, imageUrls);
            return ApiResponseHelper.success(res, post, "Post created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * GET /api/v1/posts?page=1&limit=10
     * Fetch paginated feed posts (enriched with commentCount and latestComment).
     */
    async getFeed(req: Request, res: Response) {
        try {
            const queryParse = FeedPaginationQueryDTO.safeParse(req.query);
            if (!queryParse.success) {
                return ApiResponseHelper.error(
                    res,
                    queryParse.error.errors.map((e) => e.message).join(", "),
                    400
                );
            }

            const { page, limit } = queryParse.data;
            const { posts, total, totalPages } = await postService.getFeed(page, limit);

            return ApiResponseHelper.success(
                res,
                posts,
                "Feed fetched successfully",
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
     * POST /api/v1/posts/:id/vote
     * Toggle upvote/downvote on a post.
     */
    async vote(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }

            const { id } = req.params;
            const parsed = VoteDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(
                    res,
                    parsed.error.errors.map((e) => e.message).join(", "),
                    400
                );
            }

            const result = await postService.toggleVote(id, userId, parsed.data.type);
            return ApiResponseHelper.success(res, result, "Vote updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * POST /api/v1/posts/:id/save
     * Toggle saving a post.
     */
    async toggleSavePost(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }
            const { id } = req.params;
            const result = await userRepo.toggleSavePost(userId, id);
            return ApiResponseHelper.success(
                res,
                result,
                result.isSaved ? "Post saved" : "Post unsaved"
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
     * POST /api/v1/posts/:id/comments
     * Add a comment to a post
     */
    async addComment(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }

            const { id } = req.params; // postId
            const parsed = CreateCommentDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(
                    res,
                    parsed.error.errors.map((e) => e.message).join(", "),
                    400
                );
            }

            const comment = await commentRepo.create({
                postId: id,
                author: userId as any,
                text: parsed.data.text,
            });

            return ApiResponseHelper.success(res, comment, "Comment added successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * DELETE /api/v1/posts/:id
     * Securely delete a post.
     */
    async deletePost(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            const userRole = req.user?.role;
            if (!userId || !userRole) {
                throw new HttpException(401, "Unauthorized");
            }

            const { id } = req.params;

            await postService.deletePost(id, userId, userRole);

            return ApiResponseHelper.success(res, null, "Post deleted successfully", 200);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * GET /api/v1/posts/:id/comments
     * Fetch all comments for a post
     */
    async getComments(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const comments = await commentRepo.getByPostId(id);

            return ApiResponseHelper.success(res, comments, "Comments fetched successfully", 200);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * DELETE /api/v1/posts/:id/comments/:commentId
     * Securely delete a comment.
     */
    async deleteComment(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }

            const { id: postId, commentId } = req.params;

            const comment = await commentRepo.getById(commentId);
            if (!comment) {
                throw new HttpException(404, "Comment not found");
            }

            const post = await postRepo.getById(postId);
            if (!post) {
                throw new HttpException(404, "Post not found");
            }

            const isCommentAuthor = comment.author.toString() === userId;
            const isPostOwner = post.author._id.toString() === userId;
            const isAdmin = req.user?.role === "admin";

            if (!isCommentAuthor && !isPostOwner && !isAdmin) {
                throw new HttpException(403, "You are not authorized to delete this comment");
            }

            await commentRepo.delete(commentId);

            return ApiResponseHelper.success(res, null, "Comment deleted successfully", 200);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * PUT /api/v1/posts/:id
     * Edit a post. Supports text and image addition, deletion, and rearrangement.
     */
    async editPost(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new HttpException(401, "Unauthorized");
            }

            const { id } = req.params;
            const existingPost = await postRepo.getById(id);
            if (!existingPost) {
                throw new HttpException(404, "Post not found");
            }

            if (existingPost.author._id.toString() !== userId) {
                throw new HttpException(403, "Forbidden: You are not the author of this post");
            }

            // Parse links and other body arrays
            let linksArray: string[] = [];
            if (req.body.links) {
                try {
                    linksArray = typeof req.body.links === "string"
                        ? JSON.parse(req.body.links)
                        : req.body.links;
                } catch {
                    linksArray = [];
                }
            }

            const bodyToParse = {
                ...req.body,
                links: linksArray,
            };

            // Parse mapData from JSON string (sent via FormData)
            if (bodyToParse.mapData && typeof bodyToParse.mapData === "string") {
                try {
                    bodyToParse.mapData = JSON.parse(bodyToParse.mapData);
                } catch {
                    delete bodyToParse.mapData;
                }
            }

            const parsed = EditPostDTO.safeParse(bodyToParse);
            if (!parsed.success) {
                return ApiResponseHelper.error(
                    res,
                    parsed.error.errors.map((e) => e.message).join(", "),
                    400
                );
            }

            // Handle image order/rearrangement
            let imageUrls = existingPost.imageUrls || [];
            
            // Extract uploaded files
            const files = req.files as Express.Multer.File[] | undefined;
            const newUploads = files ? files.map((file) => "/uploads/" + file.filename) : [];

            if (parsed.data.imageOrder) {
                try {
                    const order = JSON.parse(parsed.data.imageOrder) as string[];
                    // Map order array: replace "new_i" with the i-th uploaded file path
                    imageUrls = order.map((item) => {
                        if (item.startsWith("new_")) {
                            const index = parseInt(item.split("_")[1], 10);
                            return newUploads[index] || "";
                        }
                        return item;
                    }).filter((url) => url !== "");
                } catch (e) {
                    imageUrls = [...imageUrls, ...newUploads];
                }
            } else {
                imageUrls = [...imageUrls, ...newUploads];
            }

            const updatedFields: any = {
                ...parsed.data,
                imageUrls,
                isEdited: true,
            };
            delete updatedFields.imageOrder;

            const updatedPost = await postRepo.update(id, updatedFields);
            return ApiResponseHelper.success(res, updatedPost, "Post updated successfully", 200);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
