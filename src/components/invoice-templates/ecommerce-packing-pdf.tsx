import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";

const money = (currency: string, value: number) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const itemName = (it: { name?: string; desc?: string }) =>
  (it.name && it.name.trim()) || (it.desc && it.desc.trim()) || "Untitled item";

const sku = (it: { hsn?: string }, idx: number) => it.hsn || `SKU-${String(idx + 1).padStart(3, "0")}`;

const styles = StyleSheet.create({
  page: { fontSize: 10, color: "#0f172a", backgroundColor: "#ffffff", fontFamily: INVOICE_PDF_FONT_FAMILY },
  pageDark: { fontSize: 10, color: "#eef4fa", backgroundColor: "#0a141f", fontFamily: INVOICE_PDF_FONT_FAMILY },
  bar: { padding: 28, paddingBottom: 20, flexDirection: "row", justifyContent: "space-between" },
  barLabel: { fontSize: 8, fontWeight: "bold", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 3 },
  barNo: { fontSize: 22, fontWeight: "bold", color: "#ffffff", marginTop: 4 },
  barMeta: { fontSize: 9, color: "#ffffff", marginTop: 2, textAlign: "right" },
  stripes: { flexDirection: "row", height: 14, gap: 2, paddingHorizontal: 28 },
  body: { padding: 28, paddingBottom: 72 },
  boxes: { flexDirection: "row", gap: 12 },
  box: { width: "50%", borderWidth: 1, borderRadius: 6, padding: 10 },
  boxAccent: { width: "50%", borderWidth: 2, borderRadius: 6, padding: 10 },
  label: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.5 },
  tableHead: { flexDirection: "row", marginTop: 18, paddingVertical: 7, borderBottomWidth: 2 },
  headText: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 7 },
  colSku: { width: 80, fontSize: 8, fontWeight: "bold" },
  colItem: { flex: 1 },
  colQty: { width: 50, textAlign: "center", fontWeight: "bold" },
  colRate: { width: 80, textAlign: "right" },
  colAmt: { width: 80, textAlign: "right", fontWeight: "bold" },
  bottomRow: { flexDirection: "row", marginTop: 16, gap: 16 },
  thanks: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 10, textAlign: "center" },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, fontSize: 10 },
  divider: { borderTopWidth: 2, marginTop: 2, marginBottom: 6 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", fontSize: 13, fontWeight: "bold" },
  sigRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
  sigBox: { alignItems: "flex-end" },
  sigImage: { width: 120, height: 36, objectFit: "contain" },
  sigSpacer: { width: 160, height: 36, borderBottomWidth: 1 },
  sigCaption: { fontSize: 8, marginTop: 4 },
  watermark: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontSize: 8 },
});

