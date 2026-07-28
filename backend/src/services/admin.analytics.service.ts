import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { PostModel } from "../models/post.model";
import { CommentModel } from "../models/comment.model";

export class AdminAnalyticsService {
    /**
     * Overview KPI cards — single aggregation pass across all collections.
     */
    async getOverview() {
        const [
            totalUsers,
            totalPosts,
            totalComments,
            verifiedUsers,
            postsWithMap,
            adminCount,
            editedPosts,
            postsWithImages,
        ] = await Promise.all([
            UserModel.countDocuments(),
            PostModel.countDocuments(),
            CommentModel.countDocuments(),
            UserModel.countDocuments({ isVerified: true }),
            PostModel.countDocuments({
                "mapData.coordinates": { $exists: true, $ne: [] },
            }),
            UserModel.countDocuments({ role: "admin" }),
            PostModel.countDocuments({ isEdited: true }),
            PostModel.countDocuments({ imageUrls: { $not: { $size: 0 } } }),
        ]);

        // Upvote & downvote totals
        const voteStats = await PostModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalUpvotes: { $sum: { $size: { $ifNull: ["$upvotes", []] } } },
                    totalDownvotes: { $sum: { $size: { $ifNull: ["$downvotes", []] } } },
                },
            },
        ]);

        const totalUpvotes = voteStats[0]?.totalUpvotes ?? 0;
        const totalDownvotes = voteStats[0]?.totalDownvotes ?? 0;

        // New users in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersThisMonth = await UserModel.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
        });

        // New posts in last 30 days
        const newPostsThisMonth = await PostModel.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
        });

        return {
            totalUsers,
            totalPosts,
            totalComments,
            verifiedUsers,
            postsWithMap,
            adminCount,
            editedPosts,
            postsWithImages,
            totalUpvotes,
            totalDownvotes,
            newUsersThisMonth,
            newPostsThisMonth,
        };
    }

    /**
     * User & Post growth — weekly buckets for the last 12 weeks.
     */
    async getGrowth() {
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 × 7 days

        const [userGrowth, postGrowth] = await Promise.all([
            UserModel.aggregate([
                { $match: { createdAt: { $gte: twelveWeeksAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $isoWeekYear: "$createdAt" },
                            week: { $isoWeek: "$createdAt" },
                        },
                        count: { $sum: 1 },
                        // first day of that iso-week for charting
                        weekStart: { $min: "$createdAt" },
                    },
                },
                { $sort: { "_id.year": 1, "_id.week": 1 } },
                {
                    $project: {
                        _id: 0,
                        week: {
                            $dateToString: { format: "%Y-W%V", date: "$weekStart" },
                        },
                        weekStart: {
                            $dateToString: { format: "%b %d", date: "$weekStart" },
                        },
                        count: 1,
                    },
                },
            ]),
            PostModel.aggregate([
                { $match: { createdAt: { $gte: twelveWeeksAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $isoWeekYear: "$createdAt" },
                            week: { $isoWeek: "$createdAt" },
                        },
                        count: { $sum: 1 },
                        weekStart: { $min: "$createdAt" },
                    },
                },
                { $sort: { "_id.year": 1, "_id.week": 1 } },
                {
                    $project: {
                        _id: 0,
                        week: {
                            $dateToString: { format: "%Y-W%V", date: "$weekStart" },
                        },
                        weekStart: {
                            $dateToString: { format: "%b %d", date: "$weekStart" },
                        },
                        count: 1,
                    },
                },
            ]),
        ]);

        return { userGrowth, postGrowth };
    }

    /**
     * Engagement stats — upvotes, downvotes, comments per week (last 8 weeks).
     */
    async getEngagement() {
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

        const weeklyEngagement = await PostModel.aggregate([
            { $match: { createdAt: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: {
                        year: { $isoWeekYear: "$createdAt" },
                        week: { $isoWeek: "$createdAt" },
                    },
                    upvotes: { $sum: { $size: { $ifNull: ["$upvotes", []] } } },
                    downvotes: { $sum: { $size: { $ifNull: ["$downvotes", []] } } },
                    posts: { $sum: 1 },
                    weekStart: { $min: "$createdAt" },
                },
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } },
            {
                $project: {
                    _id: 0,
                    label: { $dateToString: { format: "%b %d", date: "$weekStart" } },
                    upvotes: 1,
                    downvotes: 1,
                    posts: 1,
                },
            },
        ]);

        // Most saved posts (by how many users saved them)
        const mostSavedPosts = await PostModel.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "savedPosts",
                    as: "savers",
                },
            },
            {
                $addFields: {
                    savedCount: { $size: "$savers" },
                    upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
                    downvoteCount: { $size: { $ifNull: ["$downvotes", []] } },
                },
            },
            { $sort: { savedCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorData",
                },
            },
            { $unwind: { path: "$authorData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    savedCount: 1,
                    upvoteCount: 1,
                    downvoteCount: 1,
                    createdAt: 1,
                    "author.username": "$authorData.username",
                    "author.firstName": "$authorData.firstName",
                    "author.lastName": "$authorData.lastName",
                },
            },
        ]);

        return { weeklyEngagement, mostSavedPosts };
    }

    /**
     * Content insights — top contributors + terrain preference distribution.
     */
    async getContent() {
        const [topContributors, terrainDistribution, recentSignups] = await Promise.all([
            // Top 10 users by post count
            PostModel.aggregate([
                {
                    $group: {
                        _id: "$author",
                        postCount: { $sum: 1 },
                        totalUpvotes: { $sum: { $size: { $ifNull: ["$upvotes", []] } } },
                    },
                },
                { $sort: { postCount: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userData",
                    },
                },
                { $unwind: "$userData" },
                {
                    $project: {
                        _id: 1,
                        postCount: 1,
                        totalUpvotes: 1,
                        "user.firstName": "$userData.firstName",
                        "user.lastName": "$userData.lastName",
                        "user.username": "$userData.username",
                        "user.imageUrl": "$userData.imageUrl",
                        "user.isVerified": "$userData.isVerified",
                        followerCount: {
                            $size: { $ifNull: ["$userData.followers", []] },
                        },
                    },
                },
            ]),

            // Terrain preference distribution
            UserModel.aggregate([
                { $unwind: "$preferredTerrains" },
                {
                    $group: {
                        _id: "$preferredTerrains",
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 12 },
                {
                    $project: {
                        _id: 0,
                        terrain: "$_id",
                        count: 1,
                    },
                },
            ]),

            // 5 most recent signups
            UserModel.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("firstName lastName username imageUrl role isVerified createdAt")
                .lean(),
        ]);

        return { topContributors, terrainDistribution, recentSignups };
    }
}
