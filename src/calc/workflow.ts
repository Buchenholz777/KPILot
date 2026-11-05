/**
 * Ablauf „Preis und Wirtschaftlichkeit“: Kosten erfassen → Preis bestimmen → Absatz planen → Gewinn beurteilen → Varianten vergleichen.
 *
 * Alle Zahlen entstehen aus denselben Rechenfunktionen wie in den Einzelrechnern (Deckungsbeitrag, Break-even, Gewinn, Zielpreis).
 * Unbekannte Werte bleiben unbekannt (nie automatisch 0); fehlende Werte werden benannt.
 * Dieses Modul kennt kein DOM und ist vollständig testbar.
 */
import { run } from "./engine";
import breakEvenDef from "./modules/break-even";
import gewinnDef from "./modules/gewinn";
import dbDef from "./modules/deckungsbeitrag";
import zielDef from "./modules/zielpreis";
import type { CalcResult, Out, RawInputs, VariantDef } from "./types";
import { D, type Decimal } from "../lib/decimal";
import { formatValue, parseNumber } from "../lib/number";

export const FLOW_ID = "preis-ablauf";
export const FLOW_SCHEMA = 1;

export type CostType = "variabel" | "einstand" | "voll";
export type Origin = "beobachtet" | "geschaetzt";
export const PERIODS = [
  { value: "monat", label: "Monat" },
  { value: "quartal", label: "Quartal" },
  { value: "jahr", label: "Jahr" },
  { value: "anderer", label: "anderer Zeitraum" },
] as const;

export interface FlowScenario {
  name: string;
  /** Leer = Wert der Basis. */
  p: string;
  v: string;
  F: string;
  q: string;
}

export interface FlowState {
  title: string;
  zeitraum: string;
  unit: string;
  costType: CostType;
  v: string;
  F: string;
  p: string;
  q: string;
  /** Optional: Zielgewinn für die Mengenrechnung. */
  z: string;
  /** Optional: verfügbare Kapazität (gleiche Einheit, gleicher Zeitraum). */
  cap: string;
  /** Optional: gewählte Änderungen in € je Einheit (auch negativ). */
  priceDelta: string;
  costDelta: string;
  /** Herkunft je Angabe: p, v, F, q. */
  origin: Partial<Record<"p" | "v" | "F" | "q", Origin>>;
  scenarios: FlowScenario[];
  note: string;
}

export const emptyFlow = (): FlowState => ({
  title: "",
  zeitraum: "monat",
  unit: "Stück",
  costType: "variabel",
  v: "",
  F: "",
  p: "",
  q: "",
  z: "",
  cap: "",
  priceDelta: "",
  costDelta: "",
  origin: {},
  scenarios: [],
  note: "",
});

/** Beispiel: dieselben Zahlen wie im Break-even- und Gewinnrechner. */
export const exampleFlow = (): FlowState => ({
  ...emptyFlow(),
  title: "Beispiel: Produkt A",
  v: "30",
  F: "3000",
  p: "50",
  q: "200",
  priceDelta: "5",
  costDelta: "2",
  origin: { p: "geschaetzt", q: "geschaetzt", v: "beobachtet", F: "beobachtet" },
  scenarios: [
    { name: "Vorsichtig", p: "", v: "", F: "", q: "150" },
    { name: "Optimistisch", p: "55", v: "", F: "", q: "250" },
  ],
});

/* ---------- Speicherformat (RawInputs) ---------- */
export function toRaw(f: FlowState): RawInputs {
  return {
    title: f.title,
    zeitraum: f.zeitraum,
    unit: f.unit,
    costType: f.costType,
    v: f.v,
    F: f.F,
    p: f.p,
    q: f.q,
    z: f.z,
    cap: f.cap,
    priceDelta: f.priceDelta,
    costDelta: f.costDelta,
    origin: Object.entries(f.origin)
      .map(([k, o]) => `${k}:${o}`)
      .join(","),
    note: f.note,
    scenarios: f.scenarios.map((s) => [s.name, s.p, s.v, s.F, s.q]),
  };
}

