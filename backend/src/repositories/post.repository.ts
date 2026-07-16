import { PostModel, IPost } from "../models/post.model";

export interface IPostRepository {
    create(data: Partial<IPost>): Promise<IPost>;
    getById(id: string): Promise<IPost | null>;
    getPaginated(page: number, limit: number): Promise<{ posts: IPost[]; total: number }>;
    addVote(postId: string, userId: string, type: "upvote" | "downvote"): Promise<IPost | null>;
    removeVote(postId: string, userId: string, type: "upvote" | "downvote"): Promise<IPost | null>;
    delete(id: string): Promise<boolean>;
}

export class PostMongoRepository implements IPostRepository {
    async create(data: Partial<IPost>): Promise<IPost> {
        const post = await PostModel.create(data);
        // Populate author details before returning
        return post.populate("author", "firstName lastName username imageUrl");
    }

    async getById(id: string): Promise<IPost | null> {
        return PostModel.findById(id).populate(
            "author",
            "firstName lastName username imageUrl"
        );
    }

    /**
     * Paginated feed retrieval, sorted by newest first.
     * Populates author with safe fields only (no password).
     */
    async getPaginated(
        page: number,
        limit: number
    ): Promise<{ posts: IPost[]; total: number }> {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            PostModel.find()
                .populate("author", "firstName lastName username imageUrl")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            PostModel.countDocuments(),
        ]);

        return { posts, total };
    }

    /**
     * Atomically add a vote and remove from the opposite array.
     * Uses $addToSet to prevent duplicate votes and $pull to remove opposite vote.
     */
    async addVote(
        postId: string,
        userId: string,
        type: "upvote" | "downvote"
    ): Promise<IPost | null> {
        const addField = type === "upvote" ? "upvotes" : "downvotes";
        const removeField = type === "upvote" ? "downvotes" : "upvotes";

        return PostModel.findByIdAndUpdate(
            postId,
            {
                $addToSet: { [addField]: userId },
                $pull: { [removeField]: userId },
            },
            { new: true }
        ).populate("author", "firstName lastName username imageUrl");
    }

    /**
     * Atomically remove a vote from the specified array.
     */
    async removeVote(
        postId: string,
        userId: string,
        type: "upvote" | "downvote"
    ): Promise<IPost | null> {
        const field = type === "upvote" ? "upvotes" : "downvotes";

        return PostModel.findByIdAndUpdate(
            postId,
            { $pull: { [field]: userId } },
            { new: true }
        ).populate("author", "firstName lastName username imageUrl");
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await PostModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
