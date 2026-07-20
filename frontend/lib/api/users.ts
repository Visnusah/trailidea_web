import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { PostRecord, PostAuthor } from "./posts";

/* ── Type Definitions ── */

export interface UserProfile {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    imageUrl?: string;
    bio?: string;
    coverImageUrl?: string;
    preferredTerrains?: string[];
    followers: string[];
    following: string[];
    savedPosts: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProfileResponse {
    success: boolean;
    message: string;
    data: {
        user: UserProfile;
        posts: PostRecord[];
        totalPosts: number;
        followersCount: number;
        followingCount: number;
    };
}

/* ── API Functions ── */

/** POST /api/v1/auth/users/:id/follow — Toggle follow/unfollow */
export const toggleFollow = async (userId: string): Promise<{ data: { isFollowing: boolean } }> => {
    try {
        const response = await axiosInstance.post(API.USERS.FOLLOW(userId));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to toggle follow");
    }
};

/** GET /api/v1/auth/users/profile/:username — Get public profile */
export const getPublicProfile = async (username: string): Promise<ProfileResponse> => {
    try {
        const response = await axiosInstance.get(API.USERS.PROFILE(username));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch profile");
    }
};

export const getSavedPosts = async (): Promise<{ data: PostRecord[] }> => {
    try {
        const response = await axiosInstance.get(API.USERS.SAVED_POSTS);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch saved posts");
    }
};

/** GET /api/v1/auth/users/:id/followers — Get populated followers list */
export const getFollowers = async (userId: string): Promise<{ data: UserProfile[] }> => {
    try {
        const response = await axiosInstance.get(API.USERS.FOLLOWERS(userId));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch followers");
    }
};

/** GET /api/v1/auth/users/:id/following — Get populated following list */
export const getFollowing = async (userId: string): Promise<{ data: UserProfile[] }> => {
    try {
        const response = await axiosInstance.get(API.USERS.FOLLOWING(userId));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch following");
    }
};

/** GET /api/v1/dashboard/sidebar — Get dashboard sidebar data */
export const getSidebarData = async (): Promise<{
    data: {
        trendingPosts: (PostRecord & { upvoteCount: number; engagement: number })[];
        whoToFollow: (UserProfile & { followerCount: number })[];
    };
}> => {
    try {
        const response = await axiosInstance.get(API.DASHBOARD.SIDEBAR);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch sidebar data");
    }
};
