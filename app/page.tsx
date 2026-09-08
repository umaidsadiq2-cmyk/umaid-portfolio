import type { Metadata } from "next";
import { CinemaHero } from "@/components/sections/cinema-hero";
import { MyServices } from "@/components/sections/my-services";
import { PortfolioPreview } from "@/components/sections/portfolio-preview";
import { FinalCta } from "@/components/sections/final-cta";
import { buildMetadata } from "@/lib/seo";

/**
 * Homepage title/description, explicit rather than inherited from the root
 * layout default: the root default is written to read well as a raw
 * `<title>` (no pipe, no keyword list) since it's also the fallback for pages
 * that forget to set their own, while the homepage — the one page most likely
 * to rank for the brand + role query and get shared directly — earns a
 * dedicated, keyword-led title matching how people actually search.
 *
 * The title is a complete, already-branded SEO title (same pattern the
 * service pages use), so it's applied straight over buildMetadata's default
 * rather than through its `title` param — that param appends " — Umaid
 * Sadiq", which would push this one past a sensible length.
 */
const base = buildMetadata({
  description:
    "Muhammad Umaid Sadiq — digital marketing expert offering social media marketing, Meta ads, graphic design, video editing, AI ads, and AI powered web development for businesses in Pakistan, UAE, Saudi Arabia, the UK, USA, and Canada.",
  path: "/",
});

export const metadata: Metadata = {
  ...base,
  title: "Digital Marketing Expert | Umaid Sadiq — Social Media & Meta Ads",
  openGraph: { ...base.openGraph, title: "Digital Marketing Expert | Umaid Sadiq" },
  twitter: { ...base.twitter, title: "Digital Marketing Expert | Umaid Sadiq" },
};

/**
 * Home page.
 *
 * 1–2  CinemaHero      Hero + "What I Do" over one continuous, held video scene
 * 3    MyServices      the six offerings as a scroll-driven horizontal carousel
 * 4    PortfolioPreview  "Selected work" (unchanged) — the nav's "Work" target
 * 5    FinalCta        "Let's work together" (unchanged)
 */
export default function HomePage() {
  return (
    <>
      <CinemaHero />
      <MyServices />
      <PortfolioPreview />
      <FinalCta />
    </>
  );
}
