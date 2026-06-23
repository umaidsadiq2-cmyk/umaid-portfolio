import type { Metadata } from "next";
import { siteMeta } from "@/content/site";

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

/** ProfessionalService schema — surfaces services + service areas to search. */
export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteMeta.name,
    description: siteMeta.description,
    url: siteMeta.url,
    image: new URL("/images/umaid1.webp", siteMeta.url).toString(),
    areaServed: ["Pakistan", "United Arab Emirates", "United Kingdom", "Canada", "United States"],
    knowsAbout: [
      "Social Media Marketing",
      "Content Creation",
      "Graphic Design",
      "Video Editing",
      "Website Development",
      "SEO",
      "Software Solutions",
    ],
    makesOffer: [
      "Social Media Marketing",
      "Content Creation",
      "Graphic Design",
      "Video Editing",
      "Website Development",
      "SEO",
      "Software Solutions",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
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
