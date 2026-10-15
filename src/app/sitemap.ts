import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const staticRoutes = [
    "/",
    "/templates",
    "/pricing",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/guides/gst-invoice",
    "/guides/freelancer",
    "/compare/invoicely-alternative",
  ];
  return staticRoutes.map((r, i) => ({
    url: `${base}${r}`,
    changeFrequency: (i === 0 ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: r === "/" ? 1 : r.startsWith("/guides") || r.startsWith("/compare") ? 0.7 : 0.8,
  }));
}
