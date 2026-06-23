import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const failures = [];
page.on("requestfailed", (r) => failures.push(r.url() + " :: " + r.failure()?.errorText));
page.on("response", (r) => {
  if (r.url().includes("/images/")) console.log("RESP", r.status(), r.url());
});
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const imgs = await page.evaluate(() =>
  Array.from(document.querySelectorAll("img")).map((i) => ({
    src: i.currentSrc || i.src,
    complete: i.complete,
    nw: i.naturalWidth,
    opacity: getComputedStyle(i).opacity,
  })),
);
console.log("IMGS", JSON.stringify(imgs, null, 2));
console.log("FAILED", failures);
await browser.close();
