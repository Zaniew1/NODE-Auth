import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import Audience from "../constants/audience";
import { UserDocument } from "../../models/user.model";
import { SessionDocument } from "../../models/session.model";
import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, JWT_SECRET } from "../constants/env";
import { UNAUTHORIZED } from "../constants/http";
import appAssert from "./appAssert";
interface JsonWebTokenClassType {
  signAccessToken(id: AccessTokenPayload, options: SignOptions): string;
  signRefreshToken(id: RefreshTokenPayload, options: SignOptions): string;
  validateAccessToken(token: string, options?: VerifyOptions): void;
  validateRefreshToken(token: string, options?: VerifyOptions): void;
}
type AccessTokenPayload = {
  userId: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
};
type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
};

class JsonWebTokenClass implements JsonWebTokenClassType {
  private accessTokenSecret = JWT_SECRET;
  private refreshTokenSecret = JWT_REFRESH_SECRET;
  private refreshTokenExpire = JWT_REFRESH_EXPIRES_IN;
  private accessTokenExpire = JWT_ACCESS_EXPIRES_IN;

  public signAccessToken(id: AccessTokenPayload, options?: SignOptions) {
    const defaultOptions = options || { expiresIn: this.accessTokenExpire, audience: [Audience.User] };
    return jwt.sign({ id }, this.accessTokenSecret, defaultOptions);
  }
  public signRefreshToken(id: RefreshTokenPayload, options?: SignOptions) {
    const defaultOptions = options || { expiresIn: this.refreshTokenExpire, audience: [Audience.User] };
    return jwt.sign({ id }, this.refreshTokenSecret, defaultOptions);
  }

  public validateAccessToken<Token extends AccessTokenPayload>(token: string, options?: VerifyOptions) {
    const defaultOptions = options || { audience: [Audience.User] };
    const payload = jwt.verify(token, this.accessTokenSecret, defaultOptions) as Token;
    appAssert(payload, UNAUTHORIZED, "You are not authorized");
    return payload;
  }
  public validateRefreshToken<Token extends RefreshTokenPayload>(token: string, options?: VerifyOptions) {
    const defaultOptions = options || { audience: [Audience.User] };
    const payload = jwt.verify(token, this.refreshTokenSecret, defaultOptions) as Token;
    appAssert(payload, UNAUTHORIZED, "You are not authorized");
    return payload;
  }
}

export const JWT = new JsonWebTokenClass();
