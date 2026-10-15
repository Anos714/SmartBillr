import { auth } from "@/lib/auth";

/** Server: true when Google OAuth keys are present in the environment. */
export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

/** Server: current session (null in guest mode). */
export async function getServerSession() {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}
