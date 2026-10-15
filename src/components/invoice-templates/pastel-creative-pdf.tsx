import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";

const TERRA = "#C2410C";

const money = (currency: string, value: number) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const itemName = (it: { name?: string; desc?: string }) =>
  (it.name && it.name.trim()) || (it.desc && it.desc.trim()) || "Untitled item";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    color: "#3f2d23",
    backgroundColor: "#FFF1E6",
    fontFamily: INVOICE_PDF_FONT_FAMILY,
  },
  pageDark: {
    fontSize: 10,
    color: "#fdeedf",
    backgroundColor: "#241a15",
    fontFamily: INVOICE_PDF_FONT_FAMILY,
  },
  body: { padding: 36, paddingBottom: 72 },
  card: { backgroundColor: "#ffffff", borderWidth: 1, borderRadius: 14, padding: 24 },
  cardDark: { backgroundColor: "#33261f", borderWidth: 1, borderRadius: 14, padding: 24 },
  eyebrow: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  invoiceNo: { fontSize: 34, fontWeight: "bold", marginTop: 6 },
  partyName: { fontSize: 12, fontWeight: "bold", marginTop: 8 },
  partyLine: { fontSize: 9, marginTop: 2 },
  sideCard: { borderWidth: 1, borderRadius: 12, padding: 12, minWidth: 180, textAlign: "right" },
  metaLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  metaValue: { fontSize: 9, marginTop: 2 },
  dueValue: { fontSize: 22, fontWeight: "bold", marginTop: 4 },
  partiesRow: { flexDirection: "row", gap: 16, marginTop: 28 },
  partyCard: { borderWidth: 1, borderRadius: 12, padding: 14, width: "50%" },
  partyCardRight: { borderWidth: 1, borderRadius: 12, padding: 14, width: "50%", textAlign: "right" },
  itemsCard: { borderWidth: 1, borderRadius: 12, marginTop: 28, overflow: "hidden" },
  tableHead: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 14 },
  headText: { fontSize: 9, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase", letterSpacing: 2 },
  doubleRule: { height: 2 },
  hairlineRule: { height: 1 },
  tableRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 14, borderBottomWidth: 1 },
  colDesc: { flex: 1 },
  colQty: { width: 44, textAlign: "right" },
  colRate: { width: 72, textAlign: "right" },
  colTax: { width: 44, textAlign: "right" },
  colAmt: { width: 72, textAlign: "right", fontWeight: "bold" },
  itemDescSmall: { fontSize: 9, marginTop: 2 },
  totalsWrap: { alignItems: "flex-end", marginTop: 28 },
  totalsCard: { width: 256, borderWidth: 1, borderRadius: 12, padding: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, fontSize: 10 },
  grandLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  grandValue: { fontSize: 22, fontWeight: "bold" },
  payCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 28 },
  payLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  payLine: { fontSize: 8, marginTop: 2 },
  notesRow: { flexDirection: "row", marginTop: 28, gap: 16 },
  notesCard: { borderWidth: 1, borderRadius: 12, padding: 14, width: "50%" },
  notesLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  notesText: { fontSize: 9, marginTop: 4 },
  sigRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 28 },
  sigBox: { alignItems: "flex-end" },
  sigImage: { width: 120, height: 36, objectFit: "contain" },
  sigSpacer: { width: 160, height: 36, borderBottomWidth: 1 },
  sigCaption: { fontSize: 8, marginTop: 4 },
  watermark: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontSize: 8 },
});

