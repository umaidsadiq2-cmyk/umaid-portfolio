import type { MetadataRoute } from "next";
import { siteMeta } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin was previously fully crawlable — the dashboard is auth-gated so
    // nothing sensitive was ever indexable, but it's not content anyone
    // should find in search either, so it's excluded explicitly.
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: new URL("/sitemap.xml", siteMeta.url).toString(),
  };
}
