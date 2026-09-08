"use client";

import { useRef, useState } from "react";
import { useUploader, type UploadKind } from "@/lib/cms/use-upload";
import type { Section } from "@/lib/cms/types";

/**
 * Single-image field: pick a file, it uploads straight to Storage, and the
 * resulting public URL is held in a hidden input for the Server Action.
 *
 * Uploading on selection rather than on submit is deliberate — a 5MB poster
 * would blow the ~4.5MB Server Action body limit, and it lets the admin see the
 * real image before committing the row.
 */
export function ImageField({
  name,
  label,
  hint,
  kind,
  section,
  brandSlug,
  initialUrl,
  aspect = "square",
}: {
  name: string;
  label: string;
  hint?: string;
  kind: UploadKind;
  section: Section;
  brandSlug: string;
  initialUrl?: string | null;
  aspect?: "square" | "wide";
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const { upload, busy, error, setError } = useUploader();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    const result = await upload(file, { section, brandSlug: brandSlug || "unfiled", kind });
    if (result) setUrl(result.url);
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-start gap-3">
        <div
          className={`relative shrink-0 overflow-hidden rounded-sm border border-line bg-fog ${
            aspect === "wide" ? "h-16 w-28" : "h-16 w-16"
          }`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className={`h-full w-full ${kind === "logo" ? "object-contain p-1.5" : "object-cover"}`}
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-[11px] text-muted">
              None
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/webp,image/png,image/jpeg,image/avif,image/svg+xml"
            disabled={busy}
            onChange={(e) => {
              setError(null);
              void onPick(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="block w-full text-sm text-muted file:mr-3 file:h-9 file:cursor-pointer file:rounded-sm file:border file:border-line-strong file:bg-canvas file:px-3 file:text-sm file:font-medium file:text-ink hover:file:bg-fog disabled:opacity-50"
          />
          {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
          {busy && <p className="mt-1 text-xs text-emerald">Uploading…</p>}
          {error && (
            <p role="alert" className="mt-1 text-xs text-red-700">
              {error}
            </p>
          )}
          {url && !busy && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="mt-1 text-xs text-muted underline underline-offset-2 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
