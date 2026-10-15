import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";

const GOLD = "#C9A227";

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
    color: "#0f172a",
    backgroundColor: "#ffffff",
    fontFamily: INVOICE_PDF_FONT_FAMILY,
  },
  pageDark: {
    fontSize: 10,
    color: "#e8edf5",
    backgroundColor: "#0b1220",
    fontFamily: INVOICE_PDF_FONT_FAMILY,
  },
  header: { padding: 36, paddingBottom: 28 },
  headerLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  headerNo: { fontSize: 34, fontWeight: "bold", color: "#ffffff", marginTop: 6 },
  headerCompany: { fontSize: 12, fontWeight: "bold", color: "#ffffff", marginTop: 10 },
  headerSub: { color: "rgba(255,255,255,0.75)", marginTop: 2, fontSize: 9 },
  headerMeta: { textAlign: "right", color: "rgba(255,255,255,0.8)", fontSize: 9 },
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
  partyCol: { width: "50%" },
  partyColRight: { width: "50%", textAlign: "right" },
  partyLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  partyName: { fontSize: 12, fontWeight: "bold", marginTop: 6 },
  partyLine: { marginTop: 2, maxWidth: 260 },
  tableHead: { flexDirection: "row", marginTop: 28, paddingVertical: 9, paddingHorizontal: 10 },
  headText: { fontSize: 9, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase", letterSpacing: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 8, paddingHorizontal: 10 },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: "right" },
  colRate: { width: 80, textAlign: "right" },
  colTax: { width: 50, textAlign: "right" },
  colAmt: { width: 80, textAlign: "right", fontWeight: "bold" },
  itemName: { fontSize: 11, fontWeight: "bold" },
  itemDescSmall: { fontSize: 9, marginTop: 2 },
  totalsWrap: { alignItems: "flex-end", marginTop: 28 },
  totalsBox: { width: 256 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, fontSize: 10 },
  grandLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  grandValue: { fontSize: 22, fontWeight: "bold" },
  payBlock: { marginTop: 28 },
  payLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2, color: GOLD },
  payLine: { fontSize: 8, marginTop: 2 },
  notesRow: { flexDirection: "row", marginTop: 28, gap: 24 },
  notesCol: { width: "50%" },
  notesLabel: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2, color: GOLD },
  notesText: { fontSize: 9, marginTop: 4 },
  sigRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 28 },
  sigBox: { alignItems: "flex-end" },
  sigImage: { width: 120, height: 36, objectFit: "contain" },
  sigSpacer: { width: 160, height: 36, borderBottomWidth: 1 },
  sigCaption: { fontSize: 8, marginTop: 4 },
  watermark: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontSize: 8 },
});

