import type { Metadata } from "next";
import { portfolioCategories } from "@/content/portfolio-categories";
import { CategoryCard } from "@/components/portfolio/category-card";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

const PATH = "/portfolio";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description:
    "Selected work by Muhammad Umaid Sadiq — social media creatives and video content, organised by client.",
  path: PATH,
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Work", path: PATH },
];

/**
 * The hub of the work flow.
 *
 * Navbar "Work" lands here and shows exactly two choices; each opens that
 * section's brand cards, which the CMS drives. Previously this page listed
 * individual placeholder projects, which duplicated the section pages and
 * skipped the category step entirely.
 */
export default function PortfolioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <PageHeader
        eyebrow="Selected work"
        title="Work that earns trust before the first call."
        intro="Two bodies of work — creative for social, and video built to hold attention. Pick one to see it client by client."
        breadcrumb={
          <Breadcrumb items={crumbs.map((c) => ({ name: c.name, href: c.path }))} />
        }
      />
      <section className="bg-mist">
        <div className="shell shell-wide py-20 md:py-28">
          <div className="grid gap-6 overflow-x-clip md:grid-cols-2">
            {portfolioCategories.map((category, i) => (
              <CategoryCard
                key={category.href}
                category={category}
                priority={i === 0}
              />
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
