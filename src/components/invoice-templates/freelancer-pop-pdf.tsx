import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { TemplateProps } from "./minimal-white";

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

const styles = StyleSheet.create({
  page: { fontSize: 10, color: "#18181b", backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  header: { padding: 32, flexDirection: "row", justifyContent: "space-between" },
  headerLabel: { fontSize: 8, fontWeight: "bold", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 2 },
  headerNo: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginTop: 4 },
  headerSub: { color: "rgba(255,255,255,0.85)", marginTop: 6 },
  totalCard: { backgroundColor: "#ffffff", borderRadius: 8, padding: 16, minWidth: 170, textAlign: "right" },
  totalLabel: { fontSize: 8, fontWeight: "bold", color: "#a1a1aa", textTransform: "uppercase" },
  totalValue: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  totalDue: { fontSize: 8, color: "#71717a", marginTop: 4 },
  body: { padding: 32 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", color: "#52525b" },
  metaLabel: { fontSize: 8, fontWeight: "bold", color: "#a1a1aa", textTransform: "uppercase" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderRadius: 6 },
  itemDesc: { fontWeight: "bold" },
  itemSub: { fontSize: 8, color: "#71717a", marginTop: 2 },
  totalsWrap: { alignItems: "flex-end", marginTop: 16 },
  totalsBox: { width: 200 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, color: "#52525b" },
  watermark: { textAlign: "center", marginTop: 28, fontSize: 8, color: "#a1a1aa" },
});

export function FreelancerPopPdfDocument({ data, totals, watermark }: TemplateProps) {
  const accent = data.accent || "#4f46e5";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { backgroundColor: accent }]}>
          <View>
            <Text style={styles.headerLabel}>Invoice</Text>
            <Text style={styles.headerNo}>{data.invoiceNo}</Text>
            <Text style={styles.headerSub}>{data.fromName} · {data.fromEmail}</Text>
            <Text style={styles.headerSub}>{data.fromAddress}</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.metaLabel}>Total due</Text>
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
              <Text>{data.billToName}</Text>
              <Text>{data.billToEmail}</Text>
              <Text>{data.billToAddress}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Details</Text>
              <Text>Issued: {data.issueDate}</Text>
              <Text>Due: {data.dueDate}</Text>
              {data.gstin ? <Text>GSTIN: {data.gstin}</Text> : null}
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            {data.items.map((it, i) => (
              <View
                key={it.id}
                style={[styles.itemRow, { backgroundColor: i % 2 === 0 ? "#fafafa" : "#ffffff" }]}
              >
                <View>
                  <Text style={styles.itemDesc}>{it.desc}</Text>
                  <Text style={styles.itemSub}>
                    {`${it.qty} x ${money(data.currency, it.rate)} · ${it.taxPct}% tax`}
                  </Text>
                </View>
                <Text style={styles.itemDesc}>{money(data.currency, it.qty * it.rate)}</Text>
              </View>
            ))}
          </View>

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
              <View style={styles.totalRow}>
                <Text>Tax</Text>
                <Text>{money(data.currency, totals.taxTotal)}</Text>
              </View>
            </View>
          </View>

          {watermark ? <Text style={styles.watermark}>Made with SmartBillr</Text> : null}
        </View>
      </Page>
    </Document>
  );
}
