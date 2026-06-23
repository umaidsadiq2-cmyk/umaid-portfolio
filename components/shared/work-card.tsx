import Link from "next/link";
import type { PortfolioItem } from "@/lib/schemas";
import { services } from "@/content/services";
import { Reveal } from "@/components/shared/reveal";

const serviceName = (slug: string) =>
  services.find((s) => s.slug === slug)?.name ?? slug;

const categoryHref = (item: PortfolioItem) =>
  `/portfolio/${item.category === "video-content" ? "video-content" : "creative-designs"}`;

/** Reusable outcome-framed work card (used on home + portfolio routes). */
export function WorkCard({ item, delay = 0 }: { item: PortfolioItem; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={categoryHref(item)}
        className="group block h-full overflow-hidden rounded-lg border border-line bg-canvas"
      >
        <div className="measure-grid relative flex aspect-[16/10] items-end overflow-hidden border-b border-line bg-fog p-6">
          <span className="font-display text-4xl font-semibold text-ink/10 transition-transform duration-500 ease-out group-hover:-translate-y-1">
            {item.client ?? item.title}
          </span>
          <span className="absolute right-5 top-5 rounded-xs bg-emerald-tint px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-emerald">
            {item.category === "video-content" ? "Video" : "Design"}
          </span>
        </div>
        <div className="p-7">
          <h3 className="font-display text-xl font-semibold tracking-tight">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            <span className="text-muted">Delivered — </span>
            {item.delivered}
          </p>
          {item.result && (
            <p className="mt-4 font-mono text-sm text-emerald">{item.result}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {item.serviceTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-xs border border-line px-2.5 py-1 text-[0.7rem] text-muted"
              >
                {serviceName(tag)}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
