# Implementation Plan: Personal Brand Website for Muhammad Umaid Sadiq

**Branch**: `001-personal-brand-website` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-personal-brand-website/spec.md`

## Summary

Build a world-class, conversion-focused personal brand website that is itself the proof of Umaid's
expertise. The experience follows a deliberate narrative arc (Hook → Proof → Evidence → Capability →
Human → Process → Invitation), anchored by an interactive 3D avatar "brand mascot" and routed toward a
single primary conversion: booking a consultation, with instant-message and form fallbacks.

Technical approach: a single Next.js 15 (App Router) application in TypeScript, Server Components by
default, with islands of client interactivity (avatar, animations, forms). Static typed content modules
(CMS-ready) feed all sections. Animation is layered — GSAP + Lenis for scroll storytelling, Framer Motion
for micro-interactions, React Three Fiber for the avatar — all gated behind dynamic imports, capability
detection, and `prefers-reduced-motion` so the constitution's performance budgets (Lighthouse 95/100/95/
100) are never sacrificed for spectacle. Deployed on Vercel.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict` mode), Node.js 20 LTS, React 19

**Primary Dependencies**:
- Framework: Next.js 15 (App Router, Server Components)
- Styling/Design System: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- Animation: GSAP (+ ScrollTrigger), Framer Motion, Lenis (smooth scroll)
- 3D: React Three Fiber + drei + Three.js (avatar only, client-island, lazy)
- Forms/Validation: React Hook Form + Zod (shared schemas client + server)
- Email/Lead delivery: Resend via Next.js Server Actions
- Booking: Cal.com embed (primary CTA) — see research.md for rationale vs Calendly
- Instant message: WhatsApp deep link (`wa.me`)
- Analytics: Vercel Analytics + Vercel Speed Insights; Google Analytics 4; Google Search Console

**Storage**: No database in v1. Content lives as typed TypeScript/MDX modules under `content/`, validated
by Zod schemas — structured so a headless CMS can replace the source later without changing consumers.

**Testing**: Vitest + React Testing Library (unit/component), Playwright (cross-browser E2E + responsive),
axe-core/`@axe-core/playwright` (accessibility), Lighthouse CI (performance/SEO/best-practices budgets in
CI). ESLint + Prettier + `tsc --noEmit` as static gates.

**Target Platform**: Modern evergreen browsers (latest 2 of Chrome, Firefox, Safari, Edge), desktop +
mobile + tablet; mobile-first. Hosted on Vercel (global CDN, edge).

**Project Type**: Web application — single Next.js project (frontend-only with server actions; no separate
backend service).

**Performance Goals**: Lighthouse (mobile, mid-tier profile) Performance ≥95, SEO = 100, Accessibility
≥95, Best Practices = 100. Core Web Vitals: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms. First-meaningful hero within
~2.5s; primary-conversion reachable in <60s (SC-001..003).

**Constraints**:
- Interactive 3D avatar + scroll animation MUST NOT regress performance budgets → strict client-island
  isolation, dynamic import, lazy/Suspense, capability + reduced-motion gating, lightweight optimized GLB.
