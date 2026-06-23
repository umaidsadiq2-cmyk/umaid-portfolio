import { chromium } from "playwright";

const base = "http://localhost:3000";
const browser = await chromium.launch();
for (const path of ["/about", "/contact"]) {
  const page = await browser.newPage();
  page.on("response", (r) => {
    if (r.status() >= 400) console.log(`  ${r.status()}  ${r.url()}`);
  });
  const resp = await page.goto(base + path, { waitUntil: "networkidle" });
  console.log(`\n${path} → document status ${resp.status()}`);
  await page.waitForTimeout(800);
  await page.close();
}
await browser.close();
