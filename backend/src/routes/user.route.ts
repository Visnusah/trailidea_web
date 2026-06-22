import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import upload from "../middlewares/upload.middleware";

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
userRouter.get("/whoami",authorizedMiddleware, userController.whoami)   

export default userRouter;