# Phase 0 Research: Personal Brand Website

**Feature**: 001-personal-brand-website | **Date**: 2026-06-19

Resolves all NEEDS CLARIFICATION from Technical Context. Each entry: Decision → Rationale →
Alternatives considered.

---

## 1. Reconciling 3D avatar + animation with Lighthouse Performance ≥95

**Decision**: Treat the avatar and heavy motion as **isolated, lazily-loaded client islands** layered on
top of a fully server-rendered, fast-by-default page. Specifically:
- Page shell, hero copy, and primary CTA render as Server Components and are the LCP — never blocked by
  3D or JS.
- `AvatarCanvas` is a `"use client"` component loaded via `next/dynamic` with `{ ssr: false }` and a
  Suspense fallback (a lightweight static avatar image / poster), mounted only after first paint.
- Load the R3F/Three scene only when (a) the hero is in/near viewport (IntersectionObserver), (b) the
  device passes a capability check (not low-power, sufficient DPR, `navigator.hardwareConcurrency`), and
  (c) `prefers-reduced-motion: no-preference`. Otherwise show the static poster.
- GLB is heavily optimized (Draco/meshopt compression, baked materials, low poly, single mesh, ≤~1.5 MB
  target), served from `public/` with long cache headers.
- GSAP ScrollTrigger + Lenis run client-side but are imported dynamically and only attach on the
  client; respect reduced-motion by disabling timelines and snapping to end-states.
- Lighthouse CI runs in CI with hard budgets; a regression fails the build (Principle IV gate).

**Rationale**: Keeps LCP/CLS/TBT governed by static content while still delivering the signature 3D
"wow" for capable users. Directly satisfies FR-001/FR-002 and SC-005 (budget holds with hero active).

**Alternatives considered**:
- *Always-on full 3D scene*: rejected — unbounded TBT/INP and mobile battery cost, likely fails ≥95.
- *Pure video hero*: cheaper but less unique/interactive; contradicts the avatar-mascot brief.
- *CSS/Canvas 2D avatar*: lighter but cannot deliver the floating, mouse/scroll-responsive depth the
  brand asset requires.

---

## 2. Avatar implementation (React Three Fiber)

**Decision**: A single rigged/posed **GLB model** rendered with R3F + `@react-three/drei`. Idle =
subtle float/breathing via `useFrame` sine offset; mouse interaction = damped rotation/parallax toward
pointer; scroll interaction = drei `ScrollControls`-style progress driving pose/camera. Wrap in a
reusable `<AvatarCanvas variant="hero|inline" />` so it is reusable across pages (FR per Avatar Strategy)
while only the hero mounts the full interactive variant.

**Rationale**: GLB + drei is the standard, lightweight, well-supported path; one model reused keeps bundle
and asset cost down (lightweight requirement).

**Alternatives considered**: Spline embed (heavier runtime, less control), per-page bespoke scenes
(rejected — performance + maintenance), sprite-sheet avatar (no true 3D interaction).

---

## 3. Consultation booking provider (primary CTA)

**Decision**: **Cal.com** embed (inline + popup) for "Book a consultation."

**Rationale**: Open-source, free self/cloud tier, clean embeddable widget, themeable to the light/green
brand, loaded lazily so it doesn't tax initial performance. Meets FR-006 primary conversion.

**Alternatives considered**: Calendly (excellent UX but paid for branding/customization and heavier
embed); building a custom scheduler (out of scope for v1, no backend). Decision is swappable — booking is
configured in `content/site.ts`.

---

## 4. Inquiry form delivery

**Decision**: **Next.js Server Action** validating with the shared **Zod** schema, then sending via
**Resend** to Umaid's inbox. Client uses React Hook Form + the same Zod schema (`zodResolver`) for
inline validation. Add a honeypot field + lightweight per-IP rate limit; return typed success/error for
the UI confirmation and graceful-failure fallback (FR-007/008/009/010).

**Rationale**: No separate backend, secrets stay server-side, one validation schema for client + server
(Principle I + IX), modern Resend DX for transactional email.

**Alternatives considered**: Third-party form services (Formspree/Getform — less control, data leaves our
boundary), API route instead of Server Action (more boilerplate, no benefit here), Nodemailer/SMTP
(more config than Resend).

---

## 5. Instant-message channel

**Decision**: **WhatsApp deep link** (`https://wa.me/<number>?text=<prefilled>`) as the secondary
instant-contact rung, configured in `content/site.ts`.

