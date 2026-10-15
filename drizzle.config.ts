import type { Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // drizzle-kit migrate reads DATABASE_URL from the environment.
    // Run via `bun run db:migrate` so bun loads .env.local automatically.
    url: process.env.DATABASE_URL ?? "",
  },
} satisfies Config;
