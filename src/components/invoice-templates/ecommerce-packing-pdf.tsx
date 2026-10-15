import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import { formatMoney as canonicalFormatMoney } from "@/lib/money";
import { adjustmentAmount, lineAmount } from "./minimal-white";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";

const KRAFT = "#92400E";

const money = (currency: string, value: number) =>
  canonicalFormatMoney(value, currency);

const itemName = (it: { name?: string; desc?: string }) =>
  (it.name && it.name.trim()) || (it.desc && it.desc.trim()) || "Untitled item";

const sku = (it: { hsn?: string }, idx: number) => it.hsn || `SKU-${String(idx + 1).padStart(3, "0")}`;

const styles = StyleSheet.create({
  page: { fontSize: 10, color: "#1c1917", backgroundColor: "#FBF7F1", fontFamily: INVOICE_PDF_FONT_FAMILY },
  pageDark: { fontSize: 10, color: "#eef4fa", backgroundColor: "#0a141f", fontFamily: INVOICE_PDF_FONT_FAMILY },
  cutWrap: { paddingHorizontal: 36, paddingTop: 18 },
  cutLine: { borderTopWidth: 1, borderTopStyle: "dashed", position: "relative" },
  cutLabel: { position: "absolute", top: -7, left: "42%", fontSize: 8, paddingHorizontal: 6 },
  head: { paddingHorizontal: 36, paddingTop: 14, flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  no: { fontSize: 34, fontWeight: "bold", marginTop: 6 },
  orderLine: { fontSize: 8, marginTop: 6 },
  meta: { fontSize: 9, marginTop: 2, textAlign: "right" },
  chip: { marginTop: 6, borderWidth: 1, borderRadius: 4, padding: 3, fontSize: 8, alignSelf: "flex-end" },
  stripes: { flexDirection: "row", height: 18, gap: 2, paddingHorizontal: 36, marginTop: 14 },
  doubleRule: { height: 2 },
  hairlineRule: { height: 1 },
  body: { padding: 36, paddingTop: 20, paddingBottom: 72 },
  boxes: { flexDirection: "row", gap: 16 },
  box: { width: "50%", borderWidth: 1, borderRadius: 6, padding: 12 },
  tableHead: { flexDirection: "row", marginTop: 28, paddingVertical: 7 },
  headText: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 8 },
  colSku: { width: 90, fontSize: 8, fontWeight: "bold" },
  colItem: { flex: 1 },
  colQty: { width: 50, textAlign: "center", fontWeight: "bold" },
  colRate: { width: 80, textAlign: "right" },
  colAmt: { width: 80, textAlign: "right", fontWeight: "bold" },
  itemDescSmall: { fontSize: 9, marginTop: 2 },
  bottomRow: { flexDirection: "row", marginTop: 28, gap: 24 },
  thanks: { flex: 1, borderWidth: 1, borderStyle: "dashed", borderRadius: 6, padding: 12, textAlign: "center" },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, fontSize: 10 },
  grandLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  grandValue: { fontSize: 22, fontWeight: "bold" },
  payBlock: { marginTop: 28 },
  payLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  payLine: { fontSize: 8, marginTop: 2 },
  sigRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 28 },
  sigBox: { alignItems: "flex-end" },
  sigImage: { width: 120, height: 36, objectFit: "contain" },
  sigSpacer: { width: 160, height: 36, borderBottomWidth: 1 },
  sigCaption: { fontSize: 8, marginTop: 4 },
  watermark: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontSize: 8 },
});