**Rationale**: Dominant business-messaging channel in Pakistan/UAE and widely used in target markets;
zero-friction, no dependency. Satisfies FR-007 conversion ladder.

**Alternatives considered**: Live chat widget (adds JS weight + ongoing staffing), email-only (higher
friction).

---

## 6. Content source / management (v1 static, CMS-ready)

**Decision**: **Typed TypeScript modules** under `content/` (profile, services, portfolio, trust, site),
each validated by a Zod schema in `lib/schemas.ts`. Long-form portfolio detail may use **MDX** where rich
copy is needed. Consumers import typed data, never raw literals.

**Rationale**: Zero runtime/DB cost, full type-safety, trivial to edit, and the schema boundary means a
headless CMS (e.g., Sanity/Contentlayer) can later supply the same shapes without touching components
(Principle VIII / FR-021).

**Alternatives considered**: Headless CMS now (over-engineered for v1, adds cost/latency), raw JSON
(no type safety), hardcoding in components (violates scalability).

---

## 7. Design system & tokens (light premium-minimal palette)

**Decision**: Single token source via **Tailwind v4 `@theme`** + CSS variables in `globals.css`. Palette:
backgrounds `#FFFFFF` / `#FAFAFA` / `#F5F5F5` (white 70% / off-white 20%), green accent `#22C55E` (10%).
Define a **full green scale** so an accessible action color exists:
- `--accent` = `#22C55E` (green-500) → large/decorative accents, icons, non-text only.
- `--accent-strong` = green-700 `#15803D` (or darker) → text-bearing buttons / links to meet AA.
- Neutral text on near-black (`#0A0A0A`/zinc-950) for AAA-ish body contrast on white.
Typography: a premium variable display font + clean sans for body via `next/font` (no layout shift).
Motion tokens (durations/easings) centralized for consistency (Principle III).

**Rationale**: One source of truth enforces UX consistency and resolves the green-contrast a11y
constraint (Principle VI) up front.

**Alternatives considered**: Ad-hoc per-component colors (rejected — Principle III), using green-500 for
buttons with white text (rejected — fails WCAG AA contrast).

---

## 8. Testing & quality-gate stack

**Decision**:
- **Vitest + React Testing Library** — unit/component (logic, states, form validation).
- **Playwright** — cross-browser (Chromium/Firefox/WebKit) + responsive E2E for the conversion ladder and
  key journeys; assert **zero console errors** in E2E runs.
- **`@axe-core/playwright`** — automated accessibility checks per page (Principle VI / SC-008).
- **Lighthouse CI** — performance/SEO/best-practices/a11y budgets enforced in CI (Principle IV / SC-005).
- **ESLint + Prettier + `tsc --noEmit`** — static gates (Principle I).

**Rationale**: Directly maps to constitution Principle II's required checks (cross-browser, responsive,
no console errors, form validation, a11y, perf-before-deploy) and the merge quality gates.

**Alternatives considered**: Jest (slower with ESM/Next than Vitest), Cypress (Playwright has better
multi-engine + parallelism), manual-only QA (fails Principle II).

---

## 9. SEO architecture

**Decision**: Next.js **Metadata API** for per-route `title`/`description`/canonical + OG + Twitter
cards; `app/sitemap.ts` and `app/robots.ts` for generation; **JSON-LD** (`Person`, `WebSite`,
`BreadcrumbList`) injected in layout/pages; semantic HTML with one `<h1>` per page; `opengraph-image`
route(s) for share previews. Targets SEO = 100 (Principle V / FR-013/014/017/018).

**Rationale**: Native Next.js capabilities, no extra deps, server-rendered and crawlable.

**Alternatives considered**: `next-seo` (largely redundant with the App Router Metadata API),
manual `<head>` tags (error-prone).

---

## 10. Analytics & monitoring

**Decision**: **Vercel Analytics + Speed Insights** (real-user CWV), **Google Analytics 4** (behavior/
conversion funnels), **Google Search Console** (indexing/search). GA loaded via `next/script`
`afterInteractive` / partytown-style deferral to protect TBT.

**Rationale**: Matches the requested monitoring stack; deferred loading protects performance budgets.

**Alternatives considered**: Heavier tag managers (perf cost), no analytics (can't measure SC outcomes).

---

## Open items intentionally deferred (not blocking)

- Exact Cal.com event link, WhatsApp number, Resend domain/API key, GA4 ID → environment/config values
  supplied at implementation (`.env` + `content/site.ts`), not architectural decisions.
- Final avatar GLB art and portfolio/testimonial copy → owner-provided content (per spec Assumptions).
