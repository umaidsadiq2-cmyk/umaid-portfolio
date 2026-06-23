import type { Metadata } from "next";
import { portfolio } from "@/content/portfolio";
import { WorkCard } from "@/components/shared/work-card";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Creative Designs",
  description:
    "Brand identities, graphic design, and web design work by Muhammad Umaid Sadiq.",
  path: "/portfolio/creative-designs",
});

export default function CreativeDesignsPage() {
  const items = portfolio
    .filter((p) => p.category === "creative-design")
    .sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader
        eyebrow="Creative designs"
        title="Identity, brand, and design that looks established."
        intro="Visual work built to make a business feel like the most trusted name in its category."
      />
      <section className="bg-mist">
        <div className="shell shell-wide py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item, i) => (
              <WorkCard key={item.slug} item={item} delay={(i % 2) * 80} />
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
