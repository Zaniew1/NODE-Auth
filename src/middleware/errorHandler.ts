import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../utils/constants/http";
import { z } from "zod";

const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  res.status(BAD_REQUEST).json({
    message: error.message,
    errors: errors,
  });
};

const errorHandler: ErrorRequestHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(`PATH: ${req.path}`, error);
  if (error instanceof z.ZodError) {
    handleZodError(res, error);
  }
  res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};
export default errorHandler;
