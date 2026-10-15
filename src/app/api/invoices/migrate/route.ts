import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { auth } from "@/lib/auth";
import { InvoiceSchema, type InvoiceData } from "@/lib/invoice";
import { normalizeStatus, toRow } from "@/lib/invoice-row";

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
  let body: { invoices?: Array<{ invoice?: unknown; status?: unknown }> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!Array.isArray(body?.invoices)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const values = [];
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
    values.push(
      toRow(
        userId,
        parsed.data as InvoiceData,
        normalizeStatus(entry?.status ?? "draft"),
      ),
    );
  }
  if (values.length > 0) {
    await db.insert(invoices).values(values);
  }
  return NextResponse.json({ migrated: values.length });
}
