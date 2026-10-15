import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { assets } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    userId = session?.user?.id ?? null;
  } catch {
    userId = null;
  }
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await db
    .select({ id: assets.id, userId: assets.userId })
    .from(assets)
    .where(eq(assets.id, id))
    .limit(1);
  const row = existing[0];
  if (!row || row.userId !== userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await db.delete(assets).where(eq(assets.id, id));
  return NextResponse.json({ ok: true });
}
