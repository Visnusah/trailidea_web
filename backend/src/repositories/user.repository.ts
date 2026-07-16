import { UserModel, IUser } from "../models/user.model";
import { PostModel } from "../models/post.model";
import { CommentModel } from "../models/comment.model";

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    // 5 common mandatory methods for a repository
    createUser(user: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAll(): Promise<IUser[]>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
}

export class UserMongoRepository implements IUserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    }

    async findById(userId: string): Promise<IUser | null> {
        return await UserModel.findById(userId);
    }

    async getUserById(id: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ _id: id });
        return found;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ email });
        return found;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ username });
        return found;
    }
    async createUser(user: Partial<IUser>): Promise<IUser> {
        const created = await UserModel.create(user);
        return created;
    }
    async getAll(): Promise<IUser[]> {
        const found = await UserModel.find();
        return found;
    }
    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const updated = await UserModel.findByIdAndUpdate(id, user, { new: true });
        return updated;
    }
    async delete(id: string): Promise<boolean> {
        const deleted = await UserModel.findByIdAndDelete(id);
        return !!deleted;
    }

    /**
     * Paginated query with optional search across firstName, lastName, and email.
     */
    async getPaginated(
        page: number,
        limit: number,
        search?: string
    ): Promise<{ users: IUser[]; total: number }> {
        const query: Record<string, any> = {};

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i"); // case-insensitive
            query.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { username: regex },
            ];
        }

        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            UserModel.find(query)
                .select("-password") // never return hashed password in list
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            UserModel.countDocuments(query),
        ]);

        return { users, total };
    }

    /**
     * Toggle follow: add or remove target from current user's following,
     * and add/remove current user from target's followers.
     * Uses atomic $addToSet/$pull for thread safety.
     */
    async toggleFollow(
        targetUserId: string,
        currentUserId: string
    ): Promise<{ isFollowing: boolean }> {
        const currentUser = await UserModel.findById(currentUserId);
        if (!currentUser) throw new Error("Current user not found");

        const isCurrentlyFollowing = currentUser.following.some(
            (id) => id.toString() === targetUserId
        );

        if (isCurrentlyFollowing) {
            // Unfollow
            await UserModel.findByIdAndUpdate(currentUserId, {
                $pull: { following: targetUserId },
            });
            await UserModel.findByIdAndUpdate(targetUserId, {
                $pull: { followers: currentUserId },
            });
            return { isFollowing: false };
        } else {
            // Follow
            await UserModel.findByIdAndUpdate(currentUserId, {
                $addToSet: { following: targetUserId },
            });
            await UserModel.findByIdAndUpdate(targetUserId, {
                $addToSet: { followers: currentUserId },
            });
            return { isFollowing: true };
        }
    }

    /**
     * Toggle saving a post for a user.
     */
    async toggleSavePost(
        userId: string,
        postId: string
    ): Promise<{ isSaved: boolean }> {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        const isCurrentlySaved = user.savedPosts.some(
            (id) => id.toString() === postId
        );

        if (isCurrentlySaved) {
            await UserModel.findByIdAndUpdate(userId, {
                $pull: { savedPosts: postId },
            });
            return { isSaved: false };
        } else {
            await UserModel.findByIdAndUpdate(userId, {
                $addToSet: { savedPosts: postId },
            });
            return { isSaved: true };
        }
    }

    /**
     * Get a user's public profile by username.
     * Excludes password, populates follower/following counts.
     */
    async getProfileByUsername(username: string): Promise<IUser | null> {
        return UserModel.findOne({ username })
            .select("-password");
    }

    /**
     * Get saved posts for a user, populated with post + author data.
     */
    async getSavedPosts(userId: string): Promise<any[]> {
        const user = await UserModel.findById(userId)
            .populate({
                path: "savedPosts",
                populate: {
                    path: "author",
                    select: "firstName lastName username imageUrl",
                },
            });
        if (!user) return [];
        return user.savedPosts || [];
    }

    /**
     * Get posts authored by a specific user (paginated).
     */
    async getPostsByAuthor(
        authorId: string,
        page: number,
        limit: number
    ): Promise<{ posts: any[]; total: number }> {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            PostModel.find({ author: authorId })
                .populate("author", "firstName lastName username imageUrl")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            PostModel.countDocuments({ author: authorId }),
        ]);

        // Enrich each post with commentCount and latestComment
        const enrichedPosts = await Promise.all(
            posts.map(async (post) => {
                const postObj = post.toObject();
                const commentCount = await CommentModel.countDocuments({ postId: post._id.toString() });
                const latestComment = await CommentModel.findOne({ postId: post._id.toString() })
                    .populate("author", "firstName lastName username imageUrl")
                    .sort({ createdAt: -1 });
                return { ...postObj, commentCount, latestComment };
            })
        );

        return { posts: enrichedPosts, total };
    }
}