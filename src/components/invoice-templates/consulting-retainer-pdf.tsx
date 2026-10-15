import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import { formatMoney as canonicalFormatMoney } from "@/lib/money";
import { adjustmentAmount, lineAmount } from "./minimal-white";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";

const BURGUNDY = "#7F1D1D";

const money = (currency: string, value: number) =>
  canonicalFormatMoney(value, currency);

const itemName = (it: { name?: string; desc?: string }) =>
  (it.name && it.name.trim()) || (it.desc && it.desc.trim()) || "Untitled item";

const styles = StyleSheet.create({
  page: { fontSize: 10, color: "#1c1917", backgroundColor: "#ffffff", fontFamily: INVOICE_PDF_FONT_FAMILY },
  pageDark: { fontSize: 10, color: "#f0ece2", backgroundColor: "#100f0d", fontFamily: INVOICE_PDF_FONT_FAMILY },
  accentBar: { height: 4 },
  head: { padding: 36, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  no: { fontSize: 34, fontWeight: "bold", marginTop: 6 },
  rule: { width: 64, height: 2, marginTop: 10 },
  meta: { fontSize: 9, marginTop: 2 },
  card: { width: 230, borderWidth: 1, borderRadius: 8, padding: 14 },
  cardTick: { width: 40, height: 2 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, fontSize: 10 },
  body: { padding: 36, paddingTop: 8, paddingBottom: 72 },
  doubleRule: { height: 2 },
  hairlineRule: { height: 1 },
  tableHead: { flexDirection: "row", marginTop: 18, paddingVertical: 7 },
  headText: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 9 },
  colItem: { flex: 1 },
  colHrs: { width: 70, textAlign: "right", fontWeight: "bold" },
  colRate: { width: 90, textAlign: "right" },
  colAmt: { width: 90, textAlign: "right", fontWeight: "bold" },
  itemDescSmall: { fontSize: 9, marginTop: 2 },
  bottomRow: { flexDirection: "row", marginTop: 28, gap: 24 },
  termsBox: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 12 },
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

export function ConsultingRetainerPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || BURGUNDY;
  const dark = data.theme?.mode === "dark";
  const no = invoiceDisplayNo({ prefix: data.prefix ?? "", serialNumber: data.serialNumber ?? "", invoiceNo: data.invoiceNo });
  const muted = dark ? "#8f887a" : "#78716c";
  const body = dark ? "#c9c2b4" : "#57534e";
  const strong = dark ? "#f0ece2" : "#1c1917";
  const hairline = dark ? "#2b2a26" : "#e7e5e4";
  const cardBg = dark ? "#171512" : "#fafaf9";
  const tintBg = dark ? "#241314" : "#fbf1f1";
  const totalHours = data.items.reduce((s, it) => s + (it.qty || 0), 0);
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <View style={styles.head}>
          <View>
            <Text style={[styles.label, { color: accent }]}>Retainer Statement</Text>
            <Text style={[styles.no, { color: strong }]}>{no}</Text>
            <View style={[styles.rule, { backgroundColor: accent }]} />
            <Text style={[styles.meta, { color: strong, marginTop: 8 }]}>{data.fromName}</Text>
            <Text style={[styles.meta, { color: body }]}>{data.fromAddress}</Text>
            <Text style={[styles.meta, { color: body }]}>{data.fromEmail}</Text>
            {data.gstin ? <Text style={[styles.meta, { color: body }]}>GSTIN: {data.gstin}</Text> : null}
          </View>
          <View style={[styles.card, { borderColor: hairline, backgroundColor: cardBg }]}>
            <View style={[styles.cardTick, { backgroundColor: accent }]} />
            <Text style={[styles.label, { color: accent, marginTop: 8 }]}>Retainer summary</Text>
            <Text style={[styles.meta, { color: body }]}>Period</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: strong }}>{data.issueDate} → {data.dueDate}</Text>
            <View style={[styles.cardRow, { color: body, borderTopWidth: 1, borderTopColor: hairline, paddingTop: 6 }]}>
              <Text>Total hours</Text><Text>{totalHours} hrs</Text>
            </View>
            <View style={[styles.cardRow, { color: strong }]}><Text>Amount</Text><Text>{money(data.currency, totals.grandTotal)}</Text></View>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={[styles.meta, { color: body }]}>Prepared for {data.billToName} · {data.billToEmail}</Text>
          <View style={{ marginTop: 16 }}>
            <View style={[styles.doubleRule, { backgroundColor: accent }]} />
            <View style={[styles.hairlineRule, { backgroundColor: hairline, marginTop: 3 }]} />
          </View>
          <View style={styles.tableHead}>
            <Text style={[styles.colItem, styles.headText, { color: muted }]}>Engagement</Text>
            <Text style={[styles.colHrs, styles.headText, { color: muted }]}>Hrs</Text>
            <Text style={[styles.colRate, styles.headText, { color: muted }]}>Rate / hr</Text>
            <Text style={[styles.colAmt, styles.headText, { color: muted }]}>Amount</Text>
          </View>
          <View style={[styles.doubleRule, { backgroundColor: accent }]} />
          <View style={[styles.hairlineRule, { backgroundColor: hairline, marginTop: 3 }]} />
          {data.items.map((it) => (
            <View key={it.id} style={[styles.tableRow, { borderBottomColor: hairline }]}>
              <View style={styles.colItem}>
                <Text style={{ color: strong, fontWeight: "bold" }}>{itemName(it)}</Text>
                {it.description ? <Text style={[styles.itemDescSmall, { color: muted }]}>{it.description}</Text> : null}
                {it.hsn ? <Text style={[styles.itemDescSmall, { color: muted }]}>HSN: {it.hsn}</Text> : null}
                {it.taxPct ? <Text style={[styles.itemDescSmall, { color: muted }]}>Tax {it.taxPct}%</Text> : null}
              </View>
              <Text style={[styles.colHrs, { color: strong }]}>{String(it.qty)}</Text>
              <Text style={[styles.colRate, { color: body }]}>{money(data.currency, it.rate)}</Text>
              <Text style={[styles.colAmt, { color: strong }]}>{money(data.currency, lineAmount(totals, it.id))}</Text>
            </View>
          ))}
          <View wrap={false}>
            <View style={styles.bottomRow}>
              <View style={{ flex: 1 }}>
                {data.paymentTerms ? (
                  <View style={[styles.termsBox, { borderColor: hairline, backgroundColor: tintBg }]}>
                    <View style={[styles.cardTick, { backgroundColor: accent }]} />
                    <Text style={[styles.label, { color: accent, marginTop: 6 }]}>Payment terms</Text>
                    <Text style={{ marginTop: 4, fontWeight: "bold", color: strong }}>{data.paymentTerms}</Text>
                  </View>
                ) : null}
                {data.notes ? <Text style={{ marginTop: 10, color: body }}>{data.notes}</Text> : null}
                {data.terms ? <Text style={{ marginTop: 6, color: body }}>{data.terms}</Text> : null}
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
