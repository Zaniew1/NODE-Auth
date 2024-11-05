import jwt from "jsonwebtoken";
import "dotenv/config";
import AppError from "./appError";
import { Request, Response, NextFunction } from "express";

interface JsonWebTokenClassType {
  signToken(id: object, secret: "access" | "refresh", options: object): string | AppError;
  validateAccess(req: Request, res: Response, next: NextFunction): void;
}

class JsonWebTokenClass implements JsonWebTokenClassType {
  private accessTokenSecret;
  private refreshSecret;
  constructor(accessTokenSecret: string, refreshSecret: string) {
    this.accessTokenSecret = accessTokenSecret;
    this.refreshSecret = refreshSecret;
  }
  public signToken(id: object, secret: "access" | "refresh", options: object) {
    if (!this.accessTokenSecret) {
      throw new Error("There is no access token secret");
    }
    if (!this.refreshSecret) {
      throw new Error("There is no refresh secret");
    }
    return jwt.sign({ id }, secret === "access" ? this.accessTokenSecret : this.refreshSecret, options);
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

export const JWT = new JsonWebTokenClass(process.env.JWT_SECRET as string, process.env.JWT_REFRESH_SECRET as string);
