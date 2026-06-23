import sharp from "sharp";
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const dir = "public/images";
const files = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));

for (const f of files) {
  const input = join(dir, f);
  const out = join(dir, f.replace(/\.(png|jpe?g)$/i, ".webp"));
  const before = statSync(input).size;
  await sharp(input)
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  const after = statSync(out).size;
  unlinkSync(input); // remove the heavy original
  console.log(
    `${f} -> ${f.replace(/\.(png|jpe?g)$/i, ".webp")}  ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`,
  );
}
console.log("done");
