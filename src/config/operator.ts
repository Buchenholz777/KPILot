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
  name: { value: "Alexander Bandel", confirmed: true } as Fact,
  street: { value: "Graf-Dietrich-Weg 11", confirmed: true } as Fact,
  city: { value: "33034 Brakel", confirmed: true } as Fact,
  country: { value: "Deutschland", confirmed: true } as Fact,
  /** Kontaktweg für Impressum, Datenschutzanfragen und die Rückmeldefunktion je Rechner. */
  email: { value: "alexbundle2@gmail.com", confirmed: true } as Fact,
  /** Optional. Leer lassen, wenn keine Telefonnummer veröffentlicht werden soll. */
  phone: { value: undefined, confirmed: true } as Fact,
  /** Nur ausfüllen, wenn zutreffend (Rechtsform, Register, USt-IdNr. …). `confirmed: true` + leer = „nicht zutreffend“. */
  legalForm: { value: undefined, confirmed: true } as Fact,
  register: { value: undefined, confirmed: true } as Fact,
  vatId: { value: undefined, confirmed: true } as Fact,
  /** Zuständige Datenschutz-Aufsichtsbehörde – hängt vom bestätigten Sitz ab. */
  supervisoryAuthority: { value: "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße 2–4, 40213 Düsseldorf.", confirmed: true } as Fact,
  /** Hosting-Anbieter, den der Betreiber tatsächlich nutzt. Die Projektkonfiguration (wrangler.jsonc) weist auf Cloudflare Pages hin. */
  hostingProvider: { value: "Cloudflare Pages, ein Dienst der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA", confirmed: true } as Fact,
  hostingDetails: { value: "Cloudflare verarbeitet die Verbindungsdaten, um die Seiten auszuliefern und vor Angriffen zu schützen. Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Cloudflare, Inc. ist nach dem EU-US Data Privacy Framework zertifiziert (Art. 45 DSGVO). Wir selbst werten keine Zugriffsprotokolle aus.", confirmed: true } as Fact,
  /** Speicherdauer der Messdaten in der Google-Analytics-Property. */
  analyticsRetention: { value: "Ereignisdaten werden in Google Analytics nach 2 Monaten automatisch gelöscht. Die Cookies „_ga“ und „_ga_…“ bleiben bis zu 2 Jahre gespeichert, sofern du sie nicht vorher löschst oder deine Einwilligung widerrufst.", confirmed: true } as Fact,
  /** Grundlage der Datenübermittlung in Drittländer (Google). */
  analyticsTransferBasis: { value: "Google LLC ist nach dem EU-US Data Privacy Framework zertifiziert; die Übermittlung stützt sich auf den Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO)", confirmed: true } as Fact,
  /** Rechtliche Prüfung der Texte durch den Betreiber bzw. eine fachkundige Stelle. */
  legalReview: { value: "Vom Betreiber zur Veröffentlichung freigegeben am 05.11.2026", confirmed: true } as Fact,
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
