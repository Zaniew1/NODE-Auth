import catchAsync from "../utils/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { DatabaseInstance } from "../../utils/database";
import { JWT } from "../helpers/Jwt";
import { PasswordManage } from "../helpers/PasswordManage";
import { newUserSchema, newUserType, loginUserType } from "../../utils/zodSchemas/userSchema";
export const register: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newUser = newUserSchema.parse(req.body) as newUserType;
  const { name, password, email, surname } = newUser as newUserType;
  // we check if user with email already exists
  const userByEmail = await DatabaseInstance.findBy("user", { email });
  if (userByEmail) {
    return next(new AppError("There is user with that email already", 400));
  }
  const newPassword = await PasswordManage.hashPassword(password);
  // we send email with welcome Card component as welcome message
  // await new Email(email, name).sendWelcome();
  // we create user
  const user = await DatabaseInstance.create("user", { data: { name, surname, email, password: newPassword } });

  // create jwt token
  console.log(user.id);
  const token = JWT.signToken(user.id);
  // // set cookies
  let expirationDate = "1d";
  if (process.env.JWT_EXPIRES_IN) {
    expirationDate = process.env.JWT_EXPIRES_IN;
  }
  const cookieOption = {
    expires: new Date(Date.now() + (parseInt(expirationDate) ?? 1) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };
  res.cookie("jwt", token, cookieOption);
  res.status(200).json({
    status: "successfully registered",
    data: { user },
  });
});
export const login: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = newUserSchema.parse(req.body) as loginUserType;
  const { password, email } = user as newUserType;
  const userByEmail = await DatabaseInstance.findBy("user", { email });
  if (!userByEmail) {
    return next(new AppError("There is no user with that email", 400));
  }
  const isGoodPassword = await PasswordManage.comparePasswords(password, user.password);
  if (!isGoodPassword) {
    return next(new AppError("Incorrect password", 401));
  }
  const token = JWT.signToken(userByEmail.id);
  res.status(200).json({
    status: "successfully logged in ",
  });
});
export const forgetPassword: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully forget pass",
  });
});
export const logout: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully logout",
  });
});
export const changePassword: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully changed pass",
  });
});
export const resetPassword: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully reseted password",
  });
});
