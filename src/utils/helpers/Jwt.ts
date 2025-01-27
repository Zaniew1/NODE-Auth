import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import Audience from '../constants/audience';
import { UserDocument } from '../../user/model/user.model';
import { SessionDocument } from '../../session/model/session.model';
import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, JWT_SECRET } from '../constants/env';
import { HttpErrors } from '../constants/http';
import appAssert from './appAssert';
import { AppErrorCode } from './appError';
import { Message } from '../constants/messages';
interface JsonWebTokenClassInterface {
  signAccessToken(id: AccessTokenPayload, options: SignOptions): string;
  signRefreshToken(id: RefreshTokenPayload, options: SignOptions): string;
  validateAccessToken(token: string, options?: VerifyOptions): void;
  validateRefreshToken(token: string, options?: VerifyOptions): void;
}

export type AccessTokenPayload = {
  userId: UserDocument['_id'];
  sessionId: SessionDocument['_id'];
};

export type RefreshTokenPayload = {
  sessionId: SessionDocument['_id'];
};

/**
 * Description placeholder
 *
 * @class JsonWebTokenClass
 * @typedef {JsonWebTokenClass}
 * @implements {JsonWebTokenClassInterface}
 */
class JsonWebTokenClass implements JsonWebTokenClassInterface {
  /**
   * Access token secret from env variable
   *
   * @private
   * @type {string}
   */
  private accessTokenSecret = JWT_SECRET;
  /**
   * Refresh token secret from env variable
   *
   * @private
   * @type {string}
   */
  private refreshTokenSecret = JWT_REFRESH_SECRET;
  /**
   * Refresh token expire date from env variable
   *
   * @private
   * @type {string}
   */
  private refreshTokenExpire = JWT_REFRESH_EXPIRES_IN;
  /**
   * Access token expire date from env variable
   *
   * @private
   * @type {string}
   */
  private accessTokenExpire = JWT_ACCESS_EXPIRES_IN;

  /**
   * This method encodes user's id and sessionId into access token
   *
   * @public
   * @param {AccessTokenPayload} payload
   * @param {?SignOptions} [options]
   * @returns {*}
   */
  public signAccessToken(payload: AccessTokenPayload, options?: SignOptions) {
    const defaultOptions = options || { expiresIn: this.accessTokenExpire, audience: [Audience.User] };
    return jwt.sign(payload, this.accessTokenSecret, defaultOptions);
  }
  /**
   * This method encodes user's sessionId into refresh token
   *
   * @public
   * @param {RefreshTokenPayload} payload
   * @param {?SignOptions} [options]
   * @returns {*}
   */
  public signRefreshToken(payload: RefreshTokenPayload, options?: SignOptions) {
    const defaultOptions = options || { expiresIn: this.refreshTokenExpire, audience: [Audience.User] };
    return jwt.sign(payload, this.refreshTokenSecret, defaultOptions);
  }
  /**
   * This method decodes informations (userId , sessionId) from access token given by a user (from cookies)
   *
   * @public
   * @param {string} token
   * @param {?VerifyOptions} [options]
   * @returns {AccessTokenPayload}
   */
  public validateAccessToken(token: string, options?: VerifyOptions): AccessTokenPayload {
    const defaultOptions = options || { audience: [Audience.User] };
    let payload;
    try {
      payload = jwt.verify(token, this.accessTokenSecret, defaultOptions) as AccessTokenPayload;
    } catch (error) {
      console.log(error);
      appAssert(false, HttpErrors.UNAUTHORIZED, Message.FAIL_TOKEN_ACCESS_INVALID, AppErrorCode.InvalidAccessToken);
    }
    return payload;
  }
  /**
   * This method decodes informations (sessionId) from refresh token given by a user (from cookies)
   *
   * @public
   * @param {string} token
   * @param {?VerifyOptions} [options]
   * @returns {RefreshTokenPayload}
   */
  public validateRefreshToken(token: string, options?: VerifyOptions): RefreshTokenPayload {
    const defaultOptions = options || { audience: [Audience.User] };
    let payload;
    try {
      payload = jwt.verify(token, this.refreshTokenSecret, defaultOptions) as RefreshTokenPayload;
    } catch (error) {
      console.log(error);
      appAssert(false, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
    }
    return payload;
  }
}

/**
 * Description placeholder
 *
 * @type {JsonWebTokenClass}
 */
export const JWT = new JsonWebTokenClass();
