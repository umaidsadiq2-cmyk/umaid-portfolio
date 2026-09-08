"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createBrand, updateBrand } from "@/lib/cms/actions/brands";
import { IDLE, type ActionState } from "@/lib/cms/actions/state";
import type { AdminBrand } from "@/lib/cms/admin-queries";
import { slugify } from "@/lib/cms/slug";
import { SECTIONS, type Section } from "@/lib/cms/types";
import { ImageField } from "./image-field";

const field =
  "h-10 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm " +
  "focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/20";

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-sm bg-emerald px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-deep disabled:opacity-60"
    >
      {pending ? "Saving…" : isNew ? "Create brand" : "Save changes"}
    </button>
  );
}

export function BrandForm({
  section,
  brand,
}: {
  section: Section;
  brand?: AdminBrand;
}) {
  const router = useRouter();
  const isNew = !brand;

  const action = isNew
    ? createBrand.bind(null, section)
    : updateBrand.bind(null, brand.id);

  const [state, formAction] = useActionState<ActionState, FormData>(action, IDLE);

  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [accent, setAccent] = useState(brand?.accent ?? "#1f2937");

  // An untouched slug tracks the name; once edited by hand it stays put.
  const effectiveSlug = slug || slugify(name);

  useEffect(() => {
    if (state.ok) {
      router.push(`/admin/${section}`);
      router.refresh();
    }
  }, [state.ok, router, section]);

  const err = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-line bg-canvas p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Brand name
            </label>
            <input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
              placeholder="Ignitol"
            />
            {err("name") && <p className="mt-1 text-xs text-red-700">{err("name")}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
              URL slug
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className={field}
              placeholder={slugify(name) || "auto-generated from the name"}
            />
            <p className="mt-1 truncate text-xs text-muted">
              {SECTIONS[section].basePath}/
              <span className="font-medium text-ink-soft">
                {effectiveSlug || "…"}
              </span>
            </p>
            {err("slug") && <p className="mt-1 text-xs text-red-700">{err("slug")}</p>}
            {!isNew && brand.slug !== effectiveSlug && effectiveSlug && (
              <p className="mt-1 text-xs text-amber-700">
                Changing the slug changes this brand&apos;s public URL. Existing links
                to /{brand.slug} will 404.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="industry" className="mb-1.5 block text-sm font-medium">
              Industry
            </label>
            <input
              id="industry"
              name="industry"
              defaultValue={brand?.industry ?? ""}
              className={field}
              placeholder="Technology & SaaS"
            />
          </div>

          <div>
            <label htmlFor="accent" className="mb-1.5 block text-sm font-medium">
              Accent colour
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="h-10 w-12 shrink-0 cursor-pointer rounded-sm border border-line-strong bg-canvas p-1"
                aria-label="Pick accent colour"
              />
              <input
                id="accent"
                name="accent"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className={`${field} font-mono`}
                placeholder="#0B6E4F"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Card gradient, and the monogram badge when no logo is set. Use a deep
              shade — white text sits on top of it.
            </p>
            {err("accent") && <p className="mt-1 text-xs text-red-700">{err("accent")}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="blurb" className="mb-1.5 block text-sm font-medium">
              Blurb
            </label>
            <textarea
              id="blurb"
              name="blurb"
              rows={3}
              defaultValue={brand?.blurb ?? ""}
              maxLength={400}
              className="w-full rounded-sm border border-line-strong bg-canvas px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/20"
              placeholder="One line on what you did for this client and what it achieved."
            />
            <p className="mt-1 text-xs text-muted">
              Shown on the brand&apos;s page and used in its search description.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 rounded-lg border border-line bg-canvas p-5 sm:grid-cols-2">
        <ImageField
          name="logoUrl"
          label="Logo"
          kind="logo"
          section={section}
          brandSlug={effectiveSlug}
          initialUrl={brand?.logoUrl}
          hint="Optional. Without one, the card shows a monogram in the accent colour."
        />
        <ImageField
          name="bgUrl"
          label="Card background"
          kind="bg"
          section={section}
          brandSlug={effectiveSlug}
          initialUrl={brand?.bgUrl}
          aspect="wide"
          hint="Optional. Sits at 50% opacity over the accent gradient."
        />
      </div>

      <div className="rounded-lg border border-line bg-canvas p-5">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={brand?.published ?? true}
            className="mt-0.5 h-4 w-4 accent-[#0b6e4f]"
          />
          <span>
            <span className="block text-sm font-medium">Published</span>
            <span className="block text-xs text-muted">
              Unpublished brands stay visible here but disappear from the live site,
              along with everything inside them.
            </span>
          </span>
        </label>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SaveButton isNew={isNew} />
        <Link
          href={`/admin/${section}`}
          className="h-10 rounded-sm border border-line-strong px-4 text-sm font-medium leading-10 transition-colors hover:bg-fog"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
