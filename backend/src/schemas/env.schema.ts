import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("8080"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  MONGO_URI: z.string().url(),

  //Smtp variables
  SMTP_HOST: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_PORT: z.string(),
  EMAIL_FROM: z.string(),

  //jwt secret
  TOKEN_SECRET: z.string(),
  ACCESS_SECRET: z.string(),
  REFRESH_SECRET: z.string(),
});
