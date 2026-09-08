import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteMeta } from "@/content/site";
import { PostGallery } from "@/components/portfolio/post-gallery";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { getBrandSlugs, getSocialBrand } from "@/lib/cms/queries";
import { SECTIONS } from "@/lib/cms/types";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

const BASE = SECTIONS.social.basePath;

export const revalidate = 3600;

/**
 * Prerender the brands that exist at build time. A brand added later still
 * works — it renders on first request and is then cached, because
 * dynamicParams defaults to true.
 */
export async function generateStaticParams() {
  const slugs = await getBrandSlugs("social");
  return slugs.map((company) => ({ company }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string }>;
}): Promise<Metadata> {
  const { company: slug } = await params;
  const data = await getSocialBrand(slug);
  if (!data) return buildMetadata({ title: "Not found" });

  const { brand } = data;
  return buildMetadata({
    title: `${brand.name} — Social Media Creatives`,
    description: `${brand.itemCount} social media creatives designed for ${brand.name} (${brand.industry}) by Muhammad Umaid Sadiq. ${brand.blurb}`,
    path: `${BASE}/${brand.slug}`,
  });
}

export default async function CompanyPortfolioPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: slug } = await params;
  const data = await getSocialBrand(slug);
  if (!data) notFound();

  const { brand, posts } = data;
  const path = `${BASE}/${brand.slug}`;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/portfolio" },
    { name: "Social Media Creatives", path: BASE },
    { name: brand.name, path },
  ];

  // Every slide, flattened — the gallery schema describes images, not posts.
  const images = posts.flatMap((post) => post.slides);

  const galleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${brand.name} — Social Media Creatives`,
    description: brand.blurb,
    url: new URL(path, siteMeta.url).toString(),
    author: { "@type": "Person", name: siteMeta.name },
    image: images.map((p) => ({
      "@type": "ImageObject",
      contentUrl: new URL(p.src, siteMeta.url).toString(),
      name: p.alt,
      width: p.width,
      height: p.height,
    })),
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
        eyebrow={brand.industry}
        title={brand.name}
        intro={brand.blurb}
        breadcrumb={
          <Breadcrumb items={crumbs.map((c) => ({ name: c.name, href: c.path }))} />
        }
      >
        {images.length > 0 && (
          <p className="mt-6 text-sm font-medium text-muted">
            {images.length} creatives
          </p>
        )}
      </PageHeader>

      <section className="bg-mist">
        <div className="shell shell-wide py-16 md:py-24">
          {posts.length > 0 ? (
            <PostGallery posts={posts} />
          ) : (
            <p className="mx-auto max-w-md rounded-xl border border-dashed border-line-strong px-6 py-16 text-center text-muted">
              Creatives for this client are being added shortly.
            </p>
          )}
        </div>
      </section>

      <FinalCta />
    </>
  );
}
