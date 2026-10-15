// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";

import "@/lib/pdf-font";
import {
  DEFAULT_INVOICE,
  calcTotals,
  type InvoiceData,
  type InvoiceTotals,
} from "@/lib/invoice";
import { MinimalWhitePdfDocument } from "@/components/invoice-templates/minimal-white-pdf";

function buildInvoice(itemCount: number): {
  data: InvoiceData;
  totals: InvoiceTotals;
} {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Service line ${i + 1}`,
    description: `Scope detail for line ${i + 1} — should flow onto later pages, not vanish.`,
    qty: 2,
    rate: 100,
    taxPct: 18,
  }));
  const data: InvoiceData = { ...DEFAULT_INVOICE, items };
  const totals = calcTotals({
    items: data.items,
    discountFlat: data.discountFlat,
    adjustments: data.adjustments ?? [],
  });
  return { data, totals };
}

function pageCount(buf: Buffer): number {
  const text = buf.toString("latin1");
  // "/Type /Pages" (parent node) also contains "/Type /Page" — exclude it.
  return (text.match(/\/Type \/Page[^s]/g) ?? []).length;
}

describe("multipage PDF flow", () => {
  it(
    "renders a 40-item invoice without clipping (output grows vs 1 item)",
    async () => {
      const one = buildInvoice(1);
      const many = buildInvoice(40);
      const [bufOne, bufMany] = await Promise.all([
        renderToBuffer(
          <MinimalWhitePdfDocument
            data={one.data}
            totals={one.totals}
            watermark
          />,
        ),
        renderToBuffer(
          <MinimalWhitePdfDocument
            data={many.data}
            totals={many.totals}
            watermark
          />,
        ),
      ]);
      expect(bufOne.length).toBeGreaterThan(0);
      // Content streams compress well, so byte size alone is a weak signal —
      // assert on real page count: 1 item fits on one page, 40 must spill.
      expect(pageCount(bufOne)).toBe(1);
      expect(pageCount(bufMany)).toBeGreaterThan(1);
      // If items were clipped instead of flowing, both buffers would be near
      // identical in size; flowing content must still be larger overall.
      expect(bufMany.length).toBeGreaterThan(bufOne.length);
    },
    60000,
  );
});
