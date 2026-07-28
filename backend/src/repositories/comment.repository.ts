import { CommentModel, IComment } from "../models/comment.model";

export interface ICommentRepository {
    create(data: Partial<IComment>): Promise<IComment>;
    getByPostId(postId: string): Promise<IComment[]>;
    delete(id: string): Promise<boolean>;
    getById(id: string): Promise<IComment | null>;
}

export class CommentMongoRepository implements ICommentRepository {
    async create(data: Partial<IComment>): Promise<IComment> {
        const comment = await CommentModel.create(data);
        return comment.populate("author", "firstName lastName username imageUrl");
    }

    async getByPostId(postId: string): Promise<IComment[]> {
        return CommentModel.find({ postId })
            .populate("author", "firstName lastName username imageUrl")
            .sort({ createdAt: 1 }); // Oldest first (chronological order)
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await CommentModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getById(id: string): Promise<IComment | null> {
        return CommentModel.findById(id);
    }
}
