# Contract: Content Schemas

**Feature**: 001-personal-brand-website | **Date**: 2026-06-19

The UI contract for an application of this type is the **typed content boundary** between `content/`
modules and the components that consume them. All schemas live in `lib/schemas.ts` (Zod) and are the
single source of truth for both content validation and TypeScript types (`z.infer`). Components MUST
consume validated, typed data — never raw literals. A headless CMS may later produce the same shapes
without changing consumers (Principle VIII).

Schemas are specified declaratively below (field → rule). Implementation produces the actual Zod objects.

## Shared value objects

```text
Url            = string, must be valid URL
ImageRef       = { src: string (non-empty), alt: string (non-empty),
                   width?: int>0, height?: int>0 }   # width/height required for <img> to avoid CLS
MediaAsset     = { type: 'image'|'video', src: string, alt: string,
                   width?: int>0, height?: int>0, poster?: string }
Slug           = string matching ^[a-z0-9]+(?:-[a-z0-9]+)*$
```

## profileSchema

```text
name           : string (1..)
title          : string (1..)
tagline        : string (1..120)
bio            : string (MDX/markdown allowed)
philosophy     : string
expertise      : string[] (min 1)
process        : ProcessStep[] (min 1)   # { order:int, title, description, icon? }
avatar         : { model: string ending ".glb", poster: ImageRef, alt: string }
socials        : { platform: enum, url: Url, label: string }[]
location       : string
```

## capabilitySchema (array length === 7 in v1)

```text
slug            : Slug (unique)
name            : string (1..)
outcome         : string (1..)          # REQUIRED — business outcome, not a bare label (FR-005)
description     : string (1..)
icon            : string
order           : int >= 0
relatedPortfolio: Slug[]                # references PortfolioItem.slug
```

Rule: the seven canonical slugs are present:
`social-media-marketing, content-creation, graphic-design, video-editing, web-development, seo,
custom-software`.

## portfolioItemSchema

```text
slug         : Slug (unique)
title        : string (1..)
category     : enum('creative-design','video-content')   # extensible
serviceTags  : Slug[] (min 1)            # references capability slugs
challenge    : string (1..)              # REQUIRED outcome storytelling
delivered    : string (1..)              # REQUIRED
result       : string?                   # optional impact/metric
media        : MediaAsset[] (min 1)
thumbnail    : ImageRef
featured     : boolean
order        : int >= 0
client       : string?
```

## trustSignalSchema (discriminated union on `type`)

```text
type === 'logo'        → logo:        { name, src, alt, url? }
type === 'testimonial' → testimonial: { quote, author, role?, company?, avatar? }
type === 'result'      → result:      { metric, label, context? }
+ order : int >= 0
```

Rule: v1 dataset contains ≥1 `logo`. Section renders gracefully with logos only.

## inquirySchema (client + server, shared)

```text
name        : string, 2..80
email       : string, email
company     : string?, ..120
serviceInterest : enum(capability slugs)?    # optional
budget      : enum('<1k','1k-5k','5k-10k','10k+','not-sure')?
message     : string, 10..2000
consent     : literal(true)
_honeypot   : string, must equal '' (reject if non-empty)
```

## conversionConfigSchema

```text
bookingUrl       : Url                    # Cal.com event link
whatsapp         : { number: string (E.164-ish), prefill: string }
email            : string, email
nav              : { label: string, href: string }[] (min 1)
primaryCtaLabel  : string (default "Book a consultation")
```

**Validation timing**: All content modules are parsed against their schema at module load (build time);
invalid content throws and fails the build (fail-fast, Principle I/VIII).
