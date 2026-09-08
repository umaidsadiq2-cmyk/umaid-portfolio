import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Section, VideoProvider } from "./types";

/**
 * Admin read layer.
 *
 * Deliberately NOT cached and NOT tagged, unlike ./queries. Two reasons:
 *   1. the admin must see unpublished drafts, which requires the session-bound
 *      client — and reading cookies makes the route dynamic anyway
 *   2. after an edit, the admin needs to see the truth immediately; a cache here
 *      would show them stale data and make working edits look broken
 */

export type AdminBrand = {
  id: string;
  section: Section;
  slug: string;
  name: string;
  industry: string;
  blurb: string;
  accent: string;
  logoUrl: string | null;
  bgUrl: string | null;
  pinned: boolean;
  position: number;
  published: boolean;
  itemCount: number;
};

export type AdminSlide = {
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string | null;
};

export type AdminItem = {
  id: string;
  kind: "image_post" | "carousel" | "video";
  title: string | null;
  alt: string | null;
  provider: VideoProvider | null;
  videoUrl: string | null;
  thumbUrl: string | null;
  pinned: boolean;
  position: number;
  published: boolean;
  slides: AdminSlide[];
};

const ORDER = (a: { pinned: boolean; position: number }, b: typeof a) =>
  (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.position - b.position;

export async function listBrandsForAdmin(section: Section): Promise<AdminBrand[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("brands")
    .select(
      "id, section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published, items(count)",
    )
    .eq("section", section);

  if (error) throw new Error(`Could not load brands: ${error.message}`);

  return (data ?? [])
    .map((row) => {
      const r = row as Record<string, unknown> & { items: { count: number }[] | null };
      return {
        id: r.id as string,
        section: r.section as Section,
        slug: r.slug as string,
        name: r.name as string,
        industry: r.industry as string,
        blurb: r.blurb as string,
        accent: r.accent as string,
        logoUrl: (r.logo_url as string | null) ?? null,
        bgUrl: (r.bg_url as string | null) ?? null,
        pinned: r.pinned as boolean,
        position: r.position as number,
        published: r.published as boolean,
        itemCount: r.items?.[0]?.count ?? 0,
      };
    })
    .sort(ORDER);
}

export async function getBrandForAdmin(
  brandId: string,
): Promise<{ brand: AdminBrand; items: AdminItem[] } | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("brands")
    .select(
      `id, section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published,
       items (
         id, kind, title, alt, provider, video_url, thumb_url, pinned, position, published,
         item_slides ( id, image_url, width, height, alt, position )
       )`,
    )
    .eq("id", brandId)
    .maybeSingle();

  if (error) throw new Error(`Could not load that brand: ${error.message}`);
  if (!data) return null;

  const r = data as Record<string, unknown> & { items: unknown[] | null };
  const rawItems = (r.items ?? []) as Record<string, unknown>[];

  const items: AdminItem[] = rawItems
    .map((i) => ({
      id: i.id as string,
      kind: i.kind as AdminItem["kind"],
      title: (i.title as string | null) ?? null,
      alt: (i.alt as string | null) ?? null,
      provider: (i.provider as VideoProvider | null) ?? null,
      videoUrl: (i.video_url as string | null) ?? null,
      thumbUrl: (i.thumb_url as string | null) ?? null,
      pinned: i.pinned as boolean,
      position: i.position as number,
      published: i.published as boolean,
      slides: ((i.item_slides ?? []) as Record<string, unknown>[])
        .slice()
        .sort((a, b) => (a.position as number) - (b.position as number))
        .map((s) => ({
          id: s.id as string,
          url: s.image_url as string,
          width: s.width as number,
          height: s.height as number,
          alt: (s.alt as string | null) ?? null,
        })),
    }))
    .sort(ORDER);

  const brand: AdminBrand = {
    id: r.id as string,
    section: r.section as Section,
    slug: r.slug as string,
    name: r.name as string,
    industry: r.industry as string,
    blurb: r.blurb as string,
    accent: r.accent as string,
    logoUrl: (r.logo_url as string | null) ?? null,
    bgUrl: (r.bg_url as string | null) ?? null,
    pinned: r.pinned as boolean,
    position: r.position as number,
    published: r.published as boolean,
    itemCount: items.length,
  };

  return { brand, items };
}

/** Counts for the /admin overview tiles. */
export async function getSectionCounts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("brands").select("section, items(count)");
  if (error) throw new Error(`Could not load counts: ${error.message}`);

  const counts = {
    social: { brands: 0, items: 0 },
    video: { brands: 0, items: 0 },
  };

  for (const row of data ?? []) {
    const r = row as { section: Section; items: { count: number }[] | null };
    const bucket = counts[r.section];
    if (!bucket) continue;
    bucket.brands += 1;
    bucket.items += r.items?.[0]?.count ?? 0;
  }

  return counts;
}
