import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { signOut } from "@/lib/cms/actions/auth";
import { SECTIONS } from "@/lib/cms/types";

/**
 * Dashboard shell.
 *
 * Re-checks the session server-side rather than trusting the middleware
 * redirect, so a stale or forged cookie can't render the shell even briefly.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1360px] flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-lg font-semibold tracking-tight">
              Umaid<span className="text-emerald">.</span>
              <span className="ml-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                CMS
              </span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {Object.values(SECTIONS).map((section) => (
                <Link
                  key={section.key}
                  href={`/admin/${section.key}`}
                  className="rounded-sm px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-fog hover:text-ink"
                >
                  {section.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden text-sm text-muted underline-offset-4 hover:text-ink hover:underline md:inline"
            >
              View site ↗
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="h-9 rounded-sm border border-line-strong px-3 text-sm font-medium transition-colors hover:border-ink hover:bg-fog"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Section links collapse to a second row on small screens. */}
        <nav className="flex items-center gap-1 border-t border-line px-5 py-2 sm:hidden">
          {Object.values(SECTIONS).map((section) => (
            <Link
              key={section.key}
              href={`/admin/${section.key}`}
              className="rounded-sm px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-fog"
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
