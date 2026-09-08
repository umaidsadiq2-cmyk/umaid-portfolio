/**
 * CMS domain types.
 *
 * `Poster` and `CreativePost` intentionally keep the exact shape they had in
 * content/social-creatives.ts, so PostGallery and PostViewer consume database
 * rows with no change beyond their import path.
 */

export type Section = "social" | "video";

export type VideoProvider = "youtube" | "vimeo" | "upload";

export type Brand = {
  id: string;
  section: Section;
  slug: string;
  name: string;
  industry: string;
  blurb: string;
  /** Deep, AA-contrast accent — card gradient + monogram fallback. */
  accent: string;
  logoUrl: string | null;
  bgUrl: string | null;
  pinned: boolean;
  position: number;
  published: boolean;
  /** Published items in this brand — the "16 Designs" pill on the card. */
  itemCount: number;
};

export type Poster = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * A grid item in a Social brand gallery: one creative (single slide) or an
 * Instagram-style carousel (multiple slides). The grid shows `cover`; the
 * viewer walks `slides`.
 */
export type CreativePost = {
  id: string;
  slides: Poster[];
  cover: Poster;
  isCarousel: boolean;
  pinned: boolean;
};

export type VideoItem = {
  id: string;
  title: string;
  provider: VideoProvider;
  /** Original URL as entered (watch page) or the Storage URL for uploads. */
  url: string;
  /** Privacy-friendly embed URL; null for direct uploads (use <video>). */
  embedUrl: string | null;
  thumbUrl: string | null;
  pinned: boolean;
};

/** Sections as presented in the UI, including their public route bases. */
/**
 * `itemNoun` is what the PUBLIC card counts — images for Social, videos for
 * Video. `adminNoun` is what you MANAGE in the CMS: a carousel of six images is
 * six Designs on the site but one post in the admin, so the two deliberately
 * differ rather than one of them lying.
 */
export const SECTIONS = {
  social: {
    key: "social",
    label: "Social Media Creatives",
    basePath: "/portfolio/social-media-creatives",
    itemNoun: "Designs",
    adminNoun: "Posts",
  },
  video: {
    key: "video",
    label: "Video Content",
    basePath: "/portfolio/video-content",
    itemNoun: "Videos",
    adminNoun: "Videos",
  },
} as const satisfies Record<Section, {
  key: Section;
  label: string;
  basePath: string;
  itemNoun: string;
  adminNoun: string;
}>;

export function isSection(value: string): value is Section {
  return value === "social" || value === "video";
}
