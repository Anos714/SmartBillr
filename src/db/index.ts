import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Bun loads .env.local automatically; fall back to a placeholder so
// `next build` / `vitest` (guest mode) never throw at import time.
// Real queries only run when DATABASE_URL is configured.
const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/placeholder";

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
