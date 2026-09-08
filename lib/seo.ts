import type { Metadata } from "next";
import { services } from "@/content/services";
import { siteMeta } from "@/content/site";
import type { ServicePage } from "@/lib/schemas";

type PageSeo = {
  title?: string;
  description?: string;
  path?: string;
};

/** Per-route metadata builder (titles, canonical, OG, Twitter). */
export function buildMetadata({ title, description, path = "/" }: PageSeo): Metadata {
  const url = new URL(path, siteMeta.url).toString();
  const fullTitle = title ? `${title} — ${siteMeta.shortName}` : `${siteMeta.name} — ${siteMeta.role}`;
  const desc = description ?? siteMeta.description;

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteMeta.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}

/** JSON-LD describing Umaid as a person + the website. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteMeta.name,
    jobTitle: siteMeta.role,
    url: siteMeta.url,
    description: siteMeta.description,
    knowsAbout: [
      "Social Media Marketing",
      "Content Creation",
      "Graphic Design",
      "Video Editing",
      "Web Development",
      "SEO",
      "Custom Software",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteMeta.name,
    url: siteMeta.url,
  };
}

/**
 * ProfessionalService schema — surfaces services + service areas to search.
 *
 * The service list is derived from content/services.ts rather than restated
 * here. It was previously hardcoded twice, which meant changing an offering
 * silently left search engines advertising the old one.
 */
export function professionalServiceJsonLd() {
  const offered = services
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s) => s.name);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteMeta.name,
    description: siteMeta.description,
    url: siteMeta.url,
    image: new URL("/images/New1-cut.png", siteMeta.url).toString(),
    areaServed: ["Pakistan", "United Arab Emirates", "United Kingdom", "Canada", "United States"],
    knowsAbout: offered,
    makesOffer: offered.map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };
}

/** Service schema for one dedicated service landing page. */
export function serviceJsonLd(page: ServicePage) {
  const url = new URL(`/services/${page.slug}`, siteMeta.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.name,
    description: page.metaDescription,
    url,
    provider: {
      "@type": "Person",
      name: siteMeta.name,
      jobTitle: siteMeta.role,
      url: siteMeta.url,
    },
    areaServed: ["Pakistan", "United Arab Emirates", "Saudi Arabia", "United Kingdom", "United States", "Canada"],
  };
}

/** FAQPage schema built from a page's FAQ list. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

/** Breadcrumb schema for a page. */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: new URL(it.path, siteMeta.url).toString(),
    })),
  };
}
