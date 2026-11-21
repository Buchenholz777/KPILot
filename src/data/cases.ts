/**
 * Vier durchgängige Praxisfälle (ausdrücklich fiktive Annahmen) aus EINER Datenquelle je Fall.
 * Rechentext, Tabellen, Grafikdaten, Übernahme in Rechner und Übernahme in den Preisablauf entstehen aus denselben
 * Falldaten und denselben Rechenfunktionen wie die Rechner (kein Zahlentext von Hand, keine zweite Rechnung).
 * Geprüft in tests/cases.test.ts.
 */
import { run } from "../calc/engine";
import { getVariant } from "../calc/all";
import { compareScenarios } from "../calc/scenario";
import type { CalcResult, Out, RawInputs } from "../calc/types";
import { emptyFlow, FLOW_ID, toRaw, type FlowState } from "../calc/workflow";
import { UNIT_BY_KEY } from "../calc/units";
import { D } from "../lib/decimal";
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
const eur = (v: string | number, signed = false) => formatValue(D(v), "money", undefined, signed);
const num = (v: string | number) => formatValue(D(v), "number");

export const FLOW_URL = "/ablauf/preis-wirtschaftlichkeit/";

export interface CaseTransfer {
  label: string;
  target: string;
  url: string;
  values: Record<string, string>;
  describe: string;
  /** Herkunftsangabe im Zielrechner, z. B. „Praxisfall Handel“. */
  fromTitle: string;
}

export interface CaseStep {
  title: string;
  text: string;
  lines: string[];
  calc: string;
  variant?: string;
  /** Genau die Werte dieses Schritts (Ausgangssituation oder Variante). */
  transfer: CaseTransfer;
}

export interface PracticeCase {
  id: "handel" | "dienstleistung" | "produktion" | "werbung";
  title: string;
  sector: string;
  /** Anzeige der Mengeneinheit des Falls (z. B. „abrechenbare Stunde“). */
  unit: string;
  period: string;
  question: string;
  assumptions: string[];
  /** Erklärende Hinweise zur Deutung. */
  notes: string[];
  steps: CaseStep[];
  result: string;
  compare: { title: string; head: string[]; rows: string[][]; caption?: string };
  next: string;
  /** „Diesen Fall mit meinen Zahlen durchrechnen“. */
  primary: CaseTransfer;
  /** Weitere Übernahmen am Ende des Falls. */
  more: CaseTransfer[];
  /** Zentrale Prüfwerte (für Tests). */
  check: Record<string, string>;
}

const TITLE = (c: string) => `Praxisfall ${c}`;

function flowTransfer(label: string, caseName: string, flow: FlowState, assumptions: string[]): CaseTransfer {
  return {
    label,
    target: FLOW_ID,
    url: FLOW_URL,
    values: { flow: JSON.stringify(toRaw(flow)), assumptions: JSON.stringify(assumptions) },
    describe: `Alle Eingaben und Varianten aus ${TITLE(caseName)} (fiktive Vorlage)`,
    fromTitle: TITLE(caseName),
  };
}
const calcTransfer = (label: string, target: string, url: string, values: Record<string, string>, caseName: string): CaseTransfer => ({
  label,
  target,
  url,
  values,
  describe: `Werte aus ${TITLE(caseName)} (fiktive Werte)`,
  fromTitle: TITLE(caseName),
});
const STEP_LABEL = "Mit diesen Fallwerten im Rechner öffnen";

/** Ergebnisvergleich zweier Gewinn-Szenarien aus der gemeinsamen Vergleichslogik. */
function gewinnCompare(title: string, names: [string, string], a: RawInputs, b: RawInputs) {
  const cmp = compareScenarios(getVariant("gewinn", "menge"), a, b);
  return {
    title,
    head: ["Kennzahl", names[0], names[1], "Differenz"],
    rows: cmp.rows.slice(0, 4).map((r) => [r.label, r.a ?? "", r.b ?? "", r.diff ?? r.diffNote ?? "–"]),
  };
}

