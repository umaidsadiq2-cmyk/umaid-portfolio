import { unstable_cache } from "next/cache";
import { supabaseAnon } from "@/lib/supabase/anon";
import { staticBrands, staticVideoBrand } from "@/content/work";
import { parseVideoUrl } from "./video-url";
import type {
  Brand,
  CreativePost,
  Poster,
  Section,
  VideoItem,
  VideoProvider,
} from "./types";

/**
 * Public read layer.
 *
 * Every function here is wrapped in `unstable_cache` and tagged, so public
 * pages render from cache (protecting the Lighthouse budget) while admin
 * mutations call `revalidateTag` to purge them the instant content changes.
 * Net effect: static-fast pages that update immediately, with no rebuild.
 *
 * These run as ANON. RLS therefore does the publish-filtering for us — an
 * unpublished brand or item is invisible here even without an explicit filter.
 * The explicit `.eq("published", true)` calls below are belt-and-braces so the
 * intent stays readable at the call site.
 */

export const tags = {
  /** Purged when any brand in a section is added/edited/removed/reordered. */
  brands: (section: Section) => `brands:${section}`,
  /** Purged when a specific brand or any of its items changes. */
  brand: (section: Section, slug: string) => `brand:${section}:${slug}`,
  /** Purged on any change at all — used for slug lists / sitemap. */
  all: "cms:all",
};

const BRAND_FIELDS =
  "id, section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published";

type BrandRow = {
  id: string;
  section: Section;
  slug: string;
  name: string;
  industry: string;
  blurb: string;
  accent: string;
  logo_url: string | null;
  bg_url: string | null;
  pinned: boolean;
  position: number;
  published: boolean;
};

type SlideRow = {
  id: string;
  image_url: string;
  width: number;
  height: number;
  alt: string | null;
  position: number;
};

type ItemRow = {
  id: string;
  kind: "image_post" | "carousel" | "video";
  title: string | null;
  alt: string | null;
  provider: VideoProvider | null;
  video_url: string | null;
  thumb_url: string | null;
  pinned: boolean;
  position: number;
  created_at: string;
  item_slides: SlideRow[] | null;
};

function toBrand(row: BrandRow, itemCount: number): Brand {
  return {
    id: row.id,
    section: row.section,
    slug: row.slug,
    name: row.name,
    industry: row.industry,
    blurb: row.blurb,
    accent: row.accent,
    logoUrl: row.logo_url,
    bgUrl: row.bg_url,
    pinned: row.pinned,
    position: row.position,
    published: row.published,
    itemCount,
  };
}

/**
 * The one canonical sort, applied in JS rather than in nested PostgREST
 * ordering. Volumes here are tens of rows, and doing it here means the pinned →
 * position → created_at rule is expressed exactly once for brands, items, and
 * slides instead of being restated in every query.
 */
function byPinnedThenPosition<T extends { pinned?: boolean; position: number; created_at?: string }>(
  a: T,
  b: T,
): number {
  if ((b.pinned ? 1 : 0) !== (a.pinned ? 1 : 0)) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
  if (a.position !== b.position) return a.position - b.position;
  return (a.created_at ?? "").localeCompare(b.created_at ?? "");
}

// ---------------------------------------------------------------------------
// Brand lists
// ---------------------------------------------------------------------------

/**
 * Fetch failures (network unreachable, CMS database paused) return an empty
 * list rather than throwing. This runs both at request time for the section
 * listing pages AND at build time for generateStaticParams/sitemap, and a
 * static build must never fail wholesale because the CMS happens to be
 * unreachable — the rest of the site has nothing to do with Supabase. Worst
 * case a section shows no brands yet, instead of the entire deploy failing.
 */
/**
 * Work shipped with the site (content/work.ts) leads, then CMS brands. A CMS
 * brand reusing a static slug is dropped — the static one owns that URL.
 *
 * Static work is merged OUTSIDE unstable_cache on purpose: it is part of the
 * code, so it must change with every deploy. Inside the data cache (which
 * survives between builds) an edited count or new item could stay stale.
 */
function withStatic(section: Section, cms: Brand[]): Brand[] {
  const local = staticBrands(section);
  const taken = new Set(local.map((b) => b.slug));
  return [...local, ...cms.filter((b) => !taken.has(b.slug))];
}

async function fetchBrands(section: Section): Promise<Brand[]> {
  // Slide counts come back per item so the card can report IMAGES, not posts.
  // Counting posts would make a brand with four carousels read "4 Designs"
  // while its own page says "16 creatives" — the card must match the gallery.
  let data: BrandRow[] | null;
  try {
    const res = await supabaseAnon
      .from("brands")
      .select(`${BRAND_FIELDS}, items(id, item_slides(count))`)
      .eq("section", section)
      .eq("published", true);
    if (res.error) throw new Error(`Failed to load ${section} brands: ${res.error.message}`);
    data = res.data;
  } catch (err) {
    console.error(`[cms] Failed to load ${section} brands:`, err);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const { items, ...brand } = row as BrandRow & {
        items: { id: string; item_slides: { count: number }[] | null }[] | null;
      };

      // Social counts images across every post; Video counts the videos
      // themselves, which carry no slides.
      const count =
        section === "social"
          ? (items ?? []).reduce((sum, i) => sum + (i.item_slides?.[0]?.count ?? 0), 0)
          : (items ?? []).length;

      return toBrand(brand, count);
    })
    .sort(byPinnedThenPosition);
}

