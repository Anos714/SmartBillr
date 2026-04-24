import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(1, "Full Name is required").max(100),
  email: z.string().email().min(1, "email is required").trim().lowercase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be atleast 8 characters long"),
});

export type SignupReq = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.string().email().min(1, "email is required").trim().lowercase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be atleast 8 characters long"),
});

export type SigninReq = z.infer<typeof signinSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "token is required"),
});

export type VerifyEmailReq = z.infer<typeof verifyEmailSchema>;

export const resendVerificationEMailSchema = z.object({
  email: z.string().email().min(1, "email is required").trim().lowercase(),
});

export type ResendVerificationEmailReq = z.infer<typeof signinSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email().min(1, "email is required").trim().lowercase(),
});

export type ForgotPasswordReq = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be atleast 8 characters long"),
});

export type ResetPasswordReq = z.infer<typeof resetPasswordSchema>;
