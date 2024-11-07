import express from "express";
import * as AuthController from "../controllers/authController";
export const authRouter = express.Router();

authRouter.post("/register", AuthController.registerHandler);
authRouter.post("/login", AuthController.loginHandler);
authRouter.post("/forgetPassword", AuthController.forgetPasswordHandler);
authRouter.post("/logout", AuthController.logoutHandler);
authRouter.post("/changePassword", AuthController.changePasswordHandler);
authRouter.patch("/resetPassword/:token", AuthController.resetPasswordHandler);
authRouter.get("/verify/:code", AuthController.verifyEmailHandler);
authRouter.get("/refresh", AuthController.refreshHandler);

export default authRouter;
