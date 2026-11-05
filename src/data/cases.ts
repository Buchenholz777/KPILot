/**
 * Drei durchgängige Praxisfälle (ausdrücklich fiktive Annahmen). Alle Zahlen werden mit denselben Rechenfunktionen
 * wie in den Rechnern berechnet (kein Text mit von Hand eingetragenen Ergebnissen) und in tests/cases.test.ts geprüft.
 */
import { run } from "../calc/engine";
import { getVariant } from "../calc/all";
import { compareScenarios, type ScenarioComparison } from "../calc/scenario";
import type { CalcResult, Out, RawInputs } from "../calc/types";
import { formatValue } from "../lib/number";

type Ok = Extract<CalcResult, { status: "ok" }>;
const okRes = (id: string, variant: string | undefined, raw: RawInputs): Ok => {
  const r = run(getVariant(id, variant), raw).result;
  if (!r || r.status !== "ok") throw new Error(`Praxisfall: ${id}/${variant} nicht berechenbar`);
  return r;
};
const f = (o: Out) => formatValue(o.value, o.format, o.unit, o.signed);
const pick = (r: Ok, label: string): Out => {
  const o = r.main.label.startsWith(label) ? r.main : r.extra?.find((e) => e.label.startsWith(label));
  if (!o) throw new Error(`Ergebnis „${label}“ fehlt`);
  return o;
};

export interface CaseStep {
  title: string;
  /** Kurzer erklärender Text. */
  text: string;
  /** Rechenzeilen aus den Rechenfunktionen. */
  lines: string[];
  /** Rechner, in dem sich der Schritt nachvollziehen lässt. */
  calc: string;
  variant?: string;
}

export interface PracticeCase {
  id: "handel" | "dienstleistung" | "produktion";
  title: string;
  sector: string;
  question: string;
  /** Ausdrücklich fiktive Annahmen. */
  assumptions: string[];
  steps: CaseStep[];
  result: string;
  compare: { title: string; names: [string, string]; comparison: ScenarioComparison };
  next: string;
  /** Werte zum Übernehmen in einen Rechner. */
  transfers: { label: string; target: string; values: Record<string, string>; describe: string }[];
  /** Zentrale Prüfwerte (für Tests). */
  check: Record<string, string>;
}

