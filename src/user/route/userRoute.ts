import express from "express";
import * as UserController from "../controller/userController";
export const userRouter = express.Router();

userRouter.get("/", UserController.getUserHandler);
userRouter.delete("/", UserController.deleteUserHandler);

export default userRouter;
