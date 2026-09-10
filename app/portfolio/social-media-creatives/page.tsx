import type { Metadata } from "next";
import { siteMeta } from "@/content/site";
import { industries } from "@/content/work";
import { BrandGrid } from "@/components/portfolio/brand-grid";
import { IndustryShowcase } from "@/components/portfolio/industry-showcase";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { getBrands } from "@/lib/cms/queries";
import { SECTIONS } from "@/lib/cms/types";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

const PATH = SECTIONS.social.basePath;

/**
 * Statically rendered and cache-tagged. Admin mutations call revalidateTag, so
 * CMS edits appear immediately without giving up the static render. The
 * one-hour floor is only a backstop for a missed purge.
 */
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Social Media Creatives",
  description:
    "Social media creatives by Muhammad Umaid Sadiq for automotive, drinks & ice cream, health care, perfume, snacks, and real estate brands.",
  path: PATH,
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/portfolio" },
  { name: "Social Media Creatives", path: PATH },
];

/**
 * Every social creative on one page, filtered by industry. Any brands added
 * through the CMS still appear below as client cards.
 */
export default async function SocialMediaCreativesPage() {
  const brands = await getBrands("social");

  const galleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Social Media Creatives",
    url: new URL(PATH, siteMeta.url).toString(),
    author: { "@type": "Person", name: siteMeta.name },
    image: industries.flatMap((industry) =>
      industry.posters.map((p) => ({
        "@type": "ImageObject",
        contentUrl: new URL(p.src, siteMeta.url).toString(),
        name: p.alt,
        width: p.width,
        height: p.height,
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />
      <PageHeader
        eyebrow="Social Media Creatives"
        title="Creative work, organised by industry."
        intro="Pick an industry to see the social media creatives designed for it — and the kind of brands behind them."
        breadcrumb={
          <Breadcrumb items={crumbs.map((c) => ({ name: c.name, href: c.path }))} />
        }
      />

      <section className="bg-mist">
        <div className="shell shell-wide py-16 md:py-24">
          <IndustryShowcase industries={industries} />

          {brands.length > 0 && (
            <div className="mt-24">
              <p className="eyebrow mb-8">More client work</p>
              <BrandGrid
                brands={brands}
                basePath={PATH}
                itemNoun={SECTIONS.social.itemNoun}
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
