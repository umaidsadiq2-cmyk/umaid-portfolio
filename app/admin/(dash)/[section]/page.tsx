import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandList } from "@/components/admin/brand-list";
import { listBrandsForAdmin } from "@/lib/cms/admin-queries";
import { isSection, SECTIONS } from "@/lib/cms/types";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSection(section)) notFound();

  const brands = await listBrandsForAdmin(section);
  const meta = SECTIONS[section];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {meta.label}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {brands.length} {brands.length === 1 ? "brand" : "brands"} ·{" "}
            <Link
              href={meta.basePath}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-ink"
            >
              view live page ↗
            </Link>
          </p>
        </div>
        <Link
          href={`/admin/${section}/new`}
          className="h-10 rounded-sm bg-emerald px-4 text-sm font-medium leading-10 text-white transition-colors hover:bg-emerald-deep"
        >
          Add brand
        </Link>
      </div>

      <BrandList section={section} brands={brands} />
    </div>
  );
}
