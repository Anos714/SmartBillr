import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";

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
  body: { padding: 28, paddingBottom: 72 },
  card: { backgroundColor: "#ffffff", borderRadius: 14, padding: 22 },
  cardDark: { backgroundColor: "#33261f", borderRadius: 14, padding: 22 },
  badge: { color: "#ffffff", fontSize: 8, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2, borderRadius: 999, padding: 6, textAlign: "center", width: 90 },
  invoiceNo: { fontSize: 28, fontWeight: "bold", marginTop: 8 },
  partyName: { fontSize: 11, fontWeight: "bold", marginTop: 8 },
  partyLine: { fontSize: 9, marginTop: 2 },
  sideCard: { borderRadius: 12, padding: 12, minWidth: 180, textAlign: "right" },
  metaLabel: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.5 },
  metaValue: { fontSize: 9, marginTop: 2 },
  dueValue: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
  partiesRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  partyCard: { borderRadius: 12, padding: 14, width: "50%" },
  partyCardRight: { borderRadius: 12, padding: 14, width: "50%", textAlign: "right" },
  itemsCard: { borderRadius: 12, marginTop: 12, overflow: "hidden" },
  tableHead: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 14 },
  headText: { fontSize: 8, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 14, borderTopWidth: 1, borderTopStyle: "dashed" },
  colDesc: { flex: 1 },
  colQty: { width: 44, textAlign: "right" },
  colRate: { width: 72, textAlign: "right" },
  colTax: { width: 44, textAlign: "right" },
  colAmt: { width: 72, textAlign: "right", fontWeight: "bold" },
  itemDescSmall: { fontSize: 8, marginTop: 2 },
  totalsWrap: { alignItems: "flex-end", marginTop: 12 },
  totalsCard: { width: 256, borderRadius: 12, padding: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, fontSize: 10 },
  divider: { borderTopWidth: 2, borderTopStyle: "dashed", marginTop: 4, marginBottom: 6 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", fontSize: 14, fontWeight: "bold" },
  payCard: { borderRadius: 12, padding: 14, marginTop: 12 },
  payLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase" },
  payLine: { fontSize: 8, marginTop: 2 },
  notesRow: { flexDirection: "row", marginTop: 12, gap: 12 },
  notesCard: { borderRadius: 12, padding: 14, width: "50%" },
  notesLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase" },
  notesText: { fontSize: 10, marginTop: 4 },
  sigRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 18 },
  sigBox: { alignItems: "flex-end" },
  sigImage: { width: 120, height: 36, objectFit: "contain", borderRadius: 10, backgroundColor: "#ffffff", padding: 2 },
  sigSpacer: { width: 160, height: 36, borderBottomWidth: 2, borderBottomStyle: "dashed" },
  sigCaption: { fontSize: 8, marginTop: 4 },
  watermark: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontSize: 8 },
});

