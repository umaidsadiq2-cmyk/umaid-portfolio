import { portfolioItemSchema, type PortfolioItem } from "@/lib/schemas";
import { z } from "zod";

/**
 * Placeholder portfolio entries with real structure. Replace media + copy with
 * actual case work before launch; thumbnails live under /public/portfolio/.
 */
export const portfolio: PortfolioItem[] = z.array(portfolioItemSchema).parse([
  {
    slug: "aurora-clinic-rebrand",
    title: "Aurora Aesthetic Clinic — Brand & Web",
    category: "creative-design",
    serviceTags: ["graphic-design", "web-development", "seo"],
    challenge:
      "A respected clinic looked dated online and lost enquiries to flashier competitors.",
    delivered:
      "A calm, premium identity and a fast website engineered to convert consultations.",
    result: "2.4× more consultation requests in the first quarter.",
    media: [
      {
        type: "image",
        src: "/portfolio/aurora-1.jpg",
        alt: "Aurora clinic brand and website",
        width: 1600,
        height: 1000,
      },
    ],
    thumbnail: {
      src: "/portfolio/aurora-1.jpg",
      alt: "Aurora clinic brand and website",
      width: 1200,
      height: 900,
    },
    featured: true,
    order: 0,
    client: "Aurora Aesthetic Clinic",
  },
  {
    slug: "northwind-travel-campaign",
    title: "Northwind Travel — Social Campaign",
    category: "creative-design",
    serviceTags: ["social-media-marketing", "content-creation", "graphic-design"],
    challenge:
      "A travel agency had beautiful trips but a flat, inconsistent social presence.",
    delivered:
      "A cohesive content system and campaign that grew an engaged, ready-to-book audience.",
    result: "+38% engaged followers in 90 days.",
    media: [
      {
        type: "image",
        src: "/portfolio/northwind-1.jpg",
        alt: "Northwind travel social campaign",
        width: 1600,
        height: 1000,
      },
    ],
    thumbnail: {
      src: "/portfolio/northwind-1.jpg",
      alt: "Northwind travel social campaign",
      width: 1200,
      height: 900,
    },
    featured: true,
    order: 1,
    client: "Northwind Travel",
  },
  {
    slug: "forge-ecommerce-reels",
    title: "Forge Apparel — Short-Form Video",
    category: "video-content",
    serviceTags: ["video-editing", "content-creation"],
    challenge:
      "An e-commerce brand's product videos weren't holding attention or driving sales.",
    delivered:
      "A retention-first editing system for reels with pacing, captions, and motion.",
    result: "3.1× average watch-time across the series.",
    media: [
      {
        type: "video",
        src: "/portfolio/forge-reel.mp4",
        alt: "Forge Apparel short-form video",
        poster: "/portfolio/forge-1.jpg",
        width: 1080,
        height: 1350,
      },
    ],
    thumbnail: {
      src: "/portfolio/forge-1.jpg",
      alt: "Forge Apparel short-form video",
      width: 1200,
      height: 900,
    },
    featured: true,
    order: 2,
    client: "Forge Apparel",
  },
  {
    slug: "meridian-saas-launch",
    title: "Meridian — Product Launch Film",
    category: "video-content",
    serviceTags: ["video-editing", "graphic-design"],
    challenge:
      "A software team needed a launch film that explained value without losing viewers.",
    delivered:
      "A tightly cut brand film with motion graphics that carried the story to the CTA.",
    media: [
      {
        type: "video",
        src: "/portfolio/meridian-film.mp4",
        alt: "Meridian product launch film",
        poster: "/portfolio/meridian-1.jpg",
        width: 1920,
        height: 1080,
      },
    ],
    thumbnail: {
      src: "/portfolio/meridian-1.jpg",
      alt: "Meridian product launch film",
      width: 1200,
      height: 900,
    },
    featured: false,
    order: 3,
    client: "Meridian",
  },
]);

export const featuredPortfolio = portfolio.filter((p) => p.featured);
