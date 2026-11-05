import { describe, expect, it } from "vitest";
import { calc, okCalc, extra } from "./helpers";
import { getVariant, CALCS } from "../src/calc/all";
import { runExample, validate } from "../src/calc/engine";
import { D } from "../src/lib/decimal";

describe("Rabatt: nötiger Mehrabsatz", () => {
  const base = { preis: "100", v: "80", rabatt: "10", q0: "100", zeitraum: "monat" };
  it("Prüffall: 100 €, 80 € variable Kosten, 10 % → 90 €, Beitrag 20 → 10, Faktor 2, +100 %, 200 Stück", () => {
    const r = okCalc("rabatt-absatz", "prozent", base);
    expect(r.main.label).toBe("Erforderlicher Mehrabsatz");
    expect(r.main.value.toString()).toBe("100");
    expect(extra(r, "Absatzfaktor")).toBe("2");
    expect(extra(r, "Neuer Verkaufspreis")).toBe("90");
    expect(extra(r, "Stückdeckungsbeitrag vorher")).toBe("20");
    expect(extra(r, "Stückdeckungsbeitrag nachher")).toBe("10");
    expect(extra(r, "Veränderung des Stückdeckungsbeitrags")).toBe("-10");
    expect(extra(r, "Erforderliche neue Menge")).toBe("200");
  });
  it("beide Modi liefern bei gleichem Preis dasselbe Ergebnis", () => {
    const a = okCalc("rabatt-absatz", "prozent", base);
    const b = okCalc("rabatt-absatz", "neuer-preis", { preis: "100", v: "80", neuerPreis: "90", q0: "100", zeitraum: "monat" });
    expect(b.main.value.toString()).toBe(a.main.value.toString());
    expect(extra(b, "Erforderliche neue Menge")).toBe("200");
  });
  it("Rundung erst am Ende und gegen die ungerundeten Werte geprüft", () => {
    // d0 = 10, p1 = 83 → d1 = 3 → Faktor 10/3; q0 = 7 → theoretisch 23,333… → 24
    const r = okCalc("rabatt-absatz", "neuer-preis", { preis: "90", v: "80", neuerPreis: "83", q0: "7", zeitraum: "monat" });
    const q = D(extra(r, "Erforderliche neue Menge"));
    expect(q.toString()).toBe("24");
    expect(D(3).mul(q).gte(D(10).mul(7))).toBe(true); // erreicht den bisherigen Gesamtbeitrag
    expect(D(3).mul(q.sub(1)).lt(D(10).mul(7))).toBe(true); // eine Einheit weniger reicht nicht
    expect(extra(r, "Theoretische Menge")).toMatch(/^23\.3333/);
  });
  it("ohne Ausgangsmenge: Faktor und Prozent, aber keine absolute Zielmenge", () => {
    const r = okCalc("rabatt-absatz", "prozent", { ...base, q0: "" });
    expect(r.main.value.toString()).toBe("100");
    expect(r.extra?.some((e) => e.label === "Erforderliche neue Menge")).toBe(false);
  });
  it("Ausgangsmenge 0 wird nachvollziehbar behandelt", () => {
    const r = okCalc("rabatt-absatz", "prozent", { ...base, q0: "0" });
    expect(extra(r, "Erforderliche neue Menge")).toBe("0");
    expect(r.meaning).toMatch(/nichts zu halten/);
  });
  it("Rabatt 0 %: Faktor 1, kein Mehrabsatz", () => {
    const r = okCalc("rabatt-absatz", "prozent", { ...base, rabatt: "0" });
    expect(r.main.value.toString()).toBe("0");
    expect(extra(r, "Absatzfaktor")).toBe("1");
  });
  it("Beitrag nach Rabatt null: keine Zielmenge, verständliche Grenze", () => {
    const r = calc("rabatt-absatz", "prozent", { ...base, rabatt: "20" })!; // Preis 80 = Kosten
    expect(r.status).toBe("impossible");
    if (r.status !== "impossible") return;
    expect(r.message).toMatch(/Stückdeckungsbeitrag ist 0,00 €/);
    expect(r.message).toMatch(/weder eine endliche noch eine „unendliche“ Zielmenge/);
    expect(r.partial?.length).toBeGreaterThan(0);
  });
  it("Beitrag nach Rabatt negativ: Verlust je Einheit wird benannt", () => {
    const r = calc("rabatt-absatz", "prozent", { ...base, rabatt: "50" })!;
    expect(r.status).toBe("impossible");
    expect("message" in r && r.message).toMatch(/Verlust von 30,00 €/);
  });
  it("100 % Rabatt und Beitrag schon vorher ≤ 0 sind keine Lösung", () => {
    expect(calc("rabatt-absatz", "prozent", { ...base, rabatt: "100" })!.status).toBe("impossible");
    expect(calc("rabatt-absatz", "prozent", { ...base, v: "100" })!.status).toBe("impossible");
    expect(calc("rabatt-absatz", "prozent", { ...base, v: "120" })!.status).toBe("impossible");
  });
  it("unzulässige Eingaben: Rabatt > 100, negativer Preis, neuer Preis über dem alten", () => {
    expect(calc("rabatt-absatz", "prozent", { ...base, rabatt: "101" })).toBeNull();
    expect(calc("rabatt-absatz", "prozent", { ...base, preis: "-5" })).toBeNull();
    expect(calc("rabatt-absatz", "prozent", { ...base, preis: "0" })).toBeNull();
    const r = calc("rabatt-absatz", "neuer-preis", { preis: "100", v: "80", neuerPreis: "110", q0: "", zeitraum: "monat" })!;
    expect(r.status).toBe("invalid");
  });
});

