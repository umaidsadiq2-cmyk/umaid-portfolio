import type { Brand, Poster, Section, VideoItem } from "@/lib/cms/types";

/**
 * Portfolio work shipped with the site itself, rather than stored in the CMS,
 * so the Work pages always have real work to show — including when the CMS
 * database is paused or unreachable. Media lives under /public/portfolio/work/
 * as web-optimised WebP / MP4 (the raw uploads stay out of the repo).
 *
 *  - Social creatives are grouped by INDUSTRY and shown together on the one
 *    Social Media Creatives page (see IndustryShowcase).
 *  - Video work is grouped into brand-style collections, each with its own
 *    page, merged in front of any CMS video brands by lib/cms/queries.ts.
 */

const BASE = "/portfolio/work";

// ---------------------------------------------------------------------------
// Social media creatives — by industry
// ---------------------------------------------------------------------------

export type Industry = {
  slug: string;
  label: string;
  description: string;
  posters: Poster[];
};

function poster(path: string, width: number, height: number, alt: string): Poster {
  return { src: `${BASE}/${path}`, width, height, alt };
}

export const industries: Industry[] = [
  {
    slug: "automotive",
    label: "Automotive",
    description:
      "I have designed social media creatives for automotive brands, including vehicle lubricant manufacturers and automotive rubber parts manufacturers and exporters — product-hero posts, performance messaging, and distributor campaigns for brands like Ignitol, Mileage Master, Apex Drive, and Nexon across the UAE and Canada.",
    posters: [
      poster("automotive-posters/04.webp", 1280, 1600, "Engine oil social media ad creatives for Mileage Master, Apex Drive, Ignitol and Nexon lubricants"),
      poster("automotive-posters/01.webp", 1080, 1350, "Ignitol engine oil Instagram feed — Force and Ultimus motorcycle oil posts"),
      poster("automotive-posters/02.webp", 1080, 1350, "Ignitol Force motorcycle engine oil social media creatives"),
      poster("automotive-posters/03.webp", 790, 988, "Automotive lubricant social media poster design"),
      poster("automotive-posters/05.webp", 1080, 1350, "Ignitol lubricant brand social media post grid"),
      poster("automotive-posters/06.webp", 1080, 1350, "Automotive engine oil campaign posts for social media"),
    ],
  },
  {
    slug: "drinks-ice-cream",
    label: "Drinks & Ice Cream",
    description:
      "I have designed social media creatives for beverage and dessert brands — bubble tea, ice cream, and chilled drinks — from colourful, youth-focused campaign grids for Jolly to AI product photoshoots for Nescafé Chilled Mocha that make the product the hero of every frame.",
    posters: [
      poster("social-media-posters/01.webp", 1280, 1600, "Jolly drinks and ice cream social media post series — bubble tea, mango delight and blue slush creatives"),
      poster("ai-photoshoot/01.webp", 1080, 1350, "AI product photoshoot — Nescafé Chilled Mocha bottle with floating chocolate, coffee beans and ice"),
      poster("ai-photoshoot/02.webp", 1080, 1350, "AI product photography — Nescafé Chilled Mocha splash concept"),
      poster("ai-photoshoot/03.webp", 1080, 1350, "AI-generated Nescafé Chilled Mocha product shot with coffee pour"),
      poster("ai-photoshoot/04.webp", 1080, 1350, "AI product photoshoot — iced mocha drink advertising visual"),
    ],
  },
  {
    slug: "health-care",
    label: "Health Care",
    description:
      "I have designed social media creatives for pharmaceutical and homeopathic healthcare brands, turning product benefits into clear, trustworthy posts — including launch campaigns for Sonexo's CIMI, Renalus, and NORM syrups that explain what each product does and who it helps.",
    posters: [
      poster("social-media-posters/02.webp", 1280, 1600, "Sonexo healthcare social media posts for CIMI, Renalus and NORM elixir syrups"),
    ],
  },
  {
    slug: "perfume",
    label: "Perfume",
    description:
      "I have designed social media creatives for fragrance brands — luxury lifestyle campaigns for Perfumistan, and AI-generated product photoshoots that place a bottle anywhere, from underwater to desert dunes, without the cost of a physical shoot.",
    posters: [
      poster("social-media-posters/03.webp", 1280, 1600, "Perfumistan luxury perfume social media campaign — eau de parfum bottle in nature and desert scenes"),
      poster("ai-photoshoot/05.webp", 1080, 1350, "AI perfume photoshoot — fragrance bottle held underwater with bubbles"),
      poster("ai-photoshoot/06.webp", 1080, 1350, "AI perfume product photography concept"),
      poster("ai-photoshoot/07.webp", 1080, 1350, "AI-generated luxury perfume advertising shot"),
      poster("ai-photoshoot/08.webp", 1080, 1350, "AI perfume product visual for social media"),
    ],
  },
  {
    slug: "snacks",
    label: "Snacks",
    description:
      "I have designed social media creatives for snack food brands, including the Snakitos nachos campaign for FM Foods — flavour-led, high-energy posts built around everyday moments like school breaks, road trips, and picnics.",
    posters: [
      poster("social-media-posters/04.webp", 1600, 1327, "FM Foods Snakitos nachos social media ad creatives — salsa vs paprika campaign"),
    ],
  },
  {
    slug: "real-estate",
    label: "Real Estate",
    description:
      "I have designed social media creatives for real estate developers and property marketing agencies, including Unit 4 Marketings in Lahore — project listings, investment messaging, and lead-generation posts that build trust with plot and home buyers.",
    posters: [
      poster("real-estate/01.webp", 1080, 1350, "Unit 4 Marketings real estate social media posts — residential plot projects in Lahore"),
    ],
  },
];

