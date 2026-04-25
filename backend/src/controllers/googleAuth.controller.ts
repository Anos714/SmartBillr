import { Request, Response } from "express";
import crypto from "crypto";
import { googleClient } from "../config/googleAuth";
import { User } from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  generateHashedToken,
  hashPassword,
} from "../lib/auth";
import client from "../config/redis";
import { env } from "../config/env";

export const googleAuthHandler = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token missing",
    });
  }

  try {
    // VERIFY GOOGLE TOKEN
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google token",
      });
    }

    if (!payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Google email not verified",
      });
    }

    const email = payload.email;
    const fullName = payload.name || "No Name";
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (user && user.provider === "local") {
      return res.status(400).json({
        success: false,
        message: "Account exists with email/password. Use that to login.",
      });
    }

    //  CREATE USER IF NOT EXISTS
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await hashPassword(randomPassword);

      user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        googleId,
        provider: "google",
        isUserVerified: true,
      });
    }

    const accessTokenPayload = {
      sub: user._id.toString(),
      role: user.role,
      plan: user.plan,
      tokenVersion: user.tokenVersion,
    };

    const jti = crypto.randomUUID();

    const refreshTokenPayload = {
      sub: user._id.toString(),
      jti,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken(refreshTokenPayload);

    const hashedRefresh = generateHashedToken(refreshToken);

    // STORE REFRESH TOKEN IN REDIS
    await client.set(
      `refresh_token:${refreshTokenPayload.sub}:${jti}`,
      hashedRefresh,
      {
        EX: 7 * 24 * 60 * 60,
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      accessToken,
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

    return res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }
};
