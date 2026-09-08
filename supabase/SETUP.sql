-- ###########################################################################
--  PORTFOLIO CMS — ONE-TIME SETUP
--
--  Paste this whole file into:  Supabase dashboard -> SQL Editor -> New query
--  then press RUN.  Safe to run more than once.
--
--  Creates:
--    3 tables      brands, items, item_slides
--    grants        so the API roles can reach them at all
--    RLS           public reads published rows; only a signed-in admin writes
--    3 buckets     brand-assets, creatives, videos
--    3 functions   reorder_brands, reorder_items, reorder_slides
--    seed data     your existing 10 Social Media Creatives brands
--
--  AFTER RUNNING, create your login:
--    Authentication -> Users -> Add user -> Create new user
--    Tick "Auto Confirm User", then sign in at /admin/login
-- ###########################################################################


-- ===========================  PART 1 OF 2: SCHEMA  =========================

-- ============================================================================
-- Portfolio CMS — schema, grants, RLS, storage
--
-- Two managed sections (Social Media Creatives / Video Content) share one set
-- of tables. Brands are cards; items live inside a brand. Both support pin +
-- explicit ordering via `pinned` / `position`, sorted everywhere as:
--     ORDER BY pinned DESC, position ASC, created_at ASC
--
-- Security model: the browser only ever holds the publishable/anon key. RLS
-- lets anon read PUBLISHED rows and nothing else; every write requires an
-- authenticated session. There is no service-role key in the application.
--
-- Written to be safely re-runnable: every statement is guarded, so running
-- this twice is a no-op rather than an error.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums.  CREATE TYPE has no IF NOT EXISTS, hence the guards.
-- ---------------------------------------------------------------------------
do $$ begin
  create type portfolio_section as enum ('social', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type item_kind as enum ('image_post', 'carousel', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type video_provider as enum ('youtube', 'vimeo', 'upload');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- brands — the cards on a section landing page
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id         uuid primary key default gen_random_uuid(),
  section    portfolio_section not null,
  slug       text not null,
  name       text not null,
  industry   text not null default '',
  blurb      text not null default '',
  -- Deep, AA-contrast accent. Drives the card gradient and the monogram badge
  -- when no logo is uploaded, so a brand always looks intentional.
  accent     text not null default '#1F2937',
  logo_url   text,
  bg_url     text,
  pinned     boolean not null default false,
  position   integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A brand may appear in BOTH sections (same company, social + video work),
  -- so slugs are unique per section rather than globally.
  constraint brands_slug_unique_per_section unique (section, slug),
  constraint brands_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint brands_accent_format check (accent ~* '^#[0-9a-f]{6}$')
);

create index if not exists brands_section_order_idx
  on public.brands (section, pinned desc, position asc, created_at asc);

-- ---------------------------------------------------------------------------
-- items — posters/carousels (social) or videos (video) inside a brand
-- ---------------------------------------------------------------------------
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  brand_id   uuid not null references public.brands(id) on delete cascade,
  kind       item_kind not null,
  title      text,
  alt        text,
  -- video-only columns
  provider   video_provider,
  video_url  text,
  thumb_url  text,
  pinned     boolean not null default false,
  position   integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A video row is meaningless without somewhere to play from.
  constraint items_video_needs_url
    check (kind <> 'video' or (video_url is not null and provider is not null)),
  -- Conversely, image posts must not carry video fields.
  constraint items_image_has_no_video
    check (kind = 'video' or (video_url is null and provider is null))
);

create index if not exists items_brand_order_idx
  on public.items (brand_id, pinned desc, position asc, created_at asc);

-- ---------------------------------------------------------------------------
-- item_slides — social only. 1 row = single poster, N rows = carousel.
-- `isCarousel` is derived from the row count, never stored, so it cannot drift.
-- ---------------------------------------------------------------------------
create table if not exists public.item_slides (
  id        uuid primary key default gen_random_uuid(),
  item_id   uuid not null references public.items(id) on delete cascade,
  image_url text not null,
  width     integer not null default 1080,
  height    integer not null default 1350,
  alt       text,
  position  integer not null default 0,

  constraint item_slides_dimensions_positive check (width > 0 and height > 0)
);

