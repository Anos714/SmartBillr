import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

function signParams(params: Record<string, string>, secret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

/**
 * Returns Cloudinary signed-upload params.
 * Guest uploads allowed (no auth required yet): folder smartbillr/guest,
 * or smartbillr/{userId} when a session exists.
 * 503 when Cloudinary is unconfigured — client falls back to dataURL flow.
 */
export async function POST(req: Request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary not configured" },
      { status: 503 },
    );
  }

  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    userId = session?.user?.id ?? null;
  } catch {
    userId = null;
  }

  let body: { folder?: string; eager?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = body.folder ?? `smartbillr/${userId ?? "guest"}`;
  const eager = body.eager ?? "c_limit,w_300,h_100,q_auto,f_auto";

  const signature = signParams({ timestamp, folder, eager }, apiSecret);

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    eager,
    signature,
  });
}
