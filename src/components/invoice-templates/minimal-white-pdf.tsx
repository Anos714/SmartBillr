import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";
import { invoiceDisplayNo } from "@/lib/invoice";

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
  page: { padding: 48, fontSize: 10, color: "#18181b", backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  label: { fontSize: 8, fontWeight: "bold", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1 },
  invoiceNo: { fontSize: 24, fontWeight: "bold", marginTop: 4 },
  partyName: { fontSize: 11, fontWeight: "bold", marginTop: 8 },
  partyLine: { color: "#52525b", marginTop: 2, maxWidth: 260 },
  right: { textAlign: "right" },
  tableHead: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#0C6B4F", paddingBottom: 6, marginTop: 16 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f4f4f5", paddingVertical: 6 },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: "right" },
  colRate: { width: 80, textAlign: "right" },
  colTax: { width: 50, textAlign: "right" },
  colAmt: { width: 80, textAlign: "right", fontWeight: "bold" },
  headText: { fontSize: 8, fontWeight: "bold", color: "#71717a", textTransform: "uppercase" },
  itemDescSmall: { fontSize: 8, color: "#71717a", marginTop: 2 },
  totalsWrap: { alignItems: "flex-end", marginTop: 16 },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, color: "#52525b" },
  grandRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#0C6B4F", paddingTop: 6, fontSize: 12, fontWeight: "bold", color: "#18181b" },
  foot: { flexDirection: "row", gap: 24, marginTop: 28, fontSize: 8, color: "#71717a" },
  footCol: { flex: 1 },
  watermark: { textAlign: "center", marginTop: 36, fontSize: 8, color: "#a1a1aa" },
});

export function MinimalWhitePdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.theme?.baseColor || data.accent || "#0C6B4F";
  const no = invoiceDisplayNo({
    prefix: data.prefix ?? "",
    serialNumber: data.serialNumber ?? "",
    invoiceNo: data.invoiceNo,
  });
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>Invoice</Text>
            <Text style={[styles.invoiceNo, { color: accent }]}>{no}</Text>
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
          <View style={styles.right}>
            <Text style={styles.label}>Bill to</Text>
            <Text style={styles.partyName}>{data.billToName}</Text>
            <Text style={styles.partyLine}>{data.billToEmail}</Text>
            <Text style={styles.partyLine}>{data.billToAddress}</Text>
            {(data.clientMeta ?? []).map((m, i) => (
              <Text key={i} style={styles.partyLine}>
                {m.label ? `${m.label}: ` : ""}{m.value}
              </Text>
            ))}
            <Text style={[styles.partyLine, { marginTop: 8 }]}>Issued: {data.issueDate}</Text>
            <Text style={styles.partyLine}>Due: {data.dueDate}</Text>
            {data.paymentTerms ? (
              <Text style={styles.partyLine}>Payment: {data.paymentTerms}</Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.tableHead, { borderBottomColor: accent }]}>
          <Text style={[styles.colDesc, styles.headText]}>Description</Text>
          <Text style={[styles.colQty, styles.headText]}>Qty</Text>
          <Text style={[styles.colRate, styles.headText]}>Rate</Text>
          <Text style={[styles.colTax, styles.headText]}>Tax%</Text>
          <Text style={[styles.colAmt, styles.headText]}>Amount</Text>
        </View>
        {data.items.map((it) => (
          <View key={it.id} style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text>{itemName(it)}</Text>
              {it.description ? <Text style={styles.itemDescSmall}>{it.description}</Text> : null}
              {it.hsn ? <Text style={styles.itemDescSmall}>HSN: {it.hsn}</Text> : null}
            </View>
            <Text style={styles.colQty}>{String(it.qty)}</Text>
            <Text style={styles.colRate}>{money(data.currency, it.rate)}</Text>
            <Text style={styles.colTax}>{`${it.taxPct}%`}</Text>
            <Text style={styles.colAmt}>{money(data.currency, it.qty * it.rate)}</Text>
          </View>
        ))}

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
            <View style={[styles.grandRow, { borderTopColor: accent }]}>
              <Text>Total</Text>
              <Text>{money(data.currency, totals.grandTotal)}</Text>
            </View>
          </View>
        </View>

        {(data.paymentInfo ?? []).length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.headText}>Payment info</Text>
            {(data.paymentInfo ?? []).map((m, i) => (
              <Text key={i} style={{ fontSize: 8, color: "#52525b", marginTop: 2 }}>
                {m.label ? `${m.label}: ` : ""}{m.value}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.foot}>
          {data.notes ? (
            <View style={styles.footCol}>
              <Text style={styles.headText}>Notes</Text>
              <Text>{data.notes}</Text>
            </View>
          ) : null}
          {data.terms ? (
            <View style={styles.footCol}>
              <Text style={styles.headText}>Terms</Text>
              <Text>{data.terms}</Text>
            </View>
          ) : null}
        </View>

        {data.signatureUrl ? (
          <View style={{ alignItems: "flex-end", marginTop: 20 }}>
            {/* Remote signature; skipped gracefully if unloadable */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src={data.signatureUrl}
              style={{ width: 120, height: 40, objectFit: "contain" }}
            />
            <Text style={{ fontSize: 8, color: "#71717a", marginTop: 4 }}>
              Authorized signature
            </Text>
          </View>
        ) : null}

        {watermark ? <Text style={styles.watermark}>Made with SmartBillr</Text> : null}
      </Page>
    </Document>
  );
}
