import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePageTemplate, servicePageSlugs } from "@/components/sections/service-page-template";
import { getServicePage } from "@/content/service-pages";
import { buildMetadata, serviceJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return servicePageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) return buildMetadata({ title: "Not found" });

  // These meta titles are already complete, hand written SEO titles (they
  // include the brand name where it earns its place) — buildMetadata's usual
  // " — Umaid Sadiq" suffix would double up the branding, so it is applied
  // only to the description/canonical/OG scaffolding and overridden here.
  const base = buildMetadata({
    description: page.metaDescription,
    path: `/services/${page.slug}`,
  });

  return {
    ...base,
    title: page.metaTitle,
    openGraph: {
      ...base.openGraph,
      title: page.ogTitle,
      description: page.ogDescription,
    },
    twitter: {
      ...base.twitter,
      title: page.ogTitle,
      description: page.ogDescription,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/#services" },
    { name: page.name, path: `/services/${page.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(page)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page.faqs)) }}
      />

      <ServicePageTemplate page={page} />
    </>
  );
}
