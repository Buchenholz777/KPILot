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