const str = (x: unknown) => (typeof x === "string" ? x : "");
export function fromRaw(raw: RawInputs | null | undefined): FlowState {
  const r = raw ?? {};
  const f = emptyFlow();
  f.title = str(r.title).slice(0, 80);
  f.zeitraum = PERIODS.some((p) => p.value === r.zeitraum) ? (r.zeitraum as string) : "monat";
  f.unit = str(r.unit).slice(0, 30) || "Stück";
  f.costType = r.costType === "einstand" || r.costType === "voll" ? r.costType : "variabel";
  for (const k of ["v", "F", "p", "q", "z", "cap", "priceDelta", "costDelta"] as const) f[k] = str(r[k]).slice(0, 24);
  f.note = str(r.note).slice(0, 2000);
  for (const part of str(r.origin).split(",")) {
    const [k, o] = part.split(":");
    if ((k === "p" || k === "v" || k === "F" || k === "q") && (o === "beobachtet" || o === "geschaetzt")) f.origin[k] = o;
  }
  const rows = Array.isArray(r.scenarios) ? (r.scenarios as string[][]) : [];
  f.scenarios = rows.slice(0, 3).map((row) => ({
    name: str(row?.[0]).slice(0, 30),
    p: str(row?.[1]).slice(0, 24),
    v: str(row?.[2]).slice(0, 24),
    F: str(row?.[3]).slice(0, 24),
    q: str(row?.[4]).slice(0, 24),
  }));
  return f;
}

/* ---------- Hilfen ---------- */
const variant = (def: { variants: VariantDef[] }, id: string) => def.variants.find((v) => v.id === id)!;
const beV = variant(breakEvenDef, "standard");
const gwV = variant(gewinnDef, "menge");
const gzV = variant(gewinnDef, "zielgewinn");
const dbV = variant(dbDef, "standard");
const zpV = variant(zielDef, "standard");

export const periodLabel = (z: string) => PERIODS.find((p) => p.value === z)?.label ?? "Zeitraum";

const known = (s: string): Decimal | undefined => {
  const p = parseNumber(s);
  return p.kind === "ok" ? p.value : undefined;
};
const tx = (d: Decimal) => d.toDecimalPlaces(10).toFixed().replace(".", ",");

function ok(r: CalcResult | null): Extract<CalcResult, { status: "ok" }> | undefined {
  return r && r.status === "ok" ? r : undefined;
}
const find = (r: Extract<CalcResult, { status: "ok" }> | undefined, start: string): Out | undefined =>
  r && (r.main.label.startsWith(start) ? r.main : r.extra?.find((e) => e.label.startsWith(start)));

/* ---------- Auswertung ---------- */
export interface Missing {
  key: "v" | "F" | "p" | "q";
  label: string;
  /** Wofür der Wert gebraucht wird. */
  neededFor: string;
}

export interface Line {
  label: string;
  value: string;
}

export interface CaseResult {
  /** Szenariobezeichnung („Basis“ oder Name). */
  name: string;
  inputs: { p?: string; v?: string; F?: string; q?: string };
  dbUnit?: Out;
  dbQuote?: Out;
  breakEven?: Extract<CalcResult, { status: "ok" }>;
  breakEvenProblem?: string;
  qMin?: Out;
  profitFrom?: Out;
  profit?: Extract<CalcResult, { status: "ok" }>;
}

export interface FlowSummary {
  period: string;
  unit: string;
  /** Vollkosten statt variabler Kosten: keine Auswertung, damit Fixkosten nicht doppelt zählen. */
  blocked?: string;
  missing: Missing[];
  base: CaseResult;
  targetQty?: Extract<CalcResult, { status: "ok" }>;
  capacity?: { required: Decimal; available: Decimal; enough: boolean; gap: Decimal; reserve: Decimal };
  priceEffect?: { delta: Decimal; after: CaseResult };
  costEffect?: { delta: Decimal; after: CaseResult };
  scenarios: CaseResult[];
  /** Eingabefelder, in denen sich Szenarien von der Basis unterscheiden. */
  differing: Record<string, ("p" | "v" | "F" | "q")[]>;
  uncertain: { key: "p" | "v" | "F" | "q"; label: string; text: string }[];
}

const LABEL = { p: "Verkaufspreis netto je Einheit", v: "Variable Kosten je Einheit", F: "Fixkosten im Zeitraum", q: "Geplante Absatzmenge" } as const;

function evalCase(name: string, i: { p?: string; v?: string; F?: string; q?: string }, zeitraum: string): CaseResult {
  const c: CaseResult = { name, inputs: i };
  const p = known(i.p ?? ""),
    v = known(i.v ?? ""),
    F = known(i.F ?? ""),
    q = known(i.q ?? "");
  if (p && v) {
    const r = ok(run(dbV, { p: tx(p), v: tx(v), q: "" }).result);
    c.dbUnit = r?.main;
    c.dbQuote = find(r, "Deckungsbeitragsquote");
  }
  if (p && v && F) {
    const res = run(beV, { p: tx(p), v: tx(v), F: tx(F), zeitraum }).result;
    const r = ok(res);
    if (r) {
      c.breakEven = r;
      c.qMin = r.main;
      c.profitFrom = find(r, "Positiver Gewinn ab");
    } else if (res && "message" in res) c.breakEvenProblem = res.message;
  }
  if (p && v && F && q) {
    c.profit = ok(run(gwV, { p: tx(p), v: tx(v), F: tx(F), q: tx(q), zeitraum }).result);
  }
  return c;
}

