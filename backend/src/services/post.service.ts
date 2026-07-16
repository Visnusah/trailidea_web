import { PostMongoRepository } from "../repositories/post.repository";
import { CreatePostDTO } from "../dtos/post.dto";
import { IPost } from "../models/post.model";
import { HttpException } from "../exceptions/http-exception";

const postRepository = new PostMongoRepository();

export class PostService {
    /**
     * Create a new post with author assignment and image URLs.
     */
    async createPost(
        authorId: string,
        data: CreatePostDTO,
        imageUrls: string[]
    ): Promise<IPost> {
        const post = await postRepository.create({
            ...data,
            imageUrls,
            author: authorId as any, // ObjectId is cast by Mongoose
        });
        return post;
    }

    /**
     * Fetch paginated feed posts with totalPages calculation.
     */
    async getFeed(
        page: number,
        limit: number
    ): Promise<{ posts: IPost[]; total: number; totalPages: number }> {
        const { posts, total } = await postRepository.getPaginated(page, limit);
        const totalPages = Math.ceil(total / limit);
        return { posts, total, totalPages };
    }

    /**
     * Toggle vote on a post.
     * If user already voted the same type → remove the vote (un-vote).
     * If user voted opposite or hasn't voted → add vote (and remove opposite).
     * Returns updated post with vote counts.
     */
    async toggleVote(
        postId: string,
        userId: string,
        type: "upvote" | "downvote"
    ): Promise<{ post: IPost; upvoteCount: number; downvoteCount: number }> {
        // Fetch current post to check existing vote state
        const existingPost = await postRepository.getById(postId);
        if (!existingPost) {
            throw new HttpException(404, "Post not found");
        }

        const userIdStr = userId.toString();
        const alreadyVotedSameType =
            type === "upvote"
                ? existingPost.upvotes.some((id) => id.toString() === userIdStr)
                : existingPost.downvotes.some((id) => id.toString() === userIdStr);

        let updatedPost: IPost | null;

        if (alreadyVotedSameType) {
            // User is un-voting (clicking same button again)
            updatedPost = await postRepository.removeVote(postId, userId, type);
        } else {
            // User is voting (new vote or switching from opposite)
            updatedPost = await postRepository.addVote(postId, userId, type);
        }

        if (!updatedPost) {
            throw new HttpException(500, "Failed to update vote");
        }

        return {
            post: updatedPost,
            upvoteCount: updatedPost.upvotes.length,
            downvoteCount: updatedPost.downvotes.length,
        };
    }
}
