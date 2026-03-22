import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error(err);

  if (process.env.NODE_ENV === "production") {
    return res.status(statusCode).json({
      success: false,
      msg: message,
    });
  }

  res.status(statusCode).json({
    success: false,
    msg: message,
    stack: err.stack,
  });
};
