import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-sm " +
  "transition-[background-color,color,border-color,transform] duration-200 " +
  "ease-out focus-visible:outline-none active:translate-y-px " +
  "disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  // Brand emerald — AA contrast (white on #0B6E4F ≈ 6.3:1)
  primary: "bg-emerald text-white hover:bg-emerald-deep",
  outline: "border border-line-strong text-ink hover:border-ink hover:bg-fog",
  ghost: "text-ink hover:bg-fog",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

type StyleProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = StyleProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
    href?: undefined;
  };

type LinkProps = StyleProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children" | "href"> & {
    href: string;
  };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (rest.href !== undefined) {
    const { href, ...linkRest } = rest as LinkProps;
    if (/^https?:\/\//.test(href)) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          {...(linkRest as ComponentPropsWithoutRef<"a">)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}