export function EcommercePackingPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || KRAFT;
  const dark = data.theme?.mode === "dark";
  const no = invoiceDisplayNo({ prefix: data.prefix ?? "", serialNumber: data.serialNumber ?? "", invoiceNo: data.invoiceNo });
  const paper = dark ? "#0a141f" : "#FBF7F1";
  const cardBg = dark ? "#101f30" : "#ffffff";
  const muted = dark ? "#7d93ab" : "#78716c";
  const body = dark ? "#b9c7d8" : "#57534e";
  const strong = dark ? "#eef4fa" : "#1c1917";
  const hairline = dark ? "#1d2f44" : "#e7e0d5";
  const stripeInk = dark ? "#334155" : "#1c1917";
  const totalQty = data.items.reduce((s, it) => s + (it.qty || 0), 0);
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={styles.cutWrap}>
          <View style={[styles.cutLine, { borderTopColor: muted }]}>
            <Text style={[styles.cutLabel, { backgroundColor: paper, color: muted }]}>✂ cut here</Text>
          </View>
        </View>
        <View style={styles.head}>
          <View>
            <Text style={[styles.label, { color: accent }]}>Packing Slip</Text>
            <Text style={[styles.no, { color: strong }]}>{no}</Text>
            <Text style={[styles.orderLine, { color: muted }]}>Order: {no}</Text>
          </View>
          <View>
            <Text style={[styles.label, { color: accent, textAlign: "right" }]}>Schedule</Text>
            <Text style={[styles.meta, { color: strong }]}>Issued: {data.issueDate}</Text>
            <Text style={[styles.meta, { color: strong }]}>Due: {data.dueDate}</Text>
            {data.paymentTerms ? <Text style={[styles.meta, { color: body }]}>Terms: {data.paymentTerms}</Text> : null}
            <Text style={[styles.chip, { borderColor: hairline, color: body }]}>{totalQty} items · {data.items.length} lines</Text>
          </View>
        </View>
        <View style={styles.stripes}>
          {Array.from({ length: 48 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: i % 7 === 0 ? 4 : i % 3 === 0 ? 2.5 : 1.25,
                backgroundColor: i % 11 === 0 ? accent : stripeInk,
                opacity: 0.8,
              }}
            />
          ))}
        </View>
        <View style={{ paddingHorizontal: 36, marginTop: 8 }}>
          <View style={[styles.doubleRule, { backgroundColor: accent }]} />
          <View style={[styles.hairlineRule, { backgroundColor: hairline, marginTop: 3 }]} />
        </View>
        <View style={styles.body}>
          <View style={styles.boxes}>
            <View style={[styles.box, { borderColor: hairline, backgroundColor: cardBg }]}>
              <Text style={[styles.label, { color: accent }]}>Ship to</Text>
              <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "bold", color: strong }}>{data.billToName}</Text>
              <Text style={{ color: body, fontSize: 9 }}>{data.billToAddress}</Text>
              <Text style={{ color: body, fontSize: 9 }}>{data.billToEmail}</Text>
            </View>
            <View style={[styles.box, { borderColor: hairline, backgroundColor: cardBg }]}>
              <Text style={[styles.label, { color: accent }]}>Bill to</Text>
              <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "bold", color: strong }}>{data.billToName}</Text>
              <Text style={{ color: body, fontSize: 9 }}>{data.fromName}</Text>
              <Text style={{ color: body, fontSize: 9 }}>{data.fromAddress}</Text>
            </View>
          </View>
          <View style={styles.tableHead}>
            <Text style={[styles.colSku, styles.headText, { color: muted }]}>SKU</Text>
            <Text style={[styles.colItem, styles.headText, { color: muted }]}>Item</Text>
            <Text style={[styles.colQty, styles.headText, { color: muted }]}>Qty</Text>
            <Text style={[styles.colRate, styles.headText, { color: muted }]}>Rate</Text>
            <Text style={[styles.colAmt, styles.headText, { color: muted }]}>Amount</Text>
          </View>
          <View style={[styles.doubleRule, { backgroundColor: accent }]} />
          <View style={[styles.hairlineRule, { backgroundColor: hairline, marginTop: 3 }]} />
          {data.items.map((it, idx) => (
            <View key={it.id} style={[styles.tableRow, { borderBottomColor: hairline }]}>
              <Text style={[styles.colSku, { color: accent }]}>{sku(it, idx)}</Text>
              <View style={styles.colItem}>
                <Text style={{ color: strong, fontWeight: "bold" }}>{itemName(it)}</Text>
                {it.description ? <Text style={[styles.itemDescSmall, { color: muted }]}>{it.description}</Text> : null}
              </View>
              <Text style={[styles.colQty, { color: strong }]}>{String(it.qty)}</Text>
              <Text style={[styles.colRate, { color: body }]}>{money(data.currency, it.rate)}</Text>
              <Text style={[styles.colAmt, { color: strong }]}>{money(data.currency, lineAmount(totals, it.id))}</Text>
            </View>
          ))}
          <View wrap={false}>
            <View style={styles.bottomRow}>
              <View style={[styles.thanks, { borderColor: accent, backgroundColor: cardBg }]}>
                <Text style={{ fontWeight: "bold", color: strong }}>Thank you for shopping with {data.fromName}!</Text>
                {data.notes ? <Text style={{ marginTop: 4, color: body, fontSize: 9 }}>{data.notes}</Text> : null}
                {data.terms ? <Text style={{ marginTop: 4, color: muted, fontSize: 9 }}>{data.terms}</Text> : null}
              </View>
              <View style={styles.totalsBox}>
                <View style={[styles.totalRow, { color: body }]}><Text>Subtotal</Text><Text>{money(data.currency, totals.subtotal)}</Text></View>
                <View style={[styles.totalRow, { color: body }]}><Text>Discount</Text><Text>-{money(data.currency, totals.discount)}</Text></View>
                {(data.adjustments ?? []).map((a) => (
                  <View key={a.id} style={[styles.totalRow, { color: body }]}>
                    <Text>
                      {a.label || "Adjustment"}
                      {a.type === "percentage" ? ` (${a.value}%)` : ""}
                    </Text>
                    <Text>
                      {money(data.currency, adjustmentAmount(totals, a.id))}
                    </Text>
                  </View>
                ))}
                <View style={[styles.totalRow, { color: body }]}><Text>Tax</Text><Text>{money(data.currency, totals.taxTotal)}</Text></View>
                {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
                  <View style={[styles.totalRow, { color: body }]}><Text>Adjustments</Text><Text>{money(data.currency, totals.adjustmentsTotal)}</Text></View>
                ) : null}
                <View style={[styles.doubleRule, { backgroundColor: accent }]} />
                <View style={[styles.hairlineRule, { backgroundColor: hairline, marginBottom: 8, marginTop: 3 }]} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Text style={[styles.grandLabel, { color: muted }]}>Total</Text>
                  <Text style={[styles.grandValue, { color: strong }]}>{money(data.currency, totals.grandTotal)}</Text>
                </View>
              </View>
            </View>
            {(data.paymentInfo ?? []).length > 0 ? (
              <View style={styles.payBlock}>
                <Text style={[styles.payLabel, { color: accent }]}>Payment info</Text>
                {(data.paymentInfo ?? []).map((m, i) => (
                  <Text key={i} style={[styles.payLine, { color: body }]}>
                    {m.label ? `${m.label}: ` : ""}{m.value}
                  </Text>
                ))}
              </View>
            ) : null}
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
        </View>
        {watermark ? <Text fixed style={[styles.watermark, { color: muted }]}>Made with SmartBillr</Text> : null}
      </Page>
    </Document>
  );
}
