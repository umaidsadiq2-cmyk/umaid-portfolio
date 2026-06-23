# Phase 1 Data Model: Personal Brand Website

**Feature**: 001-personal-brand-website | **Date**: 2026-06-19

All entities are static, typed content modules under `content/`, validated by Zod schemas in
`lib/schemas.ts` (single source of truth, CMS-ready). No database in v1. Field-level Zod rules appear in
[contracts/content-schemas.md](./contracts/content-schemas.md); this file describes the conceptual model.

---

## Entity: Profile (Umaid)

Single record describing the personal brand. Drives Hero, Personal Introduction, About, Process.

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| name | string | "Muhammad Umaid Sadiq" |
| title | string | e.g., "Digital Growth Partner" (positioning) |
| tagline | string | Outcome-led one-liner shown in hero (≤120 chars) |
| bio | string (MDX) | Story narrative |
| philosophy | string (MDX) | Working philosophy |
| expertise | string[] | Skill/expertise tags |
| process | ProcessStep[] | Ordered steps (see below) |
| avatar | AvatarAsset | GLB path + static poster fallback |
| socials | SocialLink[] | Platform + URL |
| location | string | Markets served context |

**ProcessStep**: `{ order: number; title: string; description: string; icon?: string }`
**AvatarAsset**: `{ model: string (/.glb); poster: string (image); alt: string }`
**SocialLink**: `{ platform: enum; url: string (url); label: string }`

---

## Entity: Capability (Growth System)

The seven offerings, presented as ONE integrated system. Drives the Services / Growth System section.

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| slug | string | unique, kebab-case |
| name | string | e.g., "SEO Services" |
| outcome | string | Business outcome it produces (required — not a bare label) |
| description | string | Concise value description |
| icon | string | Icon key |
| order | number | Display order within the system |
| relatedPortfolio | string[] | PortfolioItem slugs (cross-link to proof) |

**Rule**: Exactly the seven offerings present in v1 (social media marketing, content creation, graphic
design, video editing, web development, SEO, custom software). Each MUST have a non-empty `outcome`
(enforces FR-005 outcome framing).

---

## Entity: PortfolioItem

A showcased outcome. Drives Portfolio index, Creative Designs, Video Content, and homepage preview.

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| slug | string | unique, kebab-case |
| title | string | required |
| category | enum | `creative-design` \| `video-content` (extensible) |
| serviceTags | string[] | Capability slugs this work demonstrates |
| challenge | string | Problem framing (required — outcome storytelling) |
| delivered | string | What was delivered (required) |
| result | string? | Impact/metric where available (optional) |
| media | MediaAsset[] | ≥1 required; images and/or video |
| thumbnail | MediaAsset | Card image (required) |
| featured | boolean | Surfaces in homepage preview |
| order | number | Sort order |
| client | string? | Optional client/brand name |

**MediaAsset**: `{ type: 'image' \| 'video'; src: string; alt: string; width?: number; height?: number;
poster?: string }`
**Rule**: `alt` required on every image for accessibility (Principle VI). `width`/`height` required on
images to prevent CLS (Principle IV).

---

## Entity: TrustSignal

Credibility elements. Client logos committed for v1; testimonials/results are optional and slot in
without redesign (FR-011, US5).

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| type | enum | `logo` \| `testimonial` \| `result` |
| logo | LogoAsset? | required when type=`logo` |
| testimonial | Testimonial? | required when type=`testimonial` |
| result | Result? | required when type=`result` |
| order | number | Display order |

**LogoAsset**: `{ name: string; src: string; alt: string; url?: string }`
**Testimonial**: `{ quote: string; author: string; role?: string; company?: string; avatar?: string }`
**Result**: `{ metric: string; label: string; context?: string }` (e.g., metric "3.2x", label "traffic
growth")
**Rule**: v1 content provides ≥1 `logo`. The trust section renders gracefully when only logos exist
(no empty/sparse state).

---

## Entity: Inquiry (transient — not stored)

Captured from the contact form, delivered via Server Action → Resend. Not persisted in v1.

| Field | Type | Validation (Zod, client + server) |
|-------|------|-----------------------------------|
| name | string | required, 2–80 chars |
| email | string | required, valid email |
| company | string? | optional, ≤120 chars |
| serviceInterest | enum? | optional, one of Capability slugs |
| budget | enum? | optional (e.g., ranges) |
| message | string | required, 10–2000 chars |
| consent | boolean | required true (contact consent) |
| _honeypot | string | must be empty (spam guard) |

**State transitions**: `idle → validating → submitting → success | error`. On `error`, entered data is
preserved and an alternative channel (WhatsApp/booking) is offered (FR-010).

---

## Entity: ConversionConfig (site config)

Drives the conversion ladder + sticky CTA. Lives in `content/site.ts`.

| Field | Type | Notes |
|-------|------|-------|
| bookingUrl | string (url) | Cal.com event link (primary CTA) |
| whatsapp | { number: string; prefill: string } | wa.me deep link parts |
| email | string | Public contact email |
| nav | NavItem[] | Global navigation |
| primaryCtaLabel | string | e.g., "Book a consultation" |

---

## Relationships

```text
Profile (1) ───────────────── drives Hero / About / Process
Capability (7) ──relatedPortfolio──▶ PortfolioItem (n)
PortfolioItem (n) ──serviceTags──▶ Capability (n)   (bidirectional cross-link)
TrustSignal (n) ───────────── Achievements / trust section
Inquiry ──serviceInterest──▶ Capability (optional)
ConversionConfig ──────────── Navbar / StickyCTA / Contact / FinalCTA
```

All content shapes are validated at module load (build time) so invalid content fails fast (Principle I).
