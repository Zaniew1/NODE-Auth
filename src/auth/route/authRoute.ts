import express from "express";
import * as AuthController from "../controller/authController";
export const authRouter = express.Router();

authRouter.post("/register", AuthController.registerHandler);
authRouter.post("/login", AuthController.loginHandler);
authRouter.post("/logout", AuthController.logoutHandler);
authRouter.post("/changePassword/:verificationCode", AuthController.changePasswordHandler);
authRouter.patch("/forgotPassword", AuthController.forgotPasswordHandler);
authRouter.get("/verify/:code", AuthController.verifyEmailHandler);
authRouter.get("/refresh", AuthController.refreshHandler);

export default authRouter;
