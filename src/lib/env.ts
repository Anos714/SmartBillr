import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "Missing ENV: DATABASE_URL - user must provide in .env.local"),
  BETTER_AUTH_SECRET: z.string().min(1).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1).optional(),
  DODO_PAYMENTS_API_KEY: z.string().min(1).optional(),
  DODO_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_DODO_PRO_PRODUCT_ID: z.string().min(1).optional(),
  DODO_RETURN_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type AppEnv = z.infer<typeof envSchema>;

function validateEnv(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const [key, schema] of Object.entries(envSchema.shape)) {
    const value = process.env[key];
    const parsed = schema.safeParse(value);
    if (!parsed.success && value === undefined) {
      const def = schema.safeParse(undefined);
      if (!def.success) missing.push(key);
    }
  }
  if (missing.length > 0) {
    console.error(
      `Missing ENV: ${missing.join(", ")} - user must provide in .env.local (see .env.example). Marketing + guest mode still work.`,
    );
  }
  return { ok: missing.length === 0, missing };
}

export const envStatus = typeof window === "undefined" ? validateEnv() : { ok: true, missing: [] as string[] };
