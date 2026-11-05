// Browser-Smoke-Test der wesentlichen Nutzerwege (Playwright). Voraussetzung: `npm run build && npm run preview`.
// Aufruf: NODE_PATH=$(npm root -g) node scripts/e2e-smoke.mjs [http://localhost:4321]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.argv[2] ?? "http://localhost:4321";
const fails = [];
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) fails.push(msg);
};

const browser = await chromium.launch();
async function ctx(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  const external = [];
  await c.route(/googletagmanager|google-analytics|googleapis|gstatic/, (r) => {
    external.push(r.request().url());
    r.abort();
  });
  return { c, external };
}
const errorsOf = (p, list) => {
  p.on("pageerror", (e) => list.push("pageerror: " + e.message));
  p.on("console", (m) => m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text()) && list.push("console: " + m.text()));
};

/* 1. Erstbesuch: Banner, keine externen Anfragen vor Zustimmung */
{
  const { c, external } = await ctx();
  const p = await c.newPage();
  const errs = [];
  errorsOf(p, errs);
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  ok(await p.locator("[data-consent]").isVisible(), "Einwilligungsabfrage beim Erstbesuch sichtbar");
  ok(external.length === 0, "vor Zustimmung keine Anfragen an Google");
  ok((await p.locator("h1").innerText()).includes("Preise kalkulieren"), "Startseite: neue Hauptüberschrift");
  ok((await p.locator(".task-tile").count()) === 5, "Startseite: fünf Aufgabeneinstiege");
  // Suche mit Tippfehler
  await p.fill("[data-search]", "Deckungsbeitarg");
  await p.waitForTimeout(400);
  ok((await p.locator("[data-suggest]").innerText()).includes("Deckungsbeitrag"), "Tippfehler-Vorschlag „Deckungsbeitrag“");
  ok((await p.locator(".grid-item:not([hidden])").count()) > 0, "Tippfehler liefert direkt Treffer");
  await p.fill("[data-search]", "Wie viel muss ich verkaufen");
  await p.waitForTimeout(400);
  const first = await p.locator(".grid-item:not([hidden]) .tile-title").first().innerText();
  ok(/Break-even/.test(first), "Alltagsfrage: Break-even führt");
  await p.fill("[data-search]", "xyzqwv");
  await p.waitForTimeout(400);
  ok(await p.locator("[data-empty]").isVisible(), "Suche ohne Treffer: aktiver Leerzustand");
  ok(!(await p.locator("[data-suggest]").isVisible()), "kein unpassender Vorschlag");
  // Ablehnen
  await p.click('[data-consent-choice="denied"]');
  ok(external.length === 0, "nach Ablehnung keine Anfragen an Google");
  ok(errs.length === 0, "keine Skriptfehler auf der Startseite " + errs.join("|"));
  // Kompakte Ansicht
  await p.fill("[data-search]", "");
  await p.click('[data-view-btn="compact"]');
  ok((await p.locator("[data-grid]").getAttribute("data-view")) === "compact", "Kompaktansicht wählbar");
  await p.reload({ waitUntil: "networkidle" });
  ok((await p.locator("[data-grid]").getAttribute("data-view")) === "compact", "Ansicht bleibt lokal gemerkt");
  ok(!(await p.locator("[data-consent]").isVisible()), "Ablehnung bleibt gespeichert");
  await c.close();
}

