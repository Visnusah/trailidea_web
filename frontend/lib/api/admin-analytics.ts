import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

/* ── Type Definitions ── */

export interface OverviewStats {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    verifiedUsers: number;
    postsWithMap: number;
    adminCount: number;
    editedPosts: number;
    postsWithImages: number;
    totalUpvotes: number;
    totalDownvotes: number;
    newUsersThisMonth: number;
    newPostsThisMonth: number;
}

export interface WeeklyGrowthPoint {
    week: string;
    weekStart: string;
    count: number;
}

export interface GrowthData {
    userGrowth: WeeklyGrowthPoint[];
    postGrowth: WeeklyGrowthPoint[];
}

export interface WeeklyEngagementPoint {
    label: string;
    upvotes: number;
    downvotes: number;
    posts: number;
}

export interface SavedPost {
    _id: string;
    title: string;
    savedCount: number;
    upvoteCount: number;
    downvoteCount: number;
    createdAt: string;
    author: { username: string; firstName: string; lastName: string };
}

export interface EngagementData {
    weeklyEngagement: WeeklyEngagementPoint[];
    mostSavedPosts: SavedPost[];
}

export interface TopContributor {
    _id: string;
    postCount: number;
    totalUpvotes: number;
    followerCount: number;
    user: {
        firstName: string;
        lastName: string;
        username: string;
        imageUrl?: string;
        isVerified: boolean;
    };
}

export interface TerrainDataPoint {
    terrain: string;
    count: number;
}

export interface RecentSignup {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    imageUrl?: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
}

export interface ContentData {
    topContributors: TopContributor[];
    terrainDistribution: TerrainDataPoint[];
    recentSignups: RecentSignup[];
}

/* ── API Functions ── */

export const getAnalyticsOverview = async (): Promise<{ data: OverviewStats }> => {
    try {
        const res = await axiosInstance.get(API.ADMIN.ANALYTICS.OVERVIEW);
        return res.data;
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Failed to fetch overview analytics");
    }
};

export const getAnalyticsGrowth = async (): Promise<{ data: GrowthData }> => {
    try {
        const res = await axiosInstance.get(API.ADMIN.ANALYTICS.GROWTH);
        return res.data;
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Failed to fetch growth data");
    }
};

export const getAnalyticsEngagement = async (): Promise<{ data: EngagementData }> => {
    try {
        const res = await axiosInstance.get(API.ADMIN.ANALYTICS.ENGAGEMENT);
        return res.data;
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Failed to fetch engagement data");
    }
};

export const getAnalyticsContent = async (): Promise<{ data: ContentData }> => {
    try {
        const res = await axiosInstance.get(API.ADMIN.ANALYTICS.CONTENT);
        return res.data;
    } catch (err: any) {
        throw new Error(err?.response?.data?.message || "Failed to fetch content analytics");
    }
};
