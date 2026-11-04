import { afterEach, describe, expect, it } from "vitest";
import * as st from "../src/lib/storage";

function mem(): st.StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe("Einwilligung", () => {
  afterEach(() => st.setStorages(null, null));

  it("ohne Entscheidung: null (Banner wird gezeigt)", () => {
    st.setStorages(mem(), mem());
    expect(st.getConsent()).toBeNull();
  });
  it("speichert Zustimmung und Ablehnung", () => {
    st.setStorages(mem(), mem());
    expect(st.setConsent("granted")).toBe(true);
    expect(st.getConsent()).toBe("granted");
    st.setConsent("denied");
    expect(st.getConsent()).toBe("denied");
  });
  it("beschädigte oder fremde Werte gelten als keine Entscheidung", () => {
    const l = mem();
    st.setStorages(l, mem());
    for (const raw of ["{kaputt", '{"v":2,"analytics":"granted"}', '{"v":1,"analytics":"ja"}']) {
      l.data.set(st.CONSENT_KEY, raw);
      expect(st.getConsent(), raw).toBeNull();
    }
  });
  it("„Alles löschen“ behält die Einwilligungsentscheidung", () => {
    st.setStorages(mem(), mem());
    st.setConsent("denied");
    st.clearAll();
    expect(st.getConsent()).toBe("denied");
  });
  it("ohne Speicher: keine Entscheidung, Speichern meldet Fehler", () => {
    st.setStorages(null, null);
    expect(st.getConsent()).toBeNull();
    expect(st.setConsent("granted")).toBe(false);
  });
});
