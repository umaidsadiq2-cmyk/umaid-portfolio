import type { MetadataRoute } from "next";
import { siteMeta } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/portfolio",
    "/portfolio/creative-designs",
    "/portfolio/video-content",
    "/about",
    "/contact",
  ];
  return routes.map((path) => ({
    url: new URL(path, siteMeta.url).toString(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