/* 2. Zustimmung: nur Kennungen, keine Werte */
{
  const { c, external } = await ctx();
  const p = await c.newPage();
  await p.goto(BASE + "/break-even-rechner/", { waitUntil: "networkidle" });
  await p.click('[data-consent-choice="granted"]');
  await p.waitForTimeout(500);
  ok(external.some((u) => u.includes("googletagmanager.com/gtag/js")), "nach Zustimmung wird gtag geladen");
  await p.fill('input[name="p"]', "5043");
  await p.fill('input[name="v"]', "3017");
  await p.fill('input[name="F"]', "48211");
  await p.waitForTimeout(800);
  const dl = await p.evaluate(() => JSON.stringify(window.dataLayer ?? []));
  ok(!/5043|3017|48211/.test(dl), "Rechenwerte landen nicht im Mess-Datenstrom");
  ok(/calc_started/.test(dl) && /calc_result/.test(dl), "Ereignisse calc_started und calc_result vorhanden");
  ok((dl.match(/calc_result/g) ?? []).length === 1, "calc_result wird nur einmal gezählt");
  ok(!/5043|3017|48211/.test(external.join(" ")), "Rechenwerte nicht in Anfrage-URLs");
  await c.close();
}

/* 3. Break-even: Ergebnis, Zeitraumregel, Speichern, Löschen, Rückgängig */
{
  const { c } = await ctx();
  const p = await c.newPage();
  const errs = [];
  errorsOf(p, errs);
  await p.goto(BASE + "/break-even-rechner/#beispiel", { waitUntil: "networkidle" });
  const main = await p.locator(".result-main").innerText();
  ok(main.includes("150"), "Break-even-Beispiel: 150 Stück als Hauptergebnis");
  ok(await p.locator(".example-flag").first().isVisible(), "Beispielwerte sind gekennzeichnet");
  ok(await p.locator(".followups").isVisible(), "Folgeaktion beim Ergebnis sichtbar");
  // Szenarien mit ungleichen Zeiträumen
  await p.click('[data-tool="compare"]');
  await p.selectOption('[data-scenario] select[name="zeitraum"]', "monat");
  await p.fill('[data-scn="A"] input[name="p"]', "50");
  await p.fill('[data-scn="A"] input[name="v"]', "30");
  await p.fill('[data-scn="A"] input[name="F"]', "3000");
  await p.fill('[data-scn="B"] input[name="p"]', "55");
  await p.fill('[data-scn="B"] input[name="v"]', "30");
  await p.fill('[data-scn="B"] input[name="F"]', "3000");
  await p.waitForTimeout(300);
  ok((await p.locator("[data-scn-result]").innerText()).includes("−30 Stück"), "A/B im selben Zeitraum: Differenz −30 Stück");
  // Speichern
  await p.click('[data-tool="save"]');
  await p.fill("#save-name", "Test A");
  await p.fill("#save-note", "Fixkosten geschätzt");
  await p.selectOption("#save-project", "__new");
  await p.fill("#save-newproject", "Angebot X");
  await p.click('[data-save-form] button[value="save"]');
  await p.waitForTimeout(300);
  await p.goto(BASE + "/gespeichert/", { waitUntil: "networkidle" });
  ok((await p.locator(".saved-item h3").first().innerText()) === "Test A", "Gespeicherte Berechnung erscheint");
  ok((await p.locator(".ws-preview").first().innerText()).includes("150"), "Ergebnisvorschau live berechnet");
  ok((await p.locator(".ws-group h2").first().innerText()) === "Angebot X", "Gruppierung nach Vorhaben");
  await p.click("[data-dup]");
  await p.waitForTimeout(300);
  ok((await p.locator(".saved-item").count()) === 2, "Duplizieren erzeugt Kopie");
  await p.locator("[data-del]").first().click();
  await p.waitForTimeout(300);
  ok((await p.locator(".saved-item[data-id]").count()) === 1, "Löschen entfernt Eintrag");
  ok(await p.locator(".toast-action").isVisible(), "Rückgängig-Schaltfläche erscheint");
  await p.focus(".toast-action");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(400);
  ok((await p.locator(".saved-item[data-id]").count()) === 2, "Rückgängig per Tastatur stellt wieder her");
  // Export
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("[data-export]")]);
  const path = await dl.path();
  const { readFileSync } = await import("node:fs");
  const json = JSON.parse(readFileSync(path, "utf8"));
  ok(json.app === "KPILot" && json.items.length === 2 && json.projects.length === 1 && !JSON.stringify(json).includes("consent"), "Sicherung enthält Berechnungen und Vorhaben, keine Einwilligung");
  ok(errs.length === 0, "keine Skriptfehler " + errs.join("|"));
  await c.close();
}