/** Brand cards for a section landing page, pinned first. */
export async function getBrands(section: Section): Promise<Brand[]> {
  const cms = await unstable_cache(() => fetchBrands(section), ["cms", "brands", section], {
    tags: [tags.brands(section), tags.all],
    revalidate: 3600,
  })();
  return withStatic(section, cms);
}

/** Slugs for generateStaticParams / sitemap. */
export async function getBrandSlugs(section: Section): Promise<string[]> {
  const cms = await unstable_cache(
    async () => (await fetchBrands(section)).map((b) => b.slug),
    ["cms", "slugs", section],
    { tags: [tags.brands(section), tags.all], revalidate: 3600 },
  )();
  const local = staticBrands(section).map((b) => b.slug);
  return [...local, ...cms.filter((slug) => !local.includes(slug))];
}

// ---------------------------------------------------------------------------
// Brand detail
// ---------------------------------------------------------------------------

async function fetchBrandDetail(section: Section, slug: string) {
  const { data, error } = await supabaseAnon
    .from("brands")
    .select(
      `${BRAND_FIELDS},
       items (
         id, kind, title, alt, provider, video_url, thumb_url, pinned, position, created_at,
         item_slides ( id, image_url, width, height, alt, position )
       )`,
    )
    .eq("section", section)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load brand "${slug}": ${error.message}`);
  if (!data) return null;

  const { items, ...brandRow } = data as BrandRow & { items: ItemRow[] | null };
  const sorted = (items ?? []).slice().sort(byPinnedThenPosition);

  return { brand: toBrand(brandRow, sorted.length), items: sorted };
}

function toPoster(slide: SlideRow, brandName: string, index: number): Poster {
  const n = String(index + 1).padStart(2, "0");
  return {
    src: slide.image_url,
    alt: slide.alt?.trim() || `${brandName} social media creative №${n}`,
    width: slide.width,
    height: slide.height,
  };
}

/**
 * Social brand + its posts. A post's slides come straight from item_slides, so
 * `isCarousel` is derived from the real slide count rather than the synthetic
 * grouping pattern the static version used.
 */
export function getSocialBrand(slug: string): Promise<{
  brand: Brand;
  posts: CreativePost[];
} | null> {
  return unstable_cache(
    async () => {
      const detail = await fetchBrandDetail("social", slug);
      if (!detail) return null;

      const posts: CreativePost[] = detail.items
        .filter((item) => item.kind !== "video")
        .map((item) => {
          const slides = (item.item_slides ?? [])
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((slide, i) => toPoster(slide, detail.brand.name, i));
          return { item, slides };
        })
        // An item with no slides would render as a broken tile — drop it.
        .filter(({ slides }) => slides.length > 0)
        .map(({ item, slides }) => ({
          id: item.id,
          slides,
          cover: slides[0]!,
          isCarousel: slides.length > 1,
          pinned: item.pinned,
        }));

      // Images, not posts — keeps the card, the page header and the search
      // description all quoting the same number.
      const imageCount = posts.reduce((sum, post) => sum + post.slides.length, 0);
      return { brand: { ...detail.brand, itemCount: imageCount }, posts };
    },
    ["cms", "social-brand", slug],
    { tags: [tags.brand("social", slug), tags.all], revalidate: 3600 },
  )();
}

/** Video brand + its videos, embed URLs resolved at render time. */
export function getVideoBrand(slug: string): Promise<{
  brand: Brand;
  videos: VideoItem[];
} | null> {
  // Static collections bypass the data cache — see withStatic above.
  const local = staticVideoBrand(slug);
  if (local) return Promise.resolve(local);

  return unstable_cache(
    async () => {
      const detail = await fetchBrandDetail("video", slug);
      if (!detail) return null;

      const videos: VideoItem[] = detail.items
        .filter((item) => item.kind === "video" && item.video_url)
        .map((item) => {
          const parsed = parseVideoUrl(item.video_url!);
          return {
            id: item.id,
            title: item.title?.trim() || detail.brand.name,
            provider: item.provider ?? parsed?.provider ?? "upload",
            url: item.video_url!,
            embedUrl: parsed?.embedUrl ?? null,
            // A stored thumbnail always wins; otherwise fall back to the
            // provider's own (YouTube), otherwise null → gradient placeholder.
            thumbUrl: item.thumb_url ?? parsed?.thumbUrl ?? null,
            pinned: item.pinned,
          };
        });

      return { brand: { ...detail.brand, itemCount: videos.length }, videos };
    },
    ["cms", "video-brand", slug],
    { tags: [tags.brand("video", slug), tags.all], revalidate: 3600 },
  )();
}
