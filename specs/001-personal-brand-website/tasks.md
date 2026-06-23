---
description: "Task list for Personal Brand Website implementation"
---

# Tasks: Personal Brand Website for Muhammad Umaid Sadiq

**Input**: Design documents from `/specs/001-personal-brand-website/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

> **Implementation status (updated this run)** — The buildable foundation + primary
> pages are complete and the production build passes clean (11 static routes, lint +
> strict types green). `[X]` = done, `[~]` = partial (noted inline), `[ ]` = not started.
> Deferred by design: 3D avatar (premium static slot shipped with a clean upgrade seam),
> the automated test suite (Vitest/Playwright/axe/Lighthouse-CI), analytics wiring, and
> deploy. Real content/assets (portrait, portfolio media, logos, testimonials) pending
> from the owner.

**Tests**: INCLUDED per constitution Principle II — currently deferred to a dedicated
testing pass (Phase 9 group); app code is structured to be testable.

**Organization**: Tasks grouped by user story (US1–US6).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Initialize Next.js 15 app (App Router, TypeScript) at repo root with `package.json`, `app/`, `next.config.ts`, `tsconfig.json`
- [X] T002 [P] Install and configure Tailwind CSS v4; create `app/globals.css` with `@theme` entry
- [ ] T003 [P] ~~shadcn/ui init~~ — SKIPPED by design: hand-built brand-styled primitives in `components/ui/` to avoid templated shadcn look (see plan.md / review)
- [~] T004 [P] Animation/3D deps — gsap, framer-motion, lenis installed; **R3F/three deferred** with the 3D avatar
- [X] T005 [P] Install forms/email/validation deps (react-hook-form, zod, @hookform/resolvers, resend)
- [X] T006 [P] Configure ESLint + Prettier + `tsconfig` strict mode; add `lint`/`typecheck`/`format` scripts
- [ ] T007 [P] Set up testing toolchain (Vitest/RTL, Playwright, axe, Lighthouse CI) — deferred to testing pass
- [X] T008 [P] Create `.env.local.example` with all required env vars
- [X] T009 [P] Configure `next.config.ts` + `next/font` (Bricolage Grotesque, Geist, Geist Mono)

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T010 Define design tokens in `app/globals.css` (`@theme`) — bespoke palette (emerald #0B6E4F brand + signal #22C55E), type scale, spacing, motion, accessible green rule
- [X] T011 [P] Implement `lib/utils.ts` (cn, whatsappLink) and hooks (`use-reveal`, `use-reduced-motion`) — *capability-detection hook deferred with 3D*
- [X] T012 Implement Zod schemas in `lib/schemas.ts` per contracts (profile, capability, portfolioItem, trustSignal union, inquiry, conversionConfig)
- [X] T013 [P] Create typed content modules with load-time validation (site, profile, services, portfolio, trust)
- [X] T014 [P] Implement `lib/seo.ts` (metadata builder + Person/WebSite JSON-LD, canonical)
- [ ] T015 [P] Implement `lib/analytics.ts` (GA4 + Vercel Analytics/Speed Insights) — deferred to deploy phase
- [X] T016 Implement root layout `app/layout.tsx` (fonts, providers, Navbar, Footer, JSON-LD, skip-link)
- [X] T017 [P] Build `components/shared/navbar.tsx` (responsive, keyboard-operable, primary CTA)
- [X] T018 [P] Build `components/shared/footer.tsx` (nav, channels, location)
- [X] T019 [P] Build motion providers — `components/motion/smooth-scroll.tsx` (Lenis, reduced-motion safe) + `Reveal` + `ScrollProgress` signature; *GSAP scroll choreography deferred*
- [~] T020 [P] Base shared UI — `Button` (accessible emerald variants) + `PageHeader` + inline CTAs done; **dedicated StickyCTA component deferred** (T048)
- [X] T021 [P] Implement `app/sitemap.ts` and `app/robots.ts`
- [ ] T022 [P] Default `opengraph-image` + favicon/app-icon set — pending brand assets

**Checkpoint**: Foundation complete — build passes.

---

## Phase 3: User Story 1 - Signature first impression & avatar hero (P1) 🎯 MVP

- [ ] T023 [P] [US1] Component test for hero fallback + reduced-motion
- [ ] T024 [P] [US1] E2E test: hero loads, fallback path
- [ ] T025 [US1] `AvatarCanvas` client island (R3F, dynamic ssr:false) — **deferred (3D)**
- [ ] T026 [US1] `AvatarModel` (GLB via drei, idle float) — **deferred (3D)**
- [ ] T027 [US1] `useAvatarInteraction` (mouse parallax + scroll) — **deferred (3D)**
- [X] T028 [US1] Build `components/sections/hero.tsx` — premium hero, outcome headline, growth-line signature, CTAs, portrait slot
- [X] T029 [US1] Personal intro — philosophy band on home (`app/page.tsx`)
- [X] T030 [US1] Wire Hero into `app/page.tsx` (server-rendered LCP copy, static poster slot) + home metadata
- [ ] T031 [US1] Optimized avatar GLB + poster asset — pending owner asset

---

## Phase 4: User Story 2 - Portfolio as proof (P1)

- [ ] T032 [P] [US2] Component test for `WorkCard`
- [ ] T033 [P] [US2] E2E test: browse portfolio + categories
- [X] T034 [P] [US2] Build `components/shared/work-card.tsx` (outcome-framed, dimensioned media slot, hover)
- [X] T035 [US2] Build `components/sections/featured-work.tsx` (featured items) on home
- [X] T036 [US2] Build portfolio index `app/portfolio/page.tsx` + metadata
- [X] T037 [P] [US2] Build `app/portfolio/creative-designs/page.tsx` + metadata
- [X] T038 [P] [US2] Build `app/portfolio/video-content/page.tsx` + metadata
- [ ] T039 [US2] Per-item portfolio detail route (`/portfolio/[slug]`) — deferred (category pages shipped)
- [X] T040 [US2] Populate `content/portfolio.ts` (real structure; placeholder media)

---

## Phase 5: User Story 3 - Conversion ladder (P2)

- [ ] T041 [P] [US3] Unit test for `inquirySchema`
- [ ] T042 [US3] E2E test for full ladder
- [X] T043 [US3] Implement `app/actions/submit-inquiry.ts` Server Action (Zod re-validate, honeypot, Resend, typed result, dev fallback)
- [X] T044 [US3] Build `components/sections/contact-form.tsx` (RHF + zodResolver, states, errors, success, data preserved)
- [~] T045 [US3] Cal.com booking — wired as primary CTA links everywhere; **lazy embed component deferred**
- [X] T046 [US3] WhatsApp deep-link + email channels (footer + contact)
- [X] T047 [US3] Build `app/contact/page.tsx` (form + booking + channels)
- [ ] T048 [US3] Dedicated `StickyCTA` scroll behavior (show/hide over contact) — deferred
- [X] T049 [US3] Build `components/sections/final-cta.tsx` + on home

---

## Phase 6: User Story 4 - Integrated growth system (P2)

- [ ] T050 [P] [US4] Component test: 7 outcome-framed capabilities
- [X] T051 [US4] Build `components/sections/services.tsx` (7 offerings as one system) on home
- [X] T052 [US4] Populate `content/services.ts` (7 capabilities, outcomes)
- [ ] T053 [US4] Cross-link capabilities ↔ portfolio (`relatedPortfolio`) — serviceTags present; back-links deferred

---

## Phase 7: User Story 5 - Trust signals (P3)

- [ ] T054 [P] [US5] Component test: trust graceful with logos-only
- [X] T055 [US5] Build `components/sections/trust-bar.tsx` (logos + results, discriminated union, graceful)
- [X] T056 [P] [US5] Stat + logo rendering (inline in trust-bar; extract to standalone comps if reused)
- [X] T057 [US5] Populate `content/trust.ts` (logos + example results)

---

## Phase 8: User Story 6 - The human & process (P3)

- [ ] T058 [P] [US6] Component test: Timeline + Process
- [~] T059 [P] [US6] Experience timeline — rendered as process grid on About; dedicated `Timeline` component deferred
- [X] T060 [US6] About story sections (`app/about/page.tsx` — story, capabilities)
- [X] T061 [US6] Process section (honest numbered sequence on About)
- [X] T062 [US6] About page + home philosophy/AboutPreview band + metadata
- [X] T063 [US6] Populate `content/profile.ts`

---

## Phase 9: Polish & Cross-Cutting (NOT STARTED — next pass)

- [~] T064 [P] Per-page metadata/OG/Twitter/canonical/JSON-LD — implemented; OG images + validation pending
- [ ] T065 [P] Accessibility audit (axe) + keyboard/contrast verification
- [ ] T066 Lighthouse CI to budgets (Perf≥95/SEO100/A11y≥95/BP100)
- [ ] T067 [P] Cross-browser + responsive Playwright; zero console errors
- [ ] T068 [P] Performance hardening (dynamic imports, image/font, bundle analysis)
- [ ] T069 [P] Analytics wiring (GA4, Vercel) + conversion events
- [ ] T070 [P] README + content-editing guide
- [ ] T071 Vercel deployment + env vars + production smoke test

---

## Summary

- **Done (`[X]`)**: 33 tasks — full foundation, design system, layout, all primary pages, conversion form, SEO scaffolding, smooth-scroll signature.
- **Partial (`[~]`)**: 6 tasks — noted inline.
- **Deferred (`[ ]`)**: 3D avatar, test suite, analytics, OG assets, deploy, per-item routes.
- **Build**: ✅ `npm run build` passes — 11 static routes, lint + strict types clean.
