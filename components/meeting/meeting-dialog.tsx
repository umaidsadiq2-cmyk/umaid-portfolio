"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitMeeting } from "@/app/actions/submit-meeting";
import { Button } from "@/components/ui/button";
import { conversion } from "@/content/site";
import {
  ENGAGEMENTS,
  MEETING_EVENT,
  MEETING_SERVICES,
  MONTHLY_BUDGETS,
  PROJECT_BUDGETS,
  fieldErrorsOf,
  meetingSchema,
  meetingSummary,
  type MeetingOpenDetail,
} from "@/lib/meeting";
import { cn, whatsappLink } from "@/lib/utils";

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  services: string[];
  engagement: "" | "monthly" | "project";
  monthlyBudget: string;
  projectBudget: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  company_website: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  services: [],
  engagement: "",
  monthlyBudget: "",
  projectBudget: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
  company_website: "",
};

const fieldClass =
  "w-full rounded-sm border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-muted/70 transition-colors focus:border-emerald focus-visible:outline-none";

/**
 * The one "Create a meeting" dialog for the whole site. Mounted once in the
 * site chrome; any MeetingButton opens it by dispatching MEETING_EVENT.
 *
 * `data-lenis-prevent` lets the dialog scroll natively — without it the smooth
 * scroller swallows wheel and touch input and the long form cannot scroll.
 */
