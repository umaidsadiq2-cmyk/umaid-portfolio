# Contract: Conversion Ladder (Booking · Instant Message · Inquiry Form)

**Feature**: 001-personal-brand-website | **Date**: 2026-06-19

Defines the behavioral contract for the three conversion paths (FR-006/007/008/009/010) and the sticky
CTA. These are user-facing interaction contracts, not HTTP APIs (no external API is exposed in v1).

## 1. Primary CTA — Book a consultation (Cal.com)

- **Trigger**: `primaryCtaLabel` button in Navbar, Hero, section CTAs, sticky CTA, and Contact page.
- **Behavior**: Opens Cal.com booking (popup embed on desktop, inline on Contact page), loaded lazily on
  interaction to protect performance.
- **Config**: `conversionConfig.bookingUrl`.
- **Success**: Cal.com confirms the booking; user sees Cal.com's confirmation. Booking notification is
  delivered to Umaid by Cal.com.
- **Failure/unavailable**: If the embed fails to load, fall back to a direct link (new tab) plus the
  WhatsApp and form options (FR-010 graceful fallback).
- **A11y**: Trigger is a real `<button>`/link, keyboard-focusable, labeled; embed focus is managed.

## 2. Secondary — WhatsApp instant message

- **Trigger**: "Message on WhatsApp" action (Contact page + footer).
- **Behavior**: Opens `https://wa.me/<whatsapp.number>?text=<urlencoded whatsapp.prefill>` in a new tab.
- **Config**: `conversionConfig.whatsapp`.
- **A11y**: Descriptive link text ("Message Umaid on WhatsApp"), `rel="noopener"`.

## 3. Tertiary — Inquiry form (Server Action + Resend)

**Client contract** (React Hook Form + `zodResolver(inquirySchema)`):
- Inline validation per field; submit disabled until valid; specific error messages per field.
- States: `idle → validating → submitting → success | error`.

**Server Action contract** — `submitInquiry(input): Promise<InquiryResult>`

```text
Input  : inquirySchema (re-validated server-side — never trust client)
Output : InquiryResult =
           { ok: true,  id?: string }
         | { ok: false, error: 'validation'|'spam'|'send_failed'|'rate_limited',
             fieldErrors?: Record<field, string> }
```

- **Validation**: server re-parses with `inquirySchema`; on failure → `{ ok:false, error:'validation',
  fieldErrors }`.
- **Spam guard**: if `_honeypot` non-empty → silently `{ ok:false, error:'spam' }` (no email sent).
- **Rate limit**: per-IP limit; exceed → `{ ok:false, error:'rate_limited' }`.
- **Delivery**: on valid → send email via Resend to Umaid; on provider failure → `{ ok:false,
  error:'send_failed' }`.
- **Secrets**: Resend API key + from-domain via env vars only (Principle IX) — never in client bundle.

**UI outcomes**:
- `ok:true` → success confirmation; form cleared.
- `ok:false` → message preserved (FR-010), field errors shown, and on `send_failed`/`rate_limited` the
  user is offered WhatsApp + booking as alternatives.

## 4. Sticky CTA

- A persistent, unobtrusive "Book a consultation" affordance visible on full-length scrolls (FR-008,
  SC-009). Hidden when the inline Contact/booking section is in view to avoid duplication. Respects
  reduced-motion (no distracting entrance animation).

## Acceptance mapping

| Path | Spec refs |
|------|-----------|
| Booking primary | FR-006, US3 #1, SC-003 |
| WhatsApp | FR-007, US3 #2 |
| Form validate/deliver/fail | FR-007/009/010, US3 #3/#5, SC-004 |
| Sticky CTA | FR-008, US3 #4, SC-009 |
