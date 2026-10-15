import { Font } from "@react-pdf/renderer";

// DejaVu Sans covers U+20B9 (₹) which @react-pdf's default Helvetica lacks.
// Files live in public/fonts so they are served to the browser (client-side
// pdf() / PDFDownloadLink) and resolvable from disk during SSR/Node use.
export const INVOICE_PDF_FONT_FAMILY = "InvoiceSans";

const regularSrc =
  typeof window === "undefined"
    ? `${process.cwd()}/public/fonts/DejaVuSans.ttf`
    : "/fonts/DejaVuSans.ttf";

const boldSrc =
  typeof window === "undefined"
    ? `${process.cwd()}/public/fonts/DejaVuSans-Bold.ttf`
    : "/fonts/DejaVuSans-Bold.ttf";

const obliqueSrc =
  typeof window === "undefined"
    ? `${process.cwd()}/public/fonts/DejaVuSans-Oblique.ttf`
    : "/fonts/DejaVuSans-Oblique.ttf";

const boldObliqueSrc =
  typeof window === "undefined"
    ? `${process.cwd()}/public/fonts/DejaVuSans-BoldOblique.ttf`
    : "/fonts/DejaVuSans-BoldOblique.ttf";

Font.register({
  family: INVOICE_PDF_FONT_FAMILY,
  fonts: [
    { src: regularSrc },
    { src: boldSrc, fontWeight: "bold" },
    { src: obliqueSrc, fontStyle: "italic" },
    { src: boldObliqueSrc, fontWeight: "bold", fontStyle: "italic" },
  ],
});
