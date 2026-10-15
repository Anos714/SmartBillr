import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmartBillr",
    short_name: "SmartBillr",
    description: "Create beautiful GST invoices free. Pro for premium templates.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F0",
    theme_color: "#0C6B4F",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
