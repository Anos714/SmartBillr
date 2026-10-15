export type TemplateMeta = {
  id: string;
  name: string;
  tagline: string;
  isFree: boolean;
  accent: string;
};

export const FREE_COUNT = 2;

export const TEMPLATE_CATALOG: TemplateMeta[] = [
  {
    id: "minimal-white",
    name: "Minimal White",
    tagline: "Clean, timeless layout for any business",
    isFree: true,
    accent: "#09090b",
  },
  {
    id: "freelancer-pop",
    name: "Freelancer Pop",
    tagline: "Playful color for solo pros and creators",
    isFree: true,
    accent: "#16a34a",
  },
  {
    id: "corporate-pro",
    name: "Corporate Pro",
    tagline: "Boardroom-ready polish for agencies",
    isFree: false,
    accent: "#1e3a8a",
  },
  {
    id: "bold-dark",
    name: "Bold Dark",
    tagline: "High-contrast drama for modern studios",
    isFree: false,
    accent: "#7c3aed",
  },
  {
    id: "pastel-creative",
    name: "Pastel Creative",
    tagline: "Soft tones for designers and makers",
    isFree: false,
    accent: "#ec4899",
  },
  {
    id: "gst-tax-invoice-india",
    name: "GST Tax Invoice — India",
    tagline: "GSTIN, CGST/SGST split and tax-ready totals",
    isFree: false,
    accent: "#f59e0b",
  },
  {
    id: "ecommerce-packing",
    name: "Ecommerce Packing",
    tagline: "Line-item dense slips for online sellers",
    isFree: false,
    accent: "#0ea5e9",
  },
  {
    id: "consulting-retainer",
    name: "Consulting Retainer",
    tagline: "Milestones and retainers for advisors",
    isFree: false,
    accent: "#4f46e5",
  },
];
