"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/reveal";

type Stat = { value: number; suffix: string; label: string };

const STATS: Stat[] = [
  { value: 5, suffix: "+", label: "Years Experience" },
  { value: 100, suffix: "+", label: "Projects Completed" },
  { value: 50, suffix: "+", label: "Satisfied Clients" },
  { value: 10, suffix: "+", label: "Industries Served" },
];

function useCountUp(target: number, run: boolean, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return n;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useCountUp(stat.value, run);
  return (
    <div>
      <p className="font-display text-5xl font-semibold tracking-tight text-ink md:text-7xl">
        {n}
        <span className="text-emerald">{stat.suffix}</span>
      </p>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
        {stat.label}
      </p>
    </div>
  );
}

export function ResultsStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRun(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRun(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="border-y border-line bg-canvas">
      <div className="shell shell-wide py-20 md:py-28" ref={ref}>
        <Reveal>
          <p className="eyebrow">By the numbers</p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="display-lg mt-6 max-w-3xl">
            Experience that shows up in the results.
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-y-12 md:grid-cols-4">
          {STATS.map((s) => (
            <StatItem key={s.label} stat={s} run={run} />
          ))}
        </div>
      </div>
    </section>
  );
}
