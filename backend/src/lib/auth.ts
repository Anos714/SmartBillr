import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import crypto from "crypto";

export const cookieOption = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
} as const;

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateHashedToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateActionURL = (token: string, endpoint: string) => {
  return `${env.FRONTEND_URL}/${endpoint}?token=${token}`;
};

export const generateRefreshToken = (payload: { sub: string; jti: string }) => {
  return jwt.sign(payload, env.REFRESH_SECRET, { expiresIn: "7d" });
};

export const generateAccessToken = (payload: {
  sub: string;
  role: string;
  plan: string;
}) => {
  return jwt.sign(payload, env.ACCESS_SECRET, { expiresIn: "15m" });
};

export interface RefreshTokenRes {
  sub: string;
  jti: string;
  tokenVersion: number;
}

export interface AccessTokenRes {
  sub: string;
  role: "user" | "admin";
  plan: "free" | "pro";
  tokenVersion: number;
}

export const verifyRefreshToken = (token: string): RefreshTokenRes => {
  const decoded = jwt.verify(token, env.REFRESH_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("sub" in decoded) ||
    !("jti" in decoded) ||
    !("tokenVersion" in decoded) ||
    typeof decoded.sub !== "string" ||
    typeof decoded.jti !== "string" ||
    typeof decoded.tokenVersion !== "number"
  ) {
    throw new Error("Invalid refresh token payload");
  }

  return {
    sub: decoded.sub,
    jti: decoded.jti,
    tokenVersion: decoded.tokenVersion,
  };
};

export const verifyAccessToken = (token: string): AccessTokenRes => {
  const decoded = jwt.verify(token, env.ACCESS_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("sub" in decoded) ||
    !("role" in decoded) ||
    !("plan" in decoded) ||
    !("tokenVersion" in decoded) ||
    typeof decoded.sub !== "string" ||
    (decoded.role !== "user" && decoded.role !== "admin") ||
    (decoded.plan !== "free" && decoded.plan !== "pro") ||
    typeof decoded.tokenVersion !== "number"
  ) {
    throw new Error("Invalid access token payload");
  }

  return {
    sub: decoded.sub,
    role: decoded.role,
    plan: decoded.plan,
    tokenVersion: decoded.tokenVersion,
  };
};
