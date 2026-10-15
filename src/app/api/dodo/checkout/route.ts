import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createProCheckout } from "@/lib/dodo";

/** Create a Pro checkout session for the signed-in user. Body is empty. */
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

  try {
    const checkoutUrl = await createProCheckout({
      email,
      name: session.user.name ?? undefined,
      userId: session.user.id,
    });
    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (err) {
    console.error(
      "dodo checkout failed:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
