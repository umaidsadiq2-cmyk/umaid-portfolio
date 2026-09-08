/**
 * Grain — an ultra-light film texture over the whole page (~4% opacity) so the
 * large flat white areas never feel dead. A single fixed, inline-SVG
 * fractal-noise tile (no network request), aria-hidden, pointer-events: none,
 * beneath the navbar/overlays. Drifts slowly under motion; static otherwise.
 * See `.grain` in globals.css.
 */
export function Grain() {
  return <div aria-hidden className="grain" />;
}
