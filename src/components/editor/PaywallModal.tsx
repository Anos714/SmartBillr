"use client";

import Link from "next/link";
import { Logo } from "@/components/Brand";

type Props = {
  templateName: string;
  open: boolean;
  onClose: () => void;
};

export function PaywallModal({ templateName, open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#101210]/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="paper-texture relative w-full max-w-sm rounded-[1.5rem] border border-[#E7E2D8] bg-[#FFFDF8] p-6 shadow-2xl">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <p className="text-xs font-bold tracking-widest text-[#0C6B4F] uppercase">Pro template</p>
        </div>
        <h2 className="mt-2 text-2xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>{templateName} is Pro</h2>
        <p className="mt-2 text-sm leading-6 text-[#6B675E]">Unlock &ldquo;{templateName}&rdquo; plus all premium designs, watermark-free PDFs, and your logo.</p>
        <div className="mt-5 space-y-2">
          <a href="/api/auth/signin" aria-disabled="true" onClick={(e) => e.preventDefault()} title="auth lands in next step" className="block cursor-not-allowed rounded-xl bg-[#101210] px-4 py-2.5 text-center text-sm font-semibold text-white opacity-60">Sign in with Google (auth lands in next step)</a>
          <Link href={`/pricing?template=${encodeURIComponent(templateName)}`} className="block rounded-xl bg-[#D9F452] px-4 py-2.5 text-center text-sm font-bold text-[#101210] hover:shadow-[0_0_24px_-6px_#D9F452]">View Pricing</Link>
          <button type="button" onClick={onClose} className="block w-full rounded-xl px-4 py-2 text-center text-sm text-[#6B675E] hover:text-[#141412]">Keep editing free templates</button>
        </div>
      </div>
    </div>
  );
}
