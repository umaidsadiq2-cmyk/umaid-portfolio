import { CinemaHero } from "@/components/sections/cinema-hero";
import { MyServices } from "@/components/sections/my-services";
import { PortfolioPreview } from "@/components/sections/portfolio-preview";
import { FinalCta } from "@/components/sections/final-cta";

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
