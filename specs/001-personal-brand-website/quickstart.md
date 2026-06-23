# Quickstart & Validation Guide: Personal Brand Website

**Feature**: 001-personal-brand-website | **Date**: 2026-06-19

How to run the site locally and validate that the feature meets its spec and the constitution's quality
gates. Implementation details live in `tasks.md` and the code; this is a run/validation guide.

## Prerequisites

- Node.js 20 LTS, npm (or pnpm)
- Env vars in `.env.local`:
  - `RESEND_API_KEY`, `RESEND_FROM` (inquiry email delivery)
  - `NEXT_PUBLIC_BOOKING_URL` (Cal.com event link)
  - `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_WHATSAPP_PREFILL`
  - `NEXT_PUBLIC_GA_ID` (GA4)
  - `NEXT_PUBLIC_SITE_URL` (canonical/sitemap base)

## Setup & run

```bash
npm install
npm run dev          # local dev at http://localhost:3000
npm run build        # production build (must succeed with zero type errors)
npm run start        # serve production build for accurate perf testing
```

## Quality gates (must all pass before deploy — constitution Principles I, II, IV, V, VI)

```bash
npm run lint         # ESLint — zero errors
npm run typecheck    # tsc --noEmit — zero errors
npm run test         # Vitest + RTL unit/component
npm run test:e2e     # Playwright cross-browser + responsive (+ zero console errors assertion)
npm run test:a11y    # axe-core accessibility checks — no critical violations
npm run lighthouse   # Lighthouse CI — Perf>=95, SEO=100, A11y>=95, Best Practices=100
```

## Validation scenarios (map to spec user stories & success criteria)

### US1 — Signature first impression (P1)
1. Open `/` on a throttled mid-tier mobile profile. **Expect**: hero meaningful within ~2.5s; identity +
   outcome readable in the first viewport; primary CTA visible (SC-001, SC-002).
2. Move cursor / scroll over the hero. **Expect**: avatar responds smoothly; no jank.
3. Set OS reduced-motion / emulate low-power device. **Expect**: static premium avatar poster fallback;
   page still hits performance budget (SC-005). Reload Lighthouse — scores hold with hero active.

### US2 — Portfolio as proof (P1)
4. Scroll to work; open a portfolio item. **Expect**: challenge → delivered → result framing, alt text on
   all media, no layout shift (CLS ≤0.1).
5. Visit `/portfolio`, `/portfolio/creative-designs`, `/portfolio/video-content`. **Expect**: correct
   categorized items; range across the growth system perceivable.

### US3 — Conversion ladder (P2)
6. Click "Book a consultation" from Navbar, hero, and sticky CTA. **Expect**: Cal.com opens; booking
   confirms (SC-003 <60s path).
7. Click WhatsApp action. **Expect**: `wa.me` opens with prefilled message.
8. Submit the contact form with invalid data (bad email, empty message). **Expect**: specific inline
   errors; submission blocked.
9. Submit with valid data. **Expect**: success confirmation; email delivered to Umaid (SC-004).
10. Simulate send failure (bad key). **Expect**: clear error, entered data preserved, WhatsApp/booking
    offered as fallback.
11. Scroll the homepage fully. **Expect**: persistent sticky CTA present, hidden only over the inline
    booking/contact section (SC-009).

### US4 — Growth system (P2)
12. Open the services/growth-system section. **Expect**: all 7 offerings, each shown as an outcome,
    framed as one system; next-step CTA present.

### US5 — Trust (P3)
13. View the trust/achievements section. **Expect**: client logos render responsively; layout intact even
    with logos only (no sparse state). Adding a testimonial/result to `content/trust.ts` slots in with no
    layout break.

### US6 — Human & process (P3)
14. Open `/about`. **Expect**: avatar-driven story, expertise, philosophy, and a clear process overview.

### Cross-cutting
15. Run Lighthouse on `/`, `/portfolio`, `/about`, `/contact`. **Expect**: Perf≥95, SEO=100, A11y≥95,
    Best Practices=100 each (SC-005).
16. Keyboard-only pass through every interactive element incl. hero and all conversion paths. **Expect**:
    full operability, visible focus (SC-008).
17. View page source / check `view-source` + a crawler. **Expect**: per-page metadata, OG/Twitter tags,
    JSON-LD, canonical; `/sitemap.xml` and `/robots.txt` resolve (Principle V).
18. Open DevTools console across the journey. **Expect**: zero errors/warnings (FR-019).

## Definition of validated

All quality-gate commands pass and all 18 scenarios above behave as expected on the production build
across the latest two versions of Chrome, Firefox, Safari, and Edge (SC-006).