export function evaluate(f: FlowState): FlowSummary {
  const period = periodLabel(f.zeitraum);
  const missing: Missing[] = [];
  const need = (k: Missing["key"], neededFor: string) => {
    if (!known(f[k])) missing.push({ key: k, label: LABEL[k], neededFor });
  };
  need("v", "Deckungsbeitrag, Mindestabsatz und Gewinn");
  need("p", "Deckungsbeitrag, Mindestabsatz und Gewinn");
  need("F", "Mindestabsatz und Gewinn");
  need("q", "Gewinn bei geplanter Menge");

  const s: FlowSummary = {
    period,
    unit: f.unit || "Stück",
    missing,
    base: { name: "Basis", inputs: {} },
    scenarios: [],
    differing: {},
    uncertain: [],
  };
  if (f.costType === "voll") {
    s.blocked =
      "Du hast Vollkosten je Einheit gewählt. Sie enthalten bereits Anteile der Fixkosten – würden sie hier als variable Kosten verwendet, zählten die Fixkosten doppelt. Trage bitte die variablen Kosten je Einheit ein (ohne Fixkostenanteil) und die Fixkosten separat.";
    return s;
  }
  s.base = evalCase("Basis", { p: f.p, v: f.v, F: f.F, q: f.q }, f.zeitraum);

  // Zielgewinn → Menge, Kapazitätsabgleich
  const z = known(f.z);
  const p = known(f.p),
    v = known(f.v),
    F = known(f.F);
  if (z && p && v && F) {
    s.targetQty = ok(run(gzV, { p: tx(p), v: tx(v), F: tx(F), Z: tx(z), zeitraum: f.zeitraum }).result);
  }
  const cap = known(f.cap);
  const required = s.targetQty?.main.value ?? s.base.breakEven?.main.value;
  if (cap && required) {
    s.capacity = {
      required,
      available: cap,
      enough: cap.gte(required),
      gap: required.sub(cap).gt(0) ? required.sub(cap) : D(0),
      reserve: cap.sub(required).gt(0) ? cap.sub(required) : D(0),
    };
  }

  // Ausgewählte Preis-/Kostenänderungen (vom Nutzer gewählt, keine Vorgabe)
  const pd = known(f.priceDelta),
    cd = known(f.costDelta);
  if (pd && p) s.priceEffect = { delta: pd, after: evalCase("Preisänderung", { p: tx(p.add(pd)), v: f.v, F: f.F, q: f.q }, f.zeitraum) };
  if (cd && v) s.costEffect = { delta: cd, after: evalCase("Kostenänderung", { p: f.p, v: tx(v.add(cd)), F: f.F, q: f.q }, f.zeitraum) };

  // Varianten
  f.scenarios.forEach((sc, idx) => {
    const name = sc.name.trim() || `Variante ${idx + 1}`;
    const inp = { p: sc.p || f.p, v: sc.v || f.v, F: sc.F || f.F, q: sc.q || f.q };
    s.scenarios.push(evalCase(name, inp, f.zeitraum));
    s.differing[name] = (["p", "v", "F", "q"] as const).filter((k) => {
      const a = known(inp[k]),
        b = known(f[k]);
      return !(a && b && a.eq(b)) && !(a === undefined && b === undefined);
    });
  });

  // Unsichere Annahmen: ausdrücklich als geschätzt gekennzeichnet oder noch unbekannt
  for (const k of ["p", "v", "F", "q"] as const) {
    if (f.origin[k] === "geschaetzt")
      s.uncertain.push({ key: k, label: LABEL[k], text: `${LABEL[k]} ist eine Schätzung – das Ergebnis ist nur so sicher wie diese Annahme.` });
  }
  return s;
}

export const outText = (o?: Out) => (o ? formatValue(o.value, o.format, o.unit, o.signed) : "–");

/** Preis für eine Ziel-Deckungsbeitragsquote auf Basis der variablen Kosten (Hilfe in Schritt 2). */
export function priceForQuote(v: string, quotePct: string): { price?: Out; message?: string } {
  const r = run(zpV, { k: v, m: quotePct }).result;
  if (!r) return { message: "Bitte variable Kosten (größer als 0) und eine Zielquote unter 100 % eingeben." };
  if (r.status !== "ok") return { message: "message" in r ? r.message : "Nicht berechenbar." };
  return { price: r.main };
}
