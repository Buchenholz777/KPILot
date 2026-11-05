// Durchlauf aller Rechner und Modi im Browser: Beispiel einsetzen → Ergebnisgrafik vorhanden, ohne NaN/Infinity, ohne Skriptfehler,
// ohne horizontales Seitenscrollen (Desktop und 375 px). Voraussetzung: `npm run build && npm run preview`.
// Aufruf: NODE_PATH=$(npm root -g) node scripts/e2e-charts.mjs [http://localhost:4321]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.argv[2] ?? "http://localhost:4321";
const browser = await chromium.launch();
const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await c.addInitScript(() => localStorage.setItem("kr.consent.v1", JSON.stringify({ v: 1, analytics: "denied", at: 1 })));
const home = await c.newPage();
await home.goto(BASE + "/", { waitUntil: "domcontentloaded" });
const hrefs = await home.locator(".grid-item .tile-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
await home.close();
let modes = 0,
  bad = 0;
const rows = [];
for (const [w, h] of [[1280, 900], [375, 800]]) {
  const p = await c.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  for (const href of hrefs) {
    await p.goto(BASE + href, { waitUntil: "networkidle" });
    const variants = await p.locator("[data-variant-btn]").evaluateAll((els) => els.map((e) => e.dataset.variantBtn));
    const list = variants.length ? variants : [""];
    for (const v of list) {
      await p.goto(BASE + href + (v ? `#${v}:beispiel` : "#beispiel"), { waitUntil: "networkidle" });
      await p.reload({ waitUntil: "networkidle" });
      await p.waitForTimeout(250);
      const n = await p.locator(".chart-box > svg").count();
      const txt = await p.locator(".chart-area").first().innerText().catch(() => "");
      const svgTxt = await p.locator(".chart-box > svg").evaluateAll((els) => els.map((e) => e.textContent).join(" "));
      const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const tables = await p.locator(".chart-table").count();
      const kinds = await p.locator(".chart-box").evaluateAll((els) => els.map((e) => e.dataset.kind));
      const problem = n === 0 || /NaN|Infinity|undefined/.test(txt + svgTxt) || over > 0 || tables < n || errs.length;
      modes++;
      if (problem) {
        bad++;
        console.log(`✗ ${w}px ${href}${v ? "#" + v : ""}: Grafiken ${n}, Tabellen ${tables}, Überlauf ${over}, ${errs.join("|")}`);
        errs.length = 0;
      } else if (w === 1280) rows.push(`${href}${v ? "#" + v : ""} → ${kinds.join("+")}`);
    }
  }
  await p.close();
}
console.log(rows.join("\n"));
console.log(`\n${modes} Rechner-Modus-Aufrufe (Desktop + 375 px), ${bad} mit Befund.`);
await browser.close();
process.exit(bad ? 1 : 0);
