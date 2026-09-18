import { chromium } from "playwright";
import fs from "node:fs";

const OUT_DIR = "/tmp/shots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = "http://localhost:3000";

const targets = [
  { name: "outlier-1-creator", url: "/outlier/creators/demo-1" },
  { name: "outlier-2-feed", url: "/outlier/feed" },
  { name: "outlier-3-video", url: "/outlier/video/demo-post-1" },
  { name: "signal-1-report", url: "/signal/report/demo-v1" },
  { name: "signal-2-benchmarks", url: "/signal/benchmarks" },
  { name: "signal-3-library", url: "/signal" },
];

const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const context = await browser.newContext({ viewport: { width: 1300, height: 1000 } });
  const page = await context.newPage();
  for (const t of targets) {
    await page.goto(BASE + t.url, { waitUntil: "networkidle" });
    await page.evaluate((th) => {
      try {
        localStorage.setItem("ws-theme", th);
      } catch {}
      document.querySelector(".ws")?.setAttribute("data-theme", th);
    }, theme);
    await page.waitForTimeout(300);
    const height = await page.evaluate(() => Math.min(document.body.scrollHeight, 2600));
    await page.setViewportSize({ width: 1300, height });
    await page.waitForTimeout(150);
    const path = `${OUT_DIR}/${t.name}-${theme}.png`;
    await page.screenshot({ path, clip: { x: 0, y: 0, width: 1300, height } });
    console.log("saved", path, height);
  }
  await context.close();
}

await browser.close();
