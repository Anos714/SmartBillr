import { and, count, desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { auth } from "@/lib/auth";
import { InvoiceSchema, type InvoiceData } from "@/lib/invoice";
import { fromRow, normalizeStatus, toRow } from "@/lib/invoice-row";
import type { InvoiceStatus } from "@/lib/library";
import { parsePaging } from "@/lib/paging";

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
  const { limit, offset, status } = parsePaging(req.nextUrl.searchParams);
  const where = status
    ? and(eq(invoices.userId, userId), eq(invoices.status, status))
    : eq(invoices.userId, userId);
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(invoices)
      .where(where)
      .orderBy(desc(invoices.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(invoices).where(where),
  ]);
  return NextResponse.json({
    invoices: rows.map(fromRow),
    total: totalRows[0]?.n ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { invoice?: unknown; status?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = InvoiceSchema.safeParse(body?.invoice);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_invoice", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  let status: InvoiceStatus = "draft";
  if (body?.status !== undefined) {
    if (
      body.status !== "draft" &&
      body.status !== "paid" &&
      body.status !== "pending" &&
      body.status !== "overdue"
    ) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    status = normalizeStatus(body.status);
  }
  const row = toRow(userId, parsed.data as InvoiceData, status);
  const inserted = await db
    .insert(invoices)
    .values(row)
    .returning({ id: invoices.id });
  const id = inserted[0]?.id;
  if (!id) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }
  return NextResponse.json({ id });
}
