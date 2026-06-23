import { Hero } from "@/components/sections/hero";
import { PersonalStatement } from "@/components/sections/personal-statement";
import { ServicesStack } from "@/components/sections/services-stack";
import { ResultsStats } from "@/components/sections/results-stats";
import { PortfolioPreview } from "@/components/sections/portfolio-preview";
import { FinalCta } from "@/components/sections/final-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PersonalStatement />
      <ServicesStack />
      <ResultsStats />
      <PortfolioPreview />
      <FinalCta />
    </>
  );
}
