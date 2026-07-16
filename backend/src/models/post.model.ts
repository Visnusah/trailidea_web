import mongoose, { Schema, Document } from "mongoose";
import { PostType } from "../types/post.type";

export interface IPost extends PostType, Document {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const PostMongoSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        subtitle: { type: String, required: false },
        description: { type: String, required: true },
        imageUrls: { type: [String], default: [] },
        links: { type: [String], default: [] },
        mapData: { type: Schema.Types.Mixed, required: false },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    {
        timestamps: true, // createdAt and updatedAt will be automatically added and managed by mongoose
    }
);

export const PostModel = mongoose.model<IPost>(
    "Post", // db.posts -> Model Name "Post"
    PostMongoSchema
);
