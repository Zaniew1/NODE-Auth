import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import Audience from "../constants/audience";
import { UserDocument } from "../../user/model/user.model";
import { SessionDocument } from "../../session/model/session.model";
import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, JWT_SECRET } from "../constants/env";
import { HttpErrors } from "../constants/http";
import appAssert from "./appAssert";
import { AppErrorCode } from "./appError";
import { Message } from "../constants/messages";
interface JsonWebTokenClassInterface {
  signAccessToken(id: AccessTokenPayload, options: SignOptions): string;
  signRefreshToken(id: RefreshTokenPayload, options: SignOptions): string;
  validateAccessToken(token: string, options?: VerifyOptions): void;
  validateRefreshToken(token: string, options?: VerifyOptions): void;
}
export type AccessTokenPayload = {
  userId: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
};
export type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
};

class JsonWebTokenClass implements JsonWebTokenClassInterface {
  private accessTokenSecret = JWT_SECRET;
  private refreshTokenSecret = JWT_REFRESH_SECRET;
  private refreshTokenExpire = JWT_REFRESH_EXPIRES_IN;
  private accessTokenExpire = JWT_ACCESS_EXPIRES_IN;

  public signAccessToken(payload: AccessTokenPayload, options?: SignOptions) {
    const defaultOptions = options || { expiresIn: this.accessTokenExpire, audience: [Audience.User] };
    return jwt.sign(payload, this.accessTokenSecret, defaultOptions);
  }
  public signRefreshToken(payload: RefreshTokenPayload, options?: SignOptions) {
    const defaultOptions = options || { expiresIn: this.refreshTokenExpire, audience: [Audience.User] };
    return jwt.sign(payload, this.refreshTokenSecret, defaultOptions);
  }
  public validateAccessToken(token: string, options?: VerifyOptions): AccessTokenPayload {
    const defaultOptions = options || { audience: [Audience.User] };
    let payload = jwt.verify(token, this.accessTokenSecret, defaultOptions);
    appAssert(payload, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
    return payload as AccessTokenPayload;
  }
  public validateRefreshToken(token: string, options?: VerifyOptions): RefreshTokenPayload {
    const defaultOptions = options || { audience: [Audience.User] };
    const payload = jwt.verify(token, this.refreshTokenSecret, defaultOptions) as RefreshTokenPayload;
    appAssert(payload, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED);
    return payload;
  }
}

export const JWT = new JsonWebTokenClass();
