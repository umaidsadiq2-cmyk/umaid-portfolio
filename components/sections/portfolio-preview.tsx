import Link from "next/link";
import { portfolioCategories } from "@/content/portfolio-categories";
import { CategoryCard } from "@/components/portfolio/category-card";
import { Reveal } from "@/components/shared/reveal";
import { Ambient } from "@/components/motion/ambient";

export function PortfolioPreview() {
  return (
    <section id="work" className="relative isolate scroll-mt-24 bg-mist">
      <Ambient variant="portfolio" />
      <div className="shell shell-wide py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow">Selected work</p>
            </Reveal>
            <Reveal delay={60} rise>
              <h2 className="display-lg mt-6">A look at the work.</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 text-sm font-medium text-emerald"
            >
              View all work
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 overflow-x-clip md:grid-cols-2">
          {portfolioCategories.map((category) => (
            <CategoryCard key={category.href} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
