import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

/* ── Type Definitions ── */

export interface PostAuthor {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    imageUrl?: string;
}

export interface CommentRecord {
    _id: string;
    postId: string;
    text: string;
    author: PostAuthor;
    createdAt: string;
    updatedAt: string;
}

export interface PostRecord {
    _id: string;
    title: string;
    subtitle?: string;
    description: string;
    imageUrls: string[];
    links: string[];
    mapData?: any;
    author: PostAuthor;
    upvotes: string[];
    downvotes: string[];
    commentCount: number;
    latestComment: CommentRecord | null;
    isEdited?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface FeedResponse {
    success: boolean;
    message: string;
    data: PostRecord[];
    meta: PaginationMeta;
}

export interface FeedParams {
    page?: number;
    limit?: number;
}

export interface VoteResponse {
    success: boolean;
    message: string;
    data: {
        post: PostRecord;
        upvoteCount: number;
        downvoteCount: number;
    };
}

/* ── API Functions ── */

/** POST /api/v1/posts — Create a new post (multipart/form-data) */
export const createPost = async (formData: FormData): Promise<{ data: PostRecord }> => {
    try {
        const response = await axiosInstance.post(API.POSTS.CREATE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create post");
    }
};

/** GET /api/v1/posts?page=1&limit=10 — Fetch paginated feed */
export const getFeed = async (params: FeedParams = {}): Promise<FeedResponse> => {
    try {
        const response = await axiosInstance.get(API.POSTS.FEED, { params });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch feed");
    }
};

/** POST /api/v1/posts/:id/vote — Toggle upvote/downvote */
export const toggleVote = async (
    postId: string,
    type: "upvote" | "downvote"
): Promise<VoteResponse> => {
    try {
        const response = await axiosInstance.post(API.POSTS.VOTE(postId), { type });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to vote");
    }
};

/** GET /api/v1/posts/:id/comments — Fetch comments */
export const getComments = async (postId: string): Promise<{ data: CommentRecord[] }> => {
    try {
        const response = await axiosInstance.get(API.POSTS.COMMENTS(postId));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch comments");
    }
};

/** POST /api/v1/posts/:id/comments — Add a comment */
export const createComment = async (postId: string, text: string): Promise<{ data: CommentRecord }> => {
    try {
        const response = await axiosInstance.post(API.POSTS.COMMENTS(postId), { text });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to add comment");
    }
};

/** POST /api/v1/posts/:id/save — Toggle save/unsave */
export const toggleSavePost = async (postId: string): Promise<{ data: { isSaved: boolean } }> => {
    try {
        const response = await axiosInstance.post(API.POSTS.SAVE(postId));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to toggle save");
    }
};

/** PUT /api/v1/posts/:id — Edit a post */
export const updatePost = async (
    postId: string,
    formData: FormData
): Promise<{ data: PostRecord }> => {
    try {
        const response = await axiosInstance.put(API.POSTS.UPDATE(postId), formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update post");
    }
};

export const deletePost = async (postId: string) => {
    const response = await axiosInstance.delete(`/api/v1/posts/${postId}`);
    return response.data;
};
