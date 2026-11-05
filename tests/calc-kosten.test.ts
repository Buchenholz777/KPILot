import { describe, expect, it } from "vitest";
import { calc, okCalc, extra } from "./helpers";
import { D } from "../src/lib/decimal";

describe("Deckungsbeitrag", () => {
  it("Preis 50, v 30, Menge 100", () => {
    const r = okCalc("deckungsbeitrag", undefined, {
      p: "50",
      v: "30",
      q: "100",
    });
    expect(r.main.value.toString()).toBe("20");
    expect(extra(r, "Gesamtdeckungsbeitrag")).toBe("2000");
    expect(extra(r, "Deckungsbeitragsquote")).toBe("40");
  });
  it("negativer Deckungsbeitrag ist ein Ergebnis, kein Fehler", () =>
    expect(
      okCalc("deckungsbeitrag", undefined, {
        p: "20",
        v: "30",
      }).main.value.toString(),
    ).toBe("-10"));
  it("Preis 0: Quote nicht definiert", () =>
    expect(
      okCalc("deckungsbeitrag", undefined, { p: "0", v: "0" }).extra?.some(
        (e) => e.label.includes("quote"),
      ),
    ).toBe(false));
  it("negative Preise sind unzulässig", () =>
    expect(calc("deckungsbeitrag", undefined, { p: "-5", v: "1" })).toBeNull());
});

describe("Break-even", () => {
  const be = (F: string) =>
    okCalc("break-even", undefined, { p: "50", v: "30", F, zeitraum: "monat" });
  it("F 3.000: 150 Stück, Ergebnis 0, Gewinn ab 151", () => {
    const r = be("3000");
    expect(r.main.value.toString()).toBe("150");
    expect(extra(r, "Theoretische Gewinnschwelle")).toBe("150");
    expect(extra(r, "Ergebnis bei dieser")).toBe("0");
    expect(extra(r, "Positiver Gewinn ab")).toBe("151");
    // Gewinn bei 151 Stück = 20
    expect(D(20).mul(151).sub(3000).toString()).toBe("20");
  });
  it("F 3.010: theoretisch 150,5, benötigt 151, Gewinn 10", () => {
    const r = be("3010");
    expect(r.main.value.toString()).toBe("151");
    expect(extra(r, "Theoretische Gewinnschwelle")).toBe("150.5");
    expect(r.main.value.toString()).toBe("151");
    expect(extra(r, "Gewinn bei dieser")).toBe("10");
  });
  it("Mindeststückzahl erreicht Kostendeckung, eins weniger nicht", () => {
    for (const F of ["3000", "3010", "2999,99", "1", "123456,78"]) {
      const r = be(F);
      const q = D(r.main.value.toString());
      const f = D(F.replace(",", "."));
      expect(D(20).mul(q).sub(f).gte(0)).toBe(true);
      if (q.gt(0)) expect(D(20).mul(q.sub(1)).sub(f).lt(0)).toBe(true);
    }
  });
  it("Rundung nahe einer ganzen Zahl: kein vorzeitiges Abrunden", () => {
    const r = okCalc("break-even", undefined, {
      p: "3",
      v: "0",
      F: "300,0000000003",
      zeitraum: "monat",
    });
    expect((r.main.value.toString())).toBe("101");
  });
  it("Randfälle", () => {
    expect(
      calc("break-even", undefined, {
        p: "30",
        v: "30",
        F: "100",
        zeitraum: "monat",
      })!.status,
    ).toBe("impossible");
    expect(
      calc("break-even", undefined, {
        p: "20",
        v: "30",
        F: "100",
        zeitraum: "monat",
      })!.status,
    ).toBe("impossible");
    expect(
      okCalc("break-even", undefined, {
        p: "50",
        v: "30",
        F: "0",
        zeitraum: "monat",
      }).main.value.toString(),
    ).toBe("0");
    expect(
      calc("break-even", undefined, {
        p: "30",
        v: "30",
        F: "0",
        zeitraum: "monat",
      })!.status,
    ).toBe("ambiguous");
    expect(
      calc("break-even", undefined, {
        p: "20",
        v: "30",
        F: "0",
        zeitraum: "monat",
      })!.status,
    ).toBe("impossible");
  });
  it("fehlende Fixkosten sind nicht 0", () =>
    expect(
      calc("break-even", undefined, {
        p: "50",
        v: "30",
        F: "",
        zeitraum: "monat",
      }),
    ).toBeNull());
});

