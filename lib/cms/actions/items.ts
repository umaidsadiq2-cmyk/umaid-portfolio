"use server";

import { z } from "zod";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { groupStorageUrls } from "../storage";
import type { Section } from "../types";
import { parseVideoUrl } from "../video-url";
import { describeDbError, purge } from "./shared";
import { failure, success, type ActionState } from "./state";

/**
 * Item mutations — posters/carousels for Social brands, videos for Video brands.
 *
 * Both kinds share one `items` table, so pin and reorder are implemented once.
 * What differs is the payload: a social item carries slides (rows in
 * item_slides), a video item carries a provider + URL.
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Resolve the brand a mutation belongs to, so we know what to purge. */
async function brandOf(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  brandId: string,
) {
  const { data, error } = await supabase
    .from("brands")
    .select("id, section, slug")
    .eq("id", brandId)
    .maybeSingle();
  if (error) throw new Error(describeDbError(error));
  return data as { id: string; section: Section; slug: string } | null;
}

async function nextPosition(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  brandId: string,
) {
  const { data } = await supabase
    .from("items")
    .select("position")
    .eq("brand_id", brandId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.position ?? -1) + 1;
}

const slideSchema = z.object({
  url: z.string().url(),
  width: z.coerce.number().int().positive().max(20000).default(1080),
  height: z.coerce.number().int().positive().max(20000).default(1350),
  alt: z.string().trim().max(300).optional(),
});

/**
 * Slides arrive as a JSON array from the uploader, which has already pushed each
 * file to Storage and measured its intrinsic dimensions. Storing real width and
 * height is what lets the public grid reserve space and avoid layout shift.
 */
const socialItemSchema = z.object({
  title: z.string().trim().max(160).optional(),
  alt: z.string().trim().max(300).optional(),
  slides: z
    .string()
    .transform((raw, ctx) => {
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Could not read the uploaded images." });
        return z.NEVER;
      }
    })
    .pipe(z.array(slideSchema).min(1, "Add at least one image.").max(20)),
  published: z.coerce.boolean().default(true),
});

const videoItemSchema = z.object({
  title: z.string().trim().max(160).optional(),
  videoUrl: z.string().trim().min(1, "Paste a YouTube or Vimeo link, or upload a file."),
  thumbUrl: z.string().trim().url().optional().or(z.literal("")),
  published: z.coerce.boolean().default(true),
});

function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Social items (posters / carousels)
// ---------------------------------------------------------------------------

export async function saveSocialItem(
  brandId: string,
  itemId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = socialItemSchema.safeParse({
    title: formData.get("title") ?? undefined,
    alt: formData.get("alt") ?? undefined,
    slides: formData.get("slides") ?? "[]",
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });

  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", fieldErrorsOf(parsed.error));
  }
  const input = parsed.data;

  const supabase = await createSupabaseServerClient();
  const brand = await brandOf(supabase, brandId);
  if (!brand) return failure("That brand no longer exists.");

  // A single image is a post; several make a carousel. Derived from the actual
  // slide count so the two can never disagree.
  const kind = input.slides.length > 1 ? "carousel" : "image_post";

  let id = itemId;

  if (id) {
    const { error } = await supabase
      .from("items")
      .update({
        kind,
        title: input.title || null,
        alt: input.alt || null,
        published: input.published,
      })
      .eq("id", id);
    if (error) return failure(describeDbError(error));

    // Replace-in-full rather than diff: slide sets are small, and a partial diff
    // risks leaving stale rows that render as duplicate slides.
    const { data: old } = await supabase
      .from("item_slides")
      .select("image_url")
      .eq("item_id", id);

    const kept = new Set(input.slides.map((s) => s.url));
    const removed = (old ?? [])
      .map((s) => s.image_url)
      .filter((url) => !kept.has(url));

    const { error: clearError } = await supabase
      .from("item_slides")
      .delete()
      .eq("item_id", id);
    if (clearError) return failure(describeDbError(clearError));

    await removeStorageObjects(supabase, removed);
  } else {
    const { data, error } = await supabase
      .from("items")
      .insert({
        brand_id: brandId,
        kind,
        title: input.title || null,
        alt: input.alt || null,
        published: input.published,
        position: await nextPosition(supabase, brandId),
      })
      .select("id")
      .single();
    if (error) return failure(describeDbError(error));
    id = data.id;
  }

  const { error: slidesError } = await supabase.from("item_slides").insert(
    input.slides.map((slide, index) => ({
      item_id: id,
      image_url: slide.url,
      width: slide.width,
      height: slide.height,
      alt: slide.alt || null,
      position: index,
    })),
  );
  if (slidesError) return failure(describeDbError(slidesError));

  purge(brand.section, brand.slug);
  return success();
}