export function PastelCreativePdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || "#F97066";
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
  const cardBg = dark ? "#33261f" : "#ffffff";
  const softBg = dark ? "#2b201a" : "#FFF8F1";
  const dashed = dark ? "#4a352a" : "#f5d9c8";
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={styles.body}>
          <View style={dark ? styles.cardDark : styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={[styles.badge, { backgroundColor: accent }]}>Invoice</Text>
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
              <View style={[styles.sideCard, { backgroundColor: dark ? "#241a15" : "#FFF1E6" }]}>
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
            <View style={[styles.partyCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.metaLabel, { color: accent }]}>Billed by</Text>
              <Text style={[styles.partyName, { color: ink }]}>{data.fromName}</Text>
              <Text style={[styles.partyLine, { color: muted }]}>{data.fromEmail}</Text>
            </View>
            <View style={[styles.partyCardRight, { backgroundColor: cardBg }]}>
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

          <View style={[styles.itemsCard, { backgroundColor: cardBg }]}>
            <View style={[styles.tableHead, { backgroundColor: accent }]}>
              <Text style={[styles.colDesc, styles.headText]}>Description</Text>
              <Text style={[styles.colQty, styles.headText]}>Qty</Text>
              <Text style={[styles.colRate, styles.headText]}>Rate</Text>
              <Text style={[styles.colTax, styles.headText]}>Tax%</Text>
              <Text style={[styles.colAmt, styles.headText]}>Amount</Text>
            </View>
            {data.items.map((it, i) => (
              <View
                key={it.id}
                style={[
                  styles.tableRow,
                  { borderTopColor: dashed, backgroundColor: i % 2 === 0 ? cardBg : softBg },
                ]}
              >
                <View style={styles.colDesc}>
                  <Text style={{ color: ink }}>{itemName(it)}</Text>
                  {it.description ? <Text style={[styles.itemDescSmall, { color: muted }]}>{it.description}</Text> : null}
                  {it.hsn ? <Text style={[styles.itemDescSmall, { color: muted }]}>HSN: {it.hsn}</Text> : null}
                </View>
                <Text style={[styles.colQty, { color: ink }]}>{String(it.qty)}</Text>
                <Text style={[styles.colRate, { color: ink }]}>{money(data.currency, it.rate)}</Text>
                <Text style={[styles.colTax, { color: ink }]}>{`${it.taxPct}%`}</Text>
                <Text style={[styles.colAmt, { color: ink }]}>{money(data.currency, it.qty * it.rate)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsWrap}>
            <View style={[styles.totalsCard, { backgroundColor: cardBg }]}>
              <View style={[styles.totalRow, { color: muted }]}>
                <Text>Subtotal</Text>
                <Text style={{ color: ink }}>{money(data.currency, totals.subtotal)}</Text>
              </View>
              <View style={[styles.totalRow, { color: muted }]}>
                <Text>Discount</Text>
                <Text style={{ color: ink }}>-{money(data.currency, totals.discount)}</Text>
              </View>
              {(data.adjustments ?? []).map((a) => (
                <View key={a.id} style={[styles.totalRow, { color: muted }]}>
                  <Text>
                    {a.label || "Adjustment"}
                    {a.type === "percentage" ? ` (${a.value}%)` : ""}
                  </Text>
                  <Text style={{ color: ink }}>
                    {a.type === "percentage"
                      ? money(data.currency, (totals.subtotal * a.value) / 100)
                      : money(data.currency, a.value)}
                  </Text>
                </View>
              ))}
              <View style={[styles.totalRow, { color: muted }]}>
                <Text>Tax</Text>
                <Text style={{ color: ink }}>{money(data.currency, totals.taxTotal)}</Text>
              </View>
              {totals.adjustmentsTotal !== 0 ? (
                <View style={[styles.totalRow, { color: muted }]}>
                  <Text>Adjustments</Text>
                  <Text style={{ color: ink }}>{money(data.currency, totals.adjustmentsTotal)}</Text>
                </View>
              ) : null}
              <View style={[styles.divider, { borderTopColor: accent }]} />
              <View style={[styles.grandRow, { color: ink }]}>
                <Text>Total</Text>
                <Text>{money(data.currency, totals.grandTotal)}</Text>
              </View>
            </View>
          </View>

          {(data.paymentInfo ?? []).length > 0 ? (
            <View style={[styles.payCard, { backgroundColor: cardBg }]}>
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
              <View style={[styles.notesCard, { backgroundColor: cardBg }]}>
                {data.notes ? (
                  <>
                    <Text style={[styles.notesLabel, { color: accent }]}>Notes</Text>
                    <Text style={[styles.notesText, { color: ink }]}>{data.notes}</Text>
                  </>
                ) : null}
              </View>
              <View style={[styles.notesCard, { backgroundColor: cardBg }]}>
                {data.terms ? (
                  <>
                    <Text style={[styles.notesLabel, { color: accent }]}>Terms</Text>
                    <Text style={[styles.notesText, { color: ink }]}>{data.terms}</Text>
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
                <View style={[styles.sigSpacer, { borderBottomColor: accent }]} />
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
