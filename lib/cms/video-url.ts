import type { VideoProvider } from "./types";

/**
 * Video URL parsing.
 *
 * Accepts whatever a human actually pastes — a watch URL, a share link, a
 * shortened youtu.be, an embed URL, or a bare ID — and normalises it. Kept
 * dependency-free and pure so it can run on the server (page render) and in the
 * client (live preview in the admin form) alike.
 */

export type ParsedVideo = {
  provider: VideoProvider;
  /** Provider-side ID; null for direct uploads. */
  videoId: string | null;
  /** Embed URL for an <iframe>; null for direct uploads. */
  embedUrl: string | null;
  /** Auto-derived poster image; null when the provider offers none. */
  thumbUrl: string | null;
};

const YOUTUBE_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d{6,}$/;

function youtubeId(url: URL): string | null {
  // youtu.be/<id>
  if (url.hostname.endsWith("youtu.be")) {
    const id = url.pathname.slice(1).split("/")[0] ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }
  if (!url.hostname.includes("youtube.com")) return null;

  // youtube.com/watch?v=<id>
  const v = url.searchParams.get("v");
  if (v && YOUTUBE_ID.test(v)) return v;

  // youtube.com/{embed,shorts,live,v}/<id>
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && ["embed", "shorts", "live", "v"].includes(segments[0]!)) {
    const id = segments[1]!;
    return YOUTUBE_ID.test(id) ? id : null;
  }
  return null;
}

function vimeoId(url: URL): string | null {
  if (!url.hostname.includes("vimeo.com")) return null;
  // vimeo.com/<id>, player.vimeo.com/video/<id>, vimeo.com/channels/x/<id>
  const segments = url.pathname.split("/").filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (VIMEO_ID.test(segments[i]!)) return segments[i]!;
  }
  return null;
}

/**
 * Parse a pasted video URL. Returns null when the input is not a recognisable
 * video source, so the admin form can show a precise error instead of saving a
 * row that renders as a blank frame.
 */
export function parseVideoUrl(input: string): ParsedVideo | null {
  const raw = input.trim();
  if (!raw) return null;

  // Bare YouTube ID — a common paste.
  if (YOUTUBE_ID.test(raw)) {
    return {
      provider: "youtube",
      videoId: raw,
      embedUrl: youtubeEmbed(raw),
      thumbUrl: youtubeThumb(raw),
    };
  }

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const yt = youtubeId(url);
  if (yt) {
    return {
      provider: "youtube",
      videoId: yt,
      embedUrl: youtubeEmbed(yt),
      thumbUrl: youtubeThumb(yt),
    };
  }

  const vm = vimeoId(url);
  if (vm) {
    return {
      provider: "vimeo",
      videoId: vm,
      // Vimeo thumbnails require an API call, so the admin uploads one instead.
      embedUrl: `https://player.vimeo.com/video/${vm}?dnt=1`,
      thumbUrl: null,
    };
  }

  // A direct media file (typically a Supabase Storage URL).
  if (/\.(mp4|webm|mov)($|\?)/i.test(url.pathname + url.search)) {
    return { provider: "upload", videoId: null, embedUrl: null, thumbUrl: null };
  }

  return null;
}

/** youtube-nocookie avoids setting tracking cookies until the user hits play. */
function youtubeEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
