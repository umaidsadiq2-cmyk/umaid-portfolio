"use client";

import { useState } from "react";
import { useUploader } from "@/lib/cms/use-upload";
import type { Section } from "@/lib/cms/types";
import { moveWithin } from "./reorder";

export type Slide = { url: string; width: number; height: number };

/**
 * Ordered image set for one post.
 *
 * One image is a single creative; several make a carousel — the distinction is
 * derived from the count on save, so there is no "is this a carousel?" toggle to
 * get out of sync with reality. Order matters: slide 1 becomes the grid
 * thumbnail, so it gets a visible "Cover" badge.
 *
 * Serialised to a hidden JSON input because the files are already in Storage by
 * submit time; only URLs and dimensions need to reach the Server Action.
 */
export function SlidesField({
  section,
  brandSlug,
  initial = [],
}: {
  section: Section;
  brandSlug: string;
  initial?: Slide[];
}) {
  const [slides, setSlides] = useState<Slide[]>(initial);
  const { uploadMany, busy, error, setError } = useUploader();

  const onPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const uploaded = await uploadMany(Array.from(files), {
      section,
      brandSlug: brandSlug || "unfiled",
      kind: "slide",
    });
    if (uploaded.length > 0) setSlides((prev) => [...prev, ...uploaded]);
  };

  const move = (index: number, delta: number) =>
    setSlides((prev) => moveWithin(prev, index, index + delta));

  const remove = (index: number) =>
    setSlides((prev) => prev.filter((_, i) => i !== index));

  return (
    <div>
      <input type="hidden" name="slides" value={JSON.stringify(slides)} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium">
          Images{" "}
          <span className="font-normal text-muted">
            {slides.length === 0
              ? ""
              : slides.length === 1
                ? "· single post"
                : `· carousel of ${slides.length}`}
          </span>
        </span>
        <label className="inline-flex h-9 cursor-pointer items-center rounded-sm border border-line-strong bg-canvas px-3 text-sm font-medium transition-colors hover:bg-fog">
          {busy ? "Uploading…" : slides.length ? "Add more" : "Choose images"}
          <input
            type="file"
            multiple
            accept="image/webp,image/png,image/jpeg,image/avif"
            disabled={busy}
            className="sr-only"
            onChange={(e) => {
              void onPick(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-xs text-red-700">
          {error}
        </p>
      )}

      {slides.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line-strong px-4 py-8 text-center text-sm text-muted">
          No images yet. Select one for a single post, or several for a carousel.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {slides.map((slide, index) => (
            <li
              key={`${slide.url}-${index}`}
              className="group relative overflow-hidden rounded-sm border border-line bg-fog"
            >
              <div className="aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/70 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <span className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move image earlier"
                    className="grid h-6 w-6 place-items-center rounded-xs text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === slides.length - 1}
                    aria-label="Move image later"
                    className="grid h-6 w-6 place-items-center rounded-xs text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    →
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove image"
                  className="grid h-6 w-6 place-items-center rounded-xs text-white hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
