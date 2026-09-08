import Link from "next/link";
import { monogram } from "@/lib/utils";
import type { Brand } from "@/lib/cms/types";

/**
 * Premium client card for a section's landing grid — an agency "case-study"
 * card. Layering (back → front):
 *   1. brand-accent gradient  (always — "the card's gradient")
 *   2. background image @ 50%  (when provided — gradient shows through it)
 *   3. legibility scrim
 *   4. logo badge (real logo image when provided, else CSS monogram), count pill,
 *      name + industry in white
 * Hover lifts the card and slowly zooms the background. `data-anim="card"`
 * drives the scroll reveal.
 *
 * Logo and background now come from the CMS as absolute Storage URLs (they were
 * previously detected on disk at build time), and `basePath` / `itemNoun` let
 * the same card serve both Social Creatives and Video Content.
 */
export function CompanyLogoCard({
  brand,
  index,
  basePath,
  itemNoun,
}: {
  brand: Brand;
  index: number;
  basePath: string;
  itemNoun: string;
}) {
  return (
    <div data-anim="card" data-anim-delay={(index % 3) * 80}>
      <Link
        href={`${basePath}/${brand.slug}`}
        className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-line shadow-[0_18px_44px_-30px_rgba(11,16,14,0.5)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_40px_84px_-40px_rgba(11,16,14,0.55)]"
      >
        {/* 1 — brand gradient base */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: brand.accent }}
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/45"
        />

        {/* 2 — background image at 50% (gradient stays visible through it) */}
        {brand.bgUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.bgUrl}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        )}

        {/* 3 — legibility scrim */}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent"
        />

        {/* 4 — content */}
        <div className="relative flex h-full flex-col justify-between p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md transition-transform duration-500 ease-out group-hover:scale-105">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span
                  className="font-display text-xl font-semibold tracking-tight"
                  style={{ color: brand.accent }}
                >
                  {monogram(brand.name)}
                </span>
              )}
            </span>
            {brand.itemCount > 0 && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {brand.itemCount} {itemNoun}
              </span>
            )}
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-white">
              {brand.name}
            </h3>
            <p className="mt-1 text-sm text-white/75">{brand.industry}</p>
            <span
              aria-hidden
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              View work →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
