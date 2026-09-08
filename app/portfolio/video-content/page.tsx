import type { Metadata } from "next";
import { BrandGrid } from "@/components/portfolio/brand-grid";
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
    "Short-form video, brand films, and motion content by Muhammad Umaid Sadiq, cut for retention.",
  path: PATH,
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/portfolio" },
  { name: "Video Content", path: PATH },
];

/**
 * Brand-first, mirroring Social Media Creatives. This replaces the previous flat
 * WorkCard grid so both sections share one structure — one card component, one
 * set of CMS controls.
 */
export default async function VideoContentPage() {
  const brands = await getBrands("video");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
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
        <div className="shell shell-wide py-20 md:py-28">
          <BrandGrid
            brands={brands}
            basePath={PATH}
            itemNoun={SECTIONS.video.itemNoun}
            emptyMessage="Video work is being added here shortly."
          />
        </div>
      </section>
      <FinalCta />
    </>
  );
}
