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
  page: { fontSize: 10, color: "#1c1917", backgroundColor: "#FFFBEB", fontFamily: INVOICE_PDF_FONT_FAMILY },
  outer: { padding: 24, paddingBottom: 72 },
  header: { borderRadius: 18, padding: 30, flexDirection: "row", justifyContent: "space-between" },
  headerLabel: { fontSize: 9, fontWeight: "bold", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 2 },
  headerNo: { fontSize: 34, fontWeight: "bold", color: "#ffffff", marginTop: 6 },
  headerSub: { color: "rgba(255,255,255,0.85)", marginTop: 6 },
  totalCard: { backgroundColor: "#ffffff", borderRadius: 48, paddingVertical: 18, paddingHorizontal: 26, minWidth: 180, textAlign: "center" },
  totalLabel: { fontSize: 9, fontWeight: "bold", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 2 },
  totalValue: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
  totalDue: { fontSize: 8, color: "#78716c", marginTop: 4 },
  body: { backgroundColor: "#ffffff", borderRadius: 18, padding: 30, marginTop: 12 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", color: "#78716c" },
  metaLabel: { fontSize: 9, fontWeight: "bold", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 2 },
  metaName: { fontSize: 12, fontWeight: "bold", color: "#1c1917", marginTop: 4 },
  listHead: { flexDirection: "row", justifyContent: "space-between", marginTop: 26, paddingBottom: 8, borderBottomWidth: 2 },
  listHeadText: { fontSize: 9, fontWeight: "bold", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 2 },
  gapRule: { borderTopWidth: 1, borderTopColor: "#f5f0e1", marginTop: 2 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "#f5f0e1" },
  itemDesc: { fontSize: 11, fontWeight: "bold", color: "#1c1917" },
  itemSub: { fontSize: 8, color: "#78716c", marginTop: 2 },
  thanks: { fontSize: 12, fontWeight: "bold", textAlign: "center", marginTop: 20, fontStyle: "italic" },
  totalsWrap: { alignItems: "flex-end", marginTop: 20 },
  totalsBox: { width: 256 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, color: "#78716c", fontSize: 10 },
  divider: { borderTopWidth: 1, borderTopColor: "#f5f0e1", marginTop: 6, marginBottom: 8 },
  pillTotal: { borderRadius: 48, paddingVertical: 8, paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pillLabel: { fontSize: 9, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase", letterSpacing: 2 },
  pillValue: { fontSize: 15, fontWeight: "bold", color: "#ffffff" },
  payBlock: { marginTop: 28 },
  payLabel: { fontSize: 9, fontWeight: "bold", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 2 },
  payLine: { fontSize: 8, color: "#78716c", marginTop: 2 },
  notesRow: { flexDirection: "row", marginTop: 28, gap: 24 },
  notesCol: { width: "50%" },
  notesLabel: { fontSize: 9, fontWeight: "bold", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 2 },
  notesText: { fontSize: 9, color: "#78716c", marginTop: 4 },
  sigRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 28 },
  sigBox: { alignItems: "flex-end" },
  sigImage: { width: 120, height: 36, objectFit: "contain" },
  sigSpacer: { width: 160, height: 36, borderBottomWidth: 1, borderBottomColor: "#d6d3d1" },
  sigCaption: { fontSize: 8, color: "#78716c", marginTop: 4 },
  watermark: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "#a8a29e" },
});

export function FreelancerPopPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || "#0C6B4F";
  const no = invoiceDisplayNo({
    prefix: data.prefix ?? "",
    serialNumber: data.serialNumber ?? "",
    invoiceNo: data.invoiceNo,
  });
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outer}>
          <View style={[styles.header, { backgroundColor: accent }]}>
            <View>
              <Text style={styles.headerLabel}>Invoice</Text>
              <Text style={styles.headerNo}>{no}</Text>
              <Text style={[styles.headerSub, { fontWeight: "bold" }]}>{data.fromName} · {data.fromEmail}</Text>
              <Text style={styles.headerSub}>{data.fromAddress}</Text>
              {(data.companyMeta ?? []).map((m, i) => (
                <Text key={i} style={styles.headerSub}>
                  {m.label ? `${m.label}: ` : ""}{m.value}
                </Text>
              ))}
            </View>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total due</Text>
              <Text style={[styles.totalValue, { color: accent }]}>
                {money(data.currency, totals.grandTotal)}
              </Text>
              <Text style={styles.totalDue}>Due {data.dueDate}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.metaLabel}>Bill to</Text>
                <Text style={styles.metaName}>{data.billToName}</Text>
                <Text>{data.billToEmail}</Text>
                <Text>{data.billToAddress}</Text>
                {(data.clientMeta ?? []).map((m, i) => (
                  <Text key={i}>
                    {m.label ? `${m.label}: ` : ""}{m.value}
                  </Text>
                ))}
              </View>
              <View>
                <Text style={styles.metaLabel}>Details</Text>
                <Text style={{ marginTop: 4 }}>Issued: {data.issueDate}</Text>
                <Text>Due: {data.dueDate}</Text>
                {data.paymentTerms ? <Text>Payment: {data.paymentTerms}</Text> : null}
                {data.gstin ? <Text>GSTIN: {data.gstin}</Text> : null}
              </View>
            </View>

            <View style={[styles.listHead, { borderBottomColor: accent }]}>
              <Text style={styles.listHeadText}>What you got</Text>
              <Text style={styles.listHeadText}>Amount</Text>
            </View>
            <View style={styles.gapRule} />
            {data.items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <View>
                  <Text style={styles.itemDesc}>{itemName(it)}</Text>
                  {it.description ? <Text style={styles.itemSub}>{it.description}</Text> : null}
                  <Text style={styles.itemSub}>
                    {`${it.qty} x ${money(data.currency, it.rate)} · ${it.taxPct}% tax${it.hsn ? ` · HSN ${it.hsn}` : ""}`}
                  </Text>
                </View>
                <Text style={styles.itemDesc}>{money(data.currency, it.qty * it.rate)}</Text>
              </View>
            ))}

            <Text style={[styles.thanks, { color: accent }]}>thanks a bunch for working with me!</Text>

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
                        {a.type === "percentage"
                          ? money(data.currency, (totals.subtotal * a.value) / 100)
                          : money(data.currency, a.value)}
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
                  <View style={styles.divider} />
                  <View style={[styles.pillTotal, { backgroundColor: accent }]}>
                    <Text style={styles.pillLabel}>Total</Text>
                    <Text style={styles.pillValue}>{money(data.currency, totals.grandTotal)}</Text>
                  </View>
                </View>
              </View>

              {(data.paymentInfo ?? []).length > 0 ? (
                <View style={styles.payBlock}>
                  <Text style={styles.payLabel}>Payment info</Text>
                  {(data.paymentInfo ?? []).map((m, i) => (
                    <Text key={i} style={styles.payLine}>
                      {m.label ? `${m.label}: ` : ""}{m.value}
                    </Text>
                  ))}
                </View>
              ) : null}

              {(data.notes || data.terms) ? (
                <View style={styles.notesRow}>
                  <View style={styles.notesCol}>
                    {data.notes ? (
                      <>
                        <Text style={styles.notesLabel}>Notes</Text>
                        <Text style={styles.notesText}>{data.notes}</Text>
                      </>
                    ) : null}
                  </View>
                  <View style={styles.notesCol}>
                    {data.terms ? (
                      <>
                        <Text style={styles.notesLabel}>Terms</Text>
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
        </View>

        {watermark ? <Text fixed style={styles.watermark}>Made with SmartBillr</Text> : null}
      </Page>
    </Document>
  );
}
