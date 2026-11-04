import { describe, expect, it } from "vitest";
import { calc, okCalc, extra, near } from "./helpers";

describe("Prozentrechner", () => {
  it("20 % von 250 = 50", () =>
    expect(
      okCalc("prozent", "prozentwert", {
        g: "250",
        p: "20",
      }).main.value.toString(),
    ).toBe("50"));
  it("50 von 250 = 20 %", () =>
    expect(
      okCalc("prozent", "prozentsatz", {
        w: "50",
        g: "250",
      }).main.value.toString(),
    ).toBe("20"));
  it("50 sind 20 % von 250", () =>
    expect(
      okCalc("prozent", "grundwert", {
        w: "50",
        p: "20",
      }).main.value.toString(),
    ).toBe("250"));
  it("über 100 % ist erlaubt", () =>
    expect(
      okCalc("prozent", "prozentwert", {
        g: "200",
        p: "150",
      }).main.value.toString(),
    ).toBe("300"));
  it("Grundwert 0 ist nicht definiert", () =>
    expect(calc("prozent", "prozentsatz", { w: "5", g: "0" })!.status).toBe(
      "undefined",
    ));
  it("p = 0: unlösbar bzw. mehrdeutig", () => {
    expect(calc("prozent", "grundwert", { w: "5", p: "0" })!.status).toBe(
      "impossible",
    );
    expect(calc("prozent", "grundwert", { w: "0", p: "0" })!.status).toBe(
      "ambiguous",
    );
  });
  it("leere Eingaben liefern kein Ergebnis (nicht 0)", () =>
    expect(calc("prozent", "prozentwert", { g: "250", p: "" })).toBeNull());
});

describe("Prozentuale Veränderung", () => {
  it("80 → 100 = +25 %", () => {
    const r = okCalc("veraenderung", undefined, { alt: "80", neu: "100" });
    expect(r.main.value.toString()).toBe("25");
    expect(extra(r, "Absolute")).toBe("20");
  });
  it("100 → 80 = −20 %", () =>
    expect(
      okCalc("veraenderung", undefined, {
        alt: "100",
        neu: "80",
      }).main.value.toString(),
    ).toBe("-20"));
  it("Ausgangswert 0: nur absolute Veränderung", () => {
    const r = calc("veraenderung", undefined, { alt: "0", neu: "5" })!;
    expect(r.status).toBe("undefined");
    if (r.status === "undefined")
      expect(r.partial?.[0].value.toString()).toBe("5");
  });
  it("negativer Ausgangswert wird kommentiert", () =>
    expect(
      okCalc("veraenderung", undefined, { alt: "-50", neu: "50" }).notes
        ?.length,
    ).toBeGreaterThan(0));
});

describe("Rabatt & Erhöhung", () => {
  it("20 % dann 10 % Rabatt = insgesamt 28 % Rabatt", () => {
    const r = okCalc("rabatt", "zwei-aenderungen", {
      art1: "rabatt",
      satz1: "20",
      art2: "rabatt",
      satz2: "10",
    });
    expect(r.main.value.toString()).toBe("-28");
  });
  it("Preis nach Rabatt und Erhöhung", () => {
    expect(
      okCalc("rabatt", "rabatt", {
        preis: "100",
        rabatt: "20",
      }).main.value.toString(),
    ).toBe("80");
    expect(
      okCalc("rabatt", "erhoehung", {
        preis: "100",
        erhoehung: "150",
      }).main.value.toString(),
    ).toBe("250");
  });
  it("Rückrechnung", () => {
    expect(
      okCalc("rabatt", "ursprung-rabatt", {
        endpreis: "80",
        rabatt: "20",
      }).main.value.toString(),
    ).toBe("100");
    expect(
      okCalc("rabatt", "ursprung-erhoehung", {
        endpreis: "110",
        erhoehung: "10",
      }).main.value.toString(),
    ).toBe("100");
  });
  it("Rückrechnung bei 100 % Rabatt", () => {
    expect(
      calc("rabatt", "ursprung-rabatt", { endpreis: "0", rabatt: "100" })!
        .status,
    ).toBe("ambiguous");
    expect(
      calc("rabatt", "ursprung-rabatt", { endpreis: "5", rabatt: "100" })!
        .status,
    ).toBe("impossible");
  });
  it("Rabatt über 100 % ist unzulässig", () =>
    expect(
      calc("rabatt", "rabatt", { preis: "100", rabatt: "120" }),
    ).toBeNull());
});

describe("Prozentpunkte", () => {
  it("5 % → 6 % = +1 Prozentpunkt und +20 % relativ", () => {
    const r = okCalc("prozentpunkte", undefined, { alt: "5", neu: "6" });
    expect(r.main.value.toString()).toBe("1");
    expect(extra(r, "Relative")).toBe("20");
  });
  it("Ausgangswert 0 %", () =>
    expect(
      calc("prozentpunkte", undefined, { alt: "0", neu: "3" })!.status,
    ).toBe("undefined"));
});

describe("Dreisatz, Durchschnitt, CAGR", () => {
  it("3 Artikel 12 € → 5 Artikel 20 €", () =>
    expect(
      okCalc("dreisatz", "direkt", {
        a: "3",
        b: "12",
        c: "5",
      }).main.value.toString(),
    ).toBe("20"));
  it("umgekehrt: 3 Personen × 6 h → 6 Personen 3 h", () =>
    expect(
      okCalc("dreisatz", "umgekehrt", {
        a: "3",
        b: "6",
        c: "6",
      }).main.value.toString(),
    ).toBe("3"));
  it("Dreisatz verlangt positive Mengen", () =>
    expect(calc("dreisatz", "direkt", { a: "0", b: "12", c: "5" })).toBeNull());
  it("gewichteter Durchschnitt 10·1 + 20·3 → 17,5", () =>
    expect(
      okCalc("durchschnitt", undefined, {
        zeilen: [
          ["10", "1"],
          ["20", "3"],
        ],
      }).main.value.toString(),
    ).toBe("17.5"));
  it("Gewichte alle 0 → nicht definiert", () =>
    expect(
      calc("durchschnitt", undefined, {
        zeilen: [
          ["10", "0"],
          ["20", "0"],
        ],
      })!.status,
    ).toBe("undefined"));
  it("negative Gewichte unzulässig", () =>
    expect(
      calc("durchschnitt", undefined, { zeilen: [["10", "-1"]] }),
    ).toBeNull());
  it("CAGR 100 → 121 in 2 Jahren = 10 %", () =>
    near(
      okCalc("cagr", undefined, {
        a: "100",
        e: "121",
        n: "2",
      }).main.value.toString(),
      "10",
    ));
  it("CAGR mit gebrochenen Jahren", () =>
    near(
      okCalc("cagr", undefined, {
        a: "100",
        e: "200",
        n: "0,5",
      }).main.value.toString(),
      "300",
    ));
  it("CAGR: Anfangswert 0 unzulässig", () =>
    expect(calc("cagr", undefined, { a: "0", e: "121", n: "2" })).toBeNull());
  it("CAGR: Endwert 0 = −100 %", () =>
    expect(
      okCalc("cagr", undefined, {
        a: "100",
        e: "0",
        n: "2",
      }).main.value.toString(),
    ).toBe("-100"));
});
