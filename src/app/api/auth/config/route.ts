import { NextResponse } from "next/server";

import { isGoogleConfigured } from "@/lib/auth-status";

export async function GET() {
  return NextResponse.json({ googleConfigured: isGoogleConfigured() });
}
