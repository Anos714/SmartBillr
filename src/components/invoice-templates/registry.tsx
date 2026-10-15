import { TEMPLATE_CATALOG, type TemplateMeta } from "@/lib/templates";
import { MinimalWhitePreview, type TemplateProps } from "./minimal-white";
import { MinimalWhitePdfDocument } from "./minimal-white-pdf";
import { FreelancerPopPreview } from "./freelancer-pop";
import { FreelancerPopPdfDocument } from "./freelancer-pop-pdf";

export type TemplateEntry = {
  meta: TemplateMeta;
  Preview: (props: TemplateProps) => React.JSX.Element;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PdfDocument: (props: TemplateProps) => any;
};

// Only 2 templates are implemented in this step; the remaining 6 catalog
// entries fall back to Minimal White for preview + PDF until their
// dedicated templates land.
const entries: Record<string, TemplateEntry> = {
  "minimal-white": {
    meta: TEMPLATE_CATALOG.find((t) => t.id === "minimal-white")!,
    Preview: MinimalWhitePreview,
    PdfDocument: MinimalWhitePdfDocument,
  },
  "freelancer-pop": {
    meta: TEMPLATE_CATALOG.find((t) => t.id === "freelancer-pop")!,
    Preview: FreelancerPopPreview,
    PdfDocument: FreelancerPopPdfDocument,
  },
};

for (const meta of TEMPLATE_CATALOG) {
  if (!entries[meta.id]) {
    entries[meta.id] = {
      meta,
      Preview: MinimalWhitePreview,
      PdfDocument: MinimalWhitePdfDocument,
    };
  }
}

export function getTemplate(id: string): TemplateEntry {
  return entries[id] ?? entries["minimal-white"];
}

export function canUseTemplate(isPro: boolean, templateId: string): boolean {
  const meta = TEMPLATE_CATALOG.find((t) => t.id === templateId);
  if (!meta) return templateId === "minimal-white";
  return meta.isFree || isPro;
}

export { TEMPLATE_CATALOG };
