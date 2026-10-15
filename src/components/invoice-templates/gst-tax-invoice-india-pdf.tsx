import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";
import "@/lib/pdf-font";
import { INVOICE_PDF_FONT_FAMILY } from "@/lib/pdf-font";
import { amountToWords } from "@/lib/words";

const money = (currency: string, value: number) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const itemName = (it: { name?: string; desc?: string }) =>
  (it.name && it.name.trim()) || (it.desc && it.desc.trim()) || "Untitled item";

const lookupGstin = (meta: { label: string; value: string }[] | undefined): string => {
  const hit = (meta ?? []).find((m) => (m.label ?? "").trim().toLowerCase() === "gstin");
  return (hit?.value ?? "").trim() || "—";
};

const styles = StyleSheet.create({
  page: { fontSize: 10, color: "#0f172a", backgroundColor: "#ffffff", fontFamily: INVOICE_PDF_FONT_FAMILY },
  pageDark: { fontSize: 10, color: "#e8edf5", backgroundColor: "#0b1220", fontFamily: INVOICE_PDF_FONT_FAMILY },
  tricolor: { flexDirection: "row", height: 6 },
  head: { padding: 32, paddingBottom: 20, borderBottomWidth: 1 },
  label: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  no: { fontSize: 26, fontWeight: "bold", marginTop: 4 },
  meta: { fontSize: 9, marginTop: 2 },
  partiesRow: { flexDirection: "row", gap: 16, marginTop: 16 },
  partyBox: { width: "50%", borderWidth: 1, borderRadius: 6, padding: 10 },
  tableHead: { flexDirection: "row", marginTop: 18, paddingVertical: 8, paddingHorizontal: 8 },
  headText: { fontSize: 8, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 7, paddingHorizontal: 8 },
  colIdx: { width: 28 },
  colDesc: { flex: 1 },
  colHsn: { width: 70 },
  colQty: { width: 44, textAlign: "right" },
  colRate: { width: 76, textAlign: "right" },
  colAmt: { width: 80, textAlign: "right", fontWeight: "bold" },
  bottomRow: { flexDirection: "row", marginTop: 16, gap: 16 },
  wordsBox: { flex: 1, borderWidth: 2, borderRadius: 6, padding: 10 },
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

export function GstTaxInvoiceIndiaPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || "#0F766E";
  const dark = data.theme?.mode === "dark";
  const no = invoiceDisplayNo({ prefix: data.prefix ?? "", serialNumber: data.serialNumber ?? "", invoiceNo: data.invoiceNo });
  const muted = dark ? "#94a3b8" : "#64748b";
  const body = dark ? "#cbd5e1" : "#475569";
  const strong = dark ? "#f8fafc" : "#0f172a";
  const hairline = dark ? "#1e293b" : "#e2e8f0";
  const isInr = data.currency === "INR";
  const taxable = totals.subtotal - totals.discount;
  const half = totals.taxTotal / 2;
  const companyGstin = (data.gstin ?? "").trim() || lookupGstin(data.companyMeta);
  const clientGstin = lookupGstin(data.clientMeta);
  const words = amountToWords(totals.grandTotal, data.currency);
  return (
    <Document>
      <Page size="A4" style={dark ? styles.pageDark : styles.page}>
        <View style={styles.tricolor}>
          <View style={{ flex: 1, backgroundColor: "#FF9933" }} />
          <View style={{ flex: 1, backgroundColor: dark ? "#1e293b" : "#ffffff" }} />
          <View style={{ flex: 1, backgroundColor: "#138808" }} />
        </View>
        <View style={[styles.head, { borderBottomColor: hairline }]}>
          <Text style={[styles.label, { color: accent }]}>Tax Invoice</Text>
          <Text style={styles.no}>{no}</Text>
          <Text style={[styles.meta, { color: strong }]}>{data.fromName}</Text>
          <Text style={[styles.meta, { color: body }]}>{data.fromAddress}</Text>
          <Text style={[styles.meta, { color: body }]}>GSTIN: {companyGstin}</Text>
          <Text style={[styles.meta, { color: body }]}>Issued: {data.issueDate}  ·  Due: {data.dueDate}</Text>
        </View>
        <View style={{ padding: 32, paddingTop: 0 }}>
          <View style={styles.partiesRow}>
            <View style={[styles.partyBox, { borderColor: hairline }]}>
              <Text style={[styles.label, { color: accent }]}>Billed by</Text>
              <Text style={[styles.meta, { color: strong }]}>{data.fromName}</Text>
              <Text style={[styles.meta, { color: body }]}>GSTIN: {companyGstin}</Text>
            </View>
            <View style={[styles.partyBox, { borderColor: hairline }]}>
              <Text style={[styles.label, { color: accent }]}>Billed to</Text>
              <Text style={[styles.meta, { color: strong }]}>{data.billToName}</Text>
              <Text style={[styles.meta, { color: body }]}>GSTIN: {clientGstin}</Text>
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
          {data.items.map((it, idx) => (
            <View key={it.id} style={[styles.tableRow, { borderBottomColor: hairline }]}>
              <Text style={[styles.colIdx, { color: muted }]}>{String(idx + 1)}</Text>
              <View style={styles.colDesc}><Text style={{ color: strong }}>{itemName(it)}</Text></View>
              <Text style={[styles.colHsn, { color: body }]}>{it.hsn || "—"}</Text>
              <Text style={[styles.colQty, { color: body }]}>{String(it.qty)}</Text>
              <Text style={[styles.colRate, { color: body }]}>{money(data.currency, it.rate)}</Text>
              <Text style={[styles.colAmt, { color: strong }]}>{money(data.currency, it.qty * it.rate)}</Text>
            </View>
          ))}
          <View style={styles.bottomRow}>
            <View style={[styles.wordsBox, { borderColor: accent }]}>
              <Text style={[styles.label, { color: accent }]}>Amount in words</Text>
              <Text style={{ marginTop: 4, fontSize: 10, fontWeight: "bold", color: strong }}>{words}</Text>
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
              {totals.adjustmentsTotal !== 0 ? (
                <View style={[styles.totalRow, { color: body }]}><Text>Adjustments</Text><Text>{money(data.currency, totals.adjustmentsTotal)}</Text></View>
              ) : null}
              <View style={[styles.divider, { borderTopColor: accent }]} />
              <View style={[styles.grandRow, { color: strong }]}><Text>Grand Total</Text><Text>{money(data.currency, totals.grandTotal)}</Text></View>
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
              <Text style={[styles.sigCaption, { color: muted }]}>Authorised Signatory</Text>
            </View>
          </View>
        </View>
        {watermark ? <Text style={[styles.watermark, { color: muted }]}>Made with SmartBillr</Text> : null}
      </Page>
    </Document>
  );
}