export function buildCases(): PracticeCase[] {
  /* ================= Handel ================= */
  const H = { unit: "stueck", zeitraum: "monat", p: "100", v: "80", F: "1500", q: "100", rabatt: "10", qRabatt: "140" };
  const hU = UNIT_BY_KEY[H.unit];
  const hBase: RawInputs = { p: H.p, v: H.v, F: H.F, q: H.q, zeitraum: H.zeitraum, einheit: H.unit };
  const hDb = okRes("deckungsbeitrag", undefined, { p: H.p, v: H.v, q: H.q, einheit: H.unit });
  const hGew0 = okRes("gewinn", "menge", hBase);
  const hRabRaw = { preis: H.p, v: H.v, rabatt: H.rabatt, q0: H.q, zeitraum: H.zeitraum };
  const hRab = okRes("rabatt-absatz", "prozent", hRabRaw);
  const pNeu = pick(hRab, "Neuer Verkaufspreis").value.toString();
  const hRabRawGew: RawInputs = { p: pNeu, v: H.v, F: H.F, q: H.qRabatt, zeitraum: H.zeitraum, einheit: H.unit };
  const hNeu = okRes("gewinn", "menge", hRabRawGew);
  const hBe = okRes("break-even", undefined, { p: pNeu, v: H.v, F: H.F, zeitraum: H.zeitraum, einheit: H.unit });
  const hAssumptions = [
    `Fiktives Produkt: Nettopreis ${eur(H.p)}, variable Kosten (Einkauf und Versand) ${eur(H.v)} je ${hU.sg}.`,
    `Fixkosten des Händlers: ${eur(H.F)} im Monat; bisher ${H.q} ${hU.pl} im Monat.`,
    `Der Rabatt könnte laut Vertriebsschätzung (reine Annahme) ${H.qRabatt} statt ${H.q} ${hU.pl} bringen.`,
  ];
  const hFlow: FlowState = { ...emptyFlow(), title: TITLE("Handel"), zeitraum: H.zeitraum, unit: H.unit, v: H.v, F: H.F, p: H.p, q: H.q, scenarios: [{ name: `Mit ${H.rabatt} % Rabatt`, p: pNeu, v: "", F: "", q: H.qRabatt }] };
  const handel: PracticeCase = {
    id: "handel",
    title: "Handel: Lohnt sich ein Rabatt?",
    sector: "Handel",
    unit: hU.sg,
    period: "Monat",
    question: `Ein Händler überlegt, ein Produkt mit ${H.rabatt} % Rabatt anzubieten. Wie viel mehr müsste er verkaufen – und was bleibt am Ende?`,
    assumptions: hAssumptions,
    notes: ["Der Rabatt senkt den Beitrag je Stück direkt; deshalb ist der nötige Mehrabsatz oft viel größer als der Rabatt in Prozent.", "Die Rechnung sagt nicht, ob die zusätzliche Nachfrage erreichbar ist."],
    steps: [
      {
        title: "1. Ausgangssituation: Beitrag je Stück",
        text: "Was trägt ein Stück zur Deckung der Fixkosten bei – und wie hoch ist die Quote?",
        lines: [`Deckungsbeitrag je Stück: ${f(hDb.main)} · Deckungsbeitragsquote: ${f(pick(hDb, "Deckungsbeitragsquote"))}`, `Umsatz bei ${H.q} ${hU.pl}: ${f(pick(hDb, "Umsatz"))} · Gesamtdeckungsbeitrag: ${f(pick(hDb, "Gesamtdeckungsbeitrag"))}`],
        calc: "deckungsbeitrag",
        transfer: calcTransfer(STEP_LABEL, "deckungsbeitrag", "/deckungsbeitragsrechner/", { p: H.p, v: H.v, q: H.q, einheit: H.unit }, "Handel"),
      },
      {
        title: "2. Gewinn heute",
        text: "Mit den Fixkosten ergibt sich der Gewinn der Ausgangssituation.",
        lines: [`${hGew0.main.label} bei ${H.q} ${hU.pl} im Monat: ${f(hGew0.main)}`],
        calc: "gewinn",
        variant: "menge",
        transfer: calcTransfer(STEP_LABEL, "gewinn", "/gewinnrechner/", { p: H.p, v: H.v, F: H.F, q: H.q, zeitraum: H.zeitraum, einheit: H.unit }, "Handel"),
      },
      {
        title: `3. Rabattvariante: ${H.rabatt} % Rabatt`,
        text: "Der Rabatt senkt den Beitrag je Stück. Wie viel mehr Absatz gleicht das aus?",
        lines: [`Neuer Preis: ${f(pick(hRab, "Neuer Verkaufspreis"))}`, `Beitrag je Stück: ${f(pick(hRab, "Stückdeckungsbeitrag vorher"))} → ${f(pick(hRab, "Stückdeckungsbeitrag nachher"))}`, `Absatzfaktor: ${f(pick(hRab, "Absatzfaktor"))} · Mehrabsatz: ${f(hRab.main)}`, `Erforderliche Menge für denselben Gesamtdeckungsbeitrag: ${f(pick(hRab, "Erforderliche neue Menge"))} im Monat`],
        calc: "rabatt-absatz",
        variant: "prozent",
        transfer: calcTransfer(STEP_LABEL, "rabatt-absatz", "/rabatt-mehrabsatz-rechner/", { ...hRabRaw }, "Handel"),
      },
      {
        title: "4. Rabattvariante: Gewinn bei geschätzter Menge",
        text: `Mit dem Rabattpreis und den geschätzten ${H.qRabatt} ${hU.pl}:`,
        lines: [`${hNeu.main.label} bei ${H.qRabatt} ${hU.pl} im Monat: ${f(hNeu.main)}`],
        calc: "gewinn",
        variant: "menge",
        transfer: calcTransfer(STEP_LABEL, "gewinn", "/gewinnrechner/", { p: pNeu, v: H.v, F: H.F, q: H.qRabatt, zeitraum: H.zeitraum, einheit: H.unit }, "Handel"),
      },
      {
        title: "5. Gewinnschwelle mit Rabattpreis",
        text: "Ab wie vielen Stück deckt der Händler mit dem Rabattpreis seine Kosten?",
        lines: [`Menge zur Kostendeckung: ${f(hBe.main)}`],
        calc: "break-even",
        transfer: calcTransfer(STEP_LABEL, "break-even", "/break-even-rechner/", { p: pNeu, v: H.v, F: H.F, zeitraum: H.zeitraum, einheit: H.unit }, "Handel"),
      },
    ],
    result: `Mit ${H.rabatt} % Rabatt müsste der Händler seinen Absatz auf ${f(pick(hRab, "Erforderliche neue Menge"))} steigern (${f(hRab.main)} mehr), nur um denselben Deckungsbeitrag zu erzielen. Selbst die geschätzten ${H.qRabatt} ${hU.pl} ergäben ${f(hNeu.main)} statt ${f(hGew0.main)}.`,
    compare: gewinnCompare(`Ohne Rabatt (${H.q} ${hU.pl}) gegenüber Rabatt (${eur(pNeu)}, ${H.qRabatt} ${hU.pl})`, ["Ohne Rabatt", "Mit Rabatt"], hBase, hRabRawGew),
    next: "Prüfe, ob die erforderliche Menge im Monat lieferbar und am Markt erreichbar ist – und ob ein anderes Mittel (kleinerer Rabatt, Bundle) besser trägt.",
    primary: flowTransfer("Diesen Fall mit meinen Zahlen durchrechnen", "Handel", hFlow, hAssumptions),
    more: [calcTransfer("Rabatt-Rechner mit diesen Werten öffnen", "rabatt-absatz", "/rabatt-mehrabsatz-rechner/", { ...hRabRaw }, "Handel")],
    check: {
      dbPerUnit: hDb.main.value.toString(),
      dbQuote: pick(hDb, "Deckungsbeitragsquote").value.toString(),
      revenue: pick(hDb, "Umsatz").value.toString(),
      totalDb: pick(hDb, "Gesamtdeckungsbeitrag").value.toString(),
      profitToday: hGew0.main.value.toString(),
      newPrice: pNeu,
      dbAfter: pick(hRab, "Stückdeckungsbeitrag nachher").value.toString(),
      factor: pick(hRab, "Absatzfaktor").value.toString(),
      mehrabsatz: hRab.main.value.toString(),
      qNeu: pick(hRab, "Erforderliche neue Menge").value.toString(),
      profitRabatt: hNeu.main.value.toString(),
      beRabatt: hBe.main.value.toString(),
    },
  };

  /* ================= Dienstleistung ================= */
  const D1 = { unit: "stunde", zeitraum: "monat", p: "65", v: "5", F: "4800", q: "100", avail: "120", low: "90", high: "110" };
  const dU = UNIT_BY_KEY[D1.unit];
  const dRaw = (q?: string): RawInputs => ({ p: D1.p, v: D1.v, F: D1.F, ...(q ? { q } : {}), zeitraum: D1.zeitraum, einheit: D1.unit });
  const sK = okRes("stundensatz", undefined, { kosten: D1.F, stunden: D1.avail });
  const dDb = okRes("deckungsbeitrag", undefined, { p: D1.p, v: D1.v, einheit: D1.unit });
  const dBe = okRes("break-even", undefined, dRaw());
  const dG = okRes("gewinn", "menge", dRaw(D1.q));
  const dA = okRes("gewinn", "menge", dRaw(D1.low));
  const dB = okRes("gewinn", "menge", dRaw(D1.high));
  const fullUse = sK.main.value.add(D1.v);
  const dAssumptions = [
    `Fiktive Beratung: Fixkosten (Büro, Software, Versicherungen, Eigenanteil) ${eur(D1.F)} im Monat.`,
    `Von 160 Arbeitsstunden sind ${D1.avail} Stunden abrechenbar (Verwaltung, Akquise, Urlaub abgezogen).`,
    `Verkaufspreis ${eur(D1.p)} netto je ${dU.sg}; variable Kosten (Reise, Tools) ${eur(D1.v)} je ${dU.sg}.`,
  ];
  const dFlow: FlowState = { ...emptyFlow(), title: TITLE("Dienstleistung"), zeitraum: D1.zeitraum, unit: D1.unit, v: D1.v, F: D1.F, p: D1.p, q: D1.q, cap: D1.avail, scenarios: [{ name: "Schwacher Monat", p: "", v: "", F: "", q: D1.low }, { name: "Starker Monat", p: "", v: "", F: "", q: D1.high }] };
  const dienst: PracticeCase = {
    id: "dienstleistung",
    title: "Dienstleistung: Welcher Stundensatz trägt?",
    sector: "Dienstleistung",
    unit: dU.sg,
    period: "Monat",
    question: "Eine Beraterin will wissen, ab wie vielen abrechenbaren Stunden im Monat sich ihr Stundensatz rechnet und was bleibt.",
    assumptions: dAssumptions,
    notes: ["Nur abrechenbare Stunden zählen als Menge; Verwaltung und Akquise stecken in den Fixkosten.", "Die 120 abrechenbaren Stunden sind die verfügbare Grenze, nicht die geplante Auslastung."],
    steps: [
      {
        title: "1. Fixkostenanteil je abrechenbarer Stunde",
        text: "Die Fixkosten werden auf die verfügbaren abrechenbaren Stunden verteilt.",
        lines: [`Fixkostenanteil: ${eur(sK.main.value.toString())} je abrechenbarer Stunde (bei ${D1.avail} abrechenbaren Stunden)`, `Zuzüglich ${eur(D1.v)} variable Kosten: ${eur(fullUse.toString())} je abrechenbarer Stunde bei voller Nutzung dieser ${D1.avail} Stunden.`],
        calc: "stundensatz",
        transfer: calcTransfer(STEP_LABEL, "stundensatz", "/stundenkostensatz-rechner/", { kosten: D1.F, stunden: D1.avail }, "Dienstleistung"),
      },
      {
        title: "2. Beitrag je abrechenbarer Stunde",
        text: "Preis minus variable Kosten.",
        lines: [`Deckungsbeitrag: ${f(dDb.main)}`],
        calc: "deckungsbeitrag",
        transfer: calcTransfer(STEP_LABEL, "deckungsbeitrag", "/deckungsbeitragsrechner/", { p: D1.p, v: D1.v, einheit: D1.unit }, "Dienstleistung"),
      },
      {
        title: "3. Mindestauslastung",
        text: "Wie viele abrechenbare Stunden braucht sie im Monat zur Kostendeckung?",
        lines: [`${dBe.main.label}: ${f(dBe.main)} im Monat`],
        calc: "break-even",
        transfer: calcTransfer(STEP_LABEL, "break-even", "/break-even-rechner/", dRaw() as Record<string, string>, "Dienstleistung"),
      },
      {
        title: `4. Ergebnis bei ${D1.q} Stunden`,
        text: `Geplant sind ${D1.q} abrechenbare Stunden.`,
        lines: [`${dG.main.label}: ${f(dG.main)} im Monat`],
        calc: "gewinn",
        variant: "menge",
        transfer: calcTransfer(STEP_LABEL, "gewinn", "/gewinnrechner/", dRaw(D1.q) as Record<string, string>, "Dienstleistung"),
      },
    ],
    result: `Ab ${f(dBe.main)} im Monat sind die Kosten gedeckt. Bei ${D1.q} Stunden bleiben ${f(dG.main)}; bis zur Grenze von ${D1.avail} abrechenbaren Stunden sind ${Number(D1.avail) - Number(D1.q)} Stunden Spielraum.`,
    compare: gewinnCompare(`Schwächerer Monat (${D1.low} Stunden) gegenüber starkem Monat (${D1.high} Stunden)`, [`${D1.low} Stunden`, `${D1.high} Stunden`], dRaw(D1.low), dRaw(D1.high)),
    next: `Prüfe, ob die geplanten ${D1.q} Stunden durch Aufträge belegt sind (Auslastung) und wie sich ein etwas höherer Stundensatz auswirkt.`,
    primary: flowTransfer("Diesen Fall mit meinen Zahlen durchrechnen", "Dienstleistung", dFlow, dAssumptions),
    more: [calcTransfer("Stundenkostensatz mit diesen Werten öffnen", "stundensatz", "/stundenkostensatz-rechner/", { kosten: D1.F, stunden: D1.avail }, "Dienstleistung")],
    check: {
      fixPerHour: sK.main.value.toString(),
      fullUse: fullUse.toString(),
      dbPerHour: dDb.main.value.toString(),
      dbUnit: dDb.main.unit ?? "",
      beHours: dBe.main.value.toString(),
      beText: f(dBe.main),
      profit100: dG.main.value.toString(),
      profit90: dA.main.value.toString(),
      profit110: dB.main.value.toString(),
    },
  };

  /* ================= Produktion ================= */
  const P = { unit: "stueck", zeitraum: "monat", p: "12", v: "7", F: "15000", q: "3600", z: "5000", cap: "4000", p2: "13" };
  const pU = UNIT_BY_KEY[P.unit];
  const pRaw = (o: Partial<Record<string, string>> = {}): RawInputs => ({ p: P.p, v: P.v, F: P.F, zeitraum: P.zeitraum, einheit: P.unit, ...(o as Record<string, string>) });
  const pDb = okRes("deckungsbeitrag", undefined, { p: P.p, v: P.v, einheit: P.unit });
  const pBe = okRes("break-even", undefined, pRaw());
  const pG = okRes("gewinn", "menge", pRaw({ q: P.q }));
  const pZ = okRes("gewinn", "zielgewinn", pRaw({ Z: P.z }));
  const pG13 = okRes("gewinn", "menge", pRaw({ p: P.p2, q: P.q }));
  const reserve = D(P.cap).sub(pZ.main.value);
  const pAssumptions = [
    `Fiktives Produkt: Verkaufspreis ${eur(P.p)} netto, variable Stückkosten (Material, Verpackung, Energie) ${eur(P.v)}.`,
    `Fixkosten (Miete, Maschinen, Gehälter) ${eur(P.F)} im Monat.`,
    `Die Fertigung schafft höchstens ${num(P.cap)} ${pU.pl} im Monat; geplant sind ${num(P.q)} ${pU.pl}.`,
  ];
  const pFlow: FlowState = { ...emptyFlow(), title: TITLE("Produktion"), zeitraum: P.zeitraum, unit: P.unit, v: P.v, F: P.F, p: P.p, q: P.q, z: P.z, cap: P.cap, scenarios: [{ name: `Preis ${eur(P.p2)}`, p: P.p2, v: "", F: "", q: "" }] };
  const prod: PracticeCase = {
    id: "produktion",
    title: "Produktion: Reicht die Kapazität für das Gewinnziel?",
    sector: "Produktion",
    unit: pU.sg,
    period: "Monat",
    question: `Ein kleiner Hersteller will ${eur(P.z)} Gewinn im Monat erreichen. Wie viele ${pU.pl} sind dafür nötig und schafft die Fertigung das?`,
    assumptions: pAssumptions,
    notes: ["Kapazität und Menge müssen im selben Zeitraum und in derselben Einheit gelten.", "Ob ein höherer Preis die geplante Menge am Markt noch trägt, zeigt die Rechnung nicht."],
    steps: [
      { title: "1. Beitrag je Stück", text: "Preis minus variable Stückkosten.", lines: [`Deckungsbeitrag je Stück: ${f(pDb.main)}`], calc: "deckungsbeitrag", transfer: calcTransfer(STEP_LABEL, "deckungsbeitrag", "/deckungsbeitragsrechner/", { p: P.p, v: P.v, einheit: P.unit }, "Produktion") },
      { title: "2. Gewinnschwelle", text: "Ab welcher Menge sind die Fixkosten gedeckt?", lines: [`Menge zur Kostendeckung: ${f(pBe.main)} im Monat`, `Positiver Gewinn ab: ${f(pick(pBe, "Positiver Gewinn ab"))}`], calc: "break-even", transfer: calcTransfer(STEP_LABEL, "break-even", "/break-even-rechner/", pRaw() as Record<string, string>, "Produktion") },
      { title: `3. Ergebnis bei ${num(P.q)} ${pU.pl}`, text: "Was bleibt bei der Planmenge?", lines: [`${pG.main.label}: ${f(pG.main)} im Monat`], calc: "gewinn", variant: "menge", transfer: calcTransfer(STEP_LABEL, "gewinn", "/gewinnrechner/", pRaw({ q: P.q }) as Record<string, string>, "Produktion") },
      { title: "4. Menge für den Zielgewinn und Kapazität", text: `Für ${eur(P.z)} Gewinn werden mehr ${pU.pl} gebraucht – passt das zur Kapazität von ${num(P.cap)}?`, lines: [`Benötigte Menge für ${eur(P.z)} Gewinn: ${f(pZ.main)} im Monat`, `Kapazität: ${num(P.cap)} ${pU.pl} im selben Monat → ${reserve.isZero() ? "die Kapazität reicht genau (Reserve 0)." : reserve.gt(0) ? `Reserve ${num(reserve.toString())}.` : `es fehlen ${num(reserve.abs().toString())}.`}`], calc: "gewinn", variant: "zielgewinn", transfer: calcTransfer(STEP_LABEL, "gewinn", "/gewinnrechner/", pRaw({ Z: P.z }) as Record<string, string>, "Produktion") },
      { title: `5. Preisvariante ${eur(P.p2)}`, text: `Bei unveränderter Planmenge von ${num(P.q)} ${pU.pl}:`, lines: [`${pG13.main.label}: ${f(pG13.main)} im Monat`], calc: "gewinn", variant: "menge", transfer: calcTransfer(STEP_LABEL, "gewinn", "/gewinnrechner/", pRaw({ p: P.p2, q: P.q }) as Record<string, string>, "Produktion") },
    ],
    result: `Die Gewinnschwelle liegt bei ${f(pBe.main)} im Monat. Bei ${num(P.q)} ${pU.pl} bleiben ${f(pG.main)}; für ${eur(P.z)} Gewinn braucht es ${f(pZ.main)} – ${reserve.isZero() ? "genau die Kapazität, es gibt keine Reserve" : `Reserve ${num(reserve.toString())}`}.`,
    compare: gewinnCompare(`Preis ${eur(P.p)} gegenüber ${eur(P.p2)} (jeweils ${num(P.q)} ${pU.pl} im Monat)`, [eur(P.p), eur(P.p2)], pRaw({ q: P.q }), pRaw({ p: P.p2, q: P.q })),
    next: "Prüfe, ob die Kapazität auch bei Ausfällen reicht und ob der höhere Preis am Markt die geplante Menge noch trägt.",
    primary: flowTransfer("Diesen Fall mit meinen Zahlen durchrechnen", "Produktion", pFlow, pAssumptions),
    more: [calcTransfer("Gewinnrechner (Zielgewinn) mit diesen Werten öffnen", "gewinn", "/gewinnrechner/", pRaw({ Z: P.z }) as Record<string, string>, "Produktion")],
    check: {
      dbPerUnit: pDb.main.value.toString(),
      beQty: pBe.main.value.toString(),
      profit3600: pG.main.value.toString(),
      qTarget: pZ.main.value.toString(),
      reserve: reserve.toString(),
      profit13: pG13.main.value.toString(),
    },
  };

  /* ================= Werbewirtschaftlichkeit ================= */
  const W = { umsatz: "3600", kosten: "900", quote: "30", alt: "20" };
  const wStd = okRes("roas", "standard", { umsatz: W.umsatz, kosten: W.kosten });
  const wRawBase = { umsatz: W.umsatz, kosten: W.kosten, quote: W.quote, alt: "" };
  const wBase = okRes("roas", "wirtschaftlichkeit", wRawBase);
  const wAlt = okRes("roas", "wirtschaftlichkeit", { ...wRawBase, alt: W.alt });
  const sens = ["20", "25", "30"].map((q) => ({ q, r: okRes("roas", "wirtschaftlichkeit", { ...wRawBase, quote: q }) }));
  const wAssumptions = [
    `Fiktive Kampagne: ${eur(W.umsatz)} der Werbung zugeordneter Nettoumsatz, ${eur(W.kosten)} Werbekosten – beides im selben Messzeitraum und mit derselben Zuordnung.`,
    `Deckungsbeitragsquote vor Werbekosten: ${W.quote} % (variable Kosten wie Ware, Verpackung, Versand und Gebühren sind schon abgezogen). Alternative zum Vergleich: ${W.alt} %.`,
  ];
  const wTransfer = (label: string, values: Record<string, string>, target = "roas") => calcTransfer(label, target, "/roas-rechner/", values, "Werbung");
  const wCompare = wAlt.comparison!;
  const werbung: PracticeCase = {
    id: "werbung",
    title: "Werbung: Bleibt nach den Werbekosten etwas übrig?",
    sector: "Marketing",
    unit: "Euro",
    period: "Messzeitraum der Kampagne",
    question: "Ein Onlineshop will wissen, ob eine Kampagne nach ihren Kosten noch einen Beitrag leistet – und wie empfindlich das von der Deckungsbeitragsquote abhängt.",
    assumptions: wAssumptions,
    notes: [
      "Umsatz ist kein Gewinn: Vom zugeordneten Umsatz gehen zuerst die variablen Kosten und dann die Werbekosten ab.",
      "Weitere Fixkosten (Personal, Miete, Software …) sind im Beitrag nach Werbung noch nicht berücksichtigt – er ist kein Unternehmensgewinn.",
      "Umsatz und Werbekosten müssen zum selben Messzeitraum und zur selben Zuordnung (Attribution) gehören.",
      "Die Quote enthält die variablen Kosten, aber nicht die Werbung – sie wird erst anschließend abgezogen, damit sie nicht doppelt zählt.",
      "Eine berechnete Alternative ist keine Vorhersage der Nachfrage.",
    ],
    steps: [
      { title: "1. Zugeordneter Umsatz und Werbekosten", text: "Wie viel Umsatz ordnet die Messung je Werbe-Euro zu?", lines: [`ROAS: ${f(wStd.main)} (${eur(W.umsatz)} Umsatz / ${eur(W.kosten)} Werbekosten)`], calc: "roas", variant: "standard", transfer: wTransfer(STEP_LABEL, { umsatz: W.umsatz, kosten: W.kosten }) },
      { title: "2. Deckungsbeitrag vor Werbung", text: `Bei ${W.quote} % Deckungsbeitragsquote:`, lines: [`Deckungsbeitrag vor Werbung: ${f(pick(wBase, "Deckungsbeitrag vor"))}`], calc: "roas", variant: "wirtschaftlichkeit", transfer: wTransfer(STEP_LABEL, { umsatz: W.umsatz, kosten: W.kosten, quote: W.quote }) },
      { title: "3. Beitrag nach Werbekosten", text: "Vom Deckungsbeitrag gehen die Werbekosten ab.", lines: [`Beitrag nach Werbung: ${f(wBase.main)}`], calc: "roas", variant: "wirtschaftlichkeit", transfer: wTransfer(STEP_LABEL, { umsatz: W.umsatz, kosten: W.kosten, quote: W.quote }) },
      { title: `4. Alternative Quote ${W.alt} %`, text: "Was ändert sich bei höheren variablen Kosten?", lines: [`Deckungsbeitrag vor Werbung: ${f(pick(wAlt, "Alternative Quote: Deckungsbeitrag vor"))} · Beitrag nach Werbung: ${f(pick(wAlt, "Alternative Quote: Beitrag nach"))}`, wCompare.summary], calc: "roas", variant: "wirtschaftlichkeit", transfer: wTransfer(STEP_LABEL, { umsatz: W.umsatz, kosten: W.kosten, quote: W.quote, alt: W.alt }) },
      { title: "5. Mindest-ROAS", text: "Ab welchem ROAS deckt der Deckungsbeitrag die Werbekosten?", lines: [`Bei ${W.quote} %: ${f(pick(wBase, "Mindest-ROAS"))} · bei ${W.alt} %: ${f(pick(wAlt, "Alternative Quote: Mindest-ROAS"))} · tatsächlicher ROAS in beiden Fällen ${f(wStd.main)}`], calc: "roas", variant: "wirtschaftlichkeit", transfer: wTransfer(STEP_LABEL, { umsatz: W.umsatz, kosten: W.kosten, quote: W.quote, alt: W.alt }) },
      { title: "6. Empfindlichkeit gegenüber der gewählten Quote", text: "Dieselbe Kampagne bei drei gewählten Quoten – die Werte sind Annahmen, keine Marktdaten:", lines: sens.map((x) => `Quote ${x.q} %: Beitrag nach Werbung ${f(x.r.main)}, Mindest-ROAS ${f(pick(x.r, "Mindest-ROAS"))}`), calc: "roas", variant: "wirtschaftlichkeit", transfer: wTransfer(STEP_LABEL, { umsatz: W.umsatz, kosten: W.kosten, quote: W.quote, alt: W.alt }) },
    ],
    result: `Bei ${W.quote} % Quote bleiben nach den Werbekosten ${f(wBase.main)}; bei ${W.alt} % wären es ${f(pick(wAlt, "Alternative Quote: Beitrag nach"))}. ${wCompare.summary}`,
    compare: { title: wCompare.title, head: wCompare.head, rows: wCompare.rows },
    next: "Prüfe, wie stabil deine Deckungsbeitragsquote wirklich ist (Retouren, Versand, Gebühren) und ob Umsatz und Werbekosten zum selben Messzeitraum gehören.",
    primary: wTransfer("Diesen Fall mit meinen Zahlen durchrechnen", { umsatz: W.umsatz, kosten: W.kosten, quote: W.quote, alt: W.alt }),
    more: [],
    check: {
      roas: wStd.main.value.toString(),
      dbBefore: pick(wBase, "Deckungsbeitrag vor").value.toString(),
      after: wBase.main.value.toString(),
      dbBeforeAlt: pick(wAlt, "Alternative Quote: Deckungsbeitrag vor").value.toString(),
      afterAlt: pick(wAlt, "Alternative Quote: Beitrag nach").value.toString(),
      diff: pick(wAlt, "Alternative minus aktuelle").value.toString(),
      minRoas: pick(wBase, "Mindest-ROAS").value.toString(),
      minRoasAlt: pick(wAlt, "Alternative Quote: Mindest-ROAS").value.toString(),
      afterQ25: sens[1].r.main.value.toString(),
    },
  };

  return [handel, dienst, prod, werbung];
}
