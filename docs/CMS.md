# Portfolio CMS

Manages the two portfolio sections — **Social Media Creatives** and **Video
Content** — as Brands (cards) containing Items (posters/carousels, or videos).
Both support create/edit/delete, pinning, and explicit ordering.

Stack: Supabase (Postgres + Auth + Storage) behind the existing Next.js 15 app.

---

## First-time setup

### 1. Create the schema

Supabase dashboard → **SQL Editor** → **New query** → paste all of
[`supabase/SETUP.sql`](../supabase/SETUP.sql) → **Run**.

Safe to run more than once. It creates the tables, grants, RLS policies, storage
buckets and reorder functions, then seeds your existing 10 Social brands.

### 2. Create your login

Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.

Enter your email and a strong password, and tick **Auto Confirm User** (skips the
verification email). This is the only account that can edit anything.

### 3. Point the app at the project

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Both are public by design. **Never add the `service_role` key** — it bypasses
RLS, and anything prefixed `NEXT_PUBLIC_` is inlined into JavaScript served to
every visitor.

Then `npm run dev` and sign in at `/admin/login`.

---

## Using it

| Route | What it does |
| --- | --- |
| `/admin` | Overview, with counts per section |
| `/admin/social` · `/admin/video` | Brand list — pin, reorder, edit, delete |
| `/admin/<section>/new` | Add a brand |
| `/admin/<section>/<brandId>` | Manage that brand's items, and its details |

**Pinning** floats a brand or item to the top of its section. Pinned entries stay
independently orderable among themselves.

**Ordering** uses ↑ / ↓ and a position box. Position 1 is first. Moves apply
within a row's own group, so nudging the top unpinned row can't displace a
pinned one.

**Publishing.** Unpublished brands and items stay visible in the admin but
vanish from the live site. Unpublishing a *brand* hides everything inside it.

**Social items.** One image is a single post; several make a carousel — decided
by how many you upload, so there's no toggle to get out of sync. The first image
is the grid thumbnail (marked *Cover*).

**Video items.** Paste a YouTube or Vimeo link; it's validated as you type.
YouTube supplies its own poster frame — Vimeo doesn't, so upload a thumbnail for
Vimeo videos or the tile shows a plain gradient. Direct MP4 upload works too
(50MB cap), but embeds are free to host and stream better.

---

## How "instantly updates" works

Public pages are **statically rendered** — necessary to hold the Lighthouse
Perf ≥95 budget in `CLAUDE.md`.

Every public read goes through `unstable_cache` with a tag
(`lib/cms/queries.ts`). Every admin mutation calls `revalidateTag`
(`lib/cms/actions/shared.ts` → `purge`). So an edit purges exactly the affected
pages and the next visitor sees the change — no rebuild, no `force-dynamic`.

`revalidate = 3600` on each page is only a backstop for a missed purge.

A rename purges **both** the old and new slug, or the old URL would keep serving
stale content for an hour.

---

## Security model

Three independent layers; the app never holds a key that can bypass them.

1. **Middleware** (`middleware.ts`) redirects unauthenticated `/admin/*`
   requests. Convenience only — a Server Action can be POSTed directly without
   passing through it.
2. **`requireAdmin()`** re-verifies the session inside every mutation. Uses
   `getUser()`, never `getSession()` — the latter reads the cookie without
   verifying it and can be spoofed.
3. **RLS** in Postgres. `anon` is granted `SELECT` only, and policies restrict
   that to published rows. `anon` has no `INSERT`/`UPDATE`/`DELETE` grant at
   all, so a leaked publishable key cannot write even if a policy were later
   mis-written.

Uploads go browser → Storage directly, carrying the admin session (Storage RLS
still applies). This sidesteps the ~4.5MB Server Action body limit that a single
poster can exceed.

---

## What the migration changed in existing code

| File | Change |
| --- | --- |
| `content/social-creatives.ts` | **Deleted** — the 10 brands now live in Postgres |
| `lib/social-assets.ts` | **Deleted** — `node:fs` build-time detection can't see uploaded files |
| `components/portfolio/company-logo-card.tsx` | Takes a `Brand` and a `basePath`, so it serves both sections |
| `app/portfolio/video-content/page.tsx` | Was a flat `WorkCard` grid; now a brand grid matching Social |
| `app/portfolio/video-content/[brand]/page.tsx` | **New** — video gallery + player |
| `components/portfolio/video-gallery.tsx` | **New** — mirrors `PostGallery`; lazy embed façade |
| `components/shared/site-chrome.tsx` | **New** — keeps navbar/Lenis/cursor/brand-intro off `/admin` |
| `app/sitemap.ts` | Now async; enumerates CMS brand pages |
| `post-gallery.tsx` / `post-viewer.tsx` | Import path only — behaviour untouched |

The seed reproduces the previous appearance exactly: same brands, order, accents
and copy; `logo_url`/`bg_url` left `NULL` (no such files existed, so cards keep
their monogram fallback); posters kept at their `/public` paths; the original
carousel grouping preserved. New uploads go to Storage.

---

## Deploying

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
`NEXT_PUBLIC_SITE_URL` in your host's environment, and confirm the Supabase
hostname in `next.config.ts` → `images.remotePatterns` matches your project.

`next build` reads the database. If the schema is missing or the project is
unreachable, the build fails loudly rather than silently shipping an empty
portfolio.
