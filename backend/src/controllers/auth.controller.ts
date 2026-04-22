import { Request, Response } from "express";
import { SignupReq, signupSchema } from "../schemas/signup.schema";
import { User } from "../models/user.model";
import {
  generateHashedToken,
  generateEmailVerificationToken,
  hashPassword,
} from "../lib/auth";
import { env } from "../config/env";
import { sendMail } from "../lib/sendMail";
import { verifyEmailTemplate } from "../templates/verifyEmail.template";
import jwt from "jsonwebtoken";

export const signupUser = async (
  req: Request<{}, {}, SignupReq>,
  res: Response,
) => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
    });
  }

  const { fullName, email, password } = result.data;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = generateEmailVerificationToken();

    //store email verification token in db
    const hashedEmailVerificationToken = generateHashedToken(token);
    newUser.emailVerifyToken = hashedEmailVerificationToken;
    newUser.emailVerifyTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await newUser.save();

    const emailVerifyUrl = `${env.APP_URL}/api/v1/auth/email-verify?token=${token}`;
    await sendMail(
      newUser.email,
      "Email Verification mail",
      verifyEmailTemplate(newUser.fullName, emailVerifyUrl),
    );

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: {
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        isUserVerified: newUser.isUserVerified,
        tokenVersion: newUser.tokenVersion,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyEmailToken = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({
      success: false,
      message: "Token is missing",
    });
  }

  try {
    const hashedToken = generateHashedToken(token);

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    if (user.isUserVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    user.isUserVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpiry = undefined;
    user.emailVerifiedAt = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({
        success: false,
        message: "Verification link expired",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
