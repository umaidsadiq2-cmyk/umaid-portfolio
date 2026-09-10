import { SECTIONS } from "@/lib/cms/types";

/**
 * The two top-level portfolio categories.
 *
 * This is the entry point to the whole work flow:
 *   Navbar "Work" → /portfolio → one of these two → that section's brand cards
 *
 * `href` comes from the CMS section config rather than a hardcoded string, so
 * the public route and the admin's "view live page" link can never disagree.
 *
 * Shared by the homepage preview and the /portfolio page so the two always show
 * the same names and copy.
 */
export type PortfolioCategory = {
  title: string;
  blurb: string;
  href: string;
  /** Extensionless — Photo resolves .webp → .jpg → .png. */
  img: string;
  label: string;
};

export const portfolioCategories: PortfolioCategory[] = [
  {
    title: SECTIONS.social.label,
    blurb:
      "Social media posters, product campaigns, and AI product photoshoots for food, health, fragrance, and automotive brands.",
    href: SECTIONS.social.basePath,
    img: "/images/portfolio-creative",
    label: "Creative",
  },
  {
    title: SECTIONS.video.label,
    blurb:
      "AI video ads, short-form video ads, and logo animations cut for retention, shares, and action.",
    href: SECTIONS.video.basePath,
    img: "/images/portfolio-video",
    label: "Video",
  },
];
