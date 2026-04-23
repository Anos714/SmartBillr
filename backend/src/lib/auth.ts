import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import crypto from "crypto";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateHashedToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateEmailVerificationURL = (token: string) => {
  return `${env.APP_URL}/api/v1/auth/email-verify?token=${token}`;
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
