/**
 * Datenmodell der Ergebnisgrafiken. Reine Daten (kein DOM, kein HTML): Die Rechenmodule liefern die Ergebnisse,
 * `src/calc/charts/*` bereitet sie zu ChartSpec auf, `src/scripts/charts.ts` zeichnet sie.
 * Alle Zahlen sind für die Zeichnung (JS-Zahlen); alle Texte sind bereits formatiert und stammen aus denselben Werten.
 */
export interface ChartTable {
  head: string[];
  rows: string[][];
}

export interface ChartBase {
  /** Titel der einzelnen Grafik. */
  title: string;
  /** Kurzer erklärender Satz unter der Grafik (sichtbar). */
  caption: string;
  /** Text für Screenreader (aria-label) – enthält die wesentlichen Zahlen. */
  summary: string;
  /** Zugängliche Tabellenalternative. */
  table: ChartTable;
  /** Fachlicher Hinweis (z. B. Modellpfad, Grenzfall). */
  notice?: string;
}

export interface LinePoint {
  x: number;
  y: number;
}

export interface LinesChart extends ChartBase {
  kind: "lines";
  xLabel: string;
  yLabel: string;
  xMax: number;
  /** Texte für Achsenzahlen. */
  xFormat: (v: number) => string;
  yFormat: (v: number) => string;
  series: { id: string; label: string; style: "solid" | "dashed" | "dotted"; tone: "ink" | "accent" | "teal"; points: LinePoint[] }[];
  /** Flächen zwischen Linien (Gewinn/Verlust) mit Muster und Beschriftung. */
  regions?: { points: LinePoint[]; label: string; pattern: "loss" | "gain"; labelAt: LinePoint }[];
  markers?: {
    x: number;
    y: number;
    label: string;
    kind: "intersection" | "plan" | "target" | "point";
    /** Lage der Beschriftung: oben/unten, links/rechts vom Punkt (Standard: abhängig von der Position). */
    pos?: "tl" | "tr" | "bl" | "br";
  }[];
  /** Waagerechte Hilfslinien. */
  hlines?: { y: number; label: string }[];
  /** Bedienbare Punktauswahl (Schieberegler/Tastatur): Werte an gewählter Stelle. */
  explore?: { label: string; stops: { x: number; lines: { label: string; text: string }[] }[] };
}

export interface BarItem {
  label: string;
  /** Zweite Beschriftungszeile (z. B. Bezugsgröße). */
  sub?: string;
  value: number;
  text: string;
  emphasis?: boolean;
}
export interface BarsChart extends ChartBase {
  kind: "bars";
  /** Jedes Panel hat eine eigene Wertachse (Euro und Stück nie auf derselben Achse). */
  panels: { title: string; bars: BarItem[]; ref?: { value: number; label: string } }[];
}

export interface BridgeStep {
  label: string;
  value: number;
  text: string;
  /** total/subtotal: Balken von 0; delta: Veränderung gegenüber dem laufenden Stand. */
  type: "total" | "subtotal" | "delta";
}
export interface BridgeChart extends ChartBase {
  kind: "bridge";
  unit: string;
  steps: BridgeStep[];
}

export interface CompositionChart extends ChartBase {
  kind: "composition";
  /** Teile eines gemeinsamen Ganzen (alle ≥ 0). */
  parts: { label: string; value: number; text: string }[];
  totalLabel: string;
}

export interface MeterChart extends ChartBase {
  kind: "meter";
  rows: { label: string; value: number; text: string; ref?: { value: number; label: string } }[];
  /** Obergrenze der Achse; wird automatisch erweitert, wenn Werte darüber liegen. */
  max: number;
  axisFormat: (v: number) => string;
}

export interface ScaleChart extends ChartBase {
  kind: "scale";
  min: number;
  max: number;
  value: number;
  text: string;
  axisFormat: (v: number) => string;
}

export interface HBarsChart extends ChartBase {
  kind: "hbars";
  /** Gemeinsame Skala; Nulllinie = Basis. */
  rows: { label: string; sub?: string; value: number; text: string }[];
  zeroLabel: string;
}

export type ChartSpec = HBarsChart | LinesChart | BarsChart | BridgeChart | CompositionChart | MeterChart | ScaleChart;

/** Ergebnis der Diagrammaufbereitung. Leere Liste + `note`: bewusst keine Grafik (mit Begründung). */
export interface ChartOutcome {
  charts: ChartSpec[];
  note?: string;
}
