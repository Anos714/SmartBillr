"use client";

import Link from "next/link";

type Props = {
  templateName: string;
  open: boolean;
  onClose: () => void;
};

export function PaywallModal({ templateName, open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Pro template
        </p>
        <h2 className="mt-1 text-lg font-bold">{templateName} is Pro</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Pro template. Sign in to unlock &ldquo;{templateName}&rdquo; and all
          premium designs.
        </p>
        <div className="mt-5 space-y-2">
          <a
            href="/api/auth/signin"
            aria-disabled="true"
            onClick={(e) => e.preventDefault()}
            title="auth lands in next step"
            className="block cursor-not-allowed rounded-xl bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white opacity-60"
          >
            Sign in with Google (auth lands in next step)
          </a>
          <Link
            href={`/pricing?template=${encodeURIComponent(templateName)}`}
            className="block rounded-xl border border-zinc-200 px-4 py-2.5 text-center text-sm font-semibold hover:border-zinc-400"
          >
            View Pricing
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="block w-full rounded-xl px-4 py-2 text-center text-sm text-zinc-500 hover:text-zinc-900"
          >
            Keep editing free templates
          </button>
        </div>
      </div>
    </div>
  );
}
