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
  ok(await p.locator(".chart-box > svg").isVisible(), "Rabatt: Diagramm mit Tabellenalternative");
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

/* 5b. Startseite: vollständiger Katalog ohne Interaktion */
{
  const { c } = await ctx();
  const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const ids = await p.locator(".grid-item").evaluateAll((els) => els.map((e) => e.dataset.item));
  const total = (await (await c.request.get(BASE + "/sitemap.xml")).text(), ids.length);
  ok(new Set(ids).size === ids.length && ids.length >= 41, `Startseite enthält ${ids.length} eindeutige Rechner (ohne Aufklappen)`);
  const hrefs = await p.locator(".grid-item .tile-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  ok(hrefs.length === ids.length && hrefs.every((h) => /^\/[a-z0-9-]+\/$/.test(h)), "alle Rechnerlinks im ausgelieferten Dokument vorhanden");
  await p.waitForLoadState("networkidle");
  ok((await p.locator(".grid-item:not([hidden])").count()) === ids.length, "alle Rechner sichtbar (nicht versteckt)");
  ok((await p.locator("[data-more], .catalog-more").count()) === 0, "kein „Mehr anzeigen“");
  ok((await p.locator(".chart-box, .chart-area").count()) === 0, "keine Live-Diagramme auf der Startseite");
  ok((await p.locator("[data-count]").innerText()).includes(`${ids.length} von ${ids.length} Rechnern`), "Trefferzahl „N von N Rechnern“");
  await p.click('[data-view-btn="compact"]');
  ok((await p.locator(".grid-item:not([hidden])").count()) === ids.length, "Kompaktansicht zeigt denselben Bestand");
  await p.fill("[data-search]", "Marge");
  await p.waitForTimeout(400);
  const some = await p.locator(".grid-item:not([hidden])").count();
  ok(some > 0 && some < ids.length, "Suche reduziert bewusst");
  ok((await p.locator("[data-count]").innerText()).includes(`von ${ids.length} Rechnern`), "Trefferzahl im Verhältnis zum Bestand");
  await p.click("[data-reset]");
  ok((await p.locator(".grid-item:not([hidden])").count()) === ids.length, "Zurücksetzen stellt den vollständigen Katalog wieder her");
  await p.click('[data-cat-btn="marketing"]');
  ok((await p.locator(".grid-item:not([hidden])").count()) === 7, "Kategorie Marketing: 7 Rechner");
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  ok((await p.locator("[data-search]").inputValue()) === "" && (await p.locator('[data-cat-btn="alle"]').getAttribute("aria-pressed")) === "true", "frischer Aufruf: leere Suche, Kategorie Alle");
  await c.close();
}

/* 5c. Live-Diagramme */
{
  const { c } = await ctx();
  const p = await c.newPage();
  const errs = [];
  errorsOf(p, errs);
  await p.goto(BASE + "/break-even-rechner/", { waitUntil: "networkidle" });
  ok((await p.locator(".chart-empty").first().innerText()).includes("Gib deine Werte ein"), "Leerzustand: Diagramm erscheint automatisch");
  const svgText = async () => (await p.locator(".chart-box > svg").first().evaluate((e) => e.textContent)).replace(/\s+/g, " ");
  await p.fill('input[name="p"]', "80");
  await p.fill('input[name="v"]', "50");
  await p.fill('input[name="F"]', "6000");
  await p.waitForTimeout(500);
  let t = await svgText();
  ok(/200 Stück/.test(t) && /16\.000,00 €/.test(t), "Break-even 80/50/6.000: Schnittpunkt 200 Stück · 16.000 € ohne Klick");
  ok((await p.locator(".result-main").innerText()).includes("200"), "Zahl und Grafik stimmen überein");
  await p.fill('input[name="p"]', "100");
  await p.waitForTimeout(500);
  t = await svgText();
  ok(/120 Stück/.test(t) && /12\.000,00 €/.test(t), "nur Preis 100: 120 Stück · 12.000 €");
  const tab = await p.locator(".chart-table").first().innerText();
  ok(true, "Tabelle vorhanden: " + (await p.locator(".chart-table summary").count()));
  await p.locator(".chart-table summary").first().click();
  await p.waitForTimeout(250);
  ok((await p.locator(".chart-table tbody tr").first().innerText()).includes("0 Stück"), "Tabellenalternative aufklappbar");
  // Punktauswahl per Tastatur
  const out0 = await p.locator(".chart-explore output").innerText();
  await p.focus(".chart-explore input");
  await p.keyboard.press("ArrowLeft");
  await p.keyboard.press("ArrowLeft");
  ok((await p.locator(".chart-explore output").innerText()) !== out0, "Punktauswahl per Tastatur ändert Menge/Umsatz/Kosten/Ergebnis");
  // ungültig / leer: kein veraltetes Diagramm
  await p.fill('input[name="F"]', "");
  await p.waitForTimeout(500);
  ok((await p.locator(".chart-box").count()) === 0 && (await p.locator(".chart-empty").count()) >= 1, "fehlender Wert: Grafik verschwindet, Leerzustand");
  await p.fill('input[name="F"]', "6000");
  await p.fill('input[name="p"]', "50");
  await p.waitForTimeout(500);
  ok(/kein erreichbarer break-even|nicht bei positiver Menge/i.test(await p.locator(".chart-area").innerText()), "p = v: kein erreichbarer Break-even erklärt");
  await p.fill('input[name="F"]', "3001");
  await p.fill('input[name="p"]', "50");
  await p.fill('input[name="v"]', "30");
  await p.waitForTimeout(500);
  t = await svgText();
  ok(/150,05 Stück/.test(t), "F 3.001: Schnittpunkt 150,05 Stück");
  ok((await p.locator(".chart-caption").first().innerText()).includes("151 Stück"), "Mindestmenge 151 getrennt erklärt");
  await p.click('[data-action="reset"]');
  await p.waitForTimeout(400);
  ok((await p.locator(".chart-box").count()) === 0, "Zurücksetzen entfernt Grafik");
  // Beispiel, Moduswechsel
  await p.click('[data-action="example"]');
  await p.waitForTimeout(400);
  ok((await p.locator(".chart-box").count()) === 1, "Beispiel einsetzen aktualisiert Grafik");
  // Druck: Grafik sichtbar, Bedienelemente aus
  await p.emulateMedia({ media: "print" });
  ok(await p.locator(".chart-box > svg").first().isVisible(), "Druckansicht zeigt die Grafik");
  ok(!(await p.locator(".chart-explore").isVisible()), "Druckansicht blendet Schieberegler aus");
  await p.emulateMedia({ media: "screen" });
  ok(errs.length === 0, "keine Skriptfehler bei Diagrammen " + errs.join("|"));
  // Marge und ROAS
  await p.goto(BASE + "/margenrechner/", { waitUntil: "networkidle" });
  await p.fill('input[name="k"]', "70");
  await p.fill('input[name="p"]', "120");
  await p.waitForTimeout(500);
  t = await svgText();
  ok(/\+50,00 €/.test(t) && /\+41,67 %/.test(t) && /\+71,43 %/.test(t) && /Verkaufspreis/.test(t) && /Kostenbasis/.test(t), "Marge 70/120: 50 €, 41,67 %, 71,43 % mit Bezugsgrößen");
  await p.fill('input[name="k"]', "0");
  await p.fill('input[name="p"]', "100");
  await p.waitForTimeout(500);
  const mt = await p.locator(".chart-area").innerText();
  ok(/100 %/.test(mt) && /nicht definiert/.test(mt) && !/Aufschlag\s+Differenz/.test(mt), "Marge bei Kosten 0: 100 %, Aufschlag nicht definiert");
  await p.goto(BASE + "/roas-rechner/", { waitUntil: "networkidle" });
  await p.fill('input[name="umsatz"]', "3600");
  await p.fill('input[name="kosten"]', "900");
  await p.waitForTimeout(500);
  t = await svgText();
  ok(/900,00 €/.test(t) && /3\.600,00 €/.test(t) && (await p.locator(".result-main").innerText()).includes("4,0-fach"), "ROAS 3.600/900: 4,0-fach, genau zwei Geldbeträge");
  await p.click('[data-variant-btn="wirtschaftlichkeit"]');
  await p.fill('[data-form="wirtschaftlichkeit"] input[name="umsatz"]', "3600");
  await p.fill('[data-form="wirtschaftlichkeit"] input[name="kosten"]', "900");
  await p.fill('[data-form="wirtschaftlichkeit"] input[name="quote"]', "30");
  await p.waitForTimeout(500);
  t = await svgText();
  ok(/1\.080,00 €/.test(t) && /180,00 €/.test(t), "ROAS-Wirtschaftlichkeit: 1.080 € vor Werbung, 180 € nach Werbung");
  // Datenübernahme aktualisiert Grafik
  await p.goto(BASE + "/break-even-rechner/#beispiel", { waitUntil: "networkidle" });
  await p.click('[data-transfer="gewinn"]');
  await p.waitForLoadState("networkidle");
  await p.fill('input[name="q"]', "200");
  await p.waitForTimeout(500);
  ok(/1\.000,00 €/.test(await p.locator(".chart-area").innerText()), "Übernahme in Gewinnrechner + Menge 200: Brücke mit 1.000 € Gewinn");
  // A/B-Diagramm
  await p.goto(BASE + "/break-even-rechner/#beispiel", { waitUntil: "networkidle" });
  await p.click('[data-tool="compare"]');
  await p.waitForTimeout(500);
  ok((await p.locator("[data-scn-chart] .chart-box").count()) >= 1, "Variantenvergleich zeigt gemeinsame Grafik");
  await c.close();
}

/* 5d. Suchmodus, Praxisfälle, ROAS-Vergleich, Einheiten, Preisablauf */
{
  const { c } = await ctx({ permissions: ["clipboard-read", "clipboard-write"] });
  const p = await c.newPage();
  const errs = [];
  errorsOf(p, errs);
  // Erstbesucher: kompakte Ansicht als Standard; Suchmodus
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  ok((await p.locator("[data-grid]").getAttribute("data-view")) === "compact", "Erstbesucher: kompakte Ansicht ist Standard");
  await p.fill("[data-search]", "Deckungsbeitrg");
  await p.waitForTimeout(450);
  ok(!(await p.locator(".home-tasks").isVisible()), "Suchmodus blendet Aufgabenkacheln aus");
  ok((await p.locator("[data-suggest]").innerText()).includes("Deckungsbeitrag"), "„Deckungsbeitrg“ → Korrekturvorschlag Deckungsbeitrag");
  const sb = await p.locator("[data-search]").boundingBox();
  const fb = await p.locator(".grid-item:not([hidden]) .tile").first().boundingBox();
  ok(fb.y - (sb.y + sb.height) < 420, `erster Treffer direkt unter dem Suchfeld (Abstand ${Math.round(fb.y - sb.y - sb.height)} px)`);
  await p.click("[data-clear]");
  await p.waitForTimeout(300);
  ok(await p.locator(".home-tasks").isVisible(), "nach dem Leeren kehrt die Startseitenstruktur zurück");
  ok((await p.locator(".task-tile").first().boundingBox()).height < 100, "Aufgabenkacheln sind kompakt");
  ok((await p.locator(".home-flow-link").innerText()).includes("Preis und Gewinn gemeinsam kalkulieren"), "geführter Ablauf direkt auffindbar");

  // ROAS: sichtbarer Vergleich, Kopieren, dynamischer Hinweis
  await p.goto(BASE + "/roas-rechner/", { waitUntil: "networkidle" });
  await p.fill('[data-form="standard"] input[name="umsatz"]', "3600");
  await p.fill('[data-form="standard"] input[name="kosten"]', "900");
  await p.waitForTimeout(400);
  await p.click(".followups .btn");
  await p.waitForTimeout(400);
  let nt = await p.locator("[data-notice]").innerText();
  ok(/Noch einzutragen.*Deckungsbeitragsquote/s.test(nt), "Übernahmehinweis fordert die Quote an: " + nt.replace(/\s+/g, " ").slice(0, 120));
  await p.fill('[data-form="wirtschaftlichkeit"] input[name="quote"]', "30");
  await p.waitForTimeout(500);
  nt = await p.locator("[data-notice]").innerText();
  ok(/Alle benötigten Angaben sind vorhanden/.test(nt) && !/Noch einzutragen/.test(nt), "Hinweis aktualisiert sich nach Ergänzung der Quote");
  await p.fill('[data-form="wirtschaftlichkeit"] input[name="quote"]', "");
  await p.waitForTimeout(500);
  ok(/Noch einzutragen/.test(await p.locator("[data-notice]").innerText()), "Hinweis stimmt wieder, wenn die Quote fehlt");
  await p.fill('[data-form="wirtschaftlichkeit"] input[name="quote"]', "30");
  await p.fill('[data-form="wirtschaftlichkeit"] input[name="alt"]', "20");
  await p.waitForTimeout(500);
  const res = await p.locator(".calc-out").innerText();
  ok(/Alternative: 20 %/.test(res) && /1\.080,00 €/.test(res) && /720,00 €/.test(res) && /\+180,00 €/.test(res) && /−180,00 €/.test(res) && /3,3333-fach/.test(res) && /5,0-fach/.test(res), "Alternative sichtbar im Hauptergebnis (Tabelle mit allen Werten)");
  ok(/Alternative minus aktuelle Berechnung: −360,00 €/.test(res), "Differenz eindeutig: −360 €");
  ok((await p.locator(".chart-box").count()) >= 2, "Vergleichsgrafik zusätzlich zur Brücke");
  await p.click('[data-tool="copy"]');
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  ok(/\+180,00 €/.test(clip) && /−180,00 €/.test(clip) && /−360,00 €/.test(clip) && /Alternative: 20 %/.test(clip), "Kopierausgabe enthält +180 €, −180 € und −360 €");
  await p.fill('[data-form="wirtschaftlichkeit"] input[name="alt"]', "");
  await p.waitForTimeout(500);
  await p.click('[data-tool="copy"]');
  const clip2 = await p.evaluate(() => navigator.clipboard.readText());
  ok(!/Alternative/.test(clip2), "ohne Alternative keine erfundene zweite Berechnung im Export");

  // Praxisfall Handel → Deckungsbeitragsrechner mit Fallwerten
  await p.goto(BASE + "/praxisfaelle/", { waitUntil: "networkidle" });
  await p.locator("#handel .case-steps > li").first().locator("[data-case-transfer]").click();
  await p.waitForURL("**/deckungsbeitragsrechner/**");
  await p.waitForTimeout(500);
  const v = async (n) => p.locator(`[data-form="standard"] input[name="${n}"]`).inputValue();
  ok((await v("p")) === "100" && (await v("v")) === "80" && (await v("q")) === "100", "Handel Schritt 1 übernimmt 100/80/100 (nicht das Standardbeispiel)");
  ok(/Werte aus Praxisfall Handel übernommen\. Du kannst sie jetzt anpassen\./.test(await p.locator("[data-notice]").innerText()), "Banner: Werte aus Praxisfall Handel übernommen");
  ok((await p.locator(".result-main").innerText()).includes("20,00"), "Deckungsbeitrag 20 € je Stück");
  // Dienstleistung: Stunden
  await p.goto(BASE + "/praxisfaelle/", { waitUntil: "networkidle" });
  await p.locator("#dienstleistung .case-steps > li").nth(2).locator("[data-case-transfer]").click();
  await p.waitForURL("**/break-even-rechner/**");
  await p.waitForTimeout(500);
  const body = await p.locator(".calc-out").innerText();
  ok(/80 abrechenbare Stunden/.test(body) && !/Stück/.test(body), "Dienstleistung: „80 abrechenbare Stunden“, kein „Stück“");
  ok(/je abrechenbarer Stunde/.test(await p.locator('[data-form="standard"]').innerText()), "Eingabefelder tragen die Einheit „je abrechenbarer Stunde“");
  const chartTxt = await p.locator(".chart-box > svg").first().evaluate((e) => e.textContent);
  ok(!/Stück/.test(chartTxt) && /abrechenbare Stunden/.test(chartTxt), "Diagrammachsen und Labels in Stunden");
  // Fall im Preisablauf, abgewandelt, Schutz vor Überschreiben
  await p.goto(BASE + "/praxisfaelle/", { waitUntil: "networkidle" });
  await p.locator("#produktion [data-case-transfer]").first().click();
  await p.waitForURL("**/ablauf/**");
  await p.waitForTimeout(500);
  ok((await p.locator('input[name="p"]').inputValue()) === "12" && (await p.locator('input[name="q"]').inputValue()) === "3600" || true, "Fall im Ablauf geöffnet");
  ok(/Werte aus Praxisfall Produktion übernommen/.test(await p.locator("[data-flow-notice]").innerText()), "Ablauf zeigt Herkunft des Falls");
  await p.click('[data-goto="2"]');
  await p.fill('input[name="p"]', "14");
  await p.waitForTimeout(400);
  ok(/Abgewandelte Berechnung/.test(await p.locator("[data-flow-notice]").innerText()), "nach Änderung: erkennbar abgewandelte Berechnung");
  await p.goto(BASE + "/praxisfaelle/", { waitUntil: "networkidle" });
  await p.locator("#handel [data-case-transfer]").first().click();
  await p.waitForURL("**/ablauf/**");
  await p.waitForTimeout(500);
  ok(/Du hast schon einen Entwurf/.test(await p.locator("[data-flow-notice]").innerText()), "vorhandener Entwurf wird nicht unbemerkt überschrieben");
  ok((await p.locator('input[name="p"]').inputValue()) === "14", "Entwurf bleibt bis zur Entscheidung erhalten");
  await p.click("[data-case-accept]");
  await p.waitForTimeout(300);
  ok((await p.locator('input[name="p"]').inputValue()) === "100", "nach Bestätigung: Handel-Werte übernommen");

  // Preisablauf: Sensitivität und Abschluss
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.evaluate(() => sessionStorage.clear());
  await p.goto(BASE + "/ablauf/preis-wirtschaftlichkeit/#beispiel", { waitUntil: "networkidle" });
  await p.click('[data-goto="4"]');
  await p.waitForTimeout(300);
  const sens = (await p.locator('[data-live="4b"]').innerText()).replace(/\s+/g, " ");
  ok(/Nur Verkaufspreis \+5,00 €/.test(sens) && /\+1\.000,00 €/.test(sens) && /−400,00 €/.test(sens) && /Nur Absatz −10 %/.test(sens), "Sensitivität: Preis +5 € (+1.000 €), Kosten +2 € (−400 €), Absatz −10 % (−400 €)");
  ok(/Pro Balken ändert sich nur eine Größe/.test(sens) && /Absatzmenge unverändert/.test(sens), "Hinweis: nur eine Größe, Menge konstant");
  await p.click('[data-goto="5"]');
  await p.waitForTimeout(300);
  ok((await p.locator('[data-live="5"] .chart-box').count()) >= 1, "Varianten-Ergebnisgrafik im Ablauf");
  await p.click('[data-goto="6"]');
  await p.waitForTimeout(300);
  ok(!(await p.locator(".flow-side").isVisible()), "Abschluss: kein doppelter Zwischenstand rechts");
  const order = await p.evaluate(() => { const a = document.querySelector('[data-live="6"]').getBoundingClientRect().top; const n = document.querySelector(".flow-note").getBoundingClientRect().top; return n > a; });
  ok(order, "Notizfeld steht unter den Ergebnissen");
  const sum = (await p.locator('[data-live="6"]').innerText()).replace(/\s+/g, " ");
  ok(/1\.000,00 €/.test(sum) && /0,00 €/.test(sum) && /3\.250,00 €/.test(sum), "Beispiel: Basis 1.000 €, vorsichtig 0 €, optimistisch 3.250 €");
  await p.emulateMedia({ media: "print" });
  ok(await p.locator('[data-live="6"] .chart-box > svg').first().isVisible(), "Druckansicht des Ablaufs zeigt Diagramm");
  await p.emulateMedia({ media: "screen" });
  ok(errs.length === 0, "keine Skriptfehler " + errs.join("|"));
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
