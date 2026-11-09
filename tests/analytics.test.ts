import { beforeEach, describe, expect, it } from "vitest";
import {
  track,
  enableAnalytics,
  disableAnalytics,
  resetAnalyticsForTests,
  cleanParams,
} from "../src/lib/analytics";
import * as st from "../src/lib/storage";
import {
  OPERATOR,
  openOperatorItems,
  operatorComplete,
} from "../src/config/operator";

class Mem implements st.StorageLike {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

let sent: { name: string; params: Record<string, string> }[] = [];
beforeEach(() => {
  st.setStorages(new Mem(), new Mem());
  resetAnalyticsForTests();
  sent = [];
});
const enable = () =>
  enableAnalytics((name, params) => sent.push({ name, params }));

describe("Erfolgsmessung", () => {
  it("sendet ohne Einwilligung nichts – auch wenn das Skript bereit wäre", () => {
    enable();
    expect(track("calc_started", { calc: "break-even" })).toBe(false);
    st.setConsent("denied");
    expect(track("calc_started", { calc: "break-even" })).toBe(false);
    expect(sent).toHaveLength(0);
  });
  it("sendet nichts, solange gtag nicht geladen ist", () => {
    st.setConsent("granted");
    expect(track("calc_started", { calc: "break-even" })).toBe(false);
  });
  it("sendet nach Einwilligung, aber jedes Ereignis je Rechner und Modus nur einmal", () => {
    st.setConsent("granted");
    enable();
    expect(
      track("calc_started", { calc: "break-even", variant: "standard" }),
    ).toBe(true);
    for (let i = 0; i < 20; i++)
      track("calc_started", { calc: "break-even", variant: "standard" });
    expect(sent).toHaveLength(1);
    expect(track("calc_started", { calc: "gewinn", variant: "menge" })).toBe(
      true,
    );
    expect(sent).toHaveLength(2);
  });
  it("Widerruf stoppt die Messung sofort", () => {
    st.setConsent("granted");
    enable();
    st.setConsent("denied");
    disableAnalytics();
    expect(track("calc_result", { calc: "roi" })).toBe(false);
  });
  it("überträgt nur Kennungen – keine Zahlen, Texte oder fremde Schlüssel", () => {
    const dirty = {
      calc: "break-even",
      variant: "Mein Projekt 3.000 €",
      task: "verkaufspreis",
      q: "Deckungsbeitarg",
      value: "3000",
    } as unknown as Parameters<typeof cleanParams>[0];
    expect(cleanParams(dirty)).toEqual({
      calc: "break-even",
      task: "verkaufspreis",
    });
  });
});

describe("Navigations- und Nutzungsereignisse", () => {
  it("neue Ereignisse senden nur Rechnerkennungen, nie Freitext", () => {
    st.setConsent("granted");
    enable();
    track("calc_selected", { calc: "marge" });
    track("related_clicked", { calc: "break-even" });
    track("search_used");
    track("chart_shown", { calc: "marge", variant: "standard" });
    track("result_copied", { calc: "marge", variant: "standard" });
    track("favorite_added", { calc: "marge" });
    expect(sent.map((s) => s.name)).toEqual([
      "calc_selected",
      "related_clicked",
      "search_used",
      "chart_shown",
      "result_copied",
      "favorite_added",
    ]);
    expect(sent[2].params).toEqual({});
    // Eingeschleuste Werte werden verworfen
    track("result_copied", { calc: "Marge 12,5 %" as never, variant: "100 €" as never });
    expect(sent[sent.length - 1].params).toEqual({});
  });
  it("search_used und chart_shown zählen je Seitenaufruf nur einmal", () => {
    st.setConsent("granted");
    enable();
    for (let i = 0; i < 5; i++) {
      track("search_used");
      track("chart_shown", { calc: "roi", variant: "standard" });
    }
    expect(sent).toHaveLength(2);
  });
});

describe("Betreiberangaben", () => {
  it("alle Pflichtangaben sind vom Betreiber bestätigt (kein Hinweis „in Vorbereitung“)", () => {
    expect(openOperatorItems()).toEqual([]);
    expect(operatorComplete()).toBe(true);
  });
  it("bestätigte Kontaktdaten sind gesetzt", () => {
    expect(OPERATOR.name.value).toBe("Alexander Bandel");
    expect(OPERATOR.email.value).toBe("alexbundle2@gmail.com");
    expect(OPERATOR.city.value).toBe("33034 Brakel");
  });
  it("bestätigte Angaben ohne Wert bedeuten „nicht zutreffend“ und erscheinen nicht", () => {
    for (const k of ["legalForm", "register", "vatId", "phone"] as const) {
      expect(OPERATOR[k].confirmed, k).toBe(true);
      expect(OPERATOR[k].value, k).toBeUndefined();
    }
  });
});
