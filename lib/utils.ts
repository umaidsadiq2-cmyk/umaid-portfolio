import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Monogram initials, e.g. "Fluid Technology International" → "FT". */
export function monogram(name: string): string {
  const [a = "", b = ""] = name
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (!a) return "?";
  if (!b) return a.slice(0, 2).toUpperCase();
  return (a.charAt(0) + b.charAt(0)).toUpperCase();
}

/**
 * Percent-encode for a URL query, per RFC 3986.
 *
 * encodeURIComponent leaves ! ' ( ) * unescaped, so "I'd" would travel as a raw
 * apostrophe. Both forms work in WhatsApp, but escaping them keeps the emitted
 * URL byte-identical to the canonical wa.me link and avoids a bare quote inside
 * an HTML attribute.
 */
function encodeQuery(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/**
 * Build a WhatsApp deep link from a number + prefilled message.
 * Non-digits are stripped, so the number can be stored readably ("+92 330 …").
 */
export function whatsappLink(number: string, prefill: string) {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeQuery(prefill)}`;
}
