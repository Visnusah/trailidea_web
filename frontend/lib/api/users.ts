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

/** GET /api/v1/auth/users/me/saved — Get saved posts */
export const getSavedPosts = async (): Promise<{ data: PostRecord[] }> => {
    try {
        const response = await axiosInstance.get(API.USERS.SAVED_POSTS);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch saved posts");
    }
};
