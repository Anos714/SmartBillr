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
