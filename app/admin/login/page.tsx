import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold tracking-tight">
            Umaid<span className="text-emerald">.</span>
          </span>
          <h1 className="mt-6 font-display text-xl font-semibold tracking-tight">
            Sign in to the CMS
          </h1>
          <p className="mt-2 text-sm text-muted">
            Manage your portfolio brands, creatives, and videos.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-canvas p-6 shadow-[0_18px_44px_-34px_rgba(11,16,14,0.45)]">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            ← Back to the site
          </Link>
        </p>
      </div>
    </div>
  );
}