export function CorporateProPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || "#0F172A";
  const dark = data.theme?.mode === "dark";
  const no = invoiceDisplayNo({
    prefix: data.prefix ?? "",
    serialNumber: data.serialNumber ?? "",
    invoiceNo: data.invoiceNo,
  });
  const muted = dark ? "#94a3b8" : "#64748b";
  const body = dark ? "#cbd5e1" : "#475569";
  const strong = dark ? "#f8fafc" : "#0f172a";
  const hairline = dark ? "#1e293b" : "#e2e8f0";
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={[styles.header, { backgroundColor: accent }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={styles.headerLabel}>Invoice</Text>
              <Text style={styles.headerNo}>{no}</Text>
              <Text style={styles.headerCompany}>{data.fromName}</Text>
              <Text style={styles.headerSub}>{data.fromEmail}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerLabel}>Schedule</Text>
              <Text style={[styles.headerSub, { marginTop: 8 }]}>Issued: {data.issueDate}</Text>
              <Text style={styles.headerSub}>Due: {data.dueDate}</Text>
              {data.paymentTerms ? <Text style={styles.headerSub}>Terms: {data.paymentTerms}</Text> : null}
              <Text style={styles.premiumBadge}>Premium</Text>
            </View>
          </View>
        </View>
        <View style={styles.goldRule} />
        <View style={[styles.hairlineRule, { backgroundColor: hairline }]} />

        <View style={styles.body}>
          <View style={styles.partiesRow}>
            <View style={styles.partyCol}>
              <Text style={[styles.partyLabel, { color: dark ? GOLD : accent }]}>Billed by</Text>
              <Text style={[styles.partyName, { color: strong }]}>{data.fromName}</Text>
              <Text style={[styles.partyLine, { color: body }]}>{data.fromEmail}</Text>
              <Text style={[styles.partyLine, { color: body }]}>{data.fromAddress}</Text>
              {data.gstin ? <Text style={[styles.partyLine, { color: body }]}>GSTIN: {data.gstin}</Text> : null}
              {(data.companyMeta ?? []).map((m, i) => (
                <Text key={i} style={[styles.partyLine, { color: body }]}>
                  {m.label ? `${m.label}: ` : ""}{m.value}
                </Text>
              ))}
            </View>
            <View style={styles.partyColRight}>
              <Text style={[styles.partyLabel, { color: dark ? GOLD : accent }]}>Billed to</Text>
              <Text style={[styles.partyName, { color: strong }]}>{data.billToName}</Text>
              <Text style={[styles.partyLine, { color: body }]}>{data.billToEmail}</Text>
              <Text style={[styles.partyLine, { color: body }]}>{data.billToAddress}</Text>
              {(data.clientMeta ?? []).map((m, i) => (
                <Text key={i} style={[styles.partyLine, { color: body }]}>
                  {m.label ? `${m.label}: ` : ""}{m.value}
                </Text>
              ))}
            </View>
          </View>

          <View style={[styles.tableHead, { backgroundColor: accent }]}>
            <Text style={[styles.colDesc, styles.headText]}>Description</Text>
            <Text style={[styles.colQty, styles.headText]}>Qty</Text>
            <Text style={[styles.colRate, styles.headText]}>Rate</Text>
            <Text style={[styles.colTax, styles.headText]}>Tax%</Text>
            <Text style={[styles.colAmt, styles.headText]}>Amount</Text>
          </View>
          <View style={styles.goldRule} />
          <View style={[styles.hairlineRule, { backgroundColor: hairline }]} />
          {data.items.map((it) => (
            <View key={it.id} style={[styles.tableRow, { borderBottomColor: hairline }]}>
              <View style={styles.colDesc}>
                <Text style={[styles.itemName, { color: strong }]}>{itemName(it)}</Text>
                {it.description ? <Text style={[styles.itemDescSmall, { color: muted }]}>{it.description}</Text> : null}
                {it.hsn ? <Text style={[styles.itemDescSmall, { color: muted }]}>HSN: {it.hsn}</Text> : null}
              </View>
              <Text style={[styles.colQty, { color: body }]}>{String(it.qty)}</Text>
              <Text style={[styles.colRate, { color: body }]}>{money(data.currency, it.rate)}</Text>
              <Text style={[styles.colTax, { color: body }]}>{`${it.taxPct}%`}</Text>
              <Text style={[styles.colAmt, { color: strong }]}>{money(data.currency, it.qty * it.rate)}</Text>
            </View>
          ))}

          <View wrap={false}>
            <View style={styles.totalsWrap}>
              <View style={styles.totalsBox}>
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
                <View style={styles.goldRule} />
                <View style={[styles.hairlineRule, { backgroundColor: hairline, marginBottom: 8, marginTop: 3 }]} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Text style={[styles.grandLabel, { color: muted }]}>Total</Text>
                  <Text style={[styles.grandValue, { color: strong }]}>{money(data.currency, totals.grandTotal)}</Text>
                </View>
              </View>
            </View>

            {(data.paymentInfo ?? []).length > 0 ? (
              <View style={styles.payBlock}>
                <Text style={styles.payLabel}>Payment info</Text>
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
                      <Text style={styles.notesLabel}>Notes</Text>
                      <Text style={[styles.notesText, { color: body }]}>{data.notes}</Text>
                    </>
                  ) : null}
                </View>
                <View style={styles.notesCol}>
                  {data.terms ? (
                    <>
                      <Text style={styles.notesLabel}>Terms</Text>
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
                <Text style={[styles.sigCaption, { color: muted }]}>Authorized signature</Text>
              </View>
            </View>
          </View>
        </View>

        {watermark ? (
          <Text fixed style={[styles.watermark, { color: muted }]}>Made with SmartBillr</Text>
        ) : null}
      </Page>
    </Document>
  );
}
