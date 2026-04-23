import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/auth";
import { User } from "../models/user.model";

export const isUserAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    interface AccessTokenPayload {
      sub: string;
      role: "user" | "admin";
      plan: "free" | "pro";
      tokenVersion: number;
    }

    let payload: AccessTokenPayload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Token invalidated",
      });
    }

    if (!user.isUserVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
      });
    }

    req.user = {
      sub: user._id.toString(),
      role: user.role,
      plan: user.plan,
    };

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
