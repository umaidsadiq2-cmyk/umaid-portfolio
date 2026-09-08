import Link from "next/link";
import { getSectionCounts } from "@/lib/cms/admin-queries";
import { SECTIONS } from "@/lib/cms/types";

export default async function AdminHomePage() {
  const counts = await getSectionCounts();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Portfolio CMS</h1>
      <p className="mt-2 text-sm text-muted">
        Add brands, manage what sits inside them, and control the order they appear in.
        Changes go live on the site immediately.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Object.values(SECTIONS).map((section) => {
          const count = counts[section.key];
          return (
            <Link
              key={section.key}
              href={`/admin/${section.key}`}
              className="group rounded-lg border border-line bg-canvas p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_20px_44px_-32px_rgba(11,16,14,0.4)]"
            >
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {section.label}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {count.brands} {count.brands === 1 ? "brand" : "brands"} ·{" "}
                {count.items} {section.adminNoun.toLowerCase()}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald">
                Manage
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