/* 4. Rabatt und Werbung */
{
  const { c } = await ctx();
  const p = await c.newPage();
  await p.goto(BASE + "/rabatt-mehrabsatz-rechner/#beispiel", { waitUntil: "networkidle" });
  ok((await p.locator(".result-main").innerText()).includes("100"), "Rabatt: +100 % Mehrabsatz");
  ok((await p.locator(".result-l2").innerText()).includes("200"), "Rabatt: erforderliche Menge 200");
  ok(await p.locator(".chart-box svg").isVisible(), "Rabatt: Diagramm mit Tabellenalternative");
  ok((await p.locator(".chart-table summary").count()) === 1, "Diagramm hat Tabellenalternative");
  await p.goto(BASE + "/roas-rechner/#wirtschaftlichkeit:beispiel", { waitUntil: "networkidle" });
  const txt = await p.locator(".calc-out").innerText();
  ok(/100,00 €/.test(txt) && /600,00 €/.test(txt) && /3,33/.test(txt), "ROAS: Beitrag 100 €, vor Werbung 600 €, Mindest-ROAS 3,33");
  await c.close();
}

/* 5. Ablauf Preis & Wirtschaftlichkeit */
{
  const { c } = await ctx();
  const p = await c.newPage();
  const errs = [];
  errorsOf(p, errs);
  await p.goto(BASE + "/ablauf/preis-wirtschaftlichkeit/#beispiel", { waitUntil: "networkidle" });
  for (let i = 0; i < 5; i++) await p.click("[data-next]");
  const t = await p.locator('[data-live="6"]').innerText();
  ok(/150 Stück/.test(t) && /1\.000,00 €/.test(t), "Ablauf-Übersicht: 150 Stück, 1.000 € Ergebnis");
  ok(/Vorsichtig/.test(t) && /Optimistisch/.test(t), "Ablauf-Übersicht: Varianten");
  await p.click('[data-goto="3"]');
  await p.fill('input[name="q"]', "");
  await p.waitForTimeout(400);
  const side = await p.locator("[data-side]").innerText();
  ok(/Noch offen/.test(side) && /Absatzmenge/.test(side), "fehlende Menge wird benannt (nicht 0)");
  await p.fill('input[name="q"]', "200");
  await p.waitForTimeout(400);
  ok(!/Noch offen/.test(await p.locator("[data-side]").innerText()), "Hinweis verschwindet nach Ergänzung");
  ok(errs.length === 0, "keine Skriptfehler im Ablauf " + errs.join("|"));
  await c.close();
}

/* 6. Mobile: kein horizontales Scrollen */
for (const [w, h] of [[360, 740], [414, 896], [768, 1024], [1280, 900]]) {
  const { c } = await ctx({ viewport: { width: w, height: h } });
  const p = await c.newPage();
  for (const path of ["/", "/rechner/", "/break-even-rechner/#beispiel", "/rabatt-mehrabsatz-rechner/#beispiel", "/gespeichert/", "/ablauf/preis-wirtschaftlichkeit/#beispiel", "/praxisfaelle/", "/lernen/welche-kennzahl/", "/aufgaben/verkaufspreis-bestimmen/", "/ueber/", "/datenschutz/", "/impressum/"]) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${w}px ${path}: kein horizontales Seitenscrollen (${over})`);
  }
  await c.close();
}

await browser.close();
if (fails.length) {
  console.error(`\n${fails.length} Prüfung(en) fehlgeschlagen.`);
  process.exit(1);
}
console.log("\nAlle Browserprüfungen bestanden.");
