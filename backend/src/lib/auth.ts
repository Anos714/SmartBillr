import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import crypto from "crypto";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// jwt.sign(payload, env.EMAIL_VERIFY_SECRET, { expiresIn: "15m" })

export const generateHashedToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
