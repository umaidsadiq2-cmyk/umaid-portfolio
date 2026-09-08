"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { MotionProvider } from "@/components/motion/motion-provider";
import { Cursor } from "@/components/motion/cursor";
import { Grain } from "@/components/motion/grain";
import { AmbientPointer } from "@/components/motion/ambient-pointer";
import { PageTransition } from "@/components/motion/page-transition";

/**
 * Public-site chrome — navbar, footer, and the whole motion layer.
 *
 * The App Router always applies the root layout, but none of this belongs over
 * the CMS: Lenis would hijack scrolling in long forms, and the custom cursor
 * would fight native inputs. So the chrome opts out of /admin rather than the
 * admin trying to escape the layout.
 *
 * Public rendering is byte-for-byte what it was before this component existed.
 *
 * `floatingCta` arrives as an already-rendered element rather than an import.
 * This file is a client component, so anything it imports joins the client
 * bundle — passing the node in keeps the WhatsApp button server-rendered and
 * ships zero JavaScript for it.
 */
export function SiteChrome({
  children,
  floatingCta,
}: {
  children: React.ReactNode;
  floatingCta?: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-emerald focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <MotionProvider />
      <Cursor />
      <ScrollProgress />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <Grain />
      <AmbientPointer />
      <PageTransition />
      {floatingCta}
    </>
  );
}
