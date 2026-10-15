import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Manage Assets | SmartBillr",
  description:
    "Manage your logos, signatures, and default business details for new invoices.",
};

export default function AssetsLayout({ children }: { children: ReactNode }) {
  return children;
}
