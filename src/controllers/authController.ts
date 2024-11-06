import catchAsync from "../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import registerSchema from "../utils/zodSchemas/registerSchema";
import loginSchema from "../utils/zodSchemas/loginSchema";
import { createUser, loginUser } from "../services/auth.service";
import { CREATED, OK } from "../utils/constants/http";
import { setAuthCookies } from "../utils/helpers/cookies";
import { JWT } from "../utils/helpers/Jwt";
import SessionModel from "../models/session.model";


export const registerHandler: RequestHandler<{ id: string }> = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // validate data with zod
    const request = registerSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
    // create new user, accessToken and refreshToken
    const { user, accessToken, refreshToken } = await createUser(request);
    // set cookies
    return setAuthCookies({ res, accessToken, refreshToken }).status(CREATED).json({
      status: "successfully create user",
      user,
    });
  }
);

export const loginHandler: RequestHandler<{ id: string }> = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // validate data with zod
    const request = loginSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
    // validate if email and password are correct, create tokens, create session
    const { accessToken, refreshToken } = await loginUser(request);
    // set cookies
    return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
      status: "successfully login",
    });
  }
);

export const forgetPasswordHandler: RequestHandler<{ id: string }> = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(OK).json({
      status: "successfully forget pass",
    });
  }
);

export const logoutHandler: RequestHandler<{ id: string }> = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;
    const payload = JWT.validateAccessToken(accessToken)
    if(payload){
      await SessionModel.findByIdAndDelete(payload.sessionId)
    }
    res.status(OK).json({
      status: "successfully logout",
    });
  }
);

export const changePasswordHandler: RequestHandler<{ id: string }> = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(OK).json({
      status: "successfully changed pass",
    });
  }
);

export const resetPasswordHandler: RequestHandler<{ id: string }> = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(OK).json({
      status: "successfully reseted password",
    });
  }
);
