import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

/* ── Type Definitions ── */

export interface AdminPostAuthor {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    imageUrl?: string;
}

export interface AdminPostRecord {
    _id: string;
    title: string;
    description: string;
    imageUrls: string[];
    isEdited: boolean;
    hasMap: boolean;
    upvoteCount: number;
    downvoteCount: number;
    commentCount: number;
    createdAt: string;
    author: AdminPostAuthor;
}

export interface AdminPostPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminPostsResponse {
    success: boolean;
    message: string;
    data: AdminPostRecord[];
    meta: AdminPostPaginationMeta;
}

export interface AdminPostsParams {
    page?: number;
    limit?: number;
    search?: string;
    filter?: "all" | "map" | "images" | "edited";
}

/* ── API Functions ── */

export const getAdminPosts = async (params: AdminPostsParams = {}): Promise<AdminPostsResponse> => {
    try {
        const res = await axiosInstance.get(API.ADMIN.POSTS.GET, { params });
        return res.data;
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Failed to fetch posts");
    }
};

export const deleteAdminPost = async (postId: string): Promise<void> => {
    try {
        await axiosInstance.delete(API.ADMIN.POSTS.DELETE(postId));
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Failed to delete post");
    }
};
