import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import upload from "../middlewares/upload.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", upload.single("profile_pic"), userController.createUser);
userRouter.post("/login", userController.loginUser);

userRouter.put(
    "/update",
    authorizedMiddleware,
    upload.fields([
        { name: "profile_pic", maxCount: 1 },
        { name: "cover_pic", maxCount: 1 },
    ]),
    userController.updateUser
);
userRouter.get("/whoami", authorizedMiddleware, userController.whoami);

// Social endpoints
userRouter.post(
    "/users/:id/follow",
    authorizedMiddleware,
    userController.toggleFollow
);

// Profile endpoints — specific routes before parameterized ones
userRouter.get(
    "/users/me/saved",
    authorizedMiddleware,
    userController.getSavedPosts
);

userRouter.get(
    "/users/profile/:username",
    authorizedMiddleware,
    userController.getPublicProfile
);

// Password reset
userRouter.post(
    "/request-password-reset",
    userController.sendResetPasswordEmail
);

userRouter.post(
    "/reset-password/:token",
    userController.resetPassword
);

export default userRouter;