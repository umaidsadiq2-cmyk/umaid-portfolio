import { chromium } from "playwright";

const base = "http://localhost:3000";
const pages = ["/", "/portfolio", "/about", "/contact"];
const browser = await chromium.launch();
let problems = 0;

for (const path of pages) {
  const page = await browser.newPage();
  const msgs = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") msgs.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => msgs.push(`[pageerror] ${e.message}`));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  console.log(`\n${path}: ${msgs.length === 0 ? "✓ clean" : msgs.length + " message(s)"}`);
  for (const m of msgs) {
    console.log("   " + m);
    problems++;
  }
  await page.close();
}
await browser.close();
console.log(`\nTotal console errors/warnings: ${problems}`);
