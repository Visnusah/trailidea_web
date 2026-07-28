import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

// GET /api/v1/dashboard/sidebar — Aggregated sidebar data (trending + who to follow)
dashboardRouter.get(
    "/sidebar",
    authorizedMiddleware,
    dashboardController.getSidebar
);

export default dashboardRouter;
