import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subscriptions } from "@/db/schema";

/**
 * True when the user holds an active Pro subscription.
 * Returns false for guests, unknown users, and until the Dodo step lands.
 */
export async function hasProAccess(
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false;
  try {
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    const sub = rows[0];
    if (!sub) return false;
    return sub.status === "active" || sub.status === "trialing";
  } catch {
    return false;
  }
}
