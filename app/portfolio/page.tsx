import type { Metadata } from "next";
import { portfolio } from "@/content/portfolio";
import { WorkCard } from "@/components/shared/work-card";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description:
    "Selected work by Muhammad Umaid Sadiq — brand, web, social, and video projects framed by the outcomes they produced.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  const items = [...portfolio].sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader
        eyebrow="Selected work"
        title="Work that earns trust before the first call."
        intro="Every project below is framed by the problem it solved and the result it produced — because that's what actually matters to your business."
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
