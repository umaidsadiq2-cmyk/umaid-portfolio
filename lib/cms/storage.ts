import type { Section } from "./types";

/**
 * Supabase Storage helpers.
 *
 * Pure and isomorphic — the admin form uses them in the browser to build upload
 * paths, and Server Actions use them to work out which objects to delete when a
 * row goes away.
 */

export const BUCKETS = {
  brandAssets: "brand-assets",
  creatives: "creatives",
  videos: "videos",
} as const;

export type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

const PUBLIC_MARKER = "/storage/v1/object/public/";

/**
 * Reverse a public Storage URL back into { bucket, path }.
 *
 * Returns null for anything that is not one of our Storage URLs — notably the
 * legacy `/portfolio/social/...` paths that the seed keeps pointing at files in
 * /public. That null is load-bearing: it stops a delete from trying (and
 * failing) to remove a file that Storage never owned.
 */
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  const at = url.indexOf(PUBLIC_MARKER);
  if (at === -1) return null;

  const rest = url.slice(at + PUBLIC_MARKER.length);
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;

  const bucket = rest.slice(0, slash);
  const path = decodeURIComponent(rest.slice(slash + 1).split("?")[0] ?? "");
  if (!bucket || !path) return null;

  return { bucket, path };
}

/** Group a set of URLs by bucket so each bucket needs only one remove() call. */
export function groupStorageUrls(urls: (string | null | undefined)[]) {
  const byBucket = new Map<string, string[]>();
  for (const url of urls) {
    if (!url) continue;
    const parsed = parseStorageUrl(url);
    if (!parsed) continue;
    const list = byBucket.get(parsed.bucket) ?? [];
    list.push(parsed.path);
    byBucket.set(parsed.bucket, list);
  }
  return byBucket;
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/**
 * Build a collision-proof object path.
 *
 * The random suffix matters: re-uploading a replacement logo must produce a NEW
 * URL, otherwise the old image stays pinned in browser and CDN caches and the
 * change appears not to have worked.
 */
export function buildStoragePath(opts: {
  section: Section;
  brandSlug: string;
  kind: "logo" | "bg" | "slide" | "thumb" | "video";
  file: File;
}): string {
  const { section, brandSlug, kind, file } = opts;
  const ext =
    EXT_BY_TYPE[file.type] ?? file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const unique = crypto.randomUUID().slice(0, 8);
  return `${section}/${brandSlug}/${kind}-${unique}.${ext}`;
}

/** Which bucket a given kind of asset belongs in. */
export function bucketFor(kind: "logo" | "bg" | "slide" | "thumb" | "video"): Bucket {
  if (kind === "logo" || kind === "bg") return BUCKETS.brandAssets;
  if (kind === "slide") return BUCKETS.creatives;
  return BUCKETS.videos;
}
