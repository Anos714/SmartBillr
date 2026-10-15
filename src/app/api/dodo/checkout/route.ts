import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createProCheckout, type BillingPeriod } from "@/lib/dodo";

/** Create a Pro checkout session for the signed-in user. Body: { billing? }. */
export async function POST(req: Request) {
  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch {
    session = null;
  }

  if (!session?.user) {
    return NextResponse.json({ error: "signin_required" }, { status: 401 });
  }

  const email = session.user.email;
  if (!email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  let billing: BillingPeriod = "lifetime";
  try {
    const body = (await req.json()) as { billing?: unknown };
    if (body.billing === "monthly" || body.billing === "lifetime") {
      billing = body.billing;
    }
  } catch {
    // empty body — default to lifetime
  }

  try {
    const checkoutUrl = await createProCheckout({
      email,
      name: session.user.name ?? undefined,
      userId: session.user.id,
      billing,
    });
    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("dodo checkout failed:", message);
    if (message.startsWith("monthly_unavailable")) {
      return NextResponse.json({ error: "monthly_unavailable" }, { status: 400 });
    }
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
