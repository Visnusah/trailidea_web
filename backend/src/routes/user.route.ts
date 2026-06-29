import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import upload from "../middlewares/upload.middleware";
import router from "./upload.route";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", upload.single("profile_pic"),userController.createUser);
userRouter.post("/login", userController.loginUser);

userRouter.put(
    "/update",
    authorizedMiddleware,
    upload.single("profile_pic"),
    userController.updateUser
)
userRouter.get("/whoami",authorizedMiddleware, userController.whoami);

router.post(
    "/request-password-reset",
    userController.sendResetPasswordEmail
);

router.post(
    "/reset-password/:token",
    userController.resetPassword
);

export default userRouter;