// ---------------------------------------------------------------------------
// Video items
// ---------------------------------------------------------------------------

export async function saveVideoItem(
  brandId: string,
  itemId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = videoItemSchema.safeParse({
    title: formData.get("title") ?? undefined,
    videoUrl: formData.get("videoUrl") ?? "",
    thumbUrl: formData.get("thumbUrl") ?? "",
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });

  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", fieldErrorsOf(parsed.error));
  }
  const input = parsed.data;

  // Reject unparseable links here rather than saving a row that renders as an
  // empty frame on the live site.
  const video = parseVideoUrl(input.videoUrl);
  if (!video) {
    return failure("That link isn't recognised.", {
      videoUrl:
        "Paste a YouTube or Vimeo link (or an uploaded .mp4/.webm file URL).",
    });
  }

  const supabase = await createSupabaseServerClient();
  const brand = await brandOf(supabase, brandId);
  if (!brand) return failure("That brand no longer exists.");

  const payload = {
    kind: "video" as const,
    title: input.title || null,
    provider: video.provider,
    video_url: input.videoUrl,
    // An explicitly uploaded thumbnail wins; otherwise fall back to the
    // provider's own (YouTube gives us one, Vimeo does not).
    thumb_url: input.thumbUrl || video.thumbUrl,
    published: input.published,
  };

  if (itemId) {
    const { error } = await supabase.from("items").update(payload).eq("id", itemId);
    if (error) return failure(describeDbError(error));
  } else {
    const { error } = await supabase.from("items").insert({
      ...payload,
      brand_id: brandId,
      position: await nextPosition(supabase, brandId),
    });
    if (error) return failure(describeDbError(error));
  }

  purge(brand.section, brand.slug);
  return success();
}

// ---------------------------------------------------------------------------
// Delete / pin / reorder
// ---------------------------------------------------------------------------

export async function deleteItem(itemId: string): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: item, error: findError } = await supabase
    .from("items")
    .select(
      "id, brand_id, thumb_url, video_url, item_slides ( image_url ), brands ( section, slug )",
    )
    .eq("id", itemId)
    .maybeSingle();

  if (findError) return failure(describeDbError(findError));
  if (!item) return failure("That item no longer exists.");

  const row = item as unknown as {
    thumb_url: string | null;
    video_url: string | null;
    item_slides: { image_url: string }[] | null;
    brands: { section: Section; slug: string } | null;
  };

  const urls = [
    row.thumb_url,
    row.video_url,
    ...(row.item_slides ?? []).map((s) => s.image_url),
  ];

  const { error } = await supabase.from("items").delete().eq("id", itemId);
  if (error) return failure(describeDbError(error));

  await removeStorageObjects(supabase, urls);

  if (row.brands) purge(row.brands.section, row.brands.slug);
  return success();
}

export async function toggleItemPin(itemId: string): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: item, error: findError } = await supabase
    .from("items")
    .select("id, pinned, brands ( section, slug )")
    .eq("id", itemId)
    .maybeSingle();

  if (findError) return failure(describeDbError(findError));
  if (!item) return failure("That item no longer exists.");

  const row = item as unknown as {
    pinned: boolean;
    brands: { section: Section; slug: string } | null;
  };

  const { error } = await supabase
    .from("items")
    .update({ pinned: !row.pinned })
    .eq("id", itemId);
  if (error) return failure(describeDbError(error));

  if (row.brands) purge(row.brands.section, row.brands.slug);
  return success();
}

export async function reorderItems(
  brandId: string,
  orderedIds: string[],
): Promise<ActionState> {
  await requireAdmin();
  if (orderedIds.length === 0) return success();

  const supabase = await createSupabaseServerClient();
  const brand = await brandOf(supabase, brandId);
  if (!brand) return failure("That brand no longer exists.");

  const { error } = await supabase.rpc("reorder_items", {
    p_brand_id: brandId,
    p_ids: orderedIds,
  });
  if (error) return failure(describeDbError(error));

  purge(brand.section, brand.slug);
  return success();
}

async function removeStorageObjects(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  urls: (string | null | undefined)[],
) {
  for (const [bucket, paths] of groupStorageUrls(urls)) {
    if (paths.length === 0) continue;
    try {
      await supabase.storage.from(bucket).remove(paths);
    } catch {
      // Orphaned files are housekeeping, never a user-facing failure.
    }
  }
}
