// export const OK = 200;
// export const CREATED = 201;
// export const BAD_REQUEST = 400;
// export const UNAUTHORIZED = 401;
// export const FORBIDDEN = 403;
// export const NOT_FOUND = 404;
// export const CONFLICT = 409;
// export const UNPROCESSABLE_CONTENT = 422;
// export const TOO_MANY_REQUESTS = 429;
// export const INTERNAL_SERVER_ERROR = 500;

export enum HttpErrors {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_CONTENT = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}
export type HttpStatusCode = (typeof HttpErrors)[keyof typeof HttpErrors];
