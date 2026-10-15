import { TEMPLATE_CATALOG, type TemplateMeta } from "@/lib/templates";
import { MinimalWhitePreview, type TemplateProps } from "./minimal-white";
import { MinimalWhitePdfDocument } from "./minimal-white-pdf";
import { FreelancerPopPreview } from "./freelancer-pop";
import { FreelancerPopPdfDocument } from "./freelancer-pop-pdf";
import { CorporateProPreview } from "./corporate-pro";
import { CorporateProPdfDocument } from "./corporate-pro-pdf";
import { BoldDarkPreview } from "./bold-dark";
import { BoldDarkPdfDocument } from "./bold-dark-pdf";
import { PastelCreativePreview } from "./pastel-creative";
import { PastelCreativePdfDocument } from "./pastel-creative-pdf";
import { GstTaxInvoiceIndiaPreview } from "./gst-tax-invoice-india";
import { GstTaxInvoiceIndiaPdfDocument } from "./gst-tax-invoice-india-pdf";
import { EcommercePackingPreview } from "./ecommerce-packing";
import { EcommercePackingPdfDocument } from "./ecommerce-packing-pdf";
import { ConsultingRetainerPreview } from "./consulting-retainer";
import { ConsultingRetainerPdfDocument } from "./consulting-retainer-pdf";

export type TemplateEntry = {
  meta: TemplateMeta;
  Preview: (props: TemplateProps) => React.JSX.Element;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PdfDocument: (props: TemplateProps) => any;
};

// All 8 catalog templates are implemented with dedicated components.
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
  "corporate-pro": {
    meta: TEMPLATE_CATALOG.find((t) => t.id === "corporate-pro")!,
    Preview: CorporateProPreview,
    PdfDocument: CorporateProPdfDocument,
  },
  "bold-dark": {
    meta: TEMPLATE_CATALOG.find((t) => t.id === "bold-dark")!,
    Preview: BoldDarkPreview,
    PdfDocument: BoldDarkPdfDocument,
  },
  "pastel-creative": {
    meta: TEMPLATE_CATALOG.find((t) => t.id === "pastel-creative")!,
    Preview: PastelCreativePreview,
    PdfDocument: PastelCreativePdfDocument,
  },
  "gst-tax-invoice-india": {
    meta: TEMPLATE_CATALOG.find((t) => t.id === "gst-tax-invoice-india")!,
    Preview: GstTaxInvoiceIndiaPreview,
    PdfDocument: GstTaxInvoiceIndiaPdfDocument,
  },
  "ecommerce-packing": {
    meta: TEMPLATE_CATALOG.find((t) => t.id === "ecommerce-packing")!,
    Preview: EcommercePackingPreview,
    PdfDocument: EcommercePackingPdfDocument,
  },
  "consulting-retainer": {
    meta: TEMPLATE_CATALOG.find((t) => t.id === "consulting-retainer")!,
    Preview: ConsultingRetainerPreview,
    PdfDocument: ConsultingRetainerPdfDocument,
  },
};

export function getTemplate(id: string): TemplateEntry {
  return entries[id] ?? entries["minimal-white"];
}

export function canUseTemplate(isPro: boolean, templateId: string): boolean {
  const meta = TEMPLATE_CATALOG.find((t) => t.id === templateId);
  if (!meta) return templateId === "minimal-white";
  return meta.isFree || isPro;
}

export { TEMPLATE_CATALOG };
