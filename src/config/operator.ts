/**
 * Betreiberangaben für Impressum und Datenschutzhinweise – einzige Quelle.
 *
 * WICHTIG: Hier steht nichts, was nicht bestätigt ist. Jede Angabe trägt ein eigenes Flag `confirmed`.
 * Die Werte stammen aus dem bisherigen Entwurf des Impressums (in eckigen Klammern) bzw. aus der Projektkonfiguration
 * und sind deshalb ausdrücklich NICHT als geprüft markiert. Erst wenn der Betreiber eine Angabe bestätigt, wird
 * `confirmed: true` gesetzt. Sind alle Pflichtangaben bestätigt, verschwindet der Entwurfshinweis automatisch.
 * Die Liste der noch fehlenden Angaben erzeugt `openOperatorItems()` – sie steht auch in docs/BETREIBER-OFFEN.md.
 */
export interface Fact<T = string> {
  value?: T;
  confirmed: boolean;
}

export const OPERATOR = {
  /** Vollständiger Name der natürlichen oder juristischen Person. */
  name: { value: "Alexander Bandel", confirmed: false } as Fact,
  street: { value: "Graf-Dietrich-Weg 11", confirmed: false } as Fact,
  city: { value: "33034 Brakel", confirmed: false } as Fact,
  country: { value: "Deutschland", confirmed: false } as Fact,
  /** Kontaktweg für Impressum, Datenschutzanfragen und die Rückmeldefunktion je Rechner. */
  email: { value: "alex.bundle2@gmail.com", confirmed: false } as Fact,
  /** Optional. Leer lassen, wenn keine Telefonnummer veröffentlicht werden soll. */
  phone: { value: undefined, confirmed: true } as Fact,
  /** Nur ausfüllen, wenn zutreffend (Rechtsform, Register, USt-IdNr. …). `confirmed: true` + leer = „nicht zutreffend“. */
  legalForm: { value: undefined, confirmed: false } as Fact,
  register: { value: undefined, confirmed: false } as Fact,
  vatId: { value: undefined, confirmed: false } as Fact,
  /** Zuständige Datenschutz-Aufsichtsbehörde – hängt vom bestätigten Sitz ab. */
  supervisoryAuthority: { value: undefined, confirmed: false } as Fact,
  /** Hosting-Anbieter, den der Betreiber tatsächlich nutzt. Die Projektkonfiguration (wrangler.jsonc) weist auf Cloudflare Pages hin. */
  hostingProvider: { value: "Cloudflare Pages", confirmed: false } as Fact,
  hostingDetails: { value: undefined, confirmed: false } as Fact,
  /** Speicherdauer der Messdaten in der Google-Analytics-Property. */
  analyticsRetention: { value: undefined, confirmed: false } as Fact,
  /** Grundlage der Datenübermittlung in Drittländer (Google). */
  analyticsTransferBasis: { value: undefined, confirmed: false } as Fact,
  /** Rechtliche Prüfung der Texte durch den Betreiber bzw. eine fachkundige Stelle. */
  legalReview: { value: undefined, confirmed: false } as Fact,
};

export type OperatorKey = keyof typeof OPERATOR;

export const OPERATOR_LABELS: Record<OperatorKey, string> = {
  name: "Vollständiger Name bzw. Firma des Anbieters",
  street: "Straße und Hausnummer",
  city: "Postleitzahl und Ort",
  country: "Land",
  email: "E-Mail-Adresse (Impressum, Datenschutz, Rückmeldungen)",
  phone: "Telefonnummer (optional)",
  legalForm: "Rechtsform (falls zutreffend)",
  register: "Registergericht und Registernummer (falls zutreffend)",
  vatId: "Umsatzsteuer-Identifikationsnummer (falls zutreffend)",
  supervisoryAuthority: "Zuständige Datenschutz-Aufsichtsbehörde",
  hostingProvider: "Tatsächlich eingesetzter Hosting-Anbieter",
  hostingDetails: "Hosting: Art und Dauer der Speicherung von Verbindungsdaten laut Anbieter",
  analyticsRetention: "Google Analytics: eingestellte Speicherdauer",
  analyticsTransferBasis: "Google Analytics: Grundlage der Datenübermittlung in die USA",
  legalReview: "Bestätigung der rechtlichen Prüfung von Impressum und Datenschutzhinweisen",
};

/** Angaben, die für ein vollständiges Impressum bzw. vollständige Datenschutzhinweise bestätigt sein müssen. */
const REQUIRED: OperatorKey[] = [
  "name",
  "street",
  "city",
  "country",
  "email",
  "legalForm",
  "register",
  "vatId",
  "supervisoryAuthority",
  "hostingProvider",
  "hostingDetails",
  "analyticsRetention",
  "analyticsTransferBasis",
  "legalReview",
];

export const isConfirmed = (k: OperatorKey) => OPERATOR[k].confirmed;
export const operatorValue = (k: OperatorKey) => OPERATOR[k].value;

/** Noch nicht bestätigte Angaben (für Hinweisbox und Betreiberliste). */
export function openOperatorItems(): { key: OperatorKey; label: string }[] {
  return REQUIRED.filter((k) => !OPERATOR[k].confirmed).map((key) => ({
    key,
    label: OPERATOR_LABELS[key],
  }));
}

export const operatorComplete = () => openOperatorItems().length === 0;