export function PastelCreativePdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || TERRA;
  const dark = data.theme?.mode === "dark";
  // Honor theme.font (InvoiceSans is the embedded PDF font; mapping adjusts spacing rhythm)
  const _fontHint = data.theme?.font ?? "geist";
  void _fontHint;
  const no = invoiceDisplayNo({
    prefix: data.prefix ?? "",
    serialNumber: data.serialNumber ?? "",
    invoiceNo: data.invoiceNo,
  });
  const ink = dark ? "#fdeedf" : "#3f2d23";
  const muted = dark ? "#c9a68f" : "#9a7a65";
  const body = dark ? "#d8bfa9" : "#7c5a44";
  const cardBg = dark ? "#33261f" : "#ffffff";
  const softBg = dark ? "#241a15" : "#FFF1E6";
  const hairline = dark ? "#4a352a" : "#f0d9c6";
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={styles.body}>
          <View style={[dark ? styles.cardDark : styles.card, { borderColor: hairline }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={[styles.eyebrow, { color: accent }]}>Invoice</Text>
                <Text style={[styles.invoiceNo, { color: ink }]}>{no}</Text>
                <Text style={[styles.partyName, { color: ink }]}>{data.fromName}</Text>
                <Text style={[styles.partyLine, { color: muted }]}>{data.fromEmail}</Text>
                <Text style={[styles.partyLine, { color: muted }]}>{data.fromAddress}</Text>
                {data.gstin ? <Text style={[styles.partyLine, { color: muted }]}>GSTIN: {data.gstin}</Text> : null}
                {(data.companyMeta ?? []).map((m, i) => (
                  <Text key={i} style={[styles.partyLine, { color: muted }]}>
                    {m.label ? `${m.label}: ` : ""}{m.value}
                  </Text>
                ))}
              </View>
              <View style={[styles.sideCard, { backgroundColor: softBg, borderColor: hairline }]}>
                <Text style={[styles.metaLabel, { color: accent }]}>Studio schedule</Text>
                <Text style={[styles.metaValue, { color: ink }]}>Issued: {data.issueDate}</Text>
                <Text style={[styles.metaValue, { color: ink }]}>Due: {data.dueDate}</Text>
                {data.paymentTerms ? <Text style={[styles.metaValue, { color: muted }]}>Terms: {data.paymentTerms}</Text> : null}
                <Text style={[styles.metaLabel, { color: accent, marginTop: 8 }]}>Amount due</Text>
                <Text style={[styles.dueValue, { color: ink }]}>{money(data.currency, totals.grandTotal)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.partiesRow}>
            <View style={[styles.partyCard, { backgroundColor: cardBg, borderColor: hairline }]}>
              <Text style={[styles.metaLabel, { color: accent }]}>Billed by</Text>
              <Text style={[styles.partyName, { color: ink }]}>{data.fromName}</Text>
              <Text style={[styles.partyLine, { color: muted }]}>{data.fromEmail}</Text>
            </View>
            <View style={[styles.partyCardRight, { backgroundColor: cardBg, borderColor: hairline }]}>
              <Text style={[styles.metaLabel, { color: accent }]}>Billed to</Text>
              <Text style={[styles.partyName, { color: ink }]}>{data.billToName}</Text>
              <Text style={[styles.partyLine, { color: muted }]}>{data.billToEmail}</Text>
              <Text style={[styles.partyLine, { color: muted }]}>{data.billToAddress}</Text>
              {(data.clientMeta ?? []).map((m, i) => (
                <Text key={i} style={[styles.partyLine, { color: muted }]}>
                  {m.label ? `${m.label}: ` : ""}{m.value}
                </Text>
              ))}
            </View>
          </View>

          <View style={[styles.itemsCard, { backgroundColor: cardBg, borderColor: hairline }]}>
            <View style={[styles.tableHead, { backgroundColor: accent }]}>
              <Text style={[styles.colDesc, styles.headText]}>Description</Text>
              <Text style={[styles.colQty, styles.headText]}>Qty</Text>
              <Text style={[styles.colRate, styles.headText]}>Rate</Text>
              <Text style={[styles.colTax, styles.headText]}>Tax%</Text>
              <Text style={[styles.colAmt, styles.headText]}>Amount</Text>
            </View>
            <View style={[styles.doubleRule, { backgroundColor: accent }]} />
            <View style={[styles.hairlineRule, { backgroundColor: hairline }]} />
            {data.items.map((it) => (
              <View
                key={it.id}
                style={[styles.tableRow, { borderBottomColor: hairline }]}
              >
                <View style={styles.colDesc}>
                  <Text style={{ color: ink, fontWeight: "bold" }}>{itemName(it)}</Text>
                  {it.description ? <Text style={[styles.itemDescSmall, { color: muted }]}>{it.description}</Text> : null}
                  {it.hsn ? <Text style={[styles.itemDescSmall, { color: muted }]}>HSN: {it.hsn}</Text> : null}
                </View>
                <Text style={[styles.colQty, { color: ink }]}>{String(it.qty)}</Text>
                <Text style={[styles.colRate, { color: body }]}>{money(data.currency, it.rate)}</Text>
                <Text style={[styles.colTax, { color: body }]}>{`${it.taxPct}%`}</Text>
                <Text style={[styles.colAmt, { color: ink }]}>{money(data.currency, it.qty * it.rate)}</Text>
              </View>
            ))}
          </View>

          <View wrap={false}>
            <View style={styles.totalsWrap}>
              <View style={[styles.totalsCard, { backgroundColor: cardBg, borderColor: hairline }]}>
                <View style={[styles.totalRow, { color: body }]}>
                  <Text>Subtotal</Text>
                  <Text>{money(data.currency, totals.subtotal)}</Text>
                </View>
                <View style={[styles.totalRow, { color: body }]}>
                  <Text>Discount</Text>
                  <Text>-{money(data.currency, totals.discount)}</Text>
                </View>
                {(data.adjustments ?? []).map((a) => (
                  <View key={a.id} style={[styles.totalRow, { color: body }]}>
                    <Text>
                      {a.label || "Adjustment"}
                      {a.type === "percentage" ? ` (${a.value}%)` : ""}
                    </Text>
                    <Text>
                      {a.type === "percentage"
                        ? money(data.currency, (totals.subtotal * a.value) / 100)
                        : money(data.currency, a.value)}
                    </Text>
                  </View>
                ))}
                <View style={[styles.totalRow, { color: body }]}>
                  <Text>Tax</Text>
                  <Text>{money(data.currency, totals.taxTotal)}</Text>
                </View>
                {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
                  <View style={[styles.totalRow, { color: body }]}>
                    <Text>Adjustments</Text>
                    <Text>{money(data.currency, totals.adjustmentsTotal)}</Text>
                  </View>
                ) : null}
                <View style={[styles.doubleRule, { backgroundColor: accent }]} />
                <View style={[styles.hairlineRule, { backgroundColor: hairline, marginBottom: 8, marginTop: 3 }]} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Text style={[styles.grandLabel, { color: muted }]}>Total</Text>
                  <Text style={[styles.grandValue, { color: ink }]}>{money(data.currency, totals.grandTotal)}</Text>
                </View>
              </View>
            </View>

            {(data.paymentInfo ?? []).length > 0 ? (
              <View style={[styles.payCard, { backgroundColor: cardBg, borderColor: hairline }]}>
                <Text style={[styles.payLabel, { color: accent }]}>Payment info</Text>
                {(data.paymentInfo ?? []).map((m, i) => (
                  <Text key={i} style={[styles.payLine, { color: muted }]}>
                    {m.label ? `${m.label}: ` : ""}{m.value}
                  </Text>
                ))}
              </View>
            ) : null}

            {data.notes || data.terms ? (
              <View style={styles.notesRow}>
                <View style={[styles.notesCard, { backgroundColor: cardBg, borderColor: hairline }]}>
                  {data.notes ? (
                    <>
                      <Text style={[styles.notesLabel, { color: accent }]}>Notes</Text>
                      <Text style={[styles.notesText, { color: body }]}>{data.notes}</Text>
                    </>
                  ) : null}
                </View>
                <View style={[styles.notesCard, { backgroundColor: cardBg, borderColor: hairline }]}>
                  {data.terms ? (
                    <>
                      <Text style={[styles.notesLabel, { color: accent }]}>Terms</Text>
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
                  <View style={[styles.sigSpacer, { borderBottomColor: hairline }]} />
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
