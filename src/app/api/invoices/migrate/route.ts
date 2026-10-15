import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { auth } from "@/lib/auth";
import { InvoiceSchema, type InvoiceData } from "@/lib/invoice";
import { normalizeStatus, toRow, type InvoiceInsert } from "@/lib/invoice-row";

export const MIGRATE_MAX_ITEMS = 200;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
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
  let body: {
    invoices?: Array<{ invoice?: unknown; status?: unknown; clientId?: unknown }>;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!Array.isArray(body?.invoices)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (body.invoices.length > MIGRATE_MAX_ITEMS) {
    return NextResponse.json(
      { error: "too_many_items", max: MIGRATE_MAX_ITEMS },
      { status: 400 },
    );
  }
  // Dedupe: skip items whose client-provided uuid already exists for this user.
  const existing = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(eq(invoices.userId, userId));
  const seen = new Set(existing.map((r) => r.id));
  const values: InvoiceInsert[] = [];
  let skipped = 0;
  for (let i = 0; i < body.invoices.length; i++) {
    const entry = body.invoices[i];
    const parsed = InvoiceSchema.safeParse(entry?.invoice);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_invoice", index: i, issues: parsed.error.issues },
        { status: 400 },
      );
    }
    if (entry?.status !== undefined) {
      const s = entry.status;
      if (s !== "draft" && s !== "paid" && s !== "pending" && s !== "overdue") {
        return NextResponse.json(
          { error: "invalid_status", index: i },
          { status: 400 },
        );
      }
    }
    const clientId =
      typeof entry?.clientId === "string" && UUID_RE.test(entry.clientId)
        ? entry.clientId
        : null;
    if (clientId) {
      if (seen.has(clientId)) {
        skipped += 1;
        continue;
      }
      seen.add(clientId);
    }
    const row = toRow(
      userId,
      parsed.data as InvoiceData,
      normalizeStatus(entry?.status ?? "draft"),
    );
    values.push(clientId ? { ...row, id: clientId } : row);
  }
  if (values.length > 0) {
    await db.insert(invoices).values(values);
  }
  return NextResponse.json({ migrated: values.length, skipped });
}
