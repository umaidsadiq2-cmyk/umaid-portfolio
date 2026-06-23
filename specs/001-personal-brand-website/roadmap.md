# Project Execution Roadmap: Personal Brand Website for Muhammad Umaid Sadiq

**Feature**: 001-personal-brand-website | **Date**: 2026-06-19
**Source artifacts**: [spec.md](./spec.md) · [plan.md](./plan.md) · [research.md](./research.md) ·
[data-model.md](./data-model.md) · [contracts/](./contracts/) · [tasks.md](./tasks.md)

A phase-ordered, dependency-aware build roadmap from foundation to launch. This complements the
user-story-organized [tasks.md](./tasks.md); IDs cross-reference it where relevant.

## Legend

- **Type**: Architecture · Design · Development · Animation · SEO · Performance · Testing · Deployment
- **Priority**: `P0` critical/blocking · `P1` high-impact · `P2` important · `P3` nice-to-have
- **Parallel**: ⚡ = can run alongside sibling tasks once dependencies are met
- **Stack** (from plan.md): Next.js 15 (App Router) · TypeScript strict · Tailwind v4 + shadcn/ui ·
  GSAP + Framer Motion + Lenis · React Three Fiber · React Hook Form + Zod · Resend · Cal.com · Vercel
- **Hard constraints**: Lighthouse Perf ≥95 / SEO 100 / A11y ≥95 / Best Practices 100 (must hold with the
  3D avatar active); light premium-minimal palette (green `#22C55E` decorative; green-700+ for text/
  buttons per WCAG AA).

---

## Phase 1 — Project Foundation

**Goal**: A typed, tokenized, production-grade foundation. **Exit gate**: app boots, lint/typecheck pass,
design tokens consumable.

### 1.1 Project setup
- **Type**: Architecture · **Priority**: P0 · **Parallel**: no (root task)
- **Description**: Initialize Next.js 15 (App Router, TypeScript) at repo root; create base `app/` with
  root layout + home placeholder; configure `next.config.ts` and `next/font`.
- **Dependencies**: none
- **Acceptance Criteria**: `npm run dev` serves `/` with no errors; `npm run build` succeeds; TypeScript
  `strict: true` enabled; Node 20 engine pinned.

### 1.2 Architecture setup
- **Type**: Architecture · **Priority**: P0 · **Parallel**: no (depends 1.1)
- **Description**: Establish folder structure (`app/`, `components/{ui,shared,sections,avatar,motion}`,
  `content/`, `lib/`, `hooks/`, `public/`, `tests/`) and TS path aliases (`@/*`).
- **Dependencies**: 1.1
- **Acceptance Criteria**: All directories exist with index placeholders; `@/` imports resolve in build
  and editor; structure matches plan.md "Source Code" tree.

### 1.3 Tooling & quality gates
- **Type**: Architecture · **Priority**: P0 · **Parallel**: ⚡ (with 1.4–1.7 after 1.2)
- **Description**: Configure ESLint + Prettier + strict tsconfig; add `lint`, `typecheck`, `format`,
  `test`, `test:e2e`, `test:a11y`, `lighthouse` scripts; scaffold Vitest/Playwright/axe/Lighthouse-CI
  configs.
- **Dependencies**: 1.2
- **Acceptance Criteria**: `npm run lint` and `npm run typecheck` exit 0 on a clean tree; test runners
  execute an example test; CI-ready scripts present.

### 1.4 Design system setup
- **Type**: Design · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Install/configure Tailwind CSS v4; initialize shadcn/ui (`components.json`,
  `components/ui/`) bound to project tokens.
- **Dependencies**: 1.2
- **Acceptance Criteria**: A sample shadcn `Button` renders with project tokens; Tailwind v4 `@theme`
  active; no default-template styling remains.

