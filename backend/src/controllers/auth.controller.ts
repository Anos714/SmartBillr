import { Request, Response } from "express";
import {
  ResendVerificationEmailReq,
  resendVerificationEMailSchema,
  SigninReq,
  signinSchema,
  SignupReq,
  signupSchema,
} from "../schemas/auth.schema";
import { User } from "../models/user.model";
import {
  generateHashedToken,
  generateEmailVerificationToken,
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationURL,
  verifyRefreshToken,
  RefreshTokenRes,
} from "../lib/auth";
import { env } from "../config/env";
import { sendMail } from "../lib/sendMail";
import { verifyEmailTemplate } from "../templates/verifyEmail.template";
import client from "../config/redis";

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

    const emailVerifyUrl = generateEmailVerificationURL(token);
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

export const signinUser = async (
  req: Request<{}, {}, SigninReq>,
  res: Response,
) => {
  const result = signinSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
    });
  }

  const { email, password } = result.data;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isUserVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const accessTokenPayload = {
      sub: user._id.toString(),
      role: user.role,
      plan: user.plan,
      tokenVersion: user.tokenVersion,
    };
    const refreshTokenPayload = {
      sub: user._id.toString(),
      jti: crypto.randomUUID(),
      tokenVersion: user.tokenVersion,
    };

    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken(refreshTokenPayload);
    const hashedRefreshToken = generateHashedToken(refreshToken);

    const cookieOption = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    } as const;

    res.cookie("refreshToken", refreshToken, {
      ...cookieOption,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await client.set(
      `refresh_token:${refreshTokenPayload.sub}:${refreshTokenPayload.jti}`,
      hashedRefreshToken,
      {
        EX: 7 * 24 * 60 * 60,
      },
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken: accessToken,
      data: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isUserVerified: user.isUserVerified,
        tokenVersion: user.tokenVersion,
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
      return res.status(200).json({
        success: true,
        message: "Invalid or expired verification link",
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
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resendVerificationEmail = async (
  req: Request<{}, {}, ResendVerificationEmailReq>,
  res: Response,
) => {
  const result = resendVerificationEMailSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "validation failed",
    });
  }
  try {
    const { email } = result.data;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "If account exists, verification email sent",
      });
    }

    if (user.isUserVerified) {
      return res.status(401).json({
        success: false,
        message: "User is already verified",
      });
    }

    //rate limiting
    const now = Date.now();

    if (
      user.lastVerificationSentAt &&
      now - user.lastVerificationSentAt.getTime() < 2 * 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another email",
      });
    }

    const token = generateEmailVerificationToken();
    const hashedToken = generateHashedToken(token);

    user.lastVerificationSentAt = new Date();
    user.emailVerifyToken = hashedToken;
    user.emailVerifyTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const emailVerifyUrl = generateEmailVerificationURL(token);

    await sendMail(
      user.email,
      "Email Verification mail",
      verifyEmailTemplate(user.fullName, emailVerifyUrl),
    );

    return res.status(200).json({
      success: true,
      message: "If account exists, verification email sent",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(404).json({
      success: false,
      message: "Token is missing",
    });
  }

  let payload: RefreshTokenRes;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

  try {
    const { sub, jti, tokenVersion } = payload;

    //redis check
    const key = `refresh_token:${sub}:${jti}`;
    const storedToken = await client.get(key);
    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const hashedIncoming = generateHashedToken(refreshToken);

    if (storedToken !== hashedIncoming) {
      return res.status(401).json({
        success: false,
        message: "Token mismatch",
      });
    }

    // 🔹 DB check (tokenVersion)
    const user = await User.findById(sub);

    if (!user || user.tokenVersion !== tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Token invalidated",
      });
    }

    //  TOKEN ROTATION

    // delete old token from redis
    await client.del(key);

    const accessTokenPayload = {
      sub: user._id.toString(),
      role: user.role,
      plan: user.plan,
      tokenVersion: user.tokenVersion,
    };
    const refreshTokenPayload = {
      sub: user._id.toString(),
      jti: crypto.randomUUID(),
      tokenVersion: user.tokenVersion,
    };

    const newAccessToken = generateAccessToken(accessTokenPayload);

    const newRefreshToken = generateRefreshToken(refreshTokenPayload);

    const hashedNew = generateHashedToken(newRefreshToken);

    await client.set(
      `refresh_token:${refreshTokenPayload.sub}:${refreshTokenPayload.jti}`,
      hashedNew,
      {
        EX: 7 * 24 * 60 * 60,
      },
    );

    const cookieOption = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    } as const;

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOption,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
