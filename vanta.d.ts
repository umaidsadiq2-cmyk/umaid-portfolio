declare module "three";

declare module "vanta/dist/vanta.fog.min" {
  interface VantaEffect {
    destroy: () => void;
    setOptions?: (opts: Record<string, unknown>) => void;
  }
  const fog: (opts: Record<string, unknown>) => VantaEffect;
  export default fog;
}
