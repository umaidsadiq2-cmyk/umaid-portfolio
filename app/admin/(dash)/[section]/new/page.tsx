import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandForm } from "@/components/admin/brand-form";
import { isSection, SECTIONS } from "@/lib/cms/types";

export default async function NewBrandPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSection(section)) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl">
      <nav className="mb-4 text-sm text-muted">
        <Link href={`/admin/${section}`} className="underline-offset-4 hover:underline">
          {SECTIONS[section].label}
        </Link>
        <span aria-hidden> / </span>
        <span className="text-ink-soft">New brand</span>
      </nav>

      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight">
        Add a brand
      </h1>

      <BrandForm section={section} />
    </div>
  );
}
