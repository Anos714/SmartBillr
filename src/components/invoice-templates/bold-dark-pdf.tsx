import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import { formatMoney as canonicalFormatMoney } from "@/lib/money";
import { adjustmentAmount, lineAmount } from "./minimal-white";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";

const money = (currency: string, value: number) =>
  canonicalFormatMoney(value, currency);

const itemName = (it: { name?: string; desc?: string }) =>
  (it.name && it.name.trim()) || (it.desc && it.desc.trim()) || "Untitled item";

const GHOST = "rgba(255,255,255,0.05)";
const HAIRLINE = "rgba(255,255,255,0.1)";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    color: "#fafafa",
    backgroundColor: "#0d0d0f",
    fontFamily: INVOICE_PDF_FONT_FAMILY,
  },
  body: { padding: 36, paddingBottom: 72 },
  ghost: { fontSize: 72, fontWeight: "bold", color: GHOST, textAlign: "center", marginBottom: -10 },
  label: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  invoiceNo: { fontSize: 36, fontWeight: "bold", color: "#ffffff", marginTop: 6 },
  partyName: { fontSize: 11, fontWeight: "bold", color: "#ffffff", marginTop: 8 },
  partyLine: { color: "rgba(255,255,255,0.6)", marginTop: 2, fontSize: 9 },
  totalCard: { borderRadius: 12, padding: 18, minWidth: 210, textAlign: "right" },
  totalCardLabel: { fontSize: 9, fontWeight: "bold", color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: 2 },
  totalCardValue: { fontSize: 28, fontWeight: "bold", color: "#000000", marginTop: 4 },
  totalCardSub: { fontSize: 8, color: "rgba(0,0,0,0.7)", marginTop: 4 },
  panel: { marginTop: 26, borderRadius: 12, padding: 16, flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderColor: HAIRLINE, backgroundColor: "#161618" },
  panelLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  panelName: { fontSize: 11, fontWeight: "bold", color: "#ffffff", marginTop: 4 },
  panelLine: { fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  tableHead: { flexDirection: "row", marginTop: 26, paddingBottom: 8, borderBottomWidth: 2 },
  headText: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  gapRule: { borderTopWidth: 1, borderTopColor: HAIRLINE, marginTop: 3 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: HAIRLINE, paddingVertical: 8 },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: "right" },
  colRate: { width: 80, textAlign: "right" },
  colTax: { width: 50, textAlign: "right" },
  colAmt: { width: 80, textAlign: "right", fontWeight: "bold", color: "#ffffff" },
  bodyText: { color: "rgba(255,255,255,0.8)" },
  itemName: { fontSize: 11, fontWeight: "bold", color: "#ffffff" },
  itemDescSmall: { fontSize: 9, color: "rgba(255,255,255,0.55)", marginTop: 2 },
  totalsWrap: { alignItems: "flex-end", marginTop: 26 },
  totalsBox: { width: 280 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, color: "rgba(255,255,255,0.7)", fontSize: 10 },
  payBlock: { marginTop: 28 },
  payLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  payLine: { fontSize: 8, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  notesRow: { flexDirection: "row", marginTop: 28, gap: 24 },
  notesCol: { width: "50%" },
  notesLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  notesText: { fontSize: 9, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  sigRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 28 },
  sigBox: { alignItems: "flex-end" },
  sigImage: { width: 120, height: 36, objectFit: "contain", backgroundColor: "#fafafa", borderRadius: 6 },
  sigSpacer: { width: 160, height: 36, borderBottomWidth: 1, borderBottomColor: HAIRLINE },
  sigCaption: { fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  watermark: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.35)" },
  grandLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  grandValue: { fontSize: 30, fontWeight: "bold" },
});

