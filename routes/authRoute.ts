import express from "express";
import * as AuthController from "../controllers/authController";
export const authRouter = express.Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/forgetPassword", AuthController.forgetPassword);
authRouter.post("/logout", AuthController.logout);
authRouter.post("/changePassword", AuthController.changePassword);
authRouter.patch("/resetPassword/:token", AuthController.resetPassword);

export default authRouter;
