"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, conversion, siteMeta } from "@/content/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-line bg-canvas/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="shell shell-wide flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          {siteMeta.shortName}
          <span className="text-emerald">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-emerald transition-[width] duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
          <Button href={conversion.bookingUrl} size="md">
            {conversion.primaryCtaLabel}
          </Button>
        </nav>

        <button
          type="button"
          className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-[5px]">
            <span
              className={cn(
                "block h-px w-6 bg-ink transition-transform duration-300",
                open && "translate-y-[6px] rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-px w-6 bg-ink transition-opacity duration-300",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block h-px w-6 bg-ink transition-transform duration-300",
                open && "-translate-y-[6px] -rotate-45",
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-canvas transition-[opacity,visibility] duration-300 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav
          className="shell flex h-full flex-col justify-center gap-2"
          aria-label="Mobile"
        >
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-4 font-display text-3xl font-semibold tracking-tight"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {item.label}
            </Link>
          ))}
          <Button
            href={conversion.bookingUrl}
            size="lg"
            className="mt-6 w-full"
          >
            {conversion.primaryCtaLabel}
          </Button>
        </nav>
      </div>
    </header>
  );
}