### 1.5 Color system
- **Type**: Design · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Define the palette as tokens: backgrounds `#FFFFFF`/`#FAFAFA`/`#F5F5F5`, full green
  scale with `--accent` (#22C55E, decorative) and `--accent-strong` (green-700+, text/buttons), neutral
  text near-black.
- **Dependencies**: 1.4
- **Acceptance Criteria**: Tokens available as Tailwind utilities + CSS vars; documented usage rule
  (green-500 decorative only); `--accent-strong` on white passes WCAG AA (≥4.5:1 text / ≥3:1 large).

### 1.6 Typography system
- **Type**: Design · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Load a premium variable display font + clean body font via `next/font`; define a
  modular type scale + weights as tokens.
- **Dependencies**: 1.4
- **Acceptance Criteria**: Fonts self-hosted via `next/font` with zero CLS (no FOUT/FOIT); type scale
  utilities applied consistently; headings/body distinct and responsive.

### 1.7 Global styles
- **Type**: Design · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Author `app/globals.css` (`@theme` tokens, base resets, focus-visible styles, motion
  duration/easing tokens, container defaults).
- **Dependencies**: 1.5, 1.6
- **Acceptance Criteria**: Global base renders consistently; visible focus styles present on all
  interactive defaults; motion tokens referenced by later animation work.

### 1.8 Content & schema layer
- **Type**: Architecture · **Priority**: P0 · **Parallel**: ⚡ (after 1.2)
- **Description**: Implement Zod schemas in `lib/schemas.ts` (profile, capability, portfolioItem,
  trustSignal union, inquiry, conversionConfig) per [contracts/content-schemas.md](./contracts/content-schemas.md);
  scaffold `content/*` modules that validate at load.
- **Dependencies**: 1.2
- **Acceptance Criteria**: Importing invalid content throws at build; `z.infer` types exported and used by
  consumers; the 7 capability slugs enforced.

---

## Phase 2 — Core Layout

**Goal**: Consistent shell + reusable primitives. **Exit gate**: every page can mount inside a responsive,
accessible layout.

### 2.1 App layout
- **Type**: Development · **Priority**: P0 · **Parallel**: no (depends Phase 1)
- **Description**: Build `app/layout.tsx` — fonts, providers, Navbar, Footer, default metadata, JSON-LD
  slot, skip-to-content link.
- **Dependencies**: 1.7, 1.8
- **Acceptance Criteria**: Layout wraps all routes; skip link works; lang/meta defaults present; no
  hydration warnings.

### 2.2 Navigation (Navbar)
- **Type**: Development · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Responsive Navbar from `content/site.ts` nav; mobile menu; primary CTA button.
- **Dependencies**: 2.1, 1.8
- **Acceptance Criteria**: Keyboard-operable (tab/enter/esc), visible focus, `aria-current` on active
  route, mobile menu accessible, primary CTA present on all viewports.

### 2.3 Footer
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Footer with nav, socials, contact channels (email/WhatsApp), copyright.
- **Dependencies**: 2.1, 1.8
- **Acceptance Criteria**: Links resolve; channels pull from config; responsive; semantic `<footer>`.

### 2.4 Shared UI components
- **Type**: Development/Design · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Build `Button` (accessible green variants via `--accent-strong`), `SectionHeading`,
  `CTASection`, card primitives.
- **Dependencies**: 1.5, 1.4
- **Acceptance Criteria**: Components documented props, reused across ≥2 pages, all variants pass contrast,
  no duplicated styles.

### 2.5 Responsive framework
- **Type**: Development/Design · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Establish breakpoint scale, container widths, and fluid spacing utilities; mobile-first
  conventions.
- **Dependencies**: 1.7
- **Acceptance Criteria**: Layout holds 320px → ultra-wide with no overflow/breakage; spacing scale
  applied consistently.

### 2.6 Sticky CTA shell
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Build `StickyCTA` shell (behavior wired later in 6.6); reduced-motion safe.
- **Dependencies**: 2.4
- **Acceptance Criteria**: Renders, dismissable/focusable, no layout shift, hidden by default until wired.

---

## Phase 3 — Homepage Experience

**Goal**: The narrative homepage (Hook→Proof→Evidence→Capability→Human→Invitation). **Exit gate**: home
tells the full story and routes to conversion. **High-impact — prioritize after foundation.**

### 3.1 Hero section
- **Type**: Development · **Priority**: P0 · **Parallel**: no (anchor)
- **Description**: Build `sections/Hero` — outcome-led copy, primary CTA, avatar mount point; server-
  rendered LCP copy.
- **Dependencies**: 2.1, 2.4
- **Acceptance Criteria**: Identity + outcome legible in first viewport (mobile+desktop); CTA visible;
  hero copy is the LCP element and not blocked by JS.

### 3.2 Avatar integration
- **Type**: Development · **Priority**: P0 · **Parallel**: ⚡ (with 3.3–3.7)
- **Description**: Build `avatar/AvatarCanvas` client island (`next/dynamic ssr:false`, Suspense poster,
  IntersectionObserver mount) + `AvatarModel` (GLB via drei); reusable `variant` prop. (Motion polish in
  Phase 7.)
- **Dependencies**: 3.1, 1.8
- **Acceptance Criteria**: Avatar renders for capable devices; static poster shows during load and under
  reduced-motion/low-power; no main-thread block to LCP; GLB ≤~1.5MB.

### 3.3 Introduction section
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Build `sections/PersonalIntro` from `content/profile.ts`.
- **Dependencies**: 3.1, 1.8
- **Acceptance Criteria**: Renders profile intro; responsive; semantic headings.

### 3.4 Services (Growth System) section
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Build `sections/GrowthSystem` — 7 offerings as ONE system, each outcome-framed; CTA.
- **Dependencies**: 2.4, 1.8
- **Acceptance Criteria**: Exactly 7 capabilities, each shows a non-empty business outcome; framed as a
  system; next-step CTA present.

### 3.5 Achievements section
- **Type**: Development · **Priority**: P2 · **Parallel**: ⚡
- **Description**: Build `sections/Achievements` (logo wall + stat cards; testimonial/result slots ready).
- **Dependencies**: 2.4, 1.8
- **Acceptance Criteria**: Logos render responsively; section intact with logos-only (no sparse state);
  testimonial/result types render when present.

### 3.6 Portfolio preview
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡ (needs 4.1)
- **Description**: Build `sections/PortfolioPreview` featuring `featured` items via PortfolioCard.
- **Dependencies**: 4.1, 1.8
- **Acceptance Criteria**: Featured items render with outcome framing; links to full portfolio; no CLS.

### 3.7 CTA sections
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Build `sections/FinalCTA` and intermediate CTAs reusing `CTASection`.
- **Dependencies**: 2.4
- **Acceptance Criteria**: Clear path to booking from mid- and end-of-page; consistent styling.

### 3.8 Homepage assembly
- **Type**: Development · **Priority**: P0 · **Parallel**: no (integrates 3.x)
- **Description**: Compose `app/page.tsx` with all sections in narrative order + home metadata.
- **Dependencies**: 3.1–3.7
- **Acceptance Criteria**: Full narrative flows top-to-bottom; one `<h1>`; no console errors; metadata set.

---

## Phase 4 — Portfolio

**Goal**: Outcome-framed proof across categories. **Exit gate**: portfolio browsable with detail views.

### 4.1 Portfolio card system
- **Type**: Development · **Priority**: P0 · **Parallel**: no (shared dependency)
- **Description**: Build `shared/PortfolioCard` (`next/image` with width/height + alt, hover micro-
  interaction).
- **Dependencies**: 2.4, 1.8
- **Acceptance Criteria**: Reused by preview + all portfolio pages; images have dimensions (no CLS) and
  alt text; keyboard-focusable.

### 4.2 Portfolio landing page
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Build `app/portfolio/page.tsx` (categorized grid) + metadata.
- **Dependencies**: 4.1
- **Acceptance Criteria**: Lists items across categories; range perceivable; links to category + detail.

### 4.3 Creative Designs page
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Build `app/portfolio/creative-designs/page.tsx` + metadata.
- **Dependencies**: 4.1
- **Acceptance Criteria**: Shows only `creative-design` items; responsive gallery; no CLS.

### 4.4 Video Content page
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Build `app/portfolio/video-content/page.tsx` with lazy video + poster.
- **Dependencies**: 4.1
- **Acceptance Criteria**: Videos lazy-load with poster; no autoplay-with-sound; no CLS; accessible
  controls.

### 4.5 Portfolio detail view
- **Type**: Development · **Priority**: P1 · **Parallel**: no (after 4.2)
- **Description**: Build item detail (challenge → delivered → result + media gallery) with contextual CTA;
  per-item metadata.
- **Dependencies**: 4.2
- **Acceptance Criteria**: Each item shows challenge/delivered (+result if present); media has alt; CTA to
  contact present; unique metadata.

### 4.6 Portfolio content population
- **Type**: Development (Content) · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Populate `content/portfolio.ts` with real items, optimized media, serviceTags cross-
  links.
- **Dependencies**: 1.8
- **Acceptance Criteria**: ≥ enough items to show range; all validate against schema; serviceTags map to
  capability slugs.

---

## Phase 5 — About

**Goal**: The human + process that reduce risk. **Exit gate**: `/about` complete and credible.

### 5.1 Storytelling layout
- **Type**: Development · **Priority**: P2 · **Parallel**: no (anchor)
- **Description**: Build About story sections (Story, with reusable inline avatar variant).
- **Dependencies**: 3.2, 1.8
- **Acceptance Criteria**: Coherent narrative; avatar reused (inline); responsive; semantic structure.

### 5.2 Experience timeline
- **Type**: Development · **Priority**: P2 · **Parallel**: ⚡
- **Description**: Build `shared/Timeline` (accessible, ordered).
- **Dependencies**: 2.4, 1.8
- **Acceptance Criteria**: Ordered steps render; screen-reader friendly list semantics; responsive.

### 5.3 Skills section
- **Type**: Development · **Priority**: P2 · **Parallel**: ⚡
- **Description**: Build Skills/Expertise section from `content/profile.ts`.
- **Dependencies**: 1.8
- **Acceptance Criteria**: Expertise rendered; consistent with design system.

### 5.4 Philosophy & Process
- **Type**: Development · **Priority**: P2 · **Parallel**: ⚡
- **Description**: Build Philosophy + `sections/Process` (steps that reduce perceived risk).
- **Dependencies**: 1.8
- **Acceptance Criteria**: Process steps ordered + clear; communicates what to expect before contact.

### 5.5 About CTA
- **Type**: Development · **Priority**: P2 · **Parallel**: ⚡
- **Description**: Add CTA section to About + `sections/AboutPreview` on home.
- **Dependencies**: 3.7
- **Acceptance Criteria**: CTA routes to booking; AboutPreview links to `/about`.

### 5.6 Profile content population
- **Type**: Development (Content) · **Priority**: P2 · **Parallel**: ⚡
- **Description**: Populate `content/profile.ts` (bio, philosophy, process, expertise, avatar refs,
  socials).
- **Dependencies**: 1.8
- **Acceptance Criteria**: Validates against schema; powers hero/intro/about/process.

### 5.7 About page assembly
- **Type**: Development · **Priority**: P2 · **Parallel**: no
- **Description**: Compose `app/about/page.tsx` + metadata.
- **Dependencies**: 5.1–5.6
- **Acceptance Criteria**: Full about flows; one `<h1>`; metadata set; no console errors.

---

## Phase 6 — Contact

**Goal**: The conversion ladder (book / message / form). **Exit gate**: all three paths work + sticky CTA.
**High business impact — do not defer.**

### 6.1 Contact page layout
- **Type**: Development · **Priority**: P1 · **Parallel**: no (anchor)
- **Description**: Build `app/contact/page.tsx` shell (booking + form + channels regions) + metadata.
- **Dependencies**: 2.1
- **Acceptance Criteria**: Layout responsive; regions present; metadata set.

### 6.2 Contact form
- **Type**: Development · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Build `sections/ContactForm` (React Hook Form + `zodResolver(inquirySchema)`; states
  idle→submitting→success/error; honeypot field).
- **Dependencies**: 1.8, 6.1
- **Acceptance Criteria**: Invalid input shows specific inline errors and blocks submit; valid input
  submits; data preserved on failure; honeypot hidden from a11y tree.

### 6.3 Server action + Resend
- **Type**: Development/Architecture · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Implement `app/actions/submit-inquiry.ts` (server re-validate, honeypot, rate-limit,
  Resend send, typed `InquiryResult`) per [contracts/conversion-contracts.md](./contracts/conversion-contracts.md).
- **Dependencies**: 1.8
- **Acceptance Criteria**: Server rejects invalid/spam; sends email on valid; returns typed result;
  secrets only via env; rate-limit enforced.

### 6.4 Cal.com booking integration
- **Type**: Development · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Build `shared/BookingCta` (lazy popup + inline embed) wired to `bookingUrl`; direct-link
  fallback.
- **Dependencies**: 1.8, 2.4
- **Acceptance Criteria**: Booking opens from Navbar/Hero/sticky/contact; confirms a slot; lazy-loaded (no
  perf hit on initial load); fallback link works if embed fails.

### 6.5 Contact information + WhatsApp
- **Type**: Development · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Build `shared/ContactChannels` (WhatsApp `wa.me` deep link + email) from config.
- **Dependencies**: 1.8
- **Acceptance Criteria**: WhatsApp opens with prefilled text; email link works; descriptive link text;
  `rel="noopener"`.

### 6.6 Contact CTA + sticky wiring
- **Type**: Development · **Priority**: P1 · **Parallel**: no (after 2.6, 6.4)
- **Description**: Wire `StickyCTA` behavior (show on full-length scroll; hide over inline booking/contact).
- **Dependencies**: 2.6, 6.4
- **Acceptance Criteria**: Sticky CTA visible on long scroll, hidden over contact/booking region, reduced-
  motion safe, keyboard reachable.

---

## Phase 7 — Motion & Interaction Design

**Goal**: Cinematic, purposeful motion that never breaks the budget. **Exit gate**: motion polished +
reduced-motion verified. **Layer onto built sections — depends on Phases 2–6.**

### 7.1 Smooth scrolling
- **Type**: Animation · **Priority**: P1 · **Parallel**: no (foundation for 7.2)
- **Description**: Add Lenis provider in `components/motion`, synced for GSAP.
- **Dependencies**: 2.1
- **Acceptance Criteria**: Smooth scroll active; disabled under reduced-motion; no scroll-jank or input
  latency regressions.

### 7.2 Scroll animations
- **Type**: Animation · **Priority**: P1 · **Parallel**: ⚡
- **Description**: GSAP ScrollTrigger reveals/storytelling via reusable `Reveal` wrapper across sections.
- **Dependencies**: 7.1, 3.8
- **Acceptance Criteria**: Reveals fire correctly; end-states snap under reduced-motion; no CLS; INP ≤200ms.

### 7.3 Page transitions
- **Type**: Animation · **Priority**: P2 · **Parallel**: ⚡
- **Description**: Framer Motion route/page transitions.
- **Dependencies**: 2.1
- **Acceptance Criteria**: Transitions smooth across routes; respect reduced-motion; no flash/layout jump.

### 7.4 Hover interactions
- **Type**: Animation · **Priority**: P2 · **Parallel**: ⚡
- **Description**: Consistent hover/focus states for cards, buttons, links.
- **Dependencies**: 2.4, 4.1
- **Acceptance Criteria**: Hover + keyboard-focus parity; consistent across components; touch devices
  unaffected.

### 7.5 Avatar animations
- **Type**: Animation · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Implement `useAvatarInteraction` (idle float, damped mouse parallax, scroll-driven pose)
  with capability + reduced-motion gating.
- **Dependencies**: 3.2
- **Acceptance Criteria**: Avatar floats/responds smoothly on capable devices; static poster otherwise;
  frame rate stable; no jank on mid-tier mobile.

### 7.6 Micro-interactions
- **Type**: Animation · **Priority**: P3 · **Parallel**: ⚡
- **Description**: Subtle feedback (button press, form state, CTA emphasis).
- **Dependencies**: 2.4
- **Acceptance Criteria**: Micro-interactions enhance, never distract; reduced-motion safe.

### 7.7 Reduced-motion & perf gating
- **Type**: Animation/Performance · **Priority**: P0 · **Parallel**: no (audit)
- **Description**: Audit all motion for `prefers-reduced-motion`, capability detection, and dynamic
  import.
- **Dependencies**: 7.1–7.6
- **Acceptance Criteria**: With reduced-motion ON, experience is coherent + static; Lighthouse budgets
  hold with motion ON (verified in 9.5/10.5).

---

## Phase 8 — SEO

**Goal**: SEO score 100, rich shareable links. **Exit gate**: all routes fully optimized + crawlable.
**Parallelizable with development — apply per page as built.**

### 8.1 Metadata
- **Type**: SEO · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Per-route `title`/`description` via Next Metadata API + `lib/seo.ts` builder.
- **Dependencies**: 1.8
- **Acceptance Criteria**: Every route has unique title + description; no missing/duplicate metas.

### 8.2 Open Graph
- **Type**: SEO · **Priority**: P1 · **Parallel**: ⚡
- **Description**: OG tags + `opengraph-image` per route/default.
- **Dependencies**: 8.1
- **Acceptance Criteria**: OG preview renders correctly in a debugger for every route.

### 8.3 Twitter Cards
- **Type**: SEO · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Twitter card tags (summary_large_image).
- **Dependencies**: 8.1
- **Acceptance Criteria**: Twitter validator shows correct card per route.

### 8.4 Sitemap
- **Type**: SEO · **Priority**: P1 · **Parallel**: ⚡
- **Description**: `app/sitemap.ts` generating all routes.
- **Dependencies**: route list (Phases 3–6)
- **Acceptance Criteria**: `/sitemap.xml` lists all public routes with correct canonical URLs.

### 8.5 Robots.txt
- **Type**: SEO · **Priority**: P1 · **Parallel**: ⚡
- **Description**: `app/robots.ts` with sitemap reference.
- **Dependencies**: 8.4
- **Acceptance Criteria**: `/robots.txt` resolves, allows crawl, references sitemap.

### 8.6 Structured data
- **Type**: SEO · **Priority**: P1 · **Parallel**: ⚡
- **Description**: JSON-LD (Person, WebSite, BreadcrumbList) via `lib/seo.ts`.
- **Dependencies**: 8.1
- **Acceptance Criteria**: Passes Rich Results test with no errors; Person describes Umaid.

### 8.7 Canonical URLs
- **Type**: SEO · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Canonical per route from `NEXT_PUBLIC_SITE_URL`.
- **Dependencies**: 8.1
- **Acceptance Criteria**: Each route emits a correct self-canonical; no duplicate-content ambiguity.

---

## Phase 9 — Performance Optimization

**Goal**: Lighthouse Perf ≥95 with the 3D avatar active. **Exit gate**: budgets met on all pages.

### 9.1 Image optimization
- **Type**: Performance · **Priority**: P0 · **Parallel**: ⚡
- **Description**: `next/image` everywhere, modern formats, responsive sizes, below-fold lazy, explicit
  dimensions.
- **Dependencies**: 4.1, 3.8
- **Acceptance Criteria**: No raw `<img>` for content; CLS ≤0.1; images served in AVIF/WebP at correct
  sizes.

### 9.2 Font optimization
- **Type**: Performance · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Subset/preload via `next/font`; `font-display: swap`/optional.
- **Dependencies**: 1.6
- **Acceptance Criteria**: No layout shift from fonts; fonts self-hosted; no render-blocking font CSS.

### 9.3 Bundle optimization
- **Type**: Performance · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Audit `"use client"` usage; keep Server Components default; tree-shake; run bundle
  analyzer; isolate 3D/animation chunks.
- **Dependencies**: Phases 3–7
- **Acceptance Criteria**: Initial JS minimized; 3D/GSAP not in the initial route bundle; TBT within
  budget.

### 9.4 Lazy loading
- **Type**: Performance · **Priority**: P0 · **Parallel**: ⚡
- **Description**: `next/dynamic` for avatar/booking/heavy media; defer below-fold; IntersectionObserver
  mounts.
- **Dependencies**: 3.2, 6.4, 4.4
- **Acceptance Criteria**: Avatar/booking/video load only when needed; initial payload excludes them.

### 9.5 Lighthouse improvements
- **Type**: Performance · **Priority**: P0 · **Parallel**: no (integration)
- **Description**: Run Lighthouse CI; resolve flagged issues until budgets met with hero/motion active.
- **Dependencies**: 9.1–9.4, 7.7
- **Acceptance Criteria**: Perf ≥95, Best Practices 100 on all pages (mobile profile) in CI; LCP ≤2.5s,
  CLS ≤0.1, INP ≤200ms.

---

## Phase 10 — Quality Assurance

**Goal**: Verified across devices, a11y, perf, SEO, browsers. **Exit gate**: all checks green on prod
build.

### 10.1 Mobile testing
- **Type**: Testing · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Playwright + manual on mobile (incl. 320px); verify conversion ladder.
- **Dependencies**: Phases 3–9
- **Acceptance Criteria**: No layout breakage/overflow; all CTAs reachable; forms usable on touch.

### 10.2 Tablet testing
- **Type**: Testing · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Verify tablet breakpoints/orientation.
- **Dependencies**: Phases 3–9
- **Acceptance Criteria**: Layouts adapt correctly portrait + landscape; no broken grids.

### 10.3 Desktop testing
- **Type**: Testing · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Verify desktop + ultra-wide.
- **Dependencies**: Phases 3–9
- **Acceptance Criteria**: Content constrained/centered correctly; no excessive line lengths; hero scales.

### 10.4 Accessibility testing
- **Type**: Testing · **Priority**: P0 · **Parallel**: ⚡
- **Description**: axe on every page; keyboard-only pass (incl. hero + all conversion paths); contrast
  verification.
- **Dependencies**: Phases 3–7
- **Acceptance Criteria**: No critical axe violations; full keyboard operability + visible focus; green
  used per contrast rule; A11y score ≥95.

### 10.5 Performance testing
- **Type**: Testing · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Lighthouse on prod build across pages; throttled mobile.
- **Dependencies**: 9.5
- **Acceptance Criteria**: Perf ≥95 on all pages with avatar active; Core Web Vitals in range.

### 10.6 SEO validation
- **Type**: Testing · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Validate metadata/OG/Twitter/JSON-LD/sitemap/robots/canonical.
- **Dependencies**: Phase 8
- **Acceptance Criteria**: SEO score 100; Rich Results valid; sitemap/robots resolve; OG/Twitter previews
  correct.

### 10.7 Cross-browser & console hygiene
- **Type**: Testing · **Priority**: P0 · **Parallel**: ⚡
- **Description**: Playwright across Chromium/Firefox/WebKit; assert zero console errors/warnings.
- **Dependencies**: Phases 3–9
- **Acceptance Criteria**: Functions on latest 2 versions of major browsers; zero console errors across
  the journey.

---

## Phase 11 — Deployment

**Goal**: Live, monitored, validated in production. **Exit gate**: site launched + smoke-tested.

### 11.1 Production build
- **Type**: Deployment · **Priority**: P0 · **Parallel**: no
- **Description**: `npm run build`; ensure all gates (lint/typecheck/test/e2e/a11y/lighthouse) pass in CI.
- **Dependencies**: Phase 10
- **Acceptance Criteria**: Clean production build; CI gate green; no type/lint errors.

### 11.2 Vercel deployment
- **Type**: Deployment · **Priority**: P0 · **Parallel**: no
- **Description**: Configure Vercel project, env vars, domain; deploy.
- **Dependencies**: 11.1
- **Acceptance Criteria**: Site live on production domain over HTTPS; env vars set; preview→prod flow
  working.

### 11.3 Analytics setup
- **Type**: Deployment · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Enable Vercel Analytics + Speed Insights; wire GA4 (deferred load).
- **Dependencies**: 11.2
- **Acceptance Criteria**: Real-user CWV reporting active; GA4 receives pageviews + conversion events;
  no TBT regression.

### 11.4 Search Console setup
- **Type**: Deployment · **Priority**: P1 · **Parallel**: ⚡
- **Description**: Verify domain in Google Search Console; submit sitemap.
- **Dependencies**: 11.2, 8.4
- **Acceptance Criteria**: Property verified; sitemap submitted + accepted; no major coverage errors.

### 11.5 Production smoke test
- **Type**: Deployment/Testing · **Priority**: P0 · **Parallel**: no
- **Description**: Run the [quickstart.md](./quickstart.md) validation scenarios against production.
- **Dependencies**: 11.2
- **Acceptance Criteria**: All 18 quickstart scenarios pass on prod; booking/WhatsApp/form deliver to
  Umaid; metadata/sitemap/robots resolve.

---

## Critical Path & Sequencing

**Critical path (must be sequential):**
`1.1 → 1.2 → (1.5/1.6 → 1.7) → 1.8 → 2.1 → 3.1 → 3.2 → 3.8 → 4.1 → 6.2/6.3/6.4 → 7.7 → 9.5 → 10.x →
11.1 → 11.2 → 11.5`

**High-impact-first ordering:** Foundation (P1) → Homepage hero + avatar (3.1/3.2) → Portfolio cards
(4.1) → Conversion ladder (6.2–6.4) → then breadth (services/about/trust) → motion polish → perf → QA →
launch.

**Biggest parallelization wins:**
- Phase 1: 1.3–1.8 in parallel after 1.2.
- Phases 3–6 sections in parallel once Phase 2 done (different files).
- Phase 8 (SEO) applied per-page in parallel with development.
- Phase 9 perf tasks 9.1–9.4 in parallel before the 9.5 integration gate.
- Phase 10 device/browser tests in parallel.

**Cross-cutting guardrails (apply continuously, not just in QA):**
- Performance budget is a *merge gate*, not a final step — keep the avatar/motion as lazy islands from
  3.2 onward.
- Accessibility (green contrast, keyboard, semantics) is built in per component, validated in 10.4.
- Every new route ships with its SEO metadata (Phase 8) at creation time.

**MVP cut for earliest demo:** Phases 1–2 + tasks 3.1, 3.2, 3.8, 4.1, 4.2 (stunning entrance + browsable
proof). Add Phase 6 (conversion) for the first lead-generating release.
