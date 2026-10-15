import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { assets } from "@/db/schema";
import { auth } from "@/lib/auth";

async function requireUserId(req: NextRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(assets).where(eq(assets.userId, userId));
  return NextResponse.json({ assets: rows });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: {
    type?: unknown;
    url?: unknown;
    publicId?: unknown;
    name?: unknown;
    isDefault?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof body?.type !== "string" || !body.type.trim()) {
    return NextResponse.json({ error: "type_required" }, { status: 400 });
  }
  if (typeof body?.url !== "string" || !body.url.trim()) {
    return NextResponse.json({ error: "url_required" }, { status: 400 });
  }
  const isDefault = body.isDefault === true;
  if (isDefault) {
    await db
      .update(assets)
      .set({ isDefault: false })
      .where(eq(assets.userId, userId));
  }
  const inserted = await db
    .insert(assets)
    .values({
      userId,
      type: body.type,
      url: body.url,
      publicId: typeof body.publicId === "string" ? body.publicId : null,
      name: typeof body.name === "string" ? body.name : null,
      isDefault,
    })
    .returning();
  const row = inserted[0];
  if (!row) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }
  return NextResponse.json({ id: row.id, asset: row });
}