- Minimal client JS: Server Components by default; `"use client"` only for interactive islands.
- Light/premium-minimal palette (white 70% / off-white 20% / green accent 10%) with WCAG 2.1 AA contrast —
  constrains where the green accent (#22C55E) may be used (see Constitution Check VI + research.md).
- No secrets in client bundle; all keys server-side via env vars.

**Scale/Scope**: ~6 routes (Home, Portfolio index, Portfolio/Creative Designs, Portfolio/Video Content,
About, Contact), ~12 shared + ~8 page-specific components, single audience tier, static content, single
locale (English). Architecture future-ready for blog, case studies, and service pages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against constitution v2.1.0.

| # | Principle | Status | How this plan satisfies it / action |
|---|-----------|--------|-------------------------------------|
| I | Code Quality | ✅ PASS | TS `strict`, ESLint + Prettier + `tsc` gates, reusable component layers (`ui` / `shared` / `sections`), documented naming conventions, no dead code. |
| II | Testing Standards | ✅ PASS | Vitest+RTL, Playwright cross-browser + responsive, axe-core a11y, Lighthouse CI perf gate, zero-console-error check in E2E. |
| III | UX Consistency | ✅ PASS | Single design-token source (Tailwind v4 `@theme` + CSS vars) for spacing/type/color/motion; shadcn primitives; shared layout components. |
| IV | Performance | ⚠️ PASS w/ constraints | 3D + animation are the risk. Mitigated: RSC default, avatar as lazy client island, dynamic imports, Suspense, capability/reduced-motion gating, optimized GLB, `next/image` + `next/font`, Lighthouse CI as merge gate. Recorded in Complexity Tracking. |
| V | SEO Standards | ✅ PASS | Next Metadata API (dynamic per route), OG + Twitter cards, `sitemap.ts`, `robots.ts`, JSON-LD (Person/WebSite), canonical URLs, semantic HTML. |
| VI | Accessibility | ⚠️ PASS w/ constraints | WCAG 2.1 AA via Radix/shadcn, keyboard + focus, semantic markup, axe gate. **Constraint**: #22C55E fails AA for text/white-on-green; accessible action color uses a darker green (green-700+) or dark text — green-500 reserved for large/decorative accents. Avatar/animation have a11y fallbacks. |
| VII | Design Principles | ✅ PASS | Resolved in constitution v2.1.0 — Principle VII's visual language is now **light premium-minimal** (white-dominant + green accent `#22C55E`), matching this plan. All Principle VII tenets (premium-first, cinematic, avatar-driven, mobile-first, purposeful motion, minimal-but-impactful) are upheld. |
| VIII | Scalability | ✅ PASS | Typed `content/` modules with Zod schemas, CMS-swappable; route + component structure ready for blog/case-studies/services without redesign. |
| IX | Security | ✅ PASS | Zod validation on all input (client + server action), no secrets client-side, env vars for Resend/Cal keys, honeypot + rate-limit on form. |

**Gate result**: PASS. The prior palette deviation (VII) was resolved by amending the constitution to
v2.1.0. Two engineered constraints (IV performance with 3D, VI green-accent contrast) remain documented
in Complexity Tracking. No unjustified violations block planning.

## Project Structure

### Documentation (this feature)

```text
specs/001-personal-brand-website/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (content + form/booking contracts)
│   ├── content-schemas.md
│   └── conversion-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

Single Next.js App Router project at the repo root:

```text
app/
├── layout.tsx                      # Root layout: fonts, providers, Navbar/Footer, JSON-LD
├── page.tsx                        # Home (Hook→Proof→Evidence→Capability→Human→Invitation)
├── portfolio/
│   ├── page.tsx                    # Portfolio index (Proof)
│   ├── creative-designs/page.tsx   # Creative designs gallery
│   └── video-content/page.tsx      # Video content gallery
├── about/page.tsx                  # Story / Experience / Skills / Philosophy / Process (Human)
├── contact/page.tsx                # Conversion ladder (Invitation)
├── actions/                        # Server Actions (submit-inquiry.ts)
├── sitemap.ts                      # SEO: sitemap
├── robots.ts                       # SEO: robots
├── opengraph-image.tsx             # Default OG image
└── globals.css                     # Tailwind v4 entry + design tokens (@theme)

components/
├── ui/                             # shadcn/ui primitives (button, input, form, ...)
├── shared/                         # Navbar, Footer, CTASection, StickyCTA, PortfolioCard,
│                                   #   StatCard, Timeline, SectionHeading, Logo wall
├── avatar/                         # AvatarCanvas (R3F island), AvatarModel, useAvatarInteraction
├── sections/                       # Hero, PersonalIntro, GrowthSystem, Achievements,
│                                   #   PortfolioPreview, AboutPreview, Process, FinalCTA
└── motion/                         # GSAP/Lenis providers, Reveal, scroll utilities

content/                            # Typed, CMS-ready data
├── profile.ts                      # Umaid identity, expertise, philosophy, process
├── services.ts                     # 7 offerings as one growth system (outcome-framed)
├── portfolio.ts                    # Portfolio items (creative + video)
├── trust.ts                        # Client logos (+ optional testimonials/results)
└── site.ts                         # Nav, contact channels, social, conversion config

lib/
├── schemas.ts                      # Zod schemas (content + inquiry) — single source of truth
├── seo.ts                          # Metadata + JSON-LD helpers
├── analytics.ts                    # GA4 + Vercel wiring
└── utils.ts                        # cn(), capability detection, helpers

hooks/                              # useReducedMotion, useMediaQuery, usePrefersDevice
public/                            # avatar.glb (optimized), images, og assets, favicons
tests/
├── unit/                           # Vitest + RTL component tests
├── e2e/                            # Playwright cross-browser + responsive + a11y
└── lighthouse/                     # Lighthouse CI config/budgets
```

**Structure Decision**: Single Next.js App Router project (Project Type: web application, frontend-only
with Server Actions). Chosen over a separate frontend/backend split because v1 has no backend service —
lead delivery is a Server Action calling Resend, and content is static/typed. Layered components
(`ui` → `shared` → `sections`) enforce reuse (Principle I); `content/` + Zod schemas enforce scalability
(Principle VIII); the `avatar/` and `motion/` islands isolate the performance-sensitive code (Principle
IV).

## Complexity Tracking

> Documents the two engineered constraints/risks. (The earlier light-palette vs Principle VII deviation
> was resolved by amending the constitution to v2.1.0 and is no longer a deviation.)

| Violation / Risk | Why Needed | Simpler Alternative Rejected Because |
|------------------|------------|-------------------------------------|
| **Interactive 3D avatar + GSAP/Lenis** (perf risk vs Principle IV) | The avatar mascot and cinematic motion ARE the differentiator and the proof-of-skill (US1). | A static hero would protect the budget trivially but kill the signature "wow" the whole brief is built on. Mitigation (not removal): client-island isolation, dynamic import, lazy/Suspense, capability + reduced-motion gating, optimized GLB, Lighthouse CI gate. |
| **Green accent #22C55E for actions** (a11y risk vs Principle VI) | Brand accent and primary-action color must be the green. | Using green-500 for text or white-on-green buttons fails WCAG AA. Mitigation: accessible action shade green-700+ (or dark text on green); green-500 limited to large/decorative accents and non-text UI. |
