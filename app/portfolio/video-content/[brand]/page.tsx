import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteMeta } from "@/content/site";
import { VideoGallery } from "@/components/portfolio/video-gallery";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { getBrandSlugs, getVideoBrand } from "@/lib/cms/queries";
import { SECTIONS } from "@/lib/cms/types";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

const BASE = SECTIONS.video.basePath;

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getBrandSlugs("video");
  return slugs.map((brand) => ({ brand }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const data = await getVideoBrand(slug);
  if (!data) return buildMetadata({ title: "Not found" });

  const { brand } = data;
  return buildMetadata({
    title: `${brand.name} — Video Content`,
    description: `${brand.itemCount} videos produced for ${brand.name} (${brand.industry}) by Muhammad Umaid Sadiq. ${brand.blurb}`,
    path: `${BASE}/${brand.slug}`,
  });
}

export default async function VideoBrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const data = await getVideoBrand(slug);
  if (!data) notFound();

  const { brand, videos } = data;
  const path = `${BASE}/${brand.slug}`;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/portfolio" },
    { name: "Video Content", path: BASE },
    { name: brand.name, path },
  ];

  // Describes the collection, with each entry as a VideoObject. `contentUrl`
  // is the watch/embed URL, which is what search engines can actually resolve.
  const galleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${brand.name} — Video Content`,
    description: brand.blurb,
    url: new URL(path, siteMeta.url).toString(),
    author: { "@type": "Person", name: siteMeta.name },
    hasPart: videos.map((video) => ({
      "@type": "VideoObject",
      name: video.title,
      description: brand.blurb,
      ...(video.thumbUrl ? { thumbnailUrl: video.thumbUrl } : {}),
      contentUrl: video.url,
      ...(video.embedUrl ? { embedUrl: video.embedUrl } : {}),
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
        {videos.length > 0 && (
          <p className="mt-6 text-sm font-medium text-muted">
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </p>
        )}
      </PageHeader>

      <section className="bg-mist">
        <div className="shell shell-wide py-16 md:py-24">
          {videos.length > 0 ? (
            <VideoGallery videos={videos} />
          ) : (
            <p className="mx-auto max-w-md rounded-xl border border-dashed border-line-strong px-6 py-16 text-center text-muted">
              Videos for this client are being added shortly.
            </p>
          )}
        </div>
      </section>

      <FinalCta />
    </>
  );
}
