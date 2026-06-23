import type { Metadata } from "next";
import { portfolio } from "@/content/portfolio";
import { WorkCard } from "@/components/shared/work-card";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Video Content",
  description:
    "Short-form video, brand films, and motion content by Muhammad Umaid Sadiq, cut for retention.",
  path: "/portfolio/video-content",
});

export default function VideoContentPage() {
  const items = portfolio
    .filter((p) => p.category === "video-content")
    .sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader
        eyebrow="Video content"
        title="Video cut to hold attention to the last frame."
        intro="Short-form and brand films engineered for watch-time, shares, and action — not just views."
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
