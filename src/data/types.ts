export type CategoryId =
  "prozent" | "kosten" | "finanzen" | "marketing" | "produkt" | "controlling";

export interface Category {
  id: CategoryId;
  slug: string;
  title: string;
  short: string;
  /** Einleitung der Kategorieseite. */
  intro: string;
  /** Häufig verwechselte Begriffe in dieser Kategorie. */
  confusions: { a: string; b: string; text: string }[];
}

export interface Topic {
  id: string;
  /** URL-Pfad ohne Schrägstriche, z. B. „break-even-rechner“. */
  slug: string;
  title: string;
  /** Geläufige Abkürzung, falls vorhanden. */
  abbr?: string;
  /** Ausgeschriebener Fachbegriff, falls vom Titel abweichend. */
  fullTerm?: string;
  category: CategoryId;
  /** Redaktionell empfohlen für die Startseite (keine gemessene Beliebtheit). */
  recommended?: boolean;
  /** 1–2 kurze Sätze für die Kachel. */
  short: string;
  /** Typische Nutzerfrage. */
  question: string;
  /** „Kurz erklärt“: höchstens zwei einfache Sätze. */
  intro: string;
  /** Synonyme, Abkürzungen, Alltagsfragen, verwandte Begriffe für die Suche. */
  synonyms: string[];
  image: { alt: string; caption: string; description: string };
  formula: string[];
  variables: [string, string][];
  interpretation: string;
  misconceptions: string[];
  assumptions: string[];
  related: string[];
  seoTitle: string;
  seoDescription: string;
  sources?: { label: string; url: string }[];
}
