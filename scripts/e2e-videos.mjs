// Browser-Test der Erklärvideo-Integration (Playwright). Voraussetzung: `npm run build && npm run preview`.
// Aufruf: NODE_PATH=$(npm root -g) node scripts/e2e-videos.mjs [http://localhost:4321]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.argv[2] ?? "http://localhost:4321";
const fails = [];
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) fails.push(msg);
};
const PAGES = {
  "break-even": "/break-even-rechner/",
  cashflow: "/cashflow-rechner/",
  deckungsbeitrag: "/deckungsbeitragsrechner/",
  marge: "/margenrechner/",
  roi: "/roi-rechner/",
  conversion: "/conversion-rate-rechner/",
  "ebit-ebitda": "/ebitda-rechner/",
  roas: "/roas-rechner/",
  liquiditaet: "/liquiditaetsrechner/",
  "clv-cac": "/clv-rechner/",
  "rabatt-mehrabsatz": "/rabatt-mehrabsatz-rechner/",
  "amortisation-kapitalwert": "/amortisationsrechner/",
};

const browser = await chromium.launch();

/* 1. Jede Videoseite: Karte vorhanden, kein Video-Download, kein <video> vor Interaktion, Untertitel erreichbar */
for (const [id, path] of Object.entries(PAGES)) {
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  const mp4 = [];
  const errs = [];
  p.on("request", (r) => /\.mp4/.test(r.url()) && mp4.push(r.url()));
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  ok((await p.locator("[data-video-card]").count()) === 1, `${id}: Videokarte vorhanden`);
  ok((await p.locator(".video-heading").innerText()) === "In 60 Sekunden verstehen", `${id}: Titel „In 60 Sekunden verstehen“`);
  ok((await p.locator("video").count()) === 0, `${id}: kein <video> vor Interaktion`);
  ok(mp4.length === 0, `${id}: keine Videodatei beim Seitenaufruf geladen`);
  ok((await p.locator(".video-thumb img").getAttribute("loading")) === "lazy", `${id}: Vorschaubild lazy`);
  const vtt = await p.request.get(`${BASE}/videos/${id}.vtt`);
  ok(vtt.ok() && (await vtt.text()).startsWith("WEBVTT"), `${id}: Untertitel /videos/${id}.vtt erreichbar`);
  const head = await p.request.head(`${BASE}/videos/${id}-720.mp4`);
  ok(head.ok(), `${id}: Videodatei erreichbar`);
  ok((await p.locator(".video-transcript p").count()) >= 10, `${id}: Transkript im HTML`);
  ok(errs.length === 0, `${id}: keine Skriptfehler ${errs.join(" | ")}`);
  await c.close();
}

