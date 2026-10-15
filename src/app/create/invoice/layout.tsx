import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create Invoice | SmartBillr",
  description:
    "Create a GST-ready invoice with live preview, PDF download, and multiple templates.",
};

export default function CreateInvoiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
