import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hasProAccess } from "@/lib/billing";

/** Current viewer's Pro state. Guests get { pro: false }. */
export async function GET(req: Request) {
  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch {
    session = null;
  }

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ pro: false, status: "guest" });
  }

  const pro = await hasProAccess(userId);
  let status = "inactive";
  try {
    const rows = await db
      .select({ status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    status = rows[0]?.status ?? "inactive";
  } catch {
    status = "inactive";
  }

  return NextResponse.json({ pro, status });
}
