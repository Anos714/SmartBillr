import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmartBillr",
    short_name: "SmartBillr",
    description: "Create beautiful GST invoices free. Pro for premium templates.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#09090B",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
