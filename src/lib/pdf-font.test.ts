import { statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { INVOICE_PDF_FONT_FAMILY } from "./pdf-font";

const FONTS = [
  "DejaVuSans.ttf",
  "DejaVuSans-Bold.ttf",
  "DejaVuSans-Oblique.ttf",
  "DejaVuSans-BoldOblique.ttf",
];

describe("pdf-font shipping", () => {
  it("exports the InvoiceSans family name", () => {
    expect(INVOICE_PDF_FONT_FAMILY).toBe("InvoiceSans");
  });

  it.each(FONTS)("ships public/fonts/%s larger than 300KB", (file) => {
    const full = join(process.cwd(), "public", "fonts", file);
    const stat = statSync(full);
    expect(stat.isFile()).toBe(true);
    expect(stat.size).toBeGreaterThan(300 * 1024);
  });
});