export function EcommercePackingPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || "#0EA5E9";
  const dark = data.theme?.mode === "dark";
  const no = invoiceDisplayNo({ prefix: data.prefix ?? "", serialNumber: data.serialNumber ?? "", invoiceNo: data.invoiceNo });
  const muted = dark ? "#7d93ab" : "#64748b";
  const body = dark ? "#b9c7d8" : "#475569";
  const strong = dark ? "#eef4fa" : "#0f172a";
  const hairline = dark ? "#1d2f44" : "#e2e8f0";
  const totalQty = data.items.reduce((s, it) => s + (it.qty || 0), 0);
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={[styles.bar, { backgroundColor: accent }]}>
          <View>
            <Text style={styles.barLabel}>Packing Slip</Text>
            <Text style={styles.barNo}>{no}</Text>
          </View>
          <View>
            <Text style={styles.barMeta}>Order: {no}</Text>
            <Text style={styles.barMeta}>Issued {data.issueDate} · Due {data.dueDate}</Text>
            <Text style={styles.barMeta}>{totalQty} items · {data.items.length} lines</Text>
          </View>
        </View>
        <View style={styles.stripes}>
          {Array.from({ length: 40 }).map((_, i) => (
            <View key={i} style={{ width: i % 3 === 0 ? 4 : 2, backgroundColor: muted }} />
          ))}
        </View>
        <View style={styles.body}>
          <View style={styles.boxes}>
            <View style={[styles.boxAccent, { borderColor: accent }]}>
              <Text style={[styles.label, { color: accent }]}>Ship to</Text>
              <Text style={{ marginTop: 4, fontWeight: "bold", color: strong }}>{data.billToName}</Text>
              <Text style={{ color: body }}>{data.billToAddress}</Text>
            </View>
            <View style={[styles.box, { borderColor: hairline }]}>
              <Text style={[styles.label, { color: accent }]}>Bill to</Text>
              <Text style={{ marginTop: 4, fontWeight: "bold", color: strong }}>{data.billToName}</Text>
              <Text style={{ color: body }}>{data.fromName}</Text>
            </View>
          </View>
          <View style={[styles.tableHead, { borderBottomColor: accent }]}>
            <Text style={[styles.colSku, styles.headText, { color: muted }]}>SKU</Text>
            <Text style={[styles.colItem, styles.headText, { color: muted }]}>Item</Text>
            <Text style={[styles.colQty, styles.headText, { color: muted }]}>Qty</Text>
            <Text style={[styles.colRate, styles.headText, { color: muted }]}>Rate</Text>
            <Text style={[styles.colAmt, styles.headText, { color: muted }]}>Amount</Text>
          </View>
          {data.items.map((it, idx) => (
            <View key={it.id} style={[styles.tableRow, { borderBottomColor: hairline }]}>
              <Text style={[styles.colSku, { color: accent }]}>{sku(it, idx)}</Text>
              <View style={styles.colItem}><Text style={{ color: strong }}>{itemName(it)}</Text></View>
              <Text style={[styles.colQty, { color: strong }]}>{String(it.qty)}</Text>
              <Text style={[styles.colRate, { color: body }]}>{money(data.currency, it.rate)}</Text>
              <Text style={[styles.colAmt, { color: strong }]}>{money(data.currency, it.qty * it.rate)}</Text>
            </View>
          ))}
          <View style={styles.bottomRow}>
            <View style={[styles.thanks, { borderColor: accent }]}>
              <Text style={{ fontWeight: "bold", color: strong }}>Thank you for shopping with {data.fromName}!</Text>
              {data.notes ? <Text style={{ marginTop: 4, color: body }}>{data.notes}</Text> : null}
            </View>
            <View style={styles.totalsBox}>
              <View style={[styles.totalRow, { color: body }]}><Text>Subtotal</Text><Text>{money(data.currency, totals.subtotal)}</Text></View>
              <View style={[styles.totalRow, { color: body }]}><Text>Discount</Text><Text>-{money(data.currency, totals.discount)}</Text></View>
              <View style={[styles.totalRow, { color: body }]}><Text>Tax</Text><Text>{money(data.currency, totals.taxTotal)}</Text></View>
              {totals.adjustmentsTotal !== 0 ? (
                <View style={[styles.totalRow, { color: body }]}><Text>Adjustments</Text><Text>{money(data.currency, totals.adjustmentsTotal)}</Text></View>
              ) : null}
              <View style={[styles.divider, { borderTopColor: accent }]} />
              <View style={[styles.grandRow, { color: strong }]}><Text>Total</Text><Text>{money(data.currency, totals.grandTotal)}</Text></View>
            </View>
          </View>
          <View style={styles.sigRow}>
            <View style={styles.sigBox}>
              {data.signatureUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={data.signatureUrl} style={styles.sigImage} />
              ) : (
                <View style={[styles.sigSpacer, { borderBottomColor: muted }]} />
              )}
              <Text style={[styles.sigCaption, { color: muted }]}>Authorized signature</Text>
            </View>
          </View>
        </View>
        {watermark ? <Text style={[styles.watermark, { color: muted }]}>Made with SmartBillr</Text> : null}
      </Page>
    </Document>
  );
}