// ---------------------------------------------------------------------------
// Video content — brand-style collections
// ---------------------------------------------------------------------------

type StaticVideoBrand = Omit<Brand, "id" | "section" | "itemCount" | "published" | "logoUrl"> & {
  videos: string[];
};

const VIDEO: StaticVideoBrand[] = [
  {
    slug: "ai-video-ads",
    name: "AI Video Ads",
    industry: "AI Advertising",
    blurb:
      "Product and brand commercials produced with AI video tools — cinematic visuals and motion at a fraction of a traditional shoot's cost and turnaround.",
    accent: "#4c1d95",
    bgUrl: `${BASE}/ai-video-ads/01.jpg`,
    pinned: true,
    position: 0,
    videos: count(9).map((n) => `AI Video Ad ${n}`),
  },
  {
    slug: "video-ads",
    name: "Video Ads",
    industry: "Video Editing",
    blurb:
      "Short-form ads and reels edited for Meta, Instagram and TikTok — pacing, captions and motion built to hold attention and drive action.",
    accent: "#14532d",
    bgUrl: `${BASE}/video-ads/01.jpg`,
    pinned: false,
    position: 1,
    videos: count(16).map((n) => `Video Ad ${n}`),
  },
  {
    slug: "logo-animations",
    name: "Logo Animations",
    industry: "Motion Graphics",
    blurb:
      "Animated logo reveals and brand intros that give a business a polished, memorable signature across videos, reels and presentations.",
    accent: "#7c2d12",
    bgUrl: `${BASE}/logo-animations/01.jpg`,
    pinned: false,
    position: 2,
    videos: count(10).map((n) => `Logo Animation ${n}`),
  },
];

/**
 * Video work by category, for the Video Content page — the same one-page,
 * category-by-category layout as the social creatives.
 */
export type VideoCategory = {
  slug: string;
  label: string;
  description: string;
  videos: VideoItem[];
};

const VIDEO_COPY: Record<string, { label: string; description: string }> = {
  "ai-video-ads": {
    label: "AI Video Ads",
    description:
      "I produce product and brand commercials with AI video tools — cinematic visuals and motion at a fraction of the cost and turnaround of a traditional shoot, ready for social, web, and paid campaigns.",
  },
  "video-ads": {
    label: "Video Ads",
    description:
      "I edit short-form video ads and reels for Meta, Instagram, and TikTok — pacing, captions, and motion built to hold attention in the first seconds and drive viewers to act.",
  },
  "logo-animations": {
    label: "Logo Animation",
    description:
      "I create animated logo reveals and brand intros that give a business a polished, memorable signature across videos, reels, ads, and presentations.",
  },
};

export function videoCategories(): VideoCategory[] {
  return VIDEO.flatMap((b) => {
    const data = staticVideoBrand(b.slug);
    const copy = VIDEO_COPY[b.slug];
    if (!data || !copy) return [];
    return [{ slug: b.slug, label: copy.label, description: copy.description, videos: data.videos }];
  });
}

function count(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, "0"));
}

function toBrand(section: Section, b: StaticVideoBrand, itemCount: number): Brand {
  return {
    id: `static:${section}:${b.slug}`,
    section,
    slug: b.slug,
    name: b.name,
    industry: b.industry,
    blurb: b.blurb,
    accent: b.accent,
    logoUrl: null,
    bgUrl: b.bgUrl,
    pinned: b.pinned,
    position: b.position,
    published: true,
    itemCount,
  };
}

/** Static brands for a section. Social work is industry-based, so none there. */
export function staticBrands(section: Section): Brand[] {
  return section === "video" ? VIDEO.map((b) => toBrand("video", b, b.videos.length)) : [];
}

export function staticVideoBrand(slug: string): { brand: Brand; videos: VideoItem[] } | null {
  const b = VIDEO.find((v) => v.slug === slug);
  if (!b) return null;
  const videos: VideoItem[] = b.videos.map((title, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `${b.slug}-${n}`,
      title,
      provider: "upload",
      url: `${BASE}/${b.slug}/${n}.mp4`,
      embedUrl: null,
      thumbUrl: `${BASE}/${b.slug}/${n}.jpg`,
      pinned: false,
    };
  });
  return { brand: toBrand("video", b, videos.length), videos };
}
