import { CompanyLogoCard } from "./company-logo-card";
import type { Brand } from "@/lib/cms/types";

/**
 * Landing grid of brand cards, shared by both portfolio sections.
 *
 * The empty state matters more than it looks: a section with no brands yet
 * (Video, on day one) must not render a bare white band that reads as a broken
 * page.
 */
export function BrandGrid({
  brands,
  basePath,
  itemNoun,
  emptyMessage,
}: {
  brands: Brand[];
  basePath: string;
  itemNoun: string;
  emptyMessage: string;
}) {
  if (brands.length === 0) {
    return (
      <p className="mx-auto max-w-md rounded-xl border border-dashed border-line-strong px-6 py-16 text-center text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {brands.map((brand, i) => (
        <CompanyLogoCard
          key={brand.id}
          brand={brand}
          index={i}
          basePath={basePath}
          itemNoun={itemNoun}
        />
      ))}
    </div>
  );
}
