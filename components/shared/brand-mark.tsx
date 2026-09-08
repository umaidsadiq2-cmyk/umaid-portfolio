import { cn } from "@/lib/utils";

/**
 * The "US" brand mark (emerald roundel). This is the site's persistent logo,
 * centred in the navbar as the home link. Size is controlled by the caller via
 * `className` (e.g. `h-10 w-10`). Decorative by default (alt="") — the navbar link
 * carries its own accessible label.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/brand-mark.webp"
      alt=""
      width={256}
      height={256}
      decoding="async"
      className={cn("aspect-square rounded-full object-cover", className)}
    />
  );
}