/* 2. Bedienung: Klick öffnet Dialog, Wiedergabe erst jetzt, Esc schließt und pausiert, Ende → „Jetzt selbst berechnen“ */
{
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  await p.goto(BASE + "/break-even-rechner/", { waitUntil: "networkidle" });
  const box1 = await p.locator("[data-video-card]").boundingBox();
  await p.locator(".video-thumb img").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  const box2 = await p.locator("[data-video-card]").boundingBox();
  ok(Math.abs(box1.height - box2.height) < 1, "kein Layoutsprung nach Laden des Vorschaubilds");
  await p.evaluate(() => (window.__marker = 1));
  // Tastatur: Fokus auf Vorschaubild, Enter öffnet
  await p.locator(".video-thumb").focus();
  await p.keyboard.press("Enter");
  await p.waitForSelector("dialog[open] video");
  const v = await p.evaluate(() => {
    const el = document.querySelector("dialog[open] video");
    return { autoplay: el.autoplay, muted: el.muted, controls: el.controls, tracks: el.querySelectorAll("track[kind=captions][srclang=de]").length, src: el.querySelector("source").src };
  });
  ok(v.controls && !v.autoplay, "Player mit Steuerung, ohne Autoplay-Attribut");
  ok(!v.muted, "Ton ist an (Erklärstimme)");
  ok(v.tracks === 1, "deutsche Untertitelspur eingebunden");
  ok(v.src.endsWith("/videos/break-even-720.mp4"), "Webfassung 720p wird verwendet");
  await p.waitForFunction(() => document.querySelector("dialog[open] video").currentTime > 0.5, null, { timeout: 8000 }).then(
    () => ok(true, "Video spielt nach Klick ab"),
    () => ok(false, "Video spielt nach Klick ab"),
  );
  ok(await p.evaluate(() => document.activeElement?.closest("dialog") !== null), "Fokus liegt im Dialog");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(200);
  ok((await p.locator("dialog[open]").count()) === 0, "Esc schließt den Dialog");
  ok(await p.evaluate(() => document.querySelector("dialog video").paused), "Schließen pausiert das Video");
  // erneut öffnen, Ende simulieren
  await p.locator(".video-thumb").click();
  await p.waitForSelector("dialog[open]");
  ok((await p.locator("dialog video").count()) === 1, "Video-Element wird beim erneuten Öffnen wiederverwendet");
  await p.evaluate(() => {
    const el = document.querySelector("dialog video");
    el.pause();
    el.dispatchEvent(new Event("ended"));
  });
  ok(await p.locator("[data-video-end]").isVisible(), "nach dem Video: „Jetzt selbst berechnen“ sichtbar");
  await p.locator("[data-video-calc]").click();
  await p.waitForTimeout(400);
  ok((await p.locator("dialog[open]").count()) === 0, "„Jetzt selbst berechnen“ schließt den Dialog");
  ok(p.url().endsWith("#rechner"), "springt zu #rechner");
  ok((await p.evaluate(() => window.__marker)) === 1, "ohne Neuladen der Seite");
  const top = await p.locator("#rechner").boundingBox();
  ok(top.y < 300, "Rechner ist im sichtbaren Bereich");
  await c.close();
}

/* 3. Mobil: keine horizontale Scrollleiste, Dialog passt in den Viewport */
for (const vp of [
  { width: 360, height: 740 },
  { width: 768, height: 1024 },
]) {
  const c = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: true, isMobile: vp.width < 500 });
  const p = await c.newPage();
  await p.goto(BASE + "/marge-rechner/".replace("marge-rechner", "margenrechner"), { waitUntil: "networkidle" });
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${vp.width}px: keine horizontale Scrollleiste`);
  await p.locator(".video-thumb").click();
  await p.waitForSelector("dialog[open]");
  const b = await p.locator("dialog[open] .video-frame").boundingBox();
  ok(b.width <= vp.width && b.x >= 0, `${vp.width}px: Player passt in die Breite`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${vp.width}px: Dialog ohne horizontale Scrollleiste`);
  await c.close();
}

/* 4. Lernbereich: zwölf Kacheln mit Links zu den Rechnern; Seite ohne Video hat keine Karte */
{
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  await p.goto(BASE + "/aufgaben/kennzahlen-lernen/", { waitUntil: "networkidle" });
  ok((await p.locator("#visuell").innerText()) === "Kennzahlen visuell verstehen", "Lernbereich: Abschnitt „Kennzahlen visuell verstehen“");
  ok((await p.locator(".video-tile").count()) === 12, "Lernbereich: zwölf Videokacheln");
  const hrefs = await p.locator(".video-tile-link").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  ok(JSON.stringify(hrefs.sort()) === JSON.stringify(Object.values(PAGES).sort()), "Lernbereich: Links zu den passenden Rechnern");
  await p.goto(BASE + "/nps-rechner/", { waitUntil: "networkidle" });
  ok((await p.locator("[data-video-card]").count()) === 0, "Rechner ohne Video: keine Videokarte");
  await c.close();
}

await browser.close();
if (fails.length) {
  console.error(`\n${fails.length} Fehler`);
  process.exit(1);
}
console.log("\nAlle Video-Prüfungen bestanden.");
