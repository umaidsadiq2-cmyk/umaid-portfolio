"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type Inquiry } from "@/lib/schemas";
import { submitInquiry } from "@/app/actions/submit-inquiry";
import { services } from "@/content/services";
import { conversion } from "@/content/site";
import { whatsappLink, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const fieldBase =
  "w-full rounded-sm border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-muted/70 transition-colors focus:border-emerald focus-visible:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inquiry>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { consent: true, company_website: "" },
  });

  const onSubmit = async (values: Inquiry) => {
    setStatus("idle");
    const res = await submitInquiry(values);
    if (res.ok) {
      setStatus("success");
      reset();
    } else {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-emerald/30 bg-emerald-tint p-8">
        <p className="font-display text-2xl font-semibold tracking-tight text-emerald">
          Message sent.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Thanks — I&apos;ll reply within one business day. Prefer to talk sooner?
          Book a slot or message me directly.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href={conversion.bookingUrl} size="md">
            Book a consultation
          </Button>
          <Button
            href={whatsappLink(conversion.whatsapp.number, conversion.whatsapp.prefill)}
            variant="outline"
            size="md"
          >
            WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("company_website")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input
            type="text"
            autoComplete="name"
            className={cn(fieldBase, errors.name && "border-red-400")}
            placeholder="Your name"
            {...register("name")}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            className={cn(fieldBase, errors.email && "border-red-400")}
            placeholder="you@company.com"
            {...register("email")}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" optional>
          <input
            type="text"
            autoComplete="organization"
            className={fieldBase}
            placeholder="Company (optional)"
            {...register("company")}
          />
        </Field>
        <Field label="What do you need?" optional>
          <select className={fieldBase} defaultValue="" {...register("serviceInterest")}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Project details" error={errors.message?.message}>
        <textarea
          rows={5}
          className={cn(fieldBase, "resize-none", errors.message && "border-red-400")}
          placeholder="Tell me about your business and what you're trying to grow."
          {...register("message")}
        />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[var(--color-emerald)]"
          {...register("consent")}
        />
        <span>I agree to be contacted about my inquiry.</span>
      </label>
      {errors.consent && (
        <p className="text-sm text-red-500">{errors.consent.message}</p>
      )}

      {status === "error" && (
        <div className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Something went wrong sending your message. Please try{" "}
          <a
            className="underline"
            href={whatsappLink(conversion.whatsapp.number, conversion.whatsapp.prefill)}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>{" "}
          or email {conversion.email}.
        </div>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-500">{error}</span>}
    </label>
  );
}
