import { Router } from "express";
import { AdminPostsController } from "../controllers/admin.posts.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const adminPostsRouter = Router();
const adminPostsController = new AdminPostsController();

// All routes require valid JWT + admin role
adminPostsRouter.use(authorizedMiddleware, adminMiddleware);

// GET /api/v1/admin/posts?page=1&limit=10&search=&filter=all
adminPostsRouter.get("/", adminPostsController.listPosts);

// DELETE /api/v1/admin/posts/:id — force-delete any post
adminPostsRouter.delete("/:id", adminPostsController.deletePost);

export default adminPostsRouter;
