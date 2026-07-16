import mongoose, { Schema, Document } from "mongoose";
import { CommentType } from "../types/comment.type";

export interface IComment extends CommentType, Document {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    postId: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentMongoSchema: Schema = new Schema<IComment>(
    {
        postId: { type: String, required: true },
        text: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
        timestamps: true, // createdAt and updatedAt
    }
);

// Index on postId to speed up comment retrieval for a post
CommentMongoSchema.index({ postId: 1, createdAt: -1 });

export const CommentModel = mongoose.model<IComment>(
    "Comment",
    CommentMongoSchema
);
