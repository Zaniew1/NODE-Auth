import express from "express";
import * as AuthController from "../controller/authController";
export const authRouter = express.Router();

authRouter.post("/register", AuthController.registerHandler);
authRouter.post("/login", AuthController.loginHandler);
authRouter.post("/forgetPassword", AuthController.forgetPasswordHandler);
authRouter.post("/logout", AuthController.logoutHandler);
authRouter.post("/changePassword", AuthController.changePasswordHandler);
authRouter.patch("/forgotPassword/:verificationCode", AuthController.forgotPasswordHandler);
authRouter.get("/verify/:code", AuthController.verifyEmailHandler);
authRouter.get("/refresh", AuthController.refreshHandler);

export default authRouter;