export function buildCases(): PracticeCase[] {
  /* ---------- Handel ---------- */
  const h = { preis: "100", v: "80", rabatt: "10", q0: "100", zeitraum: "monat" };
  const hF = "1500";
  const hDb = okRes("deckungsbeitrag", undefined, { p: h.preis, v: h.v, q: h.q0 });
  const hGew0 = okRes("gewinn", "menge", { p: h.preis, v: h.v, F: hF, q: h.q0, zeitraum: "monat" });
  const hRab = okRes("rabatt-absatz", "prozent", h);
  const hNeu = okRes("gewinn", "menge", { p: "90", v: h.v, F: hF, q: "140", zeitraum: "monat" });
  const hBe = okRes("break-even", undefined, { p: "90", v: h.v, F: hF, zeitraum: "monat" });
  const handel: PracticeCase = {
    id: "handel",
    title: "Handel: Lohnt sich ein Rabatt?",
    sector: "Handel",
    question: "Ein Händler überlegt, ein Produkt mit 10 % Rabatt anzubieten. Wie viel mehr müsste er verkaufen – und was bleibt am Ende?",
    assumptions: [
      "Fiktives Produkt: Nettopreis 100 €, variable Kosten (Einkauf und Versand) 80 € je Stück.",
      "Fixkosten des Händlers: 1.500 € im Monat; bisher 100 Stück im Monat.",
      "Der Rabatt könnte laut Vertriebsschätzung (reine Annahme) 140 statt 100 Stück bringen.",
    ],
    steps: [
      { title: "1. Beitrag je Stück", text: "Was trägt ein Stück zur Deckung der Fixkosten bei?", lines: [`Deckungsbeitrag je Stück: ${f(hDb.main)}`, `Gesamtdeckungsbeitrag bei 100 Stück: ${f(pick(hDb, "Gesamtdeckungsbeitrag"))}`], calc: "deckungsbeitrag" },
      { title: "2. Gewinn heute", text: "Mit den Fixkosten ergibt sich der Gewinn bei 100 Stück.", lines: [`${hGew0.main.label} bei 100 Stück im Monat: ${f(hGew0.main)}`], calc: "gewinn", variant: "menge" },
      { title: "3. Wirkung des Rabatts", text: "Der Rabatt senkt den Beitrag je Stück. Wie viel mehr Absatz gleicht das aus?", lines: [`Neuer Preis: ${f(pick(hRab, "Neuer Verkaufspreis"))}`, `Beitrag je Stück: ${f(pick(hRab, "Stückdeckungsbeitrag vorher"))} → ${f(pick(hRab, "Stückdeckungsbeitrag nachher"))}`, `Absatzfaktor: ${f(pick(hRab, "Absatzfaktor"))} · Mehrabsatz: ${f(hRab.main)}`, `Erforderliche Menge: ${f(pick(hRab, "Erforderliche neue Menge"))} im Monat`], calc: "rabatt-absatz", variant: "prozent" },
      { title: "4. Gewinnschwelle mit Rabatt", text: "Ab wie vielen Stück deckt der Händler mit Rabattpreis seine Kosten?", lines: [`Mindeststückzahl zur Kostendeckung: ${f(hBe.main)}`], calc: "break-even" },
    ],
    result: `Mit 10 % Rabatt müsste der Händler seinen Absatz auf ${f(pick(hRab, "Erforderliche neue Menge"))} verdoppeln (${f(hRab.main)} mehr), nur um denselben Deckungsbeitrag zu erzielen. Selbst die geschätzten 140 Stück ergäben ${f(hNeu.main)} statt ${f(hGew0.main)}.`,
    compare: {
      title: "Ohne Rabatt (100 Stück) gegenüber Rabatt (90 €, 140 Stück)",
      names: ["Ohne Rabatt", "Mit Rabatt"],
      comparison: compareScenarios(getVariant("gewinn", "menge"), { p: "100", v: "80", F: hF, q: "100", zeitraum: "monat" }, { p: "90", v: "80", F: hF, q: "140", zeitraum: "monat" }),
    },
    next: "Prüfe, ob 200 Stück im Monat überhaupt lieferbar und am Markt erreichbar sind – und ob ein anderes Mittel (z. B. kleinerer Rabatt, Bundle) besser trägt.",
    transfers: [
      { label: "Rabatt-Rechner mit diesen Werten öffnen", target: "rabatt-absatz", values: { ...h }, describe: "Preis, variable Kosten, Rabatt, bisheriger Absatz und Zeitraum aus dem Praxisfall Handel (fiktive Werte)" },
      { label: "Gewinnrechner mit Rabattpreis öffnen", target: "gewinn", values: { p: "90", v: "80", F: hF, q: "140", zeitraum: "monat" }, describe: "Rabattpreis, Kosten, Fixkosten und geschätzte Menge aus dem Praxisfall Handel (fiktive Werte)" },
    ],
    check: { dbPerUnit: hDb.main.value.toString(), profitToday: hGew0.main.value.toString(), mehrabsatz: hRab.main.value.toString(), qNeu: pick(hRab, "Erforderliche neue Menge").value.toString(), profitRabatt: hNeu.main.value.toString(), beRabatt: hBe.main.value.toString() },
  };

  /* ---------- Dienstleistung ---------- */
  const sK = okRes("stundensatz", undefined, { kosten: "4800", stunden: "120" });
  const dF = "4800";
  const dDb = okRes("deckungsbeitrag", undefined, { p: "65", v: "5" });
  const dBe = okRes("break-even", undefined, { p: "65", v: "5", F: dF, zeitraum: "monat" });
  const dG = okRes("gewinn", "menge", { p: "65", v: "5", F: dF, q: "100", zeitraum: "monat" });
  const dA = okRes("gewinn", "menge", { p: "65", v: "5", F: dF, q: "90", zeitraum: "monat" });
  const dB = okRes("gewinn", "menge", { p: "65", v: "5", F: dF, q: "110", zeitraum: "monat" });
  const dienst: PracticeCase = {
    id: "dienstleistung",
    title: "Dienstleistung: Welcher Stundensatz trägt?",
    sector: "Dienstleistung",
    question: "Eine Beraterin will wissen, ab wie vielen abrechenbaren Stunden im Monat sich ihr Stundensatz rechnet und was bleibt.",
    assumptions: [
      "Fiktive Beratung: Fixkosten (Büro, Software, Versicherungen, Eigenanteil) 4.800 € im Monat.",
      "Von 160 Arbeitsstunden sind 120 Stunden abrechenbar (Verwaltung, Akquise, Urlaub abgezogen).",
      "Verkaufspreis 65 € netto je Stunde; variable Kosten (Reise, Tools) 5 € je Stunde.",
    ],
    steps: [
      { title: "1. Kosten je abrechenbare Stunde", text: "Die Fixkosten werden auf die abrechenbaren Stunden verteilt.", lines: [`Kosten je abrechenbare Stunde: ${f(sK.main)} (bei 120 Stunden)`, "Dazu kommen 5 € variable Kosten: mindestens 45 € je Stunde bei voller Auslastung der 120 Stunden."], calc: "stundensatz" },
      { title: "2. Beitrag je Stunde", text: "Preis minus variable Kosten.", lines: [`Beitrag je Stunde: ${f(dDb.main)}`], calc: "deckungsbeitrag" },
      { title: "3. Mindestauslastung", text: "Wie viele abrechenbare Stunden braucht sie im Monat?", lines: [`Mindeststückzahl (Stunden) zur Kostendeckung: ${f(dBe.main)} im Monat`], calc: "break-even" },
      { title: "4. Ergebnis bei 100 Stunden", text: "Geplant sind 100 abrechenbare Stunden.", lines: [`${dG.main.label}: ${f(dG.main)} im Monat`], calc: "gewinn", variant: "menge" },
    ],
    result: `Ab ${f(dBe.main)} abrechenbaren Stunden im Monat sind die Kosten gedeckt. Bei 100 Stunden bleiben ${f(dG.main)}; die 20 Stunden Reserve bis zur Grenze von 120 abrechenbaren Stunden sind der Spielraum.`,
    compare: {
      title: "Schwächerer Monat (90 Stunden) gegenüber starkem Monat (110 Stunden)",
      names: ["90 Stunden", "110 Stunden"],
      comparison: compareScenarios(getVariant("gewinn", "menge"), { p: "65", v: "5", F: dF, q: "90", zeitraum: "monat" }, { p: "65", v: "5", F: dF, q: "110", zeitraum: "monat" }),
    },
    next: "Prüfe, ob die geplanten 100 Stunden durch Aufträge belegt sind (Auslastung) und wie sich ein etwas höherer Stundensatz auswirkt.",
    transfers: [
      { label: "Gewinnrechner mit diesen Werten öffnen", target: "gewinn", values: { p: "65", v: "5", F: dF, q: "100", zeitraum: "monat" }, describe: "Stundensatz, variable Kosten je Stunde, Fixkosten, Stunden und Zeitraum aus dem Praxisfall Dienstleistung (fiktive Werte)" },
      { label: "Stundenkostensatz mit diesen Werten öffnen", target: "stundensatz", values: { kosten: "4800", stunden: "120" }, describe: "Periodenkosten und abrechenbare Stunden aus dem Praxisfall Dienstleistung (fiktive Werte)" },
    ],
    check: { kostenJeStunde: sK.main.value.toString(), dbJeStunde: dDb.main.value.toString(), beStunden: dBe.main.value.toString(), profit100: dG.main.value.toString(), profit90: dA.main.value.toString(), profit110: dB.main.value.toString() },
  };

  /* ---------- Produktion ---------- */
  const pF = "15000";
  const pDb = okRes("deckungsbeitrag", undefined, { p: "12", v: "7" });
  const pBe = okRes("break-even", undefined, { p: "12", v: "7", F: pF, zeitraum: "monat" });
  const pG = okRes("gewinn", "menge", { p: "12", v: "7", F: pF, q: "3600", zeitraum: "monat" });
  const pZ = okRes("gewinn", "zielgewinn", { p: "12", v: "7", F: pF, Z: "5000", zeitraum: "monat" });
  const pG13 = okRes("gewinn", "menge", { p: "13", v: "7", F: pF, q: "3600", zeitraum: "monat" });
  const prod: PracticeCase = {
    id: "produktion",
    title: "Produktion: Reicht die Kapazität für das Gewinnziel?",
    sector: "Produktion",
    question: "Ein kleiner Hersteller will 5.000 € Gewinn im Monat erreichen. Wie viele Stück sind dafür nötig und schafft die Fertigung das?",
    assumptions: [
      "Fiktives Produkt: Verkaufspreis 12 € netto, variable Stückkosten (Material, Verpackung, Energie) 7 €.",
      "Fixkosten (Miete, Maschinen, Gehälter) 15.000 € im Monat.",
      "Die Fertigung schafft höchstens 4.000 Stück im Monat; geplant sind 3.600 Stück.",
    ],
    steps: [
      { title: "1. Beitrag je Stück", text: "Preis minus variable Stückkosten.", lines: [`Deckungsbeitrag je Stück: ${f(pDb.main)}`], calc: "deckungsbeitrag" },
      { title: "2. Gewinnschwelle", text: "Ab welcher Menge sind die Fixkosten gedeckt?", lines: [`Mindeststückzahl zur Kostendeckung: ${f(pBe.main)} im Monat`, `Positiver Gewinn ab: ${f(pick(pBe, "Positiver Gewinn ab"))}`], calc: "break-even" },
      { title: "3. Ergebnis bei Planmenge", text: "Was bleibt bei 3.600 Stück?", lines: [`${pG.main.label}: ${f(pG.main)} im Monat`], calc: "gewinn", variant: "menge" },
      { title: "4. Menge für den Zielgewinn und Kapazität", text: "Für 5.000 € Gewinn werden mehr Stück gebraucht – passt das zur Kapazität von 4.000 Stück?", lines: [`Benötigte Stückzahl für 5.000 € Gewinn: ${f(pZ.main)} im Monat`, "Kapazität: 4.000 Stück im selben Monat → die Kapazität reicht genau (Reserve 0)."], calc: "gewinn", variant: "zielgewinn" },
    ],
    result: `Die Gewinnschwelle liegt bei ${f(pBe.main)} im Monat. Bei 3.600 Stück bleiben ${f(pG.main)}; für 5.000 € Gewinn braucht es ${f(pZ.main)} – genau die Kapazität. Es gibt keine Reserve.`,
    compare: {
      title: "Preis 12 € gegenüber Preis 13 € (jeweils 3.600 Stück im Monat)",
      names: ["12 €", "13 €"],
      comparison: compareScenarios(getVariant("gewinn", "menge"), { p: "12", v: "7", F: pF, q: "3600", zeitraum: "monat" }, { p: "13", v: "7", F: pF, q: "3600", zeitraum: "monat" }),
    },
    next: "Prüfe, ob die Kapazität auch bei Ausfällen reicht und ob der höhere Preis (13 €) am Markt die geplante Menge noch trägt.",
    transfers: [
      { label: "Gewinnrechner (Zielgewinn) mit diesen Werten öffnen", target: "gewinn", values: { p: "12", v: "7", F: pF, Z: "5000", zeitraum: "monat" }, describe: "Preis, variable Stückkosten, Fixkosten, Zielgewinn und Zeitraum aus dem Praxisfall Produktion (fiktive Werte)" },
      { label: "Break-even-Rechner mit diesen Werten öffnen", target: "break-even", values: { p: "12", v: "7", F: pF, zeitraum: "monat" }, describe: "Preis, variable Stückkosten, Fixkosten und Zeitraum aus dem Praxisfall Produktion (fiktive Werte)" },
    ],
    check: { dbPerUnit: pDb.main.value.toString(), beQty: pBe.main.value.toString(), profit3600: pG.main.value.toString(), qTarget: pZ.main.value.toString(), profit13: pG13.main.value.toString() },
  };
  return [handel, dienst, prod];
}
