<!--
SYNC IMPACT REPORT
==================
Version change: 2.0.0 → 2.1.0
Bump rationale: MINOR. Principle VII's visual-language descriptor was changed from
                "dark luxury" to a light, white-dominant premium-minimal palette
                (white/off-white + green accent #22C55E) to match the owner-approved
                art direction for feature 001. Principle VII's name, intent, and all
                other tenets (premium-first, cinematic, avatar-driven, mobile-first,
                purposeful motion, minimal-but-impactful) are unchanged, and no
                governance/gates break — hence MINOR (material guidance change),
                not MAJOR. Resolves the logged deviation in 001-personal-brand-website.

Modified principles:
  - VII. Design Principles (visual language: dark luxury → light premium-minimal;
       added palette + contrast note tying green accent usage to Principle VI)

Added/removed sections: (none)

Templates requiring updates:
  - .specify/templates/plan-template.md ......... ✅ aligned (generic Constitution Check gate)
  - .specify/templates/spec-template.md ......... ✅ aligned (no principle hardcoding)
  - .specify/templates/tasks-template.md ........ ✅ aligned (no principle hardcoding)
  - .specify/templates/checklist-template.md .... ✅ aligned (no principle hardcoding)
  - .specify/templates/commands/*.md ............ N/A (directory not present)
Dependent artifacts synced:
  - specs/001-personal-brand-website/plan.md .... ✅ Constitution Check VII updated to PASS

Follow-up TODOs: (none)

PRIOR REPORT (1.0.0 → 2.0.0): MAJOR — performance budgets raised to Lighthouse ≥95 with
  SEO/Best-Practices targets; principle set expanded 4 → 9; added Project Goal section;
  folded Performance & Quality Standards into Principle IV.
-->

# Muhammad Umaid Sadiq Portfolio Constitution

## Core Principles

### I. Code Quality

The codebase MUST be clean, scalable, and production-ready at all times.

- Architecture MUST follow clean separation of concerns: presentation, logic, data, and configuration
  are distinct and not entangled.
- UI MUST be built from small, reusable, single-purpose components. Duplicated markup or logic MUST be
  extracted into shared units; copy-paste is treated as a defect.
- TypeScript is mandatory in `strict` mode. `any`, non-null assertions, and `@ts-ignore`/`eslint-disable`
  MUST be justified in review or removed. Public functions and component props MUST be typed.
- Naming MUST be consistent and descriptive across files, components, variables, and folders, following a
  single documented convention.
- All code MUST pass linting and formatting with zero errors before merge. Dead code, unused
  dependencies, and commented-out blocks MUST be deleted.

**Rationale**: A premium portfolio is edited and extended continuously; clean, typed, consistent code
keeps iteration fast and the underlying craftsmanship credible to a technical audience.

### II. Testing Standards

Quality MUST be verified before deployment, never assumed.

- Every release MUST be validated for cross-browser compatibility on the latest two versions of Chrome,
  Firefox, Safari, and Edge.
- Layouts MUST be responsive-tested across mobile, tablet, and desktop breakpoints.
- The production build MUST run with **zero console errors and zero unhandled warnings**.
- All forms MUST have client-side validation with clear error states, and submission paths MUST be
  tested for success and failure.
- Accessibility MUST be tested (automated audit + keyboard/screen-reader spot checks) per Principle VI.
- Performance MUST be validated against the budgets in Principle IV before any deployment.

**Rationale**: The site represents a personal brand; a broken layout, a console error, or a failing form
seen by a recruiter undermines the entire impression the work is meant to create.

### III. User Experience Consistency

The site MUST feel like one cohesive, premium product across every page.

- A single design system (tokens for spacing, typography, color, radius, shadow, motion) MUST be the
  source of truth. Ad-hoc inline values that bypass the system are prohibited.
- Spacing, typography scale, and color usage MUST be applied uniformly site-wide.
- Navigation MUST be predictable: consistent placement, labeling, and behavior on every page.
- Interaction behavior (hovers, focus, transitions, loading and error states) MUST be consistent — the
  same action looks and responds the same way everywhere.
- Every page MUST meet a premium quality bar; no page ships feeling unfinished relative to the others.

**Rationale**: Consistency is the difference between a polished brand and a collection of pages; it is
what makes the experience feel intentional and high-end.

### IV. Performance Requirements

The site MUST be fast and measurably excellent on real devices.

- Production builds MUST meet these Lighthouse scores (mid-tier mobile profile):
  **Performance ≥ 95**, **SEO = 100**, **Accessibility ≥ 95**, **Best Practices = 100**.
- Core Web Vitals MUST be in the "good" range: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms.
- Images and assets MUST be optimized (modern formats, responsive sizing, lazy-loading below the fold);
  fonts MUST load without blocking render or causing layout shift.
- Client-side JavaScript MUST be minimized: render static/server content where possible, code-split by
  route, defer non-critical work, and avoid heavy dependencies when a lighter approach exists.
- Any change that regresses a target MUST be remediated before merge or justified in the plan's
  Complexity Tracking.

**Rationale**: Recruiters and clients skim on mobile; speed and measurable quality scores are the first,
quantifiable proof of professionalism.

### V. SEO Standards

The site MUST be fully discoverable and rich when shared.

- Markup MUST be semantic HTML with a correct, single `<h1>`-per-page heading hierarchy.
- Every page MUST define unique metadata: title, description, and canonical URL.
- Open Graph and Twitter Card tags MUST be present on every page for correct social previews.
- A sitemap and a `robots.txt` MUST be generated and kept current.
- Structured data (JSON-LD, e.g., Person/WebSite/BreadcrumbList where applicable) MUST be implemented
  and valid.

**Rationale**: A personal brand site exists to be found and shared; strong SEO foundations turn the work
into reach.

### VI. Accessibility Standards

The site MUST be usable by everyone, to WCAG 2.1 AA where practical.

- Markup MUST be semantic; interactive elements MUST use correct roles and accessible names.
- All functionality MUST be fully operable by keyboard, with visible focus states.
- Color contrast MUST meet WCAG 2.1 AA minimums.
- Content MUST be screen-reader friendly: meaningful alt text, labels, and ARIA only where semantics
  fall short.

**Rationale**: Accessibility is both an ethical baseline and a quality signal; it directly supports the
Accessibility ≥95 target in Principle IV.

### VII. Design Principles

The design MUST be premium, cinematic, and memorable.

- Premium-first: every screen aims for an award-winning, high-end aesthetic.
- The visual language is **light premium-minimal** — a white-dominant canvas (≈70% white `#FFFFFF`, ≈20%
  off-white `#FAFAFA`/`#F5F5F5`) with a disciplined green accent `#22C55E` (≈10%): clean, spacious,
  high-contrast, and intentional. Restraint and whitespace carry the luxury, not darkness. The green
  accent is decorative at `#22C55E`; any text-bearing or interactive use MUST use a darker shade
  (green-700+) or dark-on-green to satisfy the contrast requirements in Principle VI.
- Personal branding is **avatar-driven**, with cinematic storytelling guiding the visitor through the
  narrative.
- Design is **mobile-first** and responsive, scaling up to larger viewports.
- Animations MUST be smooth and purposeful — never decorative noise — and MUST respect
  `prefers-reduced-motion` and the performance budgets in Principle IV.
- Content presentation MUST be minimal but impactful, prioritizing memorable moments over density.

**Rationale**: The goal is a site that feels comparable to modern award-winning portfolios; deliberate,
cinematic design is the vehicle for a lasting impression.

### VIII. Scalability Standards

The architecture MUST anticipate growth without rework.

- The component and routing architecture MUST be reusable and extensible to support future portfolio
  expansion, a blog, and case studies without structural rewrites.
- Content MUST be managed through an approach that makes adding/editing entries straightforward (e.g.,
  structured content/CMS-ready data), not hard-coded one-offs.
- New sections MUST be addable by composing existing patterns rather than inventing parallel systems.

**Rationale**: A personal brand evolves; building for expansion now avoids costly redesigns later and
keeps the codebase coherent as it grows.

### IX. Security Standards

The site MUST follow secure-by-default practices.

- All external input (forms, query params, API payloads) MUST be validated and sanitized.
- Secure coding practices MUST be followed; secrets MUST NEVER be committed or exposed to the client.
- Sensitive configuration MUST live in environment variables, excluded from version control.
- Dependencies MUST be free of known high/critical vulnerabilities at release time.

**Rationale**: Even a portfolio handles user input and credentials (contact forms, analytics, API keys);
leaks or injection flaws are reputational and real risks.

## Project Goal

Build a world-class personal brand website for **Muhammad Umaid Sadiq** that combines premium UI/UX,
cinematic animations, exceptional performance, strong SEO foundations, and a memorable user experience.

The website MUST feel comparable to modern award-winning portfolio websites while remaining fast,
accessible, maintainable, scalable, and conversion-focused. Every decision is weighed against this goal:
if a choice does not make the site more premium, faster, more discoverable, or more memorable — without
violating any principle above — it MUST be reconsidered.

## Development Workflow & Quality Gates

The following gates MUST pass before any change is merged or deployed:

1. **Lint, format & types**: zero linter errors, clean formatting, zero TypeScript errors (Principle I).
2. **Tests & validation**: cross-browser, responsive, form, and accessibility checks pass; zero console
   errors (Principles II, VI).
3. **Performance & SEO**: production build meets Lighthouse Performance ≥95, SEO 100, Accessibility ≥95,
   Best Practices 100, and Core Web Vitals in range (Principles IV, V).
4. **Design & consistency**: UI changes conform to the design system and premium bar (Principles III, VII).
5. **Security**: input validation present, no exposed secrets, env vars protected (Principle IX).
6. **Review**: at least one review confirming compliance; any deviation MUST be recorded in the plan's
   Complexity Tracking with written justification.

## Governance

This constitution supersedes all other development practices for this project. When guidance conflicts,
the constitution wins.

- **Amendments** MUST be proposed as a documented change to this file, include rationale, and update the
  version and dates below.
- **Versioning** follows semantic versioning: MAJOR for backward-incompatible governance or principle
  removals/redefinitions, MINOR for new principles or materially expanded guidance, PATCH for
  clarifications and non-semantic refinements.
- **Compliance** is verified at every review and quality gate. Any complexity or deviation from these
  principles MUST be justified in writing; unjustified violations block merge.

**Version**: 2.1.0 | **Ratified**: 2026-06-19 | **Last Amended**: 2026-06-19
