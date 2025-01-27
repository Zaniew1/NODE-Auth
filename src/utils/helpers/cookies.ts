import { Response, CookieOptions } from 'express';
import { APP_ORIGIN, APP_VERSION, PORT } from '../constants/env';
import { fifteenMinutesFromNow, thirtyDaysFromNow } from './date';

export const REFRESH_PATH = `${APP_ORIGIN}:${PORT}/api/${APP_VERSION}/auth/refresh`;

export type AuthCookieParams = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

class Cookies {
  private static secure = true;

  private static defaultCookieOptions: CookieOptions = {
    sameSite: 'strict',
    httpOnly: true,
    secure: Cookies.secure,
  };

  public static setAuthCookies = ({ res, accessToken, refreshToken }: AuthCookieParams) => {
    return res
      .cookie('accessToken', accessToken, Cookies.getAccessTokenCookieOptions())
      .cookie('refreshToken', refreshToken, Cookies.getRefreshTokenCookieOptions());
  };

  public static clearAuthCookies = (res: Response) => {
    return res.clearCookie('accessToken').clearCookie('refreshToken', { path: REFRESH_PATH });
  };

  public static getAccessTokenCookieOptions = (): CookieOptions => ({
    ...Cookies.defaultCookieOptions,
    expires: fifteenMinutesFromNow(),
  });

  public static getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...Cookies.defaultCookieOptions,
    expires: thirtyDaysFromNow(),
    path: REFRESH_PATH,
  });
}
export default Cookies;