describe("Werbewirtschaftlichkeit und Mindest-ROAS", () => {
  const w = { umsatz: "2000", kosten: "500", quote: "30", alt: "" };
  it("Prüffall: ROAS 4, Beitrag vor Werbung 600 €, danach 100 €, Mindest-ROAS ≈ 3,33", () => {
    const r = okCalc("roas", "wirtschaftlichkeit", w);
    expect(r.main.value.toString()).toBe("100");
    expect(extra(r, "Deckungsbeitrag vor")).toBe("600");
    expect(extra(r, "ROAS")).toBe("4");
    expect(Number(extra(r, "Mindest-ROAS"))).toBeCloseTo(3.3333333, 6);
    expect(r.notes?.join(" ")).toMatch(/Fixkosten/);
    expect(r.notes?.join(" ")).toMatch(/Attribution/);
  });
  it("ROAS-Modus bleibt unverändert", () => {
    const r = okCalc("roas", "standard", { umsatz: "2000", kosten: "500" });
    expect(r.main.value.toString()).toBe("4");
  });
  it("Werbekosten 0: ROAS nicht definiert, übrige Teilwerte bleiben mit Erklärung", () => {
    const r = okCalc("roas", "wirtschaftlichkeit", { ...w, kosten: "0" });
    expect(r.extra?.some((e) => e.label === "ROAS")).toBe(false);
    expect(r.notes?.[0]).toMatch(/Bei 0 € Werbekosten ist der ROAS nicht definiert/);
    expect(r.main.value.toString()).toBe("600");
    expect(extra(r, "Mindest-ROAS").startsWith("3.33")).toBe(true);
    const std = calc("roas", "standard", { umsatz: "2000", kosten: "0" });
    expect(std?.status).toBe("undefined");
  });
  it("Quote 0: Mindest-ROAS nicht definiert, Beitrag = −Werbekosten", () => {
    const r = okCalc("roas", "wirtschaftlichkeit", { ...w, quote: "0" });
    expect(r.extra?.some((e) => e.label.startsWith("Mindest-ROAS"))).toBe(false);
    expect(r.notes?.[0]).toMatch(/Mindest-ROAS ist nicht definiert/);
    expect(r.main.value.toString()).toBe("-500");
    expect(r.tone).toBe("negative");
  });
  it("Alternative Quote zeigt die Veränderung", () => {
    const r = okCalc("roas", "wirtschaftlichkeit", { ...w, alt: "25" });
    expect(extra(r, "Beitrag nach Werbung bei")).toBe("0");
    expect(extra(r, "Veränderung")).toBe("-100");
    expect(extra(r, "Mindest-ROAS bei")).toBe("4");
  });
  it("Quote über 100 % ist unzulässig", () => {
    expect(calc("roas", "wirtschaftlichkeit", { ...w, quote: "120" })).toBeNull();
  });
});

describe("Folgeaktionen", () => {
  const fu = (id: string) => CALCS[id].followUps ?? [];
  it("ROAS → Werbewirtschaftlichkeit übernimmt Umsatz und Werbekosten, keine erfundene Quote", () => {
    const v = getVariant("roas", "standard");
    const inputs = validate(v, { umsatz: "2000", kosten: "500" }).inputs!;
    const f = fu("roas").find((x) => x.id === "roas-wirtschaftlichkeit")!;
    const res = okCalc("roas", "standard", { umsatz: "2000", kosten: "500" });
    expect(f.when(inputs, res)).toBe(true);
    if (f.action.kind !== "variant") throw new Error();
    expect(f.action.values(inputs, res)).toEqual({ umsatz: "2000", kosten: "500" });
  });
  it("Rabatt-Mehrabsatz bietet Kapazitätsabgleich nur mit absoluter Zielmenge", () => {
    const f = fu("rabatt-absatz").find((x) => x.id === "rabatt-kapazitaet")!;
    const withQ = okCalc("rabatt-absatz", "prozent", { preis: "100", v: "80", rabatt: "10", q0: "100", zeitraum: "monat" });
    const noQ = okCalc("rabatt-absatz", "prozent", { preis: "100", v: "80", rabatt: "10", q0: "", zeitraum: "monat" });
    expect(f.when(undefined, withQ)).toBe(true);
    expect(f.when(undefined, noQ)).toBe(false);
  });
  it("jede Folgeaktion verweist auf vorhandene Ziele, Modi und Felder", () => {
    for (const c of Object.values(CALCS)) {
      for (const f of c.followUps ?? []) {
        const a = f.action;
        if (a.kind === "transfer") expect(c.transfers?.some((t) => t.target === a.target), `${c.id}/${f.id}`).toBe(true);
        if (a.kind === "variant") expect(c.variants.some((v) => v.id === a.variantId), `${c.id}/${f.id}`).toBe(true);
        const keys = a.kind === "focus" ? a.fields : a.kind === "scenario" ? a.focus : [];
        for (const k of keys)
          expect(c.variants.some((v) => v.fields.some((x) => x.key === k)), `${c.id}/${f.id}/${k}`).toBe(true);
      }
    }
  });
});

describe("Beispiele", () => {
  it("neue Modi haben berechenbare Beispiele", () => {
    for (const [id, v] of [["rabatt-absatz", "prozent"], ["rabatt-absatz", "neuer-preis"], ["roas", "wirtschaftlichkeit"]] as const)
      expect(runExample(getVariant(id, v)).status).toBe("ok");
  });
});
