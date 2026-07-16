import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import upload from "../middlewares/upload.middleware";

const postRouter = Router();
const postController = new PostController();

// All routes require valid JWT (authorizedMiddleware)

// POST /api/v1/posts — Create a new post (multipart/form-data with images)
postRouter.post(
    "/",
    authorizedMiddleware,
    upload.array("images", 5),
    postController.createPost
);

// PUT /api/v1/posts/:id — Edit/update a post
postRouter.put(
    "/:id",
    authorizedMiddleware,
    upload.array("images", 5),
    postController.editPost
);

// GET /api/v1/posts?page=1&limit=10 — Fetch paginated feed
postRouter.get(
    "/",
    authorizedMiddleware,
    postController.getFeed
);

// POST /api/v1/posts/:id/vote — Toggle upvote/downvote
postRouter.post(
    "/:id/vote",
    authorizedMiddleware,
    postController.vote
);

// POST /api/v1/posts/:id/save — Toggle save/unsave a post
postRouter.post(
    "/:id/save",
    authorizedMiddleware,
    postController.toggleSavePost
);

// GET /api/v1/posts/:id/comments — Fetch comments
postRouter.get(
    "/:id/comments",
    authorizedMiddleware,
    postController.getComments
);

// POST /api/v1/posts/:id/comments — Add a comment
postRouter.post(
    "/:id/comments",
    authorizedMiddleware,
    postController.addComment
);

export default postRouter;
