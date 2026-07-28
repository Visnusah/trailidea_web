import { Request, Response } from "express";
import { AdminAnalyticsService } from "../services/admin.analytics.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const analyticsService = new AdminAnalyticsService();

export class AdminAnalyticsController {
    /**
     * GET /api/v1/admin/analytics/overview
     * Returns all KPI card data in a single call.
     */
    async getOverview(req: Request, res: Response) {
        try {
            const data = await analyticsService.getOverview();
            return ApiResponseHelper.success(
                res,
                data,
                "Analytics overview fetched successfully",
                200
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * GET /api/v1/admin/analytics/growth
     * User & post registration growth over the last 12 weeks.
     */
    async getGrowth(req: Request, res: Response) {
        try {
            const data = await analyticsService.getGrowth();
            return ApiResponseHelper.success(
                res,
                data,
                "Growth data fetched successfully",
                200
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * GET /api/v1/admin/analytics/engagement
     * Weekly upvote/downvote/comment trends + most-saved posts.
     */
    async getEngagement(req: Request, res: Response) {
        try {
            const data = await analyticsService.getEngagement();
            return ApiResponseHelper.success(
                res,
                data,
                "Engagement data fetched successfully",
                200
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * GET /api/v1/admin/analytics/content
     * Top contributors, terrain distribution, recent signups.
     */
    async getContent(req: Request, res: Response) {
        try {
            const data = await analyticsService.getContent();
            return ApiResponseHelper.success(
                res,
                data,
                "Content analytics fetched successfully",
                200
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
