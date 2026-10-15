import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import { formatMoney as canonicalFormatMoney } from "@/lib/money";
import { adjustmentAmount, lineAmount } from "./minimal-white";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";
import { amountToWords } from "@/lib/words";

const GREEN = "#0C6B4F";
const GOLD = "#C9A227";
const SAFFRON = "#FF9933";
const INDIA_GREEN = "#138808";

const money = (currency: string, value: number) =>
  canonicalFormatMoney(value, currency);

const itemName = (it: { name?: string; desc?: string }) =>
  (it.name && it.name.trim()) || (it.desc && it.desc.trim()) || "Untitled item";

const lookupGstin = (meta: { label: string; value: string }[] | undefined): string => {
  const hit = (meta ?? []).find((m) => (m.label ?? "").trim().toLowerCase() === "gstin");
  return (hit?.value ?? "").trim() || "—";
};

const styles = StyleSheet.create({
  page: { fontSize: 10, color: "#0f172a", backgroundColor: "#ffffff", fontFamily: INVOICE_PDF_FONT_FAMILY },
  pageDark: { fontSize: 10, color: "#e8edf5", backgroundColor: "#0b1220", fontFamily: INVOICE_PDF_FONT_FAMILY },
  triSaffron: { height: 1, backgroundColor: SAFFRON },
  triWhite: { height: 1 },
  triGreen: { height: 1, backgroundColor: INDIA_GREEN },
  masthead: { padding: 36, paddingBottom: 28 },
  mastLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  mastNo: { fontSize: 34, fontWeight: "bold", color: "#ffffff", marginTop: 6 },
  mastCompany: { fontSize: 12, fontWeight: "bold", color: "#ffffff", marginTop: 10 },
  mastSub: { color: "rgba(255,255,255,0.75)", marginTop: 2, fontSize: 9 },
  mastMeta: { textAlign: "right", color: "rgba(255,255,255,0.8)", fontSize: 9 },
  premiumBadge: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.14)",
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    padding: 4,
    textAlign: "center",
    borderRadius: 4,
  },
  goldRule: { height: 3, backgroundColor: GOLD },
  hairlineRule: { height: 1 },
  body: { padding: 36, paddingTop: 24, paddingBottom: 72 },
  partiesRow: { flexDirection: "row", gap: 24 },
  partyBox: { width: "50%", borderWidth: 1, borderRadius: 6, padding: 10 },
  partyLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  partyName: { fontSize: 12, fontWeight: "bold", marginTop: 6 },
  partyLine: { marginTop: 2, maxWidth: 260, fontSize: 9 },
  chip: { marginTop: 6, borderWidth: 1, borderRadius: 4, padding: 3, fontSize: 8, alignSelf: "flex-start" },
  tableHead: { flexDirection: "row", marginTop: 28, paddingVertical: 9, paddingHorizontal: 10 },
  headText: { fontSize: 9, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase", letterSpacing: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 8, paddingHorizontal: 10 },
  colIdx: { width: 28 },
  colDesc: { flex: 1 },
  colHsn: { width: 70 },
  colQty: { width: 44, textAlign: "right" },
  colRate: { width: 76, textAlign: "right" },
  colAmt: { width: 80, textAlign: "right", fontWeight: "bold" },
  itemName: { fontSize: 11, fontWeight: "bold" },
  itemDescSmall: { fontSize: 9, marginTop: 2 },
  bottomRow: { flexDirection: "row", marginTop: 28, gap: 24 },
  wordsBox: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 12 },
  wordsLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  wordsText: { marginTop: 4, fontSize: 11, fontWeight: "bold" },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, fontSize: 10 },
  grandLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  grandValue: { fontSize: 22, fontWeight: "bold" },
  payBlock: { marginTop: 28 },
  payLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  payLine: { fontSize: 8, marginTop: 2 },
  notesRow: { flexDirection: "row", marginTop: 28, gap: 24 },
  notesCol: { width: "50%" },
  notesLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  notesText: { fontSize: 9, marginTop: 4 },
  sigRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 28 },
  sigBox: { alignItems: "flex-end" },
  sigImage: { width: 120, height: 36, objectFit: "contain" },
  sigSpacer: { width: 160, height: 36, borderBottomWidth: 1 },
  sigCaption: { fontSize: 8, marginTop: 4 },
  watermark: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontSize: 8 },
});

export function GstTaxInvoiceIndiaPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || GREEN;
  const dark = data.theme?.mode === "dark";
  const no = invoiceDisplayNo({ prefix: data.prefix ?? "", serialNumber: data.serialNumber ?? "", invoiceNo: data.invoiceNo });
  const muted = dark ? "#94a3b8" : "#64748b";
  const body = dark ? "#cbd5e1" : "#475569";
  const strong = dark ? "#f8fafc" : "#0f172a";
  const hairline = dark ? "#1e293b" : "#e2e8f0";
  const cardBg = dark ? "#111c2e" : "#f8fafc";
  const wordsBg = dark ? "#12291f" : "#f2f8f5";
  const isInr = data.currency === "INR";
  const taxable = totals.subtotal - totals.discount;
  const half = totals.taxTotal / 2;
  const companyGstin = (data.gstin ?? "").trim() || lookupGstin(data.companyMeta);
  const clientGstin = lookupGstin(data.clientMeta);
  const words = amountToWords(totals.grandTotal, data.currency);
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={styles.triSaffron} />
        <View style={[styles.triWhite, { backgroundColor: dark ? "#1e293b" : "#e9edf2" }]} />
        <View style={styles.triGreen} />
        <View style={[styles.masthead, { backgroundColor: accent }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={styles.mastLabel}>Tax Invoice</Text>
              <Text style={styles.mastNo}>{no}</Text>
              <Text style={styles.mastCompany}>{data.fromName}</Text>
              <Text style={styles.mastSub}>{data.fromAddress}</Text>
              <Text style={styles.mastSub}>{data.fromEmail}</Text>
            </View>
            <View style={styles.mastMeta}>
              <Text style={styles.mastLabel}>Details</Text>
              <Text style={[styles.mastSub, { marginTop: 8 }]}>Issued: {data.issueDate}</Text>
              <Text style={styles.mastSub}>Due: {data.dueDate}</Text>
              {data.paymentTerms ? <Text style={styles.mastSub}>Terms: {data.paymentTerms}</Text> : null}
              <Text style={styles.premiumBadge}>Premium</Text>
            </View>
          </View>
        </View>
        <View style={styles.goldRule} />
        <View style={[styles.hairlineRule, { backgroundColor: hairline }]} />

        <View style={styles.body}>
          <View style={styles.partiesRow}>
            <View style={[styles.partyBox, { borderColor: hairline, backgroundColor: cardBg }]}>
              <Text style={[styles.partyLabel, { color: dark ? GOLD : accent }]}>Billed by</Text>
              <Text style={[styles.partyName, { color: strong }]}>{data.fromName}</Text>
              <Text style={[styles.partyLine, { color: body }]}>{data.fromAddress}</Text>
              <Text style={[styles.chip, { borderColor: hairline, color: body }]}>GSTIN: {companyGstin}</Text>
            </View>
            <View style={[styles.partyBox, { borderColor: hairline, backgroundColor: cardBg }]}>
              <Text style={[styles.partyLabel, { color: dark ? GOLD : accent }]}>Billed to</Text>
              <Text style={[styles.partyName, { color: strong }]}>{data.billToName}</Text>
              <Text style={[styles.partyLine, { color: body }]}>{data.billToAddress}</Text>
              <Text style={[styles.partyLine, { color: body }]}>{data.billToEmail}</Text>
              <Text style={[styles.chip, { borderColor: hairline, color: body }]}>GSTIN: {clientGstin}</Text>
            </View>
          </View>

          <View style={[styles.tableHead, { backgroundColor: accent }]}>
            <Text style={[styles.colIdx, styles.headText]}>#</Text>
            <Text style={[styles.colDesc, styles.headText]}>Description</Text>
            <Text style={[styles.colHsn, styles.headText]}>HSN/SAC</Text>
            <Text style={[styles.colQty, styles.headText]}>Qty</Text>
            <Text style={[styles.colRate, styles.headText]}>Rate</Text>
            <Text style={[styles.colAmt, styles.headText]}>Amount</Text>
          </View>
          <View style={styles.goldRule} />
          <View style={[styles.hairlineRule, { backgroundColor: hairline }]} />
          {data.items.map((it, idx) => (
            <View key={it.id} style={[styles.tableRow, { borderBottomColor: hairline }]}>
              <Text style={[styles.colIdx, { color: muted }]}>{String(idx + 1)}</Text>
              <View style={styles.colDesc}>
                <Text style={[styles.itemName, { color: strong }]}>{itemName(it)}</Text>
                {it.description ? <Text style={[styles.itemDescSmall, { color: muted }]}>{it.description}</Text> : null}
              </View>
              <Text style={[styles.colHsn, { color: body }]}>{it.hsn || "—"}</Text>
              <Text style={[styles.colQty, { color: body }]}>{String(it.qty)}</Text>
              <Text style={[styles.colRate, { color: body }]}>{money(data.currency, it.rate)}</Text>
              <Text style={[styles.colAmt, { color: strong }]}>{money(data.currency, lineAmount(totals, it.id))}</Text>
            </View>
          ))}

          <View wrap={false}>
            <View style={styles.bottomRow}>
              <View style={[styles.wordsBox, { borderColor: GOLD, backgroundColor: wordsBg }]}>
                <Text style={[styles.wordsLabel, { color: dark ? GOLD : accent }]}>Amount in words</Text>
                <Text style={[styles.wordsText, { color: strong }]}>{words}</Text>
              </View>
              <View style={styles.totalsBox}>
                <View style={[styles.totalRow, { color: body }]}><Text>Taxable Value</Text><Text>{money(data.currency, taxable)}</Text></View>
                {isInr ? (
                  <>
                    <View style={[styles.totalRow, { color: body }]}><Text>CGST</Text><Text>{money(data.currency, half)}</Text></View>
                    <View style={[styles.totalRow, { color: body }]}><Text>SGST</Text><Text>{money(data.currency, half)}</Text></View>
                  </>
                ) : (
                  <View style={[styles.totalRow, { color: body }]}><Text>Tax</Text><Text>{money(data.currency, totals.taxTotal)}</Text></View>
                )}
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
                {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
                  <View style={[styles.totalRow, { color: body }]}><Text>Adjustments</Text><Text>{money(data.currency, totals.adjustmentsTotal)}</Text></View>
                ) : null}
                <View style={styles.goldRule} />
                <View style={[styles.hairlineRule, { backgroundColor: hairline, marginBottom: 8, marginTop: 3 }]} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Text style={[styles.grandLabel, { color: muted }]}>Grand Total</Text>
                  <Text style={[styles.grandValue, { color: strong }]}>{money(data.currency, totals.grandTotal)}</Text>
                </View>
              </View>
            </View>

            {(data.paymentInfo ?? []).length > 0 ? (
              <View style={styles.payBlock}>
                <Text style={[styles.payLabel, { color: dark ? GOLD : accent }]}>Payment info</Text>
                {(data.paymentInfo ?? []).map((m, i) => (
                  <Text key={i} style={[styles.payLine, { color: body }]}>
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
                      <Text style={[styles.notesLabel, { color: dark ? GOLD : accent }]}>Notes</Text>
                      <Text style={[styles.notesText, { color: body }]}>{data.notes}</Text>
                    </>
                  ) : null}
                </View>
                <View style={styles.notesCol}>
                  {data.terms ? (
                    <>
                      <Text style={[styles.notesLabel, { color: dark ? GOLD : accent }]}>Terms</Text>
                      <Text style={[styles.notesText, { color: body }]}>{data.terms}</Text>
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
                  <View style={[styles.sigSpacer, { borderBottomColor: muted }]} />
                )}
                <Text style={[styles.sigCaption, { color: muted }]}>Authorised Signatory</Text>
              </View>
            </View>
          </View>
        </View>

        {watermark ? <Text fixed style={[styles.watermark, { color: muted }]}>Made with SmartBillr</Text> : null}
      </Page>
    </Document>
  );
}
