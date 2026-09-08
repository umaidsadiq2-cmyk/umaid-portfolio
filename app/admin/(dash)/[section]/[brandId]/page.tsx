import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandForm } from "@/components/admin/brand-form";
import { ItemList } from "@/components/admin/item-list";
import { getBrandForAdmin } from "@/lib/cms/admin-queries";
import { isSection, SECTIONS } from "@/lib/cms/types";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ section: string; brandId: string }>;
}) {
  const { section, brandId } = await params;
  if (!isSection(section)) notFound();

  const detail = await getBrandForAdmin(brandId);
  if (!detail || detail.brand.section !== section) notFound();

  const { brand, items } = detail;
  const meta = SECTIONS[section];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <nav className="mb-4 text-sm text-muted">
        <Link href={`/admin/${section}`} className="underline-offset-4 hover:underline">
          {meta.label}
        </Link>
        <span aria-hidden> / </span>
        <span className="text-ink-soft">{brand.name}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {brand.name}
        </h1>
        <Link
          href={`${meta.basePath}/${brand.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          View live page ↗
        </Link>
      </div>

      {/* Items first: adding work is the frequent task, editing brand details
          is the rare one. */}
      <ItemList
        section={section}
        brandId={brand.id}
        brandSlug={brand.slug}
        items={items}
      />

      <div className="mt-12 border-t border-line pt-8">
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Brand details
        </h2>
        <BrandForm section={section} brand={brand} />
      </div>
    </div>
  );
}
