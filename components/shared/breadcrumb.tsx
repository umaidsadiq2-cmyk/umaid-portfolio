import Link from "next/link";

export type Crumb = { name: string; href?: string };

/**
 * Visible breadcrumb trail. Pair with `breadcrumbJsonLd()` in the page for the
 * structured-data equivalent. The last item is the current page (no link).
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${it.name}-${i}`} className="flex items-center gap-2">
              {it.href && !last ? (
                <Link
                  href={it.href}
                  className="transition-colors duration-300 hover:text-ink"
                >
                  {it.name}
                </Link>
              ) : (
                <span className={last ? "text-ink" : undefined} aria-current={last ? "page" : undefined}>
                  {it.name}
                </span>
              )}
              {!last && (
                <span aria-hidden className="text-line-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
