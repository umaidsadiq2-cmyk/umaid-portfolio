import type { MetadataRoute } from "next";
import { siteMeta } from "@/content/site";
import { servicePages } from "@/content/service-pages";
import { getBrandSlugs } from "@/lib/cms/queries";
import { SECTIONS } from "@/lib/cms/types";

/**
 * Static routes plus every published brand page from the CMS.
 *
 * Async now: brand URLs are data, so adding a brand in the admin puts it in the
 * sitemap on the next revalidation rather than waiting for a code change. Reads
 * go through the same tagged cache as the pages themselves.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /portfolio/creative-designs is deliberately absent: the work flow is now
  // /portfolio → one of two sections, so that route is unreachable by
  // navigation and still renders placeholder projects. Listing it would invite
  // search engines to index an orphan page full of sample content.
  const staticRoutes = [
    "",
    "/portfolio",
    SECTIONS.social.basePath,
    SECTIONS.video.basePath,
    "/about",
    "/contact",
  ];

  const [socialSlugs, videoSlugs] = await Promise.all([
    getBrandSlugs("social"),
    getBrandSlugs("video"),
  ]);

  const brandRoutes = [
    ...socialSlugs.map((slug) => `${SECTIONS.social.basePath}/${slug}`),
    ...videoSlugs.map((slug) => `${SECTIONS.video.basePath}/${slug}`),
  ];

  const serviceRoutes = servicePages.map((s) => `/services/${s.slug}`);

  // Every entry gets the same build-time stamp. That's honest, not lazy: this
  // is a static export with no per-page "updated at" tracked anywhere, so a
  // per-route date would just be fabricated. A shared, real timestamp still
  // tells crawlers the sitemap itself is current, which is what lastModified
  // is actually for absent real per-page edit history.
  const lastModified = new Date();

  return [
    ...staticRoutes.map((path) => ({
      url: new URL(path, siteMeta.url).toString(),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...serviceRoutes.map((path) => ({
      url: new URL(path, siteMeta.url).toString(),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...brandRoutes.map((path) => ({
      url: new URL(path, siteMeta.url).toString(),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
