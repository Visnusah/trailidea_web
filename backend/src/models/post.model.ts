import mongoose, { Schema, Document } from "mongoose";
import { PostType } from "../types/post.type";

export interface IMapData {
    type?: "Point";
    coordinates?: number[]; // [longitude, latitude]
    placeName?: string;
}

export interface IPost extends PostType, Document {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
    isEdited: boolean;
    mapData?: IMapData;
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
        mapData: {
            type: { type: String, enum: ["Point"] },
            coordinates: { type: [Number], required: false },
            placeName: { type: String, required: false },
        },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        isEdited: { type: Boolean, default: false },
    },
    {
        timestamps: true, // createdAt and updatedAt will be automatically added and managed by mongoose
    }
);

// 2dsphere index for geo-spatial queries on mapData
PostMongoSchema.index({ mapData: "2dsphere" });

export const PostModel = mongoose.model<IPost>(
    "Post", // db.posts -> Model Name "Post"
    PostMongoSchema
);
