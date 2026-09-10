import type { Metadata } from "next";
import { siteMeta } from "@/content/site";
import { videoCategories } from "@/content/work";
import { BrandGrid } from "@/components/portfolio/brand-grid";
import { VideoCategoryShowcase } from "@/components/portfolio/video-category-showcase";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { getBrands } from "@/lib/cms/queries";
import { SECTIONS } from "@/lib/cms/types";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

const PATH = SECTIONS.video.basePath;

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Video Content",
  description:
    "AI video ads, short-form video ads, and logo animations by Muhammad Umaid Sadiq, cut for retention.",
  path: PATH,
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/portfolio" },
  { name: "Video Content", path: PATH },
];

/**
 * Every video on one page, by category — mirroring Social Media Creatives.
 * The static collections are already shown above, so only CMS-added brands
 * appear below as client cards.
 */
export default async function VideoContentPage() {
  const categories = videoCategories();
  const shown = new Set(categories.map((c) => c.slug));
  const cmsBrands = (await getBrands("video")).filter((b) => !shown.has(b.slug));

  const galleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Video Content",
    url: new URL(PATH, siteMeta.url).toString(),
    author: { "@type": "Person", name: siteMeta.name },
    hasPart: categories.flatMap((category) =>
      category.videos.map((video) => ({
        "@type": "VideoObject",
        name: video.title,
        description: category.description,
        ...(video.thumbUrl
          ? { thumbnailUrl: new URL(video.thumbUrl, siteMeta.url).toString() }
          : {}),
        contentUrl: new URL(video.url, siteMeta.url).toString(),
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />
      <PageHeader
        eyebrow="Video content"
        title="Video cut to hold attention to the last frame."
        intro="Short-form and brand films engineered for watch-time, shares, and action — not just views."
        breadcrumb={
          <Breadcrumb items={crumbs.map((c) => ({ name: c.name, href: c.path }))} />
        }
      />
      <section className="bg-mist">
        <div className="shell shell-wide py-16 md:py-24">
          <VideoCategoryShowcase categories={categories} />

          {cmsBrands.length > 0 && (
            <div className="mt-24">
              <p className="eyebrow mb-8">More client work</p>
              <BrandGrid
                brands={cmsBrands}
                basePath={PATH}
                itemNoun={SECTIONS.video.itemNoun}
                emptyMessage=""
              />
            </div>
          )}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
