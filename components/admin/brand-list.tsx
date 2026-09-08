"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { deleteBrand, reorderBrands, toggleBrandPin } from "@/lib/cms/actions/brands";
import type { AdminBrand } from "@/lib/cms/admin-queries";
import { SECTIONS, type Section } from "@/lib/cms/types";
import { ConfirmDelete, moveInGroup, ReorderControls } from "./reorder";

/**
 * Brand rows for a section, pinned group first.
 *
 * Reordering is optimistic: the row moves the instant it's clicked, the server
 * confirms behind it, and `router.refresh()` reconciles. Without that, every
 * nudge would cost a round trip and reordering sixteen items would feel broken.
 */
export function BrandList({
  section,
  brands,
}: {
  section: Section;
  brands: AdminBrand[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useOptimistic(brands, (_prev, next: AdminBrand[]) => next);

  const pinned = rows.filter((b) => b.pinned);
  const unpinned = rows.filter((b) => !b.pinned);

  const applyOrder = (next: AdminBrand[]) => {
    startTransition(async () => {
      setRows(next);
      const result = await reorderBrands(section, next.map((b) => b.id));
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  const onPin = (brand: AdminBrand) => {
    startTransition(async () => {
      // Pinning moves the row between groups; show it at the top of its new
      // group immediately rather than letting it sit in place until refresh.
      const next = rows.map((b) => (b.id === brand.id ? { ...b, pinned: !b.pinned } : b));
      setRows([...next.filter((b) => b.pinned), ...next.filter((b) => !b.pinned)]);
      const result = await toggleBrandPin(brand.id);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  const onDelete = (brand: AdminBrand) => {
    startTransition(async () => {
      setRows(rows.filter((b) => b.id !== brand.id));
      const result = await deleteBrand(brand.id);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-canvas p-10 text-center">
        <p className="font-display text-lg font-semibold tracking-tight">No brands yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Add your first brand and it will appear as a card on{" "}
          <span className="font-medium text-ink-soft">{SECTIONS[section].basePath}</span>.
        </p>
        <Link
          href={`/admin/${section}/new`}
          className="mt-6 inline-flex h-10 items-center rounded-sm bg-emerald px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-deep"
        >
          Add brand
        </Link>
      </div>
    );
  }

  const renderGroup = (group: AdminBrand[], label: string) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </h2>
        <ul className="overflow-hidden rounded-lg border border-line bg-canvas">
          {group.map((brand, index) => (
            <li
              key={brand.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <BrandThumb brand={brand} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/${section}/${brand.id}`}
                    className="truncate font-medium text-ink underline-offset-4 hover:underline"
                  >
                    {brand.name}
                  </Link>
                  {!brand.published && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                      Draft
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-muted">
                  {brand.industry || "No industry set"} · {brand.itemCount}{" "}
                  {SECTIONS[section].adminNoun.toLowerCase()} · /{brand.slug}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onPin(brand)}
                disabled={pending}
                aria-pressed={brand.pinned}
                title={brand.pinned ? "Unpin" : "Pin to top"}
                className={`h-7 rounded-sm px-2 text-xs font-medium transition-colors disabled:opacity-40 ${
                  brand.pinned
                    ? "bg-emerald-tint text-emerald"
                    : "text-muted hover:bg-fog hover:text-ink"
                }`}
              >
                {brand.pinned ? "📌 Pinned" : "Pin"}
              </button>

              <ReorderControls
                position={index + 1}
                groupSize={group.length}
                disabled={pending}
                onMove={(delta) => applyOrder(moveInGroup(rows, brand.id, delta))}
                onJump={(toPosition) =>
                  applyOrder(moveInGroup(rows, brand.id, { toPosition }))
                }
              />

              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/${section}/${brand.id}`}
                  className="h-7 rounded-sm px-2 text-xs font-medium leading-7 text-ink-soft transition-colors hover:bg-fog"
                >
                  Edit
                </Link>
                <ConfirmDelete
                  label={brand.name}
                  disabled={pending}
                  onConfirm={() => onDelete(brand)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {renderGroup(pinned, "Pinned")}
      {renderGroup(unpinned, pinned.length > 0 ? "All other brands" : "Brands")}
      <p className="text-xs text-muted">
        Pinned brands always show first on the site. Within each group, position 1
        appears leftmost.
      </p>
    </div>
  );
}

/** Logo if uploaded, else the accent monogram the public card falls back to. */
function BrandThumb({ brand }: { brand: AdminBrand }) {
  const initials = brand.name
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-sm border border-line"
      style={{ backgroundColor: brand.logoUrl ? "#fff" : brand.accent }}
    >
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logoUrl}
          alt=""
          className="h-full w-full object-contain p-1"
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-semibold text-white">{initials || "?"}</span>
      )}
    </span>
  );
}
