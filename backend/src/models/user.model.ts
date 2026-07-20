import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.type";

export interface IUser extends UserType, Document {
    // can add mongo related attr
    _id: mongoose.Types.ObjectId;
    bio?: string;
    coverImageUrl?: string;
    preferredTerrains?: string[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    savedPosts: mongoose.Types.ObjectId[];
    isVerified: boolean;
    otpCode?: string;
    otpExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
const UserMongoSchema: Schema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        imageUrl: { type: String, required: false },
        bio: { type: String, required: false, maxlength: 160 },
        coverImageUrl: { type: String, required: false },
        preferredTerrains: { type: [String], default: [], validate: [(val: string[]) => val.length <= 4, "Maximum 4 terrain tags allowed"] },
        followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: Schema.Types.ObjectId, ref: "User" }],
        savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
        isVerified: { type: Boolean, default: false },
        otpCode: { type: String, required: false },
        otpExpiresAt: { type: Date, required: false },
    },
    {
        timestamps: true // createdAt and updatedAt will be automatically added and managed by mongoose
    }
)
export const UserModel = mongoose.model<IUser>
(
    "User", // db.users -> Model Name "User"
    UserMongoSchema
);