import jwt from "jsonwebtoken";
import "dotenv/config";
import AppError from "./appError";
import { Request, Response, NextFunction } from "express";

interface JsonWebTokenClassType {
  signToken(id: number): string | AppError;
  validateAccess(req: Request, res: Response, next: NextFunction): void;
}

class JsonWebTokenClass implements JsonWebTokenClassType {
  private accessTokenSecret;
  private expiresIn;
  private refreshSecret;
  constructor(accessTokenSecret: string, expiresIn: string, refreshSecret: string) {
    this.accessTokenSecret = accessTokenSecret;
    this.expiresIn = expiresIn;
    this.refreshSecret = refreshSecret;
  }
  public signToken(id: number) {
    if (!this.accessTokenSecret) {
      return new AppError("There is no access token secret", 400);
    }
    if (!this.expiresIn) {
      return new AppError("There is no expires in secret", 400);
    }
    if (!this.refreshSecret) {
      return new AppError("There is no refresh secret", 400);
    }
    return jwt.sign({ id }, this.accessTokenSecret, {
      expiresIn: this.expiresIn,
    });
  }
  public validateAccess(req: Request, res: Response, next: NextFunction) {
    // const authHeader = req.header["authorization"];
    // const token = authHeader && authHeader.split(" ")[1];
    // if (!token) {
    //   return next(new AppError("There is no access token", 401));
    // }
    // jwt.verify(token, this.accessTokenSecret, (err: any, user: any) => {
    //   if (err) {
    //     return next(new AppError("You dont have access to this", 403));
    //   }
    //   req.user = user;
    //   next();
    // })
  }
}

export const JWT = new JsonWebTokenClass(
  process.env.JWT_SECRET as string,
  process.env.JWT_EXPIRES_IN as string,
  process.env.JWT_REFRESH_SECRET as string
);
