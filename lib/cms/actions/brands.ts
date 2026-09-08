"use server";

import { z } from "zod";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { groupStorageUrls } from "../storage";
import { isSection, type Section } from "../types";
import { describeDbError, purge, slugify } from "./shared";
import { failure, success, type ActionState } from "./state";

/**
 * Brand mutations.
 *
 * Every action re-verifies the admin session with `requireAdmin()`. Middleware
 * redirects browsers, but a Server Action can be POSTed directly without ever
 * passing through it, so the check has to live here too. RLS is the third layer
 * underneath both.
 */

const brandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required.").max(80),
  slug: z
    .string()
    .trim()
    .max(60)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and single hyphens only.",
    )
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().max(80).default(""),
  blurb: z.string().trim().max(400).default(""),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Accent must be a hex colour like #0B6E4F.")
    .default("#1F2937"),
  logoUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  bgUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  published: z.coerce.boolean().default(true),
});

function readBrandForm(formData: FormData) {
  return brandSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    industry: formData.get("industry") ?? "",
    blurb: formData.get("blurb") ?? "",
    accent: formData.get("accent") ?? "#1F2937",
    logoUrl: formData.get("logoUrl") ?? "",
    bgUrl: formData.get("bgUrl") ?? "",
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });
}

function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

const emptyToNull = (v: string | null | undefined) => (v && v.length > 0 ? v : null);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createBrand(
  section: Section,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSection(section)) return failure("Unknown section.");
  await requireAdmin();

  const parsed = readBrandForm(formData);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", fieldErrorsOf(parsed.error));
  }
  const input = parsed.data;
  const slug = input.slug ? input.slug : slugify(input.name);
  if (!slug) {
    return failure("Could not build a URL from that name — set a slug manually.", {
      slug: "Required.",
    });
  }

  const supabase = await createSupabaseServerClient();

  // New brands land at the end of the unpinned list.
  const { data: last } = await supabase
    .from("brands")
    .select("position")
    .eq("section", section)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("brands").insert({
    section,
    slug,
    name: input.name,
    industry: input.industry,
    blurb: input.blurb,
    accent: input.accent.toLowerCase(),
    logo_url: emptyToNull(input.logoUrl),
    bg_url: emptyToNull(input.bgUrl),
    published: input.published,
    position: (last?.position ?? -1) + 1,
  });

  if (error) return failure(describeDbError(error));

  purge(section, slug);
  return success();
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateBrand(
  brandId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = readBrandForm(formData);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", fieldErrorsOf(parsed.error));
  }
  const input = parsed.data;

  const supabase = await createSupabaseServerClient();

  const { data: existing, error: findError } = await supabase
    .from("brands")
    .select("id, section, slug")
    .eq("id", brandId)
    .maybeSingle();

  if (findError) return failure(describeDbError(findError));
  if (!existing) return failure("That brand no longer exists.");

  const section = existing.section as Section;
  const slug = input.slug ? input.slug : slugify(input.name);
  if (!slug) {
    return failure("Could not build a URL from that name — set a slug manually.", {
      slug: "Required.",
    });
  }

  const { error } = await supabase
    .from("brands")
    .update({
      slug,
      name: input.name,
      industry: input.industry,
      blurb: input.blurb,
      accent: input.accent.toLowerCase(),
      logo_url: emptyToNull(input.logoUrl),
      bg_url: emptyToNull(input.bgUrl),
      published: input.published,
    })
    .eq("id", brandId);

  if (error) return failure(describeDbError(error));

  // Both slugs: the old URL must stop serving the renamed brand's old content.
  purge(section, slug, existing.slug);
  return success();
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteBrand(brandId: string): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  // Collect every Storage object this brand owns BEFORE the cascade removes the
  // rows that reference them — otherwise the files are orphaned forever.
  const { data: brand, error: findError } = await supabase
    .from("brands")
    .select(
      "id, section, slug, logo_url, bg_url, items ( thumb_url, video_url, item_slides ( image_url ) )",
    )
    .eq("id", brandId)
    .maybeSingle();

  if (findError) return failure(describeDbError(findError));
  if (!brand) return failure("That brand no longer exists.");

  const urls: (string | null)[] = [brand.logo_url, brand.bg_url];
  for (const item of (brand.items ?? []) as {
    thumb_url: string | null;
    video_url: string | null;
    item_slides: { image_url: string }[] | null;
  }[]) {
    urls.push(item.thumb_url, item.video_url);
    for (const slide of item.item_slides ?? []) urls.push(slide.image_url);
  }

  const { error } = await supabase.from("brands").delete().eq("id", brandId);
  if (error) return failure(describeDbError(error));

  // Best-effort file cleanup. A Storage failure must NOT surface as a failed
  // delete: the row is already gone, so reporting failure would be a lie and
  // would tempt the admin into retrying a delete that cannot succeed.
  await removeStorageObjects(supabase, urls);

  purge(brand.section as Section, brand.slug);
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
      // Orphaned files are a housekeeping problem, not a user-facing error.
    }
  }
}

// ---------------------------------------------------------------------------
// Pin + reorder
// ---------------------------------------------------------------------------

export async function toggleBrandPin(brandId: string): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: brand, error: findError } = await supabase
    .from("brands")
    .select("id, section, slug, pinned")
    .eq("id", brandId)
    .maybeSingle();

  if (findError) return failure(describeDbError(findError));
  if (!brand) return failure("That brand no longer exists.");

  const { error } = await supabase
    .from("brands")
    .update({ pinned: !brand.pinned })
    .eq("id", brandId);

  if (error) return failure(describeDbError(error));

  purge(brand.section as Section, brand.slug);
  return success();
}

/**
 * Persist an explicit order.
 *
 * The client sends the COMPLETE ordered list of ids, not a delta — so an
 * up/down swap and a jump-to-position use one code path, and the result is
 * idempotent. The RPC rewrites positions to 0,1,2…, so gaps never build up.
 */
export async function reorderBrands(
  section: Section,
  orderedIds: string[],
): Promise<ActionState> {
  if (!isSection(section)) return failure("Unknown section.");
  await requireAdmin();

  if (orderedIds.length === 0) return success();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("reorder_brands", {
    p_section: section,
    p_ids: orderedIds,
  });

  if (error) return failure(describeDbError(error));

  purge(section);
  return success();
}
