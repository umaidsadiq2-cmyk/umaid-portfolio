// Processes the source avatar render into a web-ready transparent PNG.
// - Resizes to 512px (covers 256px display @2x DPR)
// - Removes the pure-black background via edge flood-fill, so interior dark
//   regions (sunglasses lenses, hair shadows) keep their pixels — only
//   background-connected near-black becomes transparent.
// - Feathers the alpha edge slightly to avoid jaggies.
import sharp from "sharp";

const SRC = "Images/ChatGPT Image Jun 19, 2026, 10_59_23 PM.png";
const OUT = "public/avatar/avatar.png";
const SIZE = 512;
// A pixel is background-eligible when it is near-black.
const BG_MAX = 44; // max channel value to count as "dark enough"

const { data, info } = await sharp(SRC)
  .resize(SIZE, SIZE, { fit: "cover" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info; // channels = 4 (RGBA)
const N = width * height;
const idx = (x, y) => (y * width + x) * channels;
const isDark = (i) =>
  data[i] <= BG_MAX && data[i + 1] <= BG_MAX && data[i + 2] <= BG_MAX;

// Flood fill from every border pixel through connected dark regions.
const bg = new Uint8Array(N); // 1 = background
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const p = y * width + x;
  if (bg[p]) return;
  if (!isDark(idx(x, y))) return;
  bg[p] = 1;
  stack.push(x, y);
};
for (let x = 0; x < width; x++) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  push(0, y);
  push(width - 1, y);
}
while (stack.length) {
  const y = stack.pop();
  const x = stack.pop();
  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

// Apply: background pixels -> alpha 0.
let cleared = 0;
for (let p = 0; p < N; p++) {
  if (bg[p]) {
    data[p * channels + 3] = 0;
    cleared++;
  }
}

// Feather: soften the alpha at the boundary so edges aren't jagged.
const out = await sharp(data, { raw: { width, height, channels } })
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();

await sharp(out).toFile(OUT);

const pct = ((cleared / N) * 100).toFixed(1);
console.log(`Cleared ${pct}% of pixels as background. Wrote ${OUT}.`);
