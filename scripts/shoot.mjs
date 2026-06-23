import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });
const base = "http://localhost:3000";
const browser = await chromium.launch();

async function viewportShots(width, height, prefix) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Scene 01 — opening
  await page.screenshot({ path: `${OUT}/${prefix}-01-opening.png` });

  // Find the services stack and capture the stacking effect at depths
  const top = await page.evaluate(() => {
    const el = document.getElementById("services");
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  const vh = height;
  const depths = [0.6, 1.7, 3.0, 4.6, 6.0];
  for (let i = 0; i < depths.length; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), top + depths[i] * vh);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${prefix}-stack-${i + 1}.png` });
  }

  // Bottom — closing scene
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${prefix}-closing.png` });

  await page.close();
  console.log(prefix, "done");
}

await viewportShots(1440, 900, "d");
await viewportShots(390, 844, "m");
await browser.close();
console.log("all done");