export function BoldDarkPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || "#A3E635";
  const no = invoiceDisplayNo({
    prefix: data.prefix ?? "",
    serialNumber: data.serialNumber ?? "",
    invoiceNo: data.invoiceNo,
  });
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.body}>
          <Text style={styles.ghost}>{no}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={[styles.label, { color: accent }]}>Invoice</Text>
              <Text style={styles.invoiceNo}>{no}</Text>
              <Text style={styles.partyName}>{data.fromName}</Text>
              <Text style={styles.partyLine}>{data.fromEmail}</Text>
              <Text style={styles.partyLine}>{data.fromAddress}</Text>
              {data.gstin ? <Text style={styles.partyLine}>GSTIN: {data.gstin}</Text> : null}
              {(data.companyMeta ?? []).map((m, i) => (
                <Text key={i} style={styles.partyLine}>
                  {m.label ? `${m.label}: ` : ""}{m.value}
                </Text>
              ))}
            </View>
            <View style={[styles.totalCard, { backgroundColor: accent }]}>
              <Text style={styles.totalCardLabel}>Total due</Text>
              <Text style={styles.totalCardValue}>{money(data.currency, totals.grandTotal)}</Text>
              <Text style={styles.totalCardSub}>Issued {data.issueDate} · Due {data.dueDate}</Text>
              {data.paymentTerms ? <Text style={styles.totalCardSub}>{data.paymentTerms}</Text> : null}
            </View>
          </View>

          <View style={styles.panel}>
            <View>
              <Text style={[styles.panelLabel, { color: accent }]}>Billed by</Text>
              <Text style={styles.panelName}>{data.fromName}</Text>
              <Text style={styles.panelLine}>{data.fromEmail}</Text>
            </View>
            <View style={{ textAlign: "right" }}>
              <Text style={[styles.panelLabel, { color: accent }]}>Billed to</Text>
              <Text style={styles.panelName}>{data.billToName}</Text>
              <Text style={styles.panelLine}>{data.billToEmail}</Text>
              <Text style={styles.panelLine}>{data.billToAddress}</Text>
              {(data.clientMeta ?? []).map((m, i) => (
                <Text key={i} style={styles.panelLine}>
                  {m.label ? `${m.label}: ` : ""}{m.value}
                </Text>
              ))}
            </View>
          </View>

          <View style={[styles.tableHead, { borderBottomColor: accent }]}>
            <Text style={[styles.colDesc, styles.headText, { color: accent }]}>Description</Text>
            <Text style={[styles.colQty, styles.headText, { color: accent }]}>Qty</Text>
            <Text style={[styles.colRate, styles.headText, { color: accent }]}>Rate</Text>
            <Text style={[styles.colTax, styles.headText, { color: accent }]}>Tax%</Text>
            <Text style={[styles.colAmt, styles.headText, { color: accent }]}>Amount</Text>
          </View>
          <View style={styles.gapRule} />
          {data.items.map((it) => (
            <View key={it.id} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.itemName}>{itemName(it)}</Text>
                {it.description ? <Text style={styles.itemDescSmall}>{it.description}</Text> : null}
                {it.hsn ? <Text style={styles.itemDescSmall}>HSN: {it.hsn}</Text> : null}
              </View>
              <Text style={[styles.colQty, styles.bodyText]}>{String(it.qty)}</Text>
              <Text style={[styles.colRate, styles.bodyText]}>{money(data.currency, it.rate)}</Text>
              <Text style={[styles.colTax, styles.bodyText]}>{`${it.taxPct}%`}</Text>
              <Text style={styles.colAmt}>{money(data.currency, lineAmount(totals, it.id))}</Text>
            </View>
          ))}

          <View wrap={false}>
            <View style={styles.totalsWrap}>
              <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                  <Text>Subtotal</Text>
                  <Text>{money(data.currency, totals.subtotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text>Discount</Text>
                  <Text>-{money(data.currency, totals.discount)}</Text>
                </View>
                {(data.adjustments ?? []).map((a) => (
                  <View key={a.id} style={styles.totalRow}>
                    <Text>
                      {a.label || "Adjustment"}
                      {a.type === "percentage" ? ` (${a.value}%)` : ""}
                    </Text>
                    <Text>
                      {money(data.currency, adjustmentAmount(totals, a.id))}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text>Tax</Text>
                  <Text>{money(data.currency, totals.taxTotal)}</Text>
                </View>
                {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
                  <View style={styles.totalRow}>
                    <Text>Adjustments</Text>
                    <Text>{money(data.currency, totals.adjustmentsTotal)}</Text>
                  </View>
                ) : null}
                <View style={{ borderBottomWidth: 2, borderBottomColor: accent, marginTop: 4 }} />
                <View style={[styles.gapRule, { marginBottom: 8 }]} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Text style={[styles.grandLabel, { color: accent }]}>Total</Text>
                  <Text style={[styles.grandValue, { color: accent }]}>{money(data.currency, totals.grandTotal)}</Text>
                </View>
              </View>
            </View>

            {(data.paymentInfo ?? []).length > 0 ? (
              <View style={styles.payBlock}>
                <Text style={[styles.payLabel, { color: accent }]}>Payment info</Text>
                {(data.paymentInfo ?? []).map((m, i) => (
                  <Text key={i} style={styles.payLine}>
                    {m.label ? `${m.label}: ` : ""}{m.value}
                  </Text>
                ))}
              </View>
            ) : null}

            {data.notes || data.terms ? (
              <View style={styles.notesRow}>
                <View style={styles.notesCol}>
                  {data.notes ? (
                    <>
                      <Text style={[styles.notesLabel, { color: accent }]}>Notes</Text>
                      <Text style={styles.notesText}>{data.notes}</Text>
                    </>
                  ) : null}
                </View>
                <View style={styles.notesCol}>
                  {data.terms ? (
                    <>
                      <Text style={[styles.notesLabel, { color: accent }]}>Terms</Text>
                      <Text style={styles.notesText}>{data.terms}</Text>
                    </>
                  ) : null}
                </View>
              </View>
            ) : null}

            <View style={styles.sigRow}>
              <View style={styles.sigBox}>
                {data.signatureUrl ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={data.signatureUrl} style={styles.sigImage} />
                ) : (
                  <View style={styles.sigSpacer} />
                )}
                <Text style={styles.sigCaption}>Authorized signature</Text>
              </View>
            </View>
          </View>
        </View>

        {watermark ? <Text fixed style={styles.watermark}>Made with SmartBillr</Text> : null}
      </Page>
    </Document>
  );
}
