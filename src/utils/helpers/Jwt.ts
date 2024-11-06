import jwt, {SignOptions, VerifyOptions} from "jsonwebtoken";
import AppError from "./appError";
import Audience from "../constants/audience";
import { UserDocument } from "../../models/user.model";
import { SessionDocument } from "../../models/session.model";
import { Request, Response, NextFunction } from "express";
import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, JWT_SECRET } from "../constants/env";
import { UNAUTHORIZED } from "../constants/http";
interface JsonWebTokenClassType {
  signAccessToken(id: AccessTokenPayload,options: SignOptions): string;
  signRefreshToken(id: RefreshTokenPayload,  options: SignOptions): string;
  validateAccessToken(token : string, options?: VerifyOptions): void;
  validateRefreshToken(token : string, options?: VerifyOptions): void;
}
type AccessTokenPayload = {
  userId: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
}
type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
}

class JsonWebTokenClass implements JsonWebTokenClassType {
  private accessTokenSecret = JWT_SECRET;
  private refreshTokenSecret = JWT_REFRESH_SECRET;
  private refreshTokenExpire = JWT_REFRESH_EXPIRES_IN;
  private accessTokenExpire = JWT_ACCESS_EXPIRES_IN;

  public signAccessToken(id: AccessTokenPayload,options?:SignOptions ){
    const defaultOptions = options || { expiresIn: this.accessTokenExpire, audience: [Audience.User], }
    return jwt.sign({ id },  this.accessTokenSecret , defaultOptions);
  }
  public signRefreshToken(id: RefreshTokenPayload,options?:SignOptions){
    const defaultOptions = options || { expiresIn: this.refreshTokenExpire, audience: [Audience.User], }
    return jwt.sign({ id },  this.refreshTokenSecret , defaultOptions);
  }

  public validateAccessToken<Token extends AccessTokenPayload>(token:string, options?: VerifyOptions)  {
    const defaultOptions = options || {  audience: [Audience.User], }
    try{
      return jwt.verify(token, this.accessTokenSecret, defaultOptions) as Token;
    }catch(e:any){
      throw new AppError(UNAUTHORIZED, "You are not authorized");
    }
  }
  public validateRefreshToken<Token extends RefreshTokenPayload>(token:string, options?: VerifyOptions) {
    const defaultOptions = options || {  audience: [Audience.User], }
    try{
      return jwt.verify(token, this.refreshTokenSecret, defaultOptions) as Token;
    }catch(e:any){
      throw new AppError(UNAUTHORIZED, "You are not authorized");
    }
  }
}

export const JWT = new JsonWebTokenClass();
