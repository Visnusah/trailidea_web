import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { CreatePostDTO, VoteDTO, FeedPaginationQueryDTO } from "../dtos/post.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { CreateCommentDTO } from "../dtos/comment.dto";
import { CommentMongoRepository } from "../repositories/comment.repository";

const postService = new PostService();
const commentRepo = new CommentMongoRepository();

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
     * Fetch paginated feed posts.
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
}