describe("Gewinn & Zielgewinn", () => {
  it("Gewinn bei 200 Stück", () =>
    expect(
      okCalc("gewinn", "menge", {
        p: "50",
        v: "30",
        F: "3000",
        q: "200",
        zeitraum: "monat",
      }).main.value.toString(),
    ).toBe("1000"));
  it("Verlust wird negativ ausgewiesen", () => {
    const r = okCalc("gewinn", "menge", {
      p: "50",
      v: "30",
      F: "3000",
      q: "100",
      zeitraum: "monat",
    });
    expect(r.main.value.toString()).toBe("-1000");
    expect(r.main.label).toBe("Verlust");
  });
  it("Zielgewinn 1.000 → 200 Stück", () =>
    expect(
      okCalc("gewinn", "zielgewinn", {
        p: "50",
        v: "30",
        F: "3000",
        Z: "1000",
        zeitraum: "monat",
      }).main.value.toString(),
    ).toBe("200"));
  it("Zielgewinn: Mindestmenge erreicht Ziel, eins weniger nicht", () => {
    const r = okCalc("gewinn", "zielgewinn", {
      p: "50",
      v: "30",
      F: "3000",
      Z: "1001",
      zeitraum: "monat",
    });
    const q = r.main.value;
    expect(q.toString()).toBe("201");
    expect(D(20).mul(q).sub(3000).gte(1001)).toBe(true);
    expect(D(20).mul(q.sub(1)).sub(3000).lt(1001)).toBe(true);
  });
  it("Zielgewinn 0 = Kostendeckung", () =>
    expect(
      okCalc("gewinn", "zielgewinn", {
        p: "50",
        v: "30",
        F: "3000",
        Z: "0",
        zeitraum: "monat",
      }).main.value.toString(),
    ).toBe("150"));
  it("nichtpositiver Deckungsbeitrag", () =>
    expect(
      calc("gewinn", "zielgewinn", {
        p: "30",
        v: "30",
        F: "3000",
        Z: "0",
        zeitraum: "monat",
      })!.status,
    ).toBe("impossible"));
});

describe("Marge, Zielpreis, Stückkosten, Zuschlag, Stundensatz", () => {
  it("Kosten 80, Preis 100: 20 % Marge, 25 % Aufschlag", () => {
    const r = okCalc("marge", undefined, { k: "80", p: "100" });
    expect(r.main.value.toString()).toBe("20");
    expect(extra(r, "Aufschlag")).toBe("25");
  });
  it("Verkauf unter Kosten: negative Marge", () =>
    expect(
      okCalc("marge", undefined, { k: "120", p: "100" }).main.value.toString(),
    ).toBe("-20"));
  it("Kosten 0: Aufschlag nicht definiert, Marge schon", () =>
    expect(
      okCalc("marge", undefined, { k: "0", p: "100" }).main.value.toString(),
    ).toBe("100"));
  it("Zielmarge 20 % auf 80 € → 100 €", () =>
    expect(
      okCalc("zielpreis", undefined, {
        k: "80",
        m: "20",
      }).main.value.toString(),
    ).toBe("100"));
  it("Zielpreis wird auf Cent aufgerundet und hält die Marge ein", () => {
    const r = okCalc("zielpreis", undefined, { k: "10", m: "33" });
    // 10 / 0,67 = 14,925373… → 14,93 €
    expect(r.main.value.toString()).toBe("14.93");
    expect(D(extra(r, "Tatsächliche")).gte(33)).toBe(true);
    // 14,92 € würde die Marge verfehlen
    expect(D("14.92").sub(10).div("14.92").mul(100).lt(33)).toBe(true);
  });
  it("Zielmarge 100 % unzulässig", () =>
    expect(calc("zielpreis", undefined, { k: "80", m: "100" })).toBeNull());
  it("Stückkosten F 1.000, v 10, q 100", () => {
    const r = okCalc("stueckkosten", undefined, {
      F: "1000",
      v: "10",
      q: "100",
    });
    expect(r.main.value.toString()).toBe("20");
    expect(extra(r, "Gesamtkosten")).toBe("2000");
  });
  it("Stückkosten bei q = 0 nicht definiert", () =>
    expect(
      calc("stueckkosten", undefined, { F: "1000", v: "10", q: "0" })!.status,
    ).toBe("undefined"));
  it("Zuschlagskalkulation → 170 € HK / 195,50 € SK", () => {
    const r = okCalc("zuschlag", "schema", {
      mek: "100",
      mgk: "10",
      fek: "50",
      fgk: "20",
      sekf: "0",
      vwgk: "5",
      vtgk: "10",
      sekv: "0",
    });
    expect(extra(r, "Herstellkosten")).toBe("170");
    expect(r.main.value.toString()).toBe("195.5");
  });
  it("Zuschlagssatz und Null-Basis", () => {
    expect(
      okCalc("zuschlag", "satz", {
        gk: "20000",
        basis: "100000",
      }).main.value.toString(),
    ).toBe("20");
    expect(calc("zuschlag", "satz", { gk: "20000", basis: "0" })!.status).toBe(
      "undefined",
    );
  });
  it("Stundenkostensatz 1.200 € / 60 h = 20 €/h", () =>
    expect(
      okCalc("stundensatz", undefined, {
        kosten: "1200",
        stunden: "60",
      }).main.value.toString(),
    ).toBe("20"));
  it("Stundensatz bei 0 h nicht definiert", () =>
    expect(
      calc("stundensatz", undefined, { kosten: "1200", stunden: "0" })!.status,
    ).toBe("undefined"));
});
