import { Request, Response, NextFunction } from 'express';

type ErrorFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * With this feature, it is unnecessary to use try catch in the code,
 * because this function acts as middleware and passes errors resulting from asynchronicity to errorHandler
 *
 * @param {ErrorFunction} controller
 * @returns {ErrorFunction}
 */
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
