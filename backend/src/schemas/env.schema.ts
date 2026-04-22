import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("8080"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  MONGO_URI: z.string().url(),
});
