import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS",
  // The admin area must never be indexed, and must never leak referrers to
  // third parties (Supabase Storage URLs appear in this UI).
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Admin area root. Deliberately thin — the dashboard shell (sidebar, sign-out)
 * lives in (dash)/layout.tsx so that /admin/login can render bare, without
 * navigation to pages the visitor cannot reach.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-mist text-ink">{children}</div>;
}
