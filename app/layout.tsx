import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { siteMeta } from "@/content/site";
import {
  buildMetadata,
  personJsonLd,
  websiteJsonLd,
  professionalServiceJsonLd,
} from "@/lib/seo";
import { SiteChrome } from "@/components/shared/site-chrome";
import { WhatsAppFloat } from "@/components/shared/whatsapp-float";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.url),
  ...buildMetadata({}),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        {/* Pre-paint flag: `js` gates the scroll-reveal animations, so a no-JS
            visitor always gets the fully-visible content. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){document.documentElement.classList.add('js')})()",
          }}
        />
      </head>
      {/* suppressHydrationWarning: some antivirus/ad-blocking browser
          extensions (e.g. Bitdefender) inject a `bis_skin_checked` attribute
          into the live DOM before React hydrates, which otherwise trips a
          false-positive hydration mismatch warning that has nothing to do
          with actual app state. */}
      <body className="antialiased" suppressHydrationWarning>
        <SiteChrome floatingCta={<WhatsAppFloat />}>{children}</SiteChrome>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(professionalServiceJsonLd()),
          }}
        />
      </body>
    </html>
  );
}
