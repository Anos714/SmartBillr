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

const styles = StyleSheet.create({
  page: { fontSize: 10, color: "#1c1917", backgroundColor: "#ffffff", fontFamily: INVOICE_PDF_FONT_FAMILY },
  pageDark: { fontSize: 10, color: "#f0ece2", backgroundColor: "#100f0d", fontFamily: INVOICE_PDF_FONT_FAMILY },
  accentBar: { height: 4 },
  head: { padding: 36, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 3 },
  no: { fontSize: 30, marginTop: 4 },
  meta: { fontSize: 9, marginTop: 2 },
  card: { width: 230, borderWidth: 1, borderRadius: 8, padding: 14 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, fontSize: 10 },
  body: { padding: 36, paddingTop: 8, paddingBottom: 72 },
  tableHead: { flexDirection: "row", marginTop: 18, paddingVertical: 7, borderBottomWidth: 2 },
  headText: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 9 },
  colItem: { flex: 1 },
  colHrs: { width: 70, textAlign: "right", fontWeight: "bold" },
  colRate: { width: 90, textAlign: "right" },
  colAmt: { width: 90, textAlign: "right", fontWeight: "bold" },
  bottomRow: { flexDirection: "row", marginTop: 16, gap: 16 },
  termsBox: { flex: 1, borderLeftWidth: 4, borderRadius: 4, padding: 10 },
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

export function ConsultingRetainerPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || "#4F46E5";
  const dark = data.theme?.mode === "dark";
  const no = invoiceDisplayNo({ prefix: data.prefix ?? "", serialNumber: data.serialNumber ?? "", invoiceNo: data.invoiceNo });
  const muted = dark ? "#8f887a" : "#78716c";
  const body = dark ? "#c9c2b4" : "#57534e";
  const strong = dark ? "#f0ece2" : "#1c1917";
  const hairline = dark ? "#2b2a26" : "#e7e5e4";
  const totalHours = data.items.reduce((s, it) => s + (it.qty || 0), 0);
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <View style={styles.head}>
          <View>
            <Text style={[styles.label, { color: accent }]}>Retainer Statement</Text>
            <Text style={styles.no}>{no}</Text>
            <Text style={[styles.meta, { color: strong }]}>{data.fromName}</Text>
            <Text style={[styles.meta, { color: body }]}>{data.fromAddress}</Text>
          </View>
          <View style={[styles.card, { borderColor: hairline }]}>
            <Text style={[styles.label, { color: accent }]}>Retainer summary</Text>
            <Text style={[styles.meta, { color: body }]}>Period</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: strong }}>{data.issueDate} → {data.dueDate}</Text>
            <View style={[styles.cardRow, { color: body }]}><Text>Total hours</Text><Text>{totalHours} hrs</Text></View>
            <View style={[styles.cardRow, { color: strong }]}><Text>Amount</Text><Text>{money(data.currency, totals.grandTotal)}</Text></View>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={[styles.meta, { color: body }]}>Prepared for {data.billToName} · {data.billToEmail}</Text>
          <View style={[styles.tableHead, { borderBottomColor: accent }]}>
            <Text style={[styles.colItem, styles.headText, { color: muted }]}>Engagement</Text>
            <Text style={[styles.colHrs, styles.headText, { color: muted }]}>Hrs</Text>
            <Text style={[styles.colRate, styles.headText, { color: muted }]}>Rate / hr</Text>
            <Text style={[styles.colAmt, styles.headText, { color: muted }]}>Amount</Text>
          </View>
          {data.items.map((it) => (
            <View key={it.id} style={[styles.tableRow, { borderBottomColor: hairline }]}>
              <View style={styles.colItem}><Text style={{ color: strong }}>{itemName(it)}</Text></View>
              <Text style={[styles.colHrs, { color: strong }]}>{String(it.qty)}</Text>
              <Text style={[styles.colRate, { color: body }]}>{money(data.currency, it.rate)}</Text>
              <Text style={[styles.colAmt, { color: strong }]}>{money(data.currency, it.qty * it.rate)}</Text>
            </View>
          ))}
          <View style={styles.bottomRow}>
            <View style={{ flex: 1 }}>
              {data.paymentTerms ? (
                <View style={[styles.termsBox, { borderLeftColor: accent }]}>
                  <Text style={[styles.label, { color: accent }]}>Payment terms</Text>
                  <Text style={{ marginTop: 4, fontWeight: "bold", color: strong }}>{data.paymentTerms}</Text>
                </View>
              ) : null}
              {data.notes ? <Text style={{ marginTop: 10, color: body }}>{data.notes}</Text> : null}
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
