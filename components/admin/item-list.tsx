"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { deleteItem, reorderItems, toggleItemPin } from "@/lib/cms/actions/items";
import type { AdminItem } from "@/lib/cms/admin-queries";
import { SECTIONS, type Section } from "@/lib/cms/types";
import { SocialItemForm, VideoItemForm } from "./item-forms";
import { ConfirmDelete, moveInGroup, ReorderControls } from "./reorder";

/**
 * Items inside one brand — posters/carousels for Social, videos for Video.
 *
 * Same pin + reorder machinery as the brand list, because they are the same
 * concept one level down. Editing happens inline rather than on a separate
 * route: galleries are long, and bouncing to another page loses the admin's
 * scroll position every time they tweak a caption.
 */
export function ItemList({
  section,
  brandId,
  brandSlug,
  items,
}: {
  section: Section;
  brandId: string;
  brandSlug: string;
  items: AdminItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useOptimistic(items, (_prev, next: AdminItem[]) => next);

  const isVideo = section === "video";
  const noun = SECTIONS[section].adminNoun.toLowerCase();

  const applyOrder = (next: AdminItem[]) => {
    startTransition(async () => {
      setRows(next);
      const result = await reorderItems(brandId, next.map((i) => i.id));
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  const onPin = (item: AdminItem) => {
    startTransition(async () => {
      const next = rows.map((i) => (i.id === item.id ? { ...i, pinned: !i.pinned } : i));
      setRows([...next.filter((i) => i.pinned), ...next.filter((i) => !i.pinned)]);
      const result = await toggleItemPin(item.id);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  const onDelete = (item: AdminItem) => {
    startTransition(async () => {
      setRows(rows.filter((i) => i.id !== item.id));
      const result = await deleteItem(item.id);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  const Form = isVideo ? VideoItemForm : SocialItemForm;
  const pinned = rows.filter((i) => i.pinned);
  const unpinned = rows.filter((i) => !i.pinned);

  const renderRow = (item: AdminItem, index: number, groupSize: number) => {
    if (editing === item.id) {
      return (
        <li key={item.id} className="border-b border-line p-4 last:border-b-0">
          <Form
            brandId={brandId}
            brandSlug={brandSlug}
            item={item}
            onDone={() => setEditing(null)}
          />
        </li>
      );
    }

    return (
      <li
        key={item.id}
        className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line px-4 py-3 last:border-b-0"
      >
        <ItemThumb item={item} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium">
              {item.title || describe(item)}
            </span>
            {!item.published && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                Draft
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted">{subtitle(item)}</p>
        </div>

        <button
          type="button"
          onClick={() => onPin(item)}
          disabled={pending}
          aria-pressed={item.pinned}
          title={item.pinned ? "Unpin" : "Pin to top"}
          className={`h-7 rounded-sm px-2 text-xs font-medium transition-colors disabled:opacity-40 ${
            item.pinned
              ? "bg-emerald-tint text-emerald"
              : "text-muted hover:bg-fog hover:text-ink"
          }`}
        >
          {item.pinned ? "📌 Pinned" : "Pin"}
        </button>

        <ReorderControls
          position={index + 1}
          groupSize={groupSize}
          disabled={pending}
          onMove={(delta) => applyOrder(moveInGroup(rows, item.id, delta))}
          onJump={(toPosition) => applyOrder(moveInGroup(rows, item.id, { toPosition }))}
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(item.id)}
            className="h-7 rounded-sm px-2 text-xs font-medium text-ink-soft transition-colors hover:bg-fog"
          >
            Edit
          </button>
          <ConfirmDelete
            label={item.title || noun}
            disabled={pending}
            onConfirm={() => onDelete(item)}
          />
        </div>
      </li>
    );
  };

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {SECTIONS[section].adminNoun}{" "}
          <span className="text-sm font-normal text-muted">({rows.length})</span>
        </h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-9 rounded-sm bg-emerald px-3 text-sm font-medium text-white transition-colors hover:bg-emerald-deep"
          >
            {isVideo ? "Add video" : "Add post"}
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {adding && (
        <div className="mb-4">
          <Form brandId={brandId} brandSlug={brandSlug} onDone={() => setAdding(false)} />
        </div>
      )}

      {rows.length === 0 && !adding ? (
        <p className="rounded-lg border border-dashed border-line-strong px-4 py-10 text-center text-sm text-muted">
          Nothing here yet. Add your first {isVideo ? "video" : "post"} and it appears on
          the brand&apos;s page immediately.
        </p>
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Pinned
              </h3>
              <ul className="mb-5 overflow-hidden rounded-lg border border-line bg-canvas">
                {pinned.map((item, i) => renderRow(item, i, pinned.length))}
              </ul>
            </>
          )}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && (
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Everything else
                </h3>
              )}
              <ul className="overflow-hidden rounded-lg border border-line bg-canvas">
                {unpinned.map((item, i) => renderRow(item, i, unpinned.length))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

function describe(item: AdminItem): string {
  if (item.kind === "video") return "Untitled video";
  if (item.kind === "carousel") return `Carousel · ${item.slides.length} slides`;
  return "Single post";
}

function subtitle(item: AdminItem): string {
  if (item.kind === "video") {
    return `${item.provider ?? "unknown"} · ${item.videoUrl ?? ""}`;
  }
  const first = item.slides[0];
  return first ? `${item.slides.length} image${item.slides.length === 1 ? "" : "s"} · ${first.width}×${first.height}` : "No images";
}

function ItemThumb({ item }: { item: AdminItem }) {
  const src = item.kind === "video" ? item.thumbUrl : (item.slides[0]?.url ?? null);

  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-sm border border-line bg-fog">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[10px] text-muted">
          {item.kind === "video" ? "▶" : "—"}
        </span>
      )}
      {item.kind === "carousel" && (
        <span className="absolute right-0.5 top-0.5 rounded-xs bg-ink/70 px-1 text-[9px] font-medium text-white">
          {item.slides.length}
        </span>
      )}
    </span>
  );
}
