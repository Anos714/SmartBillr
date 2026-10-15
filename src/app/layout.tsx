import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "SmartBillr - Create Beautiful GST Invoices Free | Freelancer Invoice Generator",
    template: "%s | SmartBillr",
  },
  description:
    "SmartBillr is a free invoice generator for freelancers and Indian businesses. 2 free templates, GST-ready invoices, no signup needed for basics.",
  keywords: ["invoice generator", "GST invoice", "free invoice maker", "freelancer billing", "SmartBillr"],
  openGraph: {
    type: "website",
    siteName: "SmartBillr",
    title: "SmartBillr - Invoices Clients Love to Pay",
    description: "Free for basics, Pro for premium templates. GST-ready for India + global.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartBillr - Create Beautiful Invoices",
    description: "Free for basics, Pro for premium templates.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