export function MeetingDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sent, setSent] = useState<{ name: string; summary: string } | null>(null);

  const statusRef = useRef(status);
  statusRef.current = status;
  const nameRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const service = (e as CustomEvent<MeetingOpenDetail>).detail?.service;
      const fresh = statusRef.current === "sent";
      openerRef.current = document.activeElement as HTMLElement | null;
      if (fresh) {
        setStatus("idle");
        setSent(null);
      }
      setErrors({});
      setForm((current) => {
        const base = fresh ? EMPTY : current;
        const valid = service && (MEETING_SERVICES as readonly string[]).includes(service);
        return valid && !base.services.includes(service)
          ? { ...base, services: [...base.services, service] }
          : base;
      });
      setOpen(true);
    };
    window.addEventListener(MEETING_EVENT, onOpen);
    return () => window.removeEventListener(MEETING_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus?.();
  }, []);

  // Lock page scroll, close on Escape, and focus the first field.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Lets globals.css restore the site cursor over the dialog (see .meeting-open).
    document.documentElement.classList.add("meeting-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    if (statusRef.current !== "sent") nameRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.classList.remove("meeting-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleService = (service: string) =>
    set(
      "services",
      form.services.includes(service)
        ? form.services.filter((s) => s !== service)
        : [...form.services, service],
    );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = meetingSchema.safeParse({ ...form, timezone: localTimeZone() });
    if (!parsed.success) {
      setErrors(fieldErrorsOf(parsed.error));
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await submitMeeting(parsed.data);
      if (res.ok) {
        setSent({ name: parsed.data.name.split(" ")[0] ?? "", summary: meetingSummary(parsed.data) });
        setStatus("sent");
      } else {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (!open) return null;

  /*
   * Closing on the backdrop takes a whole press: down and up both on the dim
   * area outside the panel. Closing on the press alone would shut the dialog on
   * any stray mouse event the opening press left behind, and it also closed the
   * dialog when a visitor selected text inside it and released outside.
   *
   * Both handlers sit on the outer layer and read data-backdrop from the event
   * target, so the scroll layer nested inside counts as backdrop too without a
   * second pair of handlers fighting over the same flag.
   */
  const isBackdrop = (target: EventTarget | null) =>
    target instanceof HTMLElement && target.dataset.backdrop !== undefined;

  const backdropDown = (e: React.MouseEvent) => {
    pressedBackdrop.current = isBackdrop(e.target);
  };
  const backdropUp = (e: React.MouseEvent) => {
    const onBackdrop = pressedBackdrop.current && isBackdrop(e.target);
    pressedBackdrop.current = false;
    if (onBackdrop) close();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-title"
      data-lenis-prevent
      data-backdrop
      onMouseDown={backdropDown}
      onMouseUp={backdropUp}
      className="fixed inset-0 z-[300] overflow-y-auto overscroll-contain bg-ink/70 backdrop-blur-sm"
    >
      <div
        data-backdrop
        className="flex min-h-full items-center justify-center p-4 sm:p-6"
      >
        <div className="relative w-full max-w-2xl rounded-lg border border-line bg-canvas p-6 shadow-2xl sm:p-9">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-xl text-ink-soft transition-colors hover:bg-fog hover:text-ink"
          >
            ✕
          </button>

          {status === "sent" && sent ? (
            <div>
              <p className="eyebrow">Request received</p>
              <h2
                id="meeting-title"
                className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Thank you{sent.name ? `, ${sent.name}` : ""}.
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Your meeting request is in. I will review your details and get back to you
                within one business day to confirm a time that works for you.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Want a faster reply? Send the same details on WhatsApp.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  href={whatsappLink(
                    conversion.whatsapp.number,
                    `Hi Umaid, I just requested a meeting on your website.\n\n${sent.summary}`,
                  )}
                  size="md"
                >
                  Send on WhatsApp
                </Button>
                <Button type="button" variant="outline" size="md" arrow={false} onClick={close}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <p className="eyebrow">Let&apos;s talk</p>
              <h2
                id="meeting-title"
                className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Create a meeting
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                Tell me a little about your business and what you need. I will reply within
                one business day to set up a call.
              </p>

              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.company_website}
                onChange={(e) => set("company_website", e.target.value)}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name}>
                  <input
                    ref={nameRef}
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={cn(fieldClass, errors.name && "border-red-400")}
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={cn(fieldClass, errors.email && "border-red-400")}
                  />
                </Field>
                <Field label="Company name" optional error={errors.company}>
                  <input
                    type="text"
                    autoComplete="organization"
                    placeholder="Your company"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Country" error={errors.country}>
                  <input
                    type="text"
                    autoComplete="country-name"
                    placeholder="e.g. Pakistan, UAE, United States"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={cn(fieldClass, errors.country && "border-red-400")}
                  />
                </Field>
                <Field label="Phone / WhatsApp" optional error={errors.phone} className="sm:col-span-2">
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 (555) 123-4567"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={fieldClass}
                  />
                </Field>
              </div>

              <fieldset className="mt-6">
                <legend className="mb-2.5 text-sm font-medium text-ink">Select services</legend>
                <div className="flex flex-wrap gap-2">
                  {MEETING_SERVICES.map((service) => {
                    const on = form.services.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleService(service)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald",
                          on
                            ? "border-emerald bg-emerald text-white"
                            : "border-line bg-canvas text-ink-soft hover:border-line-strong hover:text-ink",
                        )}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
                {errors.services && <ErrorText>{errors.services}</ErrorText>}
              </fieldset>

              <fieldset className="mt-6">
                <legend className="mb-2.5 text-sm font-medium text-ink">
                  How would you like to work together?
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ENGAGEMENTS.map((option) => {
                    const on = form.engagement === option.value;
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors",
                          on ? "border-emerald bg-emerald-tint" : "border-line hover:border-line-strong",
                        )}
                      >
                        <input
                          type="radio"
                          name="engagement"
                          value={option.value}
                          checked={on}
                          onChange={() => set("engagement", option.value)}
                          className="mt-1 h-4 w-4 accent-[var(--color-emerald)]"
                        />
                        <span>
                          <span className="block text-sm font-medium text-ink">{option.label}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                            {option.hint}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.engagement && <ErrorText>{errors.engagement}</ErrorText>}
              </fieldset>

              {form.engagement === "monthly" && (
                <BudgetField
                  label="Monthly salary budget"
                  placeholder="Type your monthly budget, e.g. $500"
                  suggestions={MONTHLY_BUDGETS}
                  value={form.monthlyBudget}
                  error={errors.monthlyBudget}
                  onChange={(v) => set("monthlyBudget", v)}
                />
              )}

              {form.engagement === "project" && (
                <BudgetField
                  label="Budget for the project"
                  placeholder="Type your project budget, e.g. $800"
                  suggestions={PROJECT_BUDGETS}
                  value={form.projectBudget}
                  error={errors.projectBudget}
                  onChange={(v) => set("projectBudget", v)}
                />
              )}

              <fieldset className="mt-6">
                <legend className="mb-2.5 text-sm font-medium text-ink">
                  Preferred meeting date and time
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Date" error={errors.preferredDate}>
                    <input
                      type="date"
                      min={todayISO()}
                      value={form.preferredDate}
                      onChange={(e) => set("preferredDate", e.target.value)}
                      className={cn(fieldClass, errors.preferredDate && "border-red-400")}
                    />
                  </Field>
                  <Field label="Time" error={errors.preferredTime}>
                    <input
                      type="time"
                      step={900}
                      value={form.preferredTime}
                      onChange={(e) => set("preferredTime", e.target.value)}
                      className={cn(fieldClass, errors.preferredTime && "border-red-400")}
                    />
                  </Field>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  In your local time ({localTimeZone()}). I will confirm this slot or suggest the
                  closest available time.
                </p>
              </fieldset>

              <Field label="Message" optional error={errors.message} className="mt-5">
                <textarea
                  rows={4}
                  placeholder="Tell me about your business, your goals, and any timeline you have in mind."
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  className={cn(fieldClass, "resize-none")}
                />
              </Field>

              {status === "error" && (
                <div className="mt-5 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Something went wrong sending your request. Please try again, or message me on{" "}
                  <a
                    className="underline"
                    href={whatsappLink(conversion.whatsapp.number, conversion.whatsapp.prefill)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                  .
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
                <Button type="submit" size="lg" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Request a meeting"}
                </Button>
                <p className="text-xs text-muted">I reply within one business day.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/** The visitor's time zone, e.g. "America/New_York". Browser-only. */
function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
  } catch {
    return "local time";
  }
}

/** Today as YYYY-MM-DD in the visitor's own time zone — the date picker's minimum. */
function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function Field({
  label,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </span>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </label>
  );
}

/**
 * Free-text budget with one-click suggestions. Visitors type any amount (in any
 * currency) or tap a range to fill the field, then adjust it if they like.
 */
function BudgetField({
  label,
  placeholder,
  suggestions,
  value,
  error,
  onChange,
}: {
  label: string;
  placeholder: string;
  suggestions: readonly string[];
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-5">
      <Field label={label} error={error}>
        <input
          type="text"
          inputMode="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldClass, error && "border-red-400")}
        />
      </Field>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Or pick one:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald",
              value === s
                ? "border-emerald bg-emerald-tint text-emerald"
                : "border-line text-ink-soft hover:border-line-strong hover:text-ink",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <span className="mt-1.5 block text-sm text-red-500">{children}</span>;
}
