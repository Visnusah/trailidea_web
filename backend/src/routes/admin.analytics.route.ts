import { Router } from "express";
import { AdminAnalyticsController } from "../controllers/admin.analytics.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const adminAnalyticsRouter = Router();
const analyticsController = new AdminAnalyticsController();

// All analytics routes require valid JWT + admin role
adminAnalyticsRouter.use(authorizedMiddleware, adminMiddleware);

// GET /api/v1/admin/analytics/overview — KPI cards data
adminAnalyticsRouter.get("/overview", analyticsController.getOverview);

// GET /api/v1/admin/analytics/growth — weekly registration growth
adminAnalyticsRouter.get("/growth", analyticsController.getGrowth);

// GET /api/v1/admin/analytics/engagement — weekly engagement trends
adminAnalyticsRouter.get("/engagement", analyticsController.getEngagement);

// GET /api/v1/admin/analytics/content — top contributors + terrain distribution
adminAnalyticsRouter.get("/content", analyticsController.getContent);

export default adminAnalyticsRouter;
