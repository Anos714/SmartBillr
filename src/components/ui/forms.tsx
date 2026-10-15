/**
 * Single source for shared form/topbar class strings.
 *
 * `inputCls`/`labelCls` were duplicated in `create/invoice` and `assets`;
 * `topbarActionCls` lived in `AppShell` (which re-exports it for existing
 * importers). Import from here instead of copying the strings.
 */

export const inputCls =
  "w-full rounded-xl border border-[#E7E2D8] bg-[#FFFDF8] px-3 py-2 text-sm text-[#141412] shadow-[inset_0_1px_2px_rgba(20,20,18,0.04)] outline-none transition placeholder:text-stone-400 focus:border-[#0C6B4F] focus:ring-2 focus:ring-[#0C6B4F]/25";

export const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#3f3c37]";

/** Small bordered button style for topbar actions. */
export const topbarActionCls =
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E7E2D8] bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-[#3f3c37] transition hover:border-[#0C6B4F]/50 hover:text-[#0C6B4F] disabled:cursor-not-allowed disabled:opacity-50";
