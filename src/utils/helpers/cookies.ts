import { Response, CookieOptions } from "express";
import { APP_ORIGIN, APP_VERSION, NODE_ENV, PORT } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = `${APP_ORIGIN}:${PORT}/api/${APP_VERSION}/auth/refresh`;
const secure = NODE_ENV !== "development";

type AuthCookieParams = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

interface CookieInterface {
  setAuthCookies({ res, accessToken, refreshToken }: AuthCookieParams): Response;
  clearAuthCookies(res: Response): Response;
  getAccessTokenCookieOptions(): CookieOptions;
  getRefreshTokenCookieOptions(): CookieOptions;
}

class Cookies implements CookieInterface {
  private defaultCookieOptions: CookieOptions = {
    sameSite: "strict",
    httpOnly: true,
    secure,
  };
  public setAuthCookies = ({ res, accessToken, refreshToken }: AuthCookieParams) => {
    return res
      .cookie("accessToken", accessToken, this.getAccessTokenCookieOptions())
      .cookie("refreshToken", refreshToken, this.getRefreshTokenCookieOptions());
  };

  public clearAuthCookies = (res: Response) => {
    return res.clearCookie("accessToken").clearCookie("refreshToken", { path: REFRESH_PATH });
  };

  public getAccessTokenCookieOptions = (): CookieOptions => ({
    ...this.defaultCookieOptions,
    expires: fifteenMinutesFromNow(),
  });

  public getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...this.defaultCookieOptions,
    expires: thirtyDaysFromNow(),
    path: REFRESH_PATH,
  });
}
export default new Cookies();
