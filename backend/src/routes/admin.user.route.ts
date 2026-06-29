import { Router } from "express";
import { AdminUserController } from "../controllers/admin.user.controller";
import {
    authorizedMiddleware,
    adminMiddleware,
} from "../middlewares/authorized.middleware";

const adminUserRouter = Router();
const adminUserController = new AdminUserController();

// All routes below require: valid JWT (authorizedMiddleware) + admin role (adminMiddleware)

// GET /api/v1/admin/users?page=1&limit=10&search=john
adminUserRouter.get(
    "/",
    authorizedMiddleware,
    adminMiddleware,
    adminUserController.listUsers
);

// GET /api/v1/admin/users/:id
adminUserRouter.get(
    "/:id",
    authorizedMiddleware,
    adminMiddleware,
    adminUserController.getUser
);

// POST /api/v1/admin/users
adminUserRouter.post(
    "/",
    authorizedMiddleware,
    adminMiddleware,
    adminUserController.createUser
);

// PUT /api/v1/admin/users/:id
adminUserRouter.put(
    "/:id",
    authorizedMiddleware,
    adminMiddleware,
    adminUserController.updateUser
);

// PATCH /api/v1/admin/users/:id  (alias for PUT — same handler)
adminUserRouter.patch(
    "/:id",
    authorizedMiddleware,
    adminMiddleware,
    adminUserController.updateUser
);

// DELETE /api/v1/admin/users/:id
adminUserRouter.delete(
    "/:id",
    authorizedMiddleware,
    adminMiddleware,
    adminUserController.deleteUser
);

export default adminUserRouter;
