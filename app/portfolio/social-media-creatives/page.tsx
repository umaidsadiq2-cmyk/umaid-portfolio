import type { Metadata } from "next";
import { BrandGrid } from "@/components/portfolio/brand-grid";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { getBrands } from "@/lib/cms/queries";
import { SECTIONS } from "@/lib/cms/types";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

const PATH = SECTIONS.social.basePath;

/**
 * Statically rendered and cache-tagged. Admin mutations call revalidateTag, so
 * edits appear immediately without giving up the static render. The one-hour
 * floor is only a backstop for a missed purge.
 */
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Social Media Creatives",
  description:
    "Explore social media campaigns and creative designs created for brands across multiple industries — by Muhammad Umaid Sadiq.",
  path: PATH,
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/portfolio" },
  { name: "Social Media Creatives", path: PATH },
];

export default async function SocialMediaCreativesPage() {
  const brands = await getBrands("social");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <PageHeader
        eyebrow="Social Media Creatives"
        title="Creative work, organised by client."
        intro="Explore social media campaigns and creative designs created for brands across multiple industries."
        breadcrumb={
          <Breadcrumb
            items={crumbs.map((c) => ({ name: c.name, href: c.path }))}
          />
        }
      />

      <section className="bg-mist">
        <div className="shell shell-wide py-20 md:py-28">
          <BrandGrid
            brands={brands}
            basePath={PATH}
            itemNoun={SECTIONS.social.itemNoun}
            emptyMessage="New client work is being added here shortly."
          />
        </div>
      </section>

      <FinalCta />
    </>
  );
}
