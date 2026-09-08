/**
 * Slug generation. Pure and dependency-free so both the Server Action and the
 * admin form's live URL preview can use it — if these ever diverged, the URL
 * shown while typing would not be the URL that got saved.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // Strip combining diacritics so "Café" → "cafe" rather than "caf".
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}
