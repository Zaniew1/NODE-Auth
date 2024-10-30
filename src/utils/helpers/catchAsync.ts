import { Request, Response, NextFunction } from "express";
type ErrorFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const catchAsync = (controller: ErrorFunction): ErrorFunction => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (e) {
      next(e);
    }
  };
};
export default catchAsync;
