import { Request, Response } from "express";
import { SignupReq, signupSchema } from "../schemas/signup.schema";
import { User } from "../models/user.model";
import { hashPassword } from "../lib/auth";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendMail } from "../lib/sendMail";
import { verifyEmailTemplate } from "../templates/verifyEmail.template";

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
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    //verification with email
    const payload = {
      userId: newUser._id,
    };
    const token = jwt.sign(payload, env.TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const emailVerifyUrl = `http://localhost:8080/email-verify?token=${token}`;
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