create index if not exists item_slides_item_order_idx
  on public.item_slides (item_id, position asc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

drop trigger if exists brands_touch_updated_at on public.brands;
create trigger brands_touch_updated_at
  before update on public.brands
  for each row execute function public.touch_updated_at();

drop trigger if exists items_touch_updated_at on public.items;
create trigger items_touch_updated_at
  before update on public.items
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Reordering RPCs
--
-- The admin sends the complete ordered list of ids; positions are rewritten to
-- 0,1,2… in one statement. This makes reordering idempotent and gap-free, and
-- means an up/down swap and a drag-to-position use the exact same code path.
--
-- SECURITY INVOKER (the default) is deliberate: the UPDATE below is still
-- subject to RLS, so an anonymous caller invoking these RPCs changes nothing.
-- ---------------------------------------------------------------------------
create or replace function public.reorder_brands(p_section portfolio_section, p_ids uuid[])
returns void
language sql
as $fn$
  update public.brands b
     set position = o.ord - 1
    from unnest(p_ids) with ordinality as o(id, ord)
   where b.id = o.id
     and b.section = p_section;
$fn$;

create or replace function public.reorder_items(p_brand_id uuid, p_ids uuid[])
returns void
language sql
as $fn$
  update public.items i
     set position = o.ord - 1
    from unnest(p_ids) with ordinality as o(id, ord)
   where i.id = o.id
     and i.brand_id = p_brand_id;
$fn$;

create or replace function public.reorder_slides(p_item_id uuid, p_ids uuid[])
returns void
language sql
as $fn$
  update public.item_slides s
     set position = o.ord - 1
    from unnest(p_ids) with ordinality as o(id, ord)
   where s.id = o.id
     and s.item_id = p_item_id;
$fn$;

-- ---------------------------------------------------------------------------
-- Grants
--
-- RLS FILTERS access; it does not GRANT it. Without these, the API roles get
-- "permission denied for table brands" and the policies below never even run.
--
-- Granting SELECT to anon looks alarming and isn't: RLS is enabled on every
-- table immediately below, so anon can still only reach rows a policy admits.
-- The write grants stop at `authenticated` — anon is never given INSERT,
-- UPDATE or DELETE at all, so a leaked publishable key cannot mutate anything
-- even if a policy were later mis-written.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on public.brands, public.items, public.item_slides
  to anon, authenticated;

grant insert, update, delete on public.brands, public.items, public.item_slides
  to authenticated;

grant all on public.brands, public.items, public.item_slides
  to service_role;

-- Functions default to EXECUTE for PUBLIC; narrow that. These are SECURITY
-- INVOKER, so RLS would stop an anon caller anyway — this just removes the
-- pointless call surface.
revoke execute on function
  public.reorder_brands(portfolio_section, uuid[]),
  public.reorder_items(uuid, uuid[]),
  public.reorder_slides(uuid, uuid[])
  from public, anon;

grant execute on function
  public.reorder_brands(portfolio_section, uuid[]),
  public.reorder_items(uuid, uuid[]),
  public.reorder_slides(uuid, uuid[])
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- This is the real security boundary. The publishable/anon key ships in the
-- browser bundle; these policies are what make that safe.
--
-- CREATE POLICY has no IF NOT EXISTS, so each is dropped first.
-- ---------------------------------------------------------------------------
alter table public.brands      enable row level security;
alter table public.items       enable row level security;
alter table public.item_slides enable row level security;

-- brands ---------------------------------------------------------------------
drop policy if exists "brands: public reads published" on public.brands;
create policy "brands: public reads published"
  on public.brands for select
  using (published or auth.role() = 'authenticated');

drop policy if exists "brands: admin writes" on public.brands;
create policy "brands: admin writes"
  on public.brands for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- items ----------------------------------------------------------------------
-- An item is publicly visible only if it is published AND its brand is too;
-- unpublishing a brand hides its whole gallery in one move.
drop policy if exists "items: public reads published" on public.items;
create policy "items: public reads published"
  on public.items for select
  using (
    auth.role() = 'authenticated'
    or (
      published
      and exists (
        select 1 from public.brands b
         where b.id = items.brand_id and b.published
      )
    )
  );

drop policy if exists "items: admin writes" on public.items;
create policy "items: admin writes"
  on public.items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- item_slides ----------------------------------------------------------------
drop policy if exists "slides: public reads published" on public.item_slides;
create policy "slides: public reads published"
  on public.item_slides for select
  using (
    auth.role() = 'authenticated'
    or exists (
      select 1
        from public.items i
        join public.brands b on b.id = i.brand_id
       where i.id = item_slides.item_id
         and i.published
         and b.published
    )
  );

drop policy if exists "slides: admin writes" on public.item_slides;
create policy "slides: admin writes"
  on public.item_slides for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage buckets
--
-- Public read (these are portfolio assets meant to be seen), authenticated
-- write. Size caps and MIME allowlists are enforced by Storage itself, so a
-- bug in the upload UI cannot be used to store arbitrary files.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('brand-assets', 'brand-assets', true,  5  * 1024 * 1024,
     array['image/webp','image/png','image/jpeg','image/svg+xml']),
  ('creatives',    'creatives',    true,  10 * 1024 * 1024,
     array['image/webp','image/png','image/jpeg','image/avif']),
  ('videos',       'videos',       true,  50 * 1024 * 1024,
     array['video/mp4','video/webm','image/webp','image/png','image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "storage: public read portfolio assets" on storage.objects;
create policy "storage: public read portfolio assets"
  on storage.objects for select
  using (bucket_id in ('brand-assets', 'creatives', 'videos'));

drop policy if exists "storage: admin uploads" on storage.objects;
create policy "storage: admin uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('brand-assets', 'creatives', 'videos'));

drop policy if exists "storage: admin updates" on storage.objects;
create policy "storage: admin updates"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('brand-assets', 'creatives', 'videos'));

drop policy if exists "storage: admin deletes" on storage.objects;
create policy "storage: admin deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('brand-assets', 'creatives', 'videos'));


-- ===========================  PART 2 OF 2: SEED  ===========================

-- ===========================================================================
-- Seed: migrate the existing static Social Media Creatives into the CMS.
--
-- Generated by scripts/cms-gen-seed-sql.mjs — do not edit by hand.
-- Safe to run more than once: brands that already exist are skipped, so this
-- will never duplicate content or overwrite edits you have made in the CMS.
-- ===========================================================================

do $$
declare
  v_brand_id uuid;
  v_item_id  uuid;
begin

  -- Ignitol — 7 posts, 16 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'ignitol') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'ignitol', 'Ignitol', 'Technology & SaaS', 'Launch campaigns and product creatives that made a young software brand feel established.', '#c2410c', NULL, NULL, false, 0, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/ignitol/poster-01.webp', 1080, 1350, 'Ignitol social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/ignitol/poster-02.webp', 1080, 1350, 'Ignitol social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/ignitol/poster-03.webp', 1080, 1350, 'Ignitol social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/ignitol/poster-04.webp', 1080, 1350, 'Ignitol social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/ignitol/poster-05.webp', 1080, 1350, 'Ignitol social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/ignitol/poster-06.webp', 1080, 1350, 'Ignitol social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/ignitol/poster-07.webp', 1080, 1350, 'Ignitol social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/ignitol/poster-08.webp', 1080, 1350, 'Ignitol social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/ignitol/poster-09.webp', 1080, 1350, 'Ignitol social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/ignitol/poster-10.webp', 1080, 1350, 'Ignitol social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 5, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/ignitol/poster-11.webp', 1080, 1350, 'Ignitol social media creative №11 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/ignitol/poster-12.webp', 1080, 1350, 'Ignitol social media creative №12 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/ignitol/poster-13.webp', 1080, 1350, 'Ignitol social media creative №13 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/ignitol/poster-14.webp', 1080, 1350, 'Ignitol social media creative №14 — designed by Muhammad Umaid Sadiq', 3),
      (v_item_id, '/portfolio/social/ignitol/poster-15.webp', 1080, 1350, 'Ignitol social media creative №15 — designed by Muhammad Umaid Sadiq', 4);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 6, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/ignitol/poster-16.webp', 1080, 1350, 'Ignitol social media creative №16 — designed by Muhammad Umaid Sadiq', 0);
  end if;

  -- Travmark — 6 posts, 12 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'travmark') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'travmark', 'Travmark', 'Travel & Tourism', 'Destination-led social design that turned wanderlust into a steady stream of enquiries.', '#0e7490', NULL, NULL, false, 1, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/travmark/poster-01.webp', 1080, 1350, 'Travmark social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/travmark/poster-02.webp', 1080, 1350, 'Travmark social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/travmark/poster-03.webp', 1080, 1350, 'Travmark social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/travmark/poster-04.webp', 1080, 1350, 'Travmark social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/travmark/poster-05.webp', 1080, 1350, 'Travmark social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/travmark/poster-06.webp', 1080, 1350, 'Travmark social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/travmark/poster-07.webp', 1080, 1350, 'Travmark social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/travmark/poster-08.webp', 1080, 1350, 'Travmark social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/travmark/poster-09.webp', 1080, 1350, 'Travmark social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/travmark/poster-10.webp', 1080, 1350, 'Travmark social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 5, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/travmark/poster-11.webp', 1080, 1350, 'Travmark social media creative №11 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/travmark/poster-12.webp', 1080, 1350, 'Travmark social media creative №12 — designed by Muhammad Umaid Sadiq', 1);
  end if;

  -- KRA Clinic — 6 posts, 14 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'kra-clinic') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'kra-clinic', 'KRA Clinic', 'Healthcare', 'Calm, trustworthy creatives for a clinic — clinical credibility without the cold edge.', '#047857', NULL, NULL, false, 2, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/kra-clinic/poster-01.webp', 1080, 1350, 'KRA Clinic social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/kra-clinic/poster-02.webp', 1080, 1350, 'KRA Clinic social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/kra-clinic/poster-03.webp', 1080, 1350, 'KRA Clinic social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/kra-clinic/poster-04.webp', 1080, 1350, 'KRA Clinic social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/kra-clinic/poster-05.webp', 1080, 1350, 'KRA Clinic social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/kra-clinic/poster-06.webp', 1080, 1350, 'KRA Clinic social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/kra-clinic/poster-07.webp', 1080, 1350, 'KRA Clinic social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/kra-clinic/poster-08.webp', 1080, 1350, 'KRA Clinic social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/kra-clinic/poster-09.webp', 1080, 1350, 'KRA Clinic social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/kra-clinic/poster-10.webp', 1080, 1350, 'KRA Clinic social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 5, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/kra-clinic/poster-11.webp', 1080, 1350, 'KRA Clinic social media creative №11 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/kra-clinic/poster-12.webp', 1080, 1350, 'KRA Clinic social media creative №12 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/kra-clinic/poster-13.webp', 1080, 1350, 'KRA Clinic social media creative №13 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/kra-clinic/poster-14.webp', 1080, 1350, 'KRA Clinic social media creative №14 — designed by Muhammad Umaid Sadiq', 3);
  end if;

  -- Volt Matrix — 5 posts, 10 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'volt-matrix') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'volt-matrix', 'Volt Matrix', 'Energy & Electronics', 'Bold, high-contrast designs that gave an electronics brand a confident, modern voice.', '#4338ca', NULL, NULL, false, 3, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/volt-matrix/poster-01.webp', 1080, 1350, 'Volt Matrix social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/volt-matrix/poster-02.webp', 1080, 1350, 'Volt Matrix social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/volt-matrix/poster-03.webp', 1080, 1350, 'Volt Matrix social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/volt-matrix/poster-04.webp', 1080, 1350, 'Volt Matrix social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/volt-matrix/poster-05.webp', 1080, 1350, 'Volt Matrix social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/volt-matrix/poster-06.webp', 1080, 1350, 'Volt Matrix social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/volt-matrix/poster-07.webp', 1080, 1350, 'Volt Matrix social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/volt-matrix/poster-08.webp', 1080, 1350, 'Volt Matrix social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/volt-matrix/poster-09.webp', 1080, 1350, 'Volt Matrix social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/volt-matrix/poster-10.webp', 1080, 1350, 'Volt Matrix social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
  end if;

  -- FM Foods — 6 posts, 15 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'fm-foods') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'fm-foods', 'FM Foods', 'Food & Beverage', 'Appetite-first social creatives — warm, vivid, and built to stop the scroll.', '#b45309', NULL, NULL, false, 4, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fm-foods/poster-01.webp', 1080, 1350, 'FM Foods social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fm-foods/poster-02.webp', 1080, 1350, 'FM Foods social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/fm-foods/poster-03.webp', 1080, 1350, 'FM Foods social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/fm-foods/poster-04.webp', 1080, 1350, 'FM Foods social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/fm-foods/poster-05.webp', 1080, 1350, 'FM Foods social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fm-foods/poster-06.webp', 1080, 1350, 'FM Foods social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fm-foods/poster-07.webp', 1080, 1350, 'FM Foods social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/fm-foods/poster-08.webp', 1080, 1350, 'FM Foods social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/fm-foods/poster-09.webp', 1080, 1350, 'FM Foods social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fm-foods/poster-10.webp', 1080, 1350, 'FM Foods social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 5, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fm-foods/poster-11.webp', 1080, 1350, 'FM Foods social media creative №11 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/fm-foods/poster-12.webp', 1080, 1350, 'FM Foods social media creative №12 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/fm-foods/poster-13.webp', 1080, 1350, 'FM Foods social media creative №13 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/fm-foods/poster-14.webp', 1080, 1350, 'FM Foods social media creative №14 — designed by Muhammad Umaid Sadiq', 3),
      (v_item_id, '/portfolio/social/fm-foods/poster-15.webp', 1080, 1350, 'FM Foods social media creative №15 — designed by Muhammad Umaid Sadiq', 4);
  end if;

  -- AIR Automotive — 6 posts, 11 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'air-automotive') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'air-automotive', 'AIR Automotive', 'Automotive', 'Sleek, premium automotive design that matched the engineering it was selling.', '#1f2937', NULL, NULL, false, 5, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/air-automotive/poster-01.webp', 1080, 1350, 'AIR Automotive social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/air-automotive/poster-02.webp', 1080, 1350, 'AIR Automotive social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/air-automotive/poster-03.webp', 1080, 1350, 'AIR Automotive social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/air-automotive/poster-04.webp', 1080, 1350, 'AIR Automotive social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/air-automotive/poster-05.webp', 1080, 1350, 'AIR Automotive social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/air-automotive/poster-06.webp', 1080, 1350, 'AIR Automotive social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/air-automotive/poster-07.webp', 1080, 1350, 'AIR Automotive social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/air-automotive/poster-08.webp', 1080, 1350, 'AIR Automotive social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/air-automotive/poster-09.webp', 1080, 1350, 'AIR Automotive social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/air-automotive/poster-10.webp', 1080, 1350, 'AIR Automotive social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 5, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/air-automotive/poster-11.webp', 1080, 1350, 'AIR Automotive social media creative №11 — designed by Muhammad Umaid Sadiq', 0);
  end if;

  -- Noor Accounting — 4 posts, 9 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'noor-accounting') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'noor-accounting', 'Noor Accounting', 'Finance & Accounting', 'Clean, reassuring financial creatives that made a numbers business feel human.', '#065f46', NULL, NULL, false, 6, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/noor-accounting/poster-01.webp', 1080, 1350, 'Noor Accounting social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/noor-accounting/poster-02.webp', 1080, 1350, 'Noor Accounting social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/noor-accounting/poster-03.webp', 1080, 1350, 'Noor Accounting social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/noor-accounting/poster-04.webp', 1080, 1350, 'Noor Accounting social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/noor-accounting/poster-05.webp', 1080, 1350, 'Noor Accounting social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/noor-accounting/poster-06.webp', 1080, 1350, 'Noor Accounting social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/noor-accounting/poster-07.webp', 1080, 1350, 'Noor Accounting social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/noor-accounting/poster-08.webp', 1080, 1350, 'Noor Accounting social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/noor-accounting/poster-09.webp', 1080, 1350, 'Noor Accounting social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
  end if;

  -- OptiLuxe — 6 posts, 13 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'optiluxe') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'optiluxe', 'OptiLuxe', 'Eyewear & Retail', 'Editorial eyewear campaigns with a luxe, fashion-forward finish.', '#6d28d9', NULL, NULL, false, 7, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/optiluxe/poster-01.webp', 1080, 1350, 'OptiLuxe social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/optiluxe/poster-02.webp', 1080, 1350, 'OptiLuxe social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/optiluxe/poster-03.webp', 1080, 1350, 'OptiLuxe social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/optiluxe/poster-04.webp', 1080, 1350, 'OptiLuxe social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/optiluxe/poster-05.webp', 1080, 1350, 'OptiLuxe social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/optiluxe/poster-06.webp', 1080, 1350, 'OptiLuxe social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/optiluxe/poster-07.webp', 1080, 1350, 'OptiLuxe social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/optiluxe/poster-08.webp', 1080, 1350, 'OptiLuxe social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/optiluxe/poster-09.webp', 1080, 1350, 'OptiLuxe social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/optiluxe/poster-10.webp', 1080, 1350, 'OptiLuxe social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 5, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/optiluxe/poster-11.webp', 1080, 1350, 'OptiLuxe social media creative №11 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/optiluxe/poster-12.webp', 1080, 1350, 'OptiLuxe social media creative №12 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/optiluxe/poster-13.webp', 1080, 1350, 'OptiLuxe social media creative №13 — designed by Muhammad Umaid Sadiq', 2);
  end if;

  -- Paul Brooks — 5 posts, 10 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'paul-brooks') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'paul-brooks', 'Paul Brooks', 'Fashion & Personal Brand', 'A cohesive personal-brand identity translated into a scroll-stopping social presence.', '#9f1239', NULL, NULL, false, 8, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/paul-brooks/poster-01.webp', 1080, 1350, 'Paul Brooks social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/paul-brooks/poster-02.webp', 1080, 1350, 'Paul Brooks social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/paul-brooks/poster-03.webp', 1080, 1350, 'Paul Brooks social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/paul-brooks/poster-04.webp', 1080, 1350, 'Paul Brooks social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/paul-brooks/poster-05.webp', 1080, 1350, 'Paul Brooks social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/paul-brooks/poster-06.webp', 1080, 1350, 'Paul Brooks social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/paul-brooks/poster-07.webp', 1080, 1350, 'Paul Brooks social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/paul-brooks/poster-08.webp', 1080, 1350, 'Paul Brooks social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/paul-brooks/poster-09.webp', 1080, 1350, 'Paul Brooks social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/paul-brooks/poster-10.webp', 1080, 1350, 'Paul Brooks social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
  end if;

  -- Fluid Technology International — 6 posts, 12 images
  if not exists (select 1 from public.brands where section = 'social' and slug = 'fluid-technology-international') then
    insert into public.brands (section, slug, name, industry, blurb, accent, logo_url, bg_url, pinned, position, published)
    values ('social', 'fluid-technology-international', 'Fluid Technology International', 'Industrial & Engineering', 'Precise, technical creatives that made complex engineering feel clear and credible.', '#0369a1', NULL, NULL, false, 9, true)
    returning id into v_brand_id;

    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 0, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-01.webp', 1080, 1350, 'Fluid Technology International social media creative №01 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 1, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-02.webp', 1080, 1350, 'Fluid Technology International social media creative №02 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-03.webp', 1080, 1350, 'Fluid Technology International social media creative №03 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-04.webp', 1080, 1350, 'Fluid Technology International social media creative №04 — designed by Muhammad Umaid Sadiq', 2),
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-05.webp', 1080, 1350, 'Fluid Technology International social media creative №05 — designed by Muhammad Umaid Sadiq', 3);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 2, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-06.webp', 1080, 1350, 'Fluid Technology International social media creative №06 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 3, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-07.webp', 1080, 1350, 'Fluid Technology International social media creative №07 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-08.webp', 1080, 1350, 'Fluid Technology International social media creative №08 — designed by Muhammad Umaid Sadiq', 1),
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-09.webp', 1080, 1350, 'Fluid Technology International social media creative №09 — designed by Muhammad Umaid Sadiq', 2);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'image_post', false, 4, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-10.webp', 1080, 1350, 'Fluid Technology International social media creative №10 — designed by Muhammad Umaid Sadiq', 0);
    insert into public.items (brand_id, kind, pinned, position, published)
    values (v_brand_id, 'carousel', false, 5, true) returning id into v_item_id;
    insert into public.item_slides (item_id, image_url, width, height, alt, position) values
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-11.webp', 1080, 1350, 'Fluid Technology International social media creative №11 — designed by Muhammad Umaid Sadiq', 0),
      (v_item_id, '/portfolio/social/fluid-technology-international/poster-12.webp', 1080, 1350, 'Fluid Technology International social media creative №12 — designed by Muhammad Umaid Sadiq', 1);
  end if;

end $$;

-- Verify:
--   select b.name, count(distinct i.id) as posts, count(s.id) as images
--     from public.brands b
--     left join public.items i on i.brand_id = b.id
--     left join public.item_slides s on s.item_id = i.id
--    where b.section = 'social' group by b.name order by b.name;
