import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("8080"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  APP_URL: z.string().default("http://localhost:8080"),
  NODE_ENV: z.string().default("development"),
  MONGO_URI: z.string().url(),
  REDIS_URL: z.string(),

  //Smtp variables
  SMTP_HOST: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_PORT: z.string(),
  EMAIL_FROM: z.string(),

  //jwt secret
  ACCESS_SECRET: z.string(),
  REFRESH_SECRET: z.string(),

  //google secrets key
  GOOGLE_CLIENT_ID: z.string(),
});
