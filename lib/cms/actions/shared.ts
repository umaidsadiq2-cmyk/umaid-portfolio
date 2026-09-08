import { revalidateTag } from "next/cache";
import { tags } from "../queries";
import { slugify } from "../slug";
import type { Section } from "../types";

/**
 * Server-only helpers for mutations. Never import this from a client
 * component — see ./state for the client-safe form-result types.
 */

/**
 * Purge the cached public reads touched by a mutation.
 *
 * This is the "instantly updates the website" step. Call it after EVERY write,
 * with every slug involved — including the OLD slug on a rename, or the
 * brand's former URL would keep serving stale content until its one-hour floor
 * expired.
 */
export { slugify };

export function purge(section: Section, ...slugs: (string | null | undefined)[]) {
  revalidateTag(tags.brands(section));
  revalidateTag(tags.all);
  for (const slug of slugs) {
    if (slug) revalidateTag(tags.brand(section, slug));
  }
}

/**
 * Translate a Postgres error into something a human can act on.
 * Anything unrecognised is passed through rather than swallowed — a silent
 * "something went wrong" in a CMS is worse than a raw constraint name.
 */
export function describeDbError(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    return "A brand with that name already exists in this section — choose a different name or slug.";
  }
  if (error.code === "23514") {
    if (error.message.includes("slug_format")) {
      return "The slug may only contain lowercase letters, numbers, and single hyphens.";
    }
    if (error.message.includes("accent_format")) {
      return "The accent must be a 6-digit hex colour, e.g. #0B6E4F.";
    }
    if (error.message.includes("video_needs_url")) {
      return "A video item needs a valid video URL.";
    }
    return `That value isn't allowed: ${error.message}`;
  }
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return "Your session has expired. Please sign in again.";
  }
  return error.message;
}
