"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { saveSocialItem, saveVideoItem } from "@/lib/cms/actions/items";
import { IDLE, type ActionState } from "@/lib/cms/actions/state";
import type { AdminItem } from "@/lib/cms/admin-queries";
import { parseVideoUrl } from "@/lib/cms/video-url";
import { ImageField } from "./image-field";
import { SlidesField } from "./slides-field";

const field =
  "h-10 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm " +
  "focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/20";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-sm bg-emerald px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-deep disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function Shell({
  title,
  onCancel,
  children,
  error,
  saveLabel,
}: {
  title: string;
  onCancel: () => void;
  children: React.ReactNode;
  error: string | null;
  saveLabel: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-canvas p-5">
      <h3 className="mb-4 font-display text-base font-semibold tracking-tight">{title}</h3>
      {children}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <div className="mt-5 flex items-center gap-3">
        <SaveButton label={saveLabel} />
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-sm border border-line-strong px-4 text-sm font-medium transition-colors hover:bg-fog"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Social: poster / carousel
// ---------------------------------------------------------------------------

export function SocialItemForm({
  brandId,
  brandSlug,
  item,
  onDone,
}: {
  brandId: string;
  brandSlug: string;
  item?: AdminItem;
  onDone: () => void;
}) {
  const router = useRouter();
  const action = saveSocialItem.bind(null, brandId, item?.id ?? null);
  const [state, formAction] = useActionState<ActionState, FormData>(action, IDLE);

  useEffect(() => {
    if (state.ok) {
      onDone();
      router.refresh();
    }
  }, [state.ok, onDone, router]);

  return (
    <form action={formAction}>
      <Shell
        title={item ? "Edit post" : "Add post or carousel"}
        onCancel={onDone}
        error={state.error}
        saveLabel={item ? "Save post" : "Add post"}
      >
        <div className="space-y-5">
          <SlidesField
            section="social"
            brandSlug={brandSlug}
            initial={item?.slides.map((s) => ({
              url: s.url,
              width: s.width,
              height: s.height,
            }))}
          />
          {state.fieldErrors?.slides && (
            <p className="text-xs text-red-700">{state.fieldErrors.slides}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                Title <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="title"
                name="title"
                defaultValue={item?.title ?? ""}
                className={field}
                placeholder="Ramadan campaign"
              />
            </div>
            <div>
              <label htmlFor="alt" className="mb-1.5 block text-sm font-medium">
                Alt text <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="alt"
                name="alt"
                defaultValue={item?.alt ?? ""}
                className={field}
                placeholder="Describes the image for screen readers"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              defaultChecked={item?.published ?? true}
              className="h-4 w-4 accent-[#0b6e4f]"
            />
            <span className="text-sm">Published</span>
          </label>
        </div>
      </Shell>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

export function VideoItemForm({
  brandId,
  brandSlug,
  item,
  onDone,
}: {
  brandId: string;
  brandSlug: string;
  item?: AdminItem;
  onDone: () => void;
}) {
  const router = useRouter();
  const action = saveVideoItem.bind(null, brandId, item?.id ?? null);
  const [state, formAction] = useActionState<ActionState, FormData>(action, IDLE);
  const [url, setUrl] = useState(item?.videoUrl ?? "");

  // Live feedback: paste a link and immediately see whether it was understood,
  // rather than discovering on save that it produced an empty player.
  const parsed = url.trim() ? parseVideoUrl(url) : null;

  useEffect(() => {
    if (state.ok) {
      onDone();
      router.refresh();
    }
  }, [state.ok, onDone, router]);

  return (
    <form action={formAction}>
      <Shell
        title={item ? "Edit video" : "Add video"}
        onCancel={onDone}
        error={state.error}
        saveLabel={item ? "Save video" : "Add video"}
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="videoUrl" className="mb-1.5 block text-sm font-medium">
              Video link
            </label>
            <input
              id="videoUrl"
              name="videoUrl"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={field}
              placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
            />
            {url.trim() && (
              <p
                className={`mt-1 text-xs ${parsed ? "text-emerald" : "text-red-700"}`}
              >
                {parsed
                  ? `Recognised as ${parsed.provider}${
                      parsed.videoId ? ` · ${parsed.videoId}` : ""
                    }`
                  : "Not recognised — paste a YouTube or Vimeo link."}
              </p>
            )}
            {state.fieldErrors?.videoUrl && (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.videoUrl}</p>
            )}
            <p className="mt-1 text-xs text-muted">
              YouTube and Vimeo are embedded and cost nothing to host. To upload an
              MP4 instead, use the thumbnail field&apos;s bucket — see below.
            </p>
          </div>

          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Title <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="title"
              name="title"
              defaultValue={item?.title ?? ""}
              className={field}
              placeholder="Brand film — 60s cut"
            />
          </div>

          <ImageField
            name="thumbUrl"
            label="Custom thumbnail"
            kind="thumb"
            section="video"
            brandSlug={brandSlug}
            initialUrl={item?.thumbUrl}
            aspect="wide"
            hint={
              parsed?.provider === "vimeo"
                ? "Recommended — Vimeo doesn't expose a thumbnail, so without one this shows a gradient."
                : "Optional. YouTube's own poster frame is used when this is empty."
            }
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              defaultChecked={item?.published ?? true}
              className="h-4 w-4 accent-[#0b6e4f]"
            />
            <span className="text-sm">Published</span>
          </label>
        </div>
      </Shell>
    </form>
  );
}
