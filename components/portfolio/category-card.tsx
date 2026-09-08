import Link from "next/link";
import { Photo } from "@/components/shared/photo";
import type { PortfolioCategory } from "@/content/portfolio-categories";

/**
 * One of the two top-level portfolio cards (Social Media Creatives / Video
 * Content). Extracted from the homepage preview so /portfolio renders the exact
 * same card — same image, copy, and hover behaviour — instead of a lookalike
 * that slowly drifts.
 */
export function CategoryCard({
  category,
  priority = false,
}: {
  category: PortfolioCategory;
  priority?: boolean;
}) {
  return (
    <div data-anim="card">
      <Link
        href={category.href}
        className="group block h-full overflow-hidden rounded-lg border border-line bg-canvas transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-line-strong hover:shadow-[0_36px_80px_-40px_rgba(11,16,14,0.4)]"
      >
        <div className="overflow-hidden">
          <Photo
            src={category.img}
            alt={`${category.title} — portfolio by Muhammad Umaid Sadiq`}
            label={category.label}
            width={1200}
            height={800}
            priority={priority}
            imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
          />
        </div>
        <div className="flex items-center justify-between gap-4 p-7">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-tight">
              {category.title}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              {category.blurb}
            </p>
          </div>
          <span
            aria-hidden
            className="text-emerald transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </Link>
    </div>
  );
}
