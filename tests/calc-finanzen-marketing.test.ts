import { describe, expect, it } from "vitest";
import { calc, okCalc, extra } from "./helpers";

describe("Finanzen & Liquidität", () => {
  it("EBIT 100.000 + 0 − 70.000 − 10.000 = 20.000", () =>
    expect(
      okCalc("ebit", undefined, {
        umsatz: "100000",
        sonstige: "0",
        aufwand: "70000",
        afa: "10000",
      }).main.value.toString(),
    ).toBe("20000"));
  it("EBIT darf negativ sein", () =>
    expect(
      okCalc("ebit", undefined, {
        umsatz: "50000",
        sonstige: "0",
        aufwand: "70000",
        afa: "10000",
      }).main.value.toString(),
    ).toBe("-30000"));
  it("EBITDA 20.000 + 10.000 = 30.000", () =>
    expect(
      okCalc("ebitda", undefined, {
        ebit: "20000",
        afa: "10000",
      }).main.value.toString(),
    ).toBe("30000"));
  it("EBIT-Marge 20 %", () =>
    expect(
      okCalc("ebit-marge", undefined, {
        ebit: "20000",
        umsatz: "100000",
      }).main.value.toString(),
    ).toBe("20"));
  it("EBIT-Marge bei Umsatz 0 nicht definiert", () =>
    expect(
      calc("ebit-marge", undefined, { ebit: "20000", umsatz: "0" })!.status,
    ).toBe("undefined"));
  it("Nettoumsatzrendite 8 %", () =>
    expect(
      okCalc("umsatzrendite", undefined, {
        ergebnis: "8000",
        umsatz: "100000",
      }).main.value.toString(),
    ).toBe("8"));
  it("Operativer Cashflow +8.000", () =>
    expect(
      okCalc("cashflow", "operativ", {
        ein: "30000",
        aus: "22000",
      }).main.value.toString(),
    ).toBe("8000"));
  it("Erweiterter Cashflow +5.000", () => {
    const r = okCalc("cashflow", "erweitert", {
      ein: "30000",
      aus: "22000",
      invEin: "0",
      invAus: "5000",
      finEin: "2000",
      finAus: "0",
    });
    expect(r.main.value.toString()).toBe("5000");
    expect(extra(r, "Investitions")).toBe("-5000");
  });
  it("Erweiterter Cashflow: fehlende Bereiche nicht als 0", () =>
    expect(
      calc("cashflow", "erweitert", {
        ein: "30000",
        aus: "22000",
        invEin: "",
        invAus: "5000",
        finEin: "2000",
        finAus: "0",
      }),
    ).toBeNull());
  it("Working Capital 20.000", () =>
    expect(
      okCalc("working-capital", undefined, {
        uv: "50000",
        vb: "30000",
      }).main.value.toString(),
    ).toBe("20000"));
  it("Working Capital darf negativ sein", () =>
    expect(
      okCalc("working-capital", undefined, {
        uv: "10000",
        vb: "30000",
      }).main.value.toString(),
    ).toBe("-20000"));
  it("Liquidität 50 % / 125 % / 250 %", () => {
    const r = okCalc("liquiditaet", undefined, {
      lm: "10000",
      ford: "15000",
      vorr: "20000",
      sonst: "5000",
      vb: "20000",
    });
    expect(r.main.value.toString()).toBe("50");
    expect(extra(r, "Liquidität 2.")).toBe("125");
    expect(extra(r, "Liquidität 3.")).toBe("250");
  });
  it("Liquidität ohne Verpflichtungen nicht definiert", () =>
    expect(
      calc("liquiditaet", undefined, {
        lm: "1",
        ford: "1",
        vorr: "1",
        sonst: "0",
        vb: "0",
      })!.status,
    ).toBe("undefined"));
  it("Eigenkapitalquote 30 %, negatives EK erlaubt", () => {
    expect(
      okCalc("eigenkapital", undefined, {
        ek: "30000",
        gk: "100000",
      }).main.value.toString(),
    ).toBe("30");
    expect(
      okCalc("eigenkapital", undefined, {
        ek: "-10000",
        gk: "100000",
      }).main.value.toString(),
    ).toBe("-10");
  });
  it("ROI 10 %", () =>
    expect(
      okCalc("roi", undefined, {
        gewinn: "5000",
        kapital: "50000",
      }).main.value.toString(),
    ).toBe("10"));
  it("ROI: Kapital muss positiv sein", () =>
    expect(
      calc("roi", undefined, { gewinn: "5000", kapital: "0" }),
    ).toBeNull());
  it("Amortisation 4 Jahre", () =>
    expect(
      okCalc("amortisation", undefined, {
        inv: "10000",
        cf: "2500",
        periode: "jahr",
      }).main.value.toString(),
    ).toBe("4"));
  it("Amortisation: ganze Perioden aufgerundet", () =>
    expect(
      extra(
        okCalc("amortisation", undefined, {
          inv: "10000",
          cf: "3000",
          periode: "jahr",
        }),
        "Benötigte",
      ),
    ).toBe("4"));
  it("Amortisation ohne positiven Rückfluss unmöglich", () =>
    expect(
      calc("amortisation", undefined, {
        inv: "10000",
        cf: "0",
        periode: "jahr",
      })!.status,
    ).toBe("impossible"));
});

describe("Marketing & Vertrieb", () => {
  it("Conversion 25 / 1.000 = 2,5 %", () =>
    expect(
      okCalc("conversion", "besuche", {
        conv: "25",
        total: "1000",
      }).main.value.toString(),
    ).toBe("2.5"));
  it("besuchsbasiert: Zähler > Nenner unzulässig", () =>
    expect(
      calc("conversion", "besuche", { conv: "20", total: "10" })!.status,
    ).toBe("invalid"));
  it("ereignisbasiert: über 100 % möglich", () =>
    expect(
      okCalc("conversion", "ereignisse", {
        conv: "20",
        total: "10",
      }).main.value.toString(),
    ).toBe("200"));
  it("Conversion: Nenner 0, Zähler 0 bei positivem Nenner", () => {
    expect(
      calc("conversion", "besuche", { conv: "0", total: "0" })!.status,
    ).toBe("undefined");
    expect(
      okCalc("conversion", "besuche", {
        conv: "0",
        total: "50",
      }).main.value.toString(),
    ).toBe("0");
  });
  it("Conversion verlangt ganze Zahlen", () =>
    expect(
      calc("conversion", "besuche", { conv: "2,5", total: "100" }),
    ).toBeNull());
  it("CTR 200 / 10.000 = 2 %", () =>
    expect(
      okCalc("ctr", undefined, {
        klicks: "200",
        imp: "10000",
      }).main.value.toString(),
    ).toBe("2"));
  it("CPC 100 € / 200 Klicks = 0,50 €", () =>
    expect(
      okCalc("cpc", undefined, {
        kosten: "100",
        klicks: "200",
      }).main.value.toString(),
    ).toBe("0.5"));
  it("CPC bei 0 Klicks und 0 € nicht definiert", () =>
    expect(calc("cpc", undefined, { kosten: "0", klicks: "0" })!.status).toBe(
      "undefined",
    ));
  it("CPM 100 € / 50.000 = 2 €", () =>
    expect(
      okCalc("cpm", undefined, {
        kosten: "100",
        imp: "50000",
      }).main.value.toString(),
    ).toBe("2"));
  it("CPA 500 € / 20 = 25 €", () =>
    expect(
      okCalc("cpa", undefined, {
        kosten: "500",
        conv: "20",
      }).main.value.toString(),
    ).toBe("25"));
  it("ROAS 2.000 / 500 = 4 bzw. 400 %", () => {
    const r = okCalc("roas", undefined, { umsatz: "2000", kosten: "500" });
    expect(r.main.value.toString()).toBe("4");
    expect(extra(r, "ROAS in Prozent")).toBe("400");
  });
  it("ROAS bei 0 € Kosten nicht definiert", () =>
    expect(
      calc("roas", undefined, { umsatz: "2000", kosten: "0" })!.status,
    ).toBe("undefined"));
  it("CAC (2.000 + 1.000) / 30 = 100 €", () =>
    expect(
      okCalc("cac", undefined, {
        mkt: "2000",
        vt: "1000",
        kunden: "30",
      }).main.value.toString(),
    ).toBe("100"));
  it("CAC bei 0 Neukunden nicht definiert", () =>
    expect(
      calc("cac", undefined, { mkt: "2000", vt: "1000", kunden: "0" })!.status,
    ).toBe("undefined"));
});

describe("Produkt & Kunden, Controlling", () => {
  it("ARPU 5.000 / 100 = 50 €", () =>
    expect(
      okCalc("arpu", undefined, {
        umsatz: "5000",
        accounts: "100",
        periode: "monat",
      }).main.value.toString(),
    ).toBe("50"));
  it("ARPU mit Dezimal-Accounts", () =>
    expect(
      okCalc("arpu", undefined, {
        umsatz: "5000",
        accounts: "62,5",
        periode: "monat",
      }).main.value.toString(),
    ).toBe("80"));
  it("CLV 50 × 4 × 3 × 40 % = 240 €, Umsatz 600 €, nach CAC 140 €", () => {
    const r = okCalc("clv", undefined, {
      aov: "50",
      kaeufe: "4",
      jahre: "3",
      db: "40",
      cac: "100",
    });
    expect(r.main.value.toString()).toBe("240");
    expect(extra(r, "Lebenszeit-Umsatz")).toBe("600");
    expect(extra(r, "Modellbeitrag nach")).toBe("140");
  });
  it("CLV mit negativer DB-Quote", () =>
    expect(
      okCalc("clv", undefined, {
        aov: "50",
        kaeufe: "4",
        jahre: "3",
        db: "-10",
      }).main.value.toString(),
    ).toBe("-60"));
  it("Churn 10 % / Retention 90 %; Neukunden ändern die Quote nicht", () => {
    const a = okCalc("churn", undefined, { anfang: "100", verloren: "10" });
    const b = okCalc("churn", undefined, {
      anfang: "100",
      verloren: "10",
      neu: "20",
    });
    expect(a.main.value.toString()).toBe("10");
    expect(extra(a, "Retention")).toBe("90");
    expect(b.main.value.toString()).toBe("10");
    expect(extra(b, "Retention")).toBe("90");
  });
  it("Churn: verlorene > Anfang unzulässig, Anfang 0 nicht definiert", () => {
    expect(
      calc("churn", undefined, { anfang: "10", verloren: "11" })!.status,
    ).toBe("invalid");
    expect(
      calc("churn", undefined, { anfang: "0", verloren: "0" })!.status,
    ).toBe("undefined");
  });
  it("MRR 320 € / ARR 3.840 €", () => {
    const r = okCalc("mrr", undefined, {
      tarife: [
        ["10", "20", "1"],
        ["12", "120", "12"],
      ],
    });
    expect(r.main.value.toString()).toBe("320");
    expect(extra(r, "ARR")).toBe("3840");
  });
  it("NPS 60/10/30 → +30", () =>
    expect(
      okCalc("nps", undefined, {
        pro: "60",
        pas: "10",
        det: "30",
      }).main.value.toString(),
    ).toBe("30"));
  it("NPS: Passive zählen im Nenner, 0 Antworten nicht definiert", () => {
    expect(
      okCalc("nps", undefined, {
        pro: "50",
        pas: "50",
        det: "0",
      }).main.value.toString(),
    ).toBe("50");
    expect(
      calc("nps", undefined, { pro: "0", pas: "0", det: "0" })!.status,
    ).toBe("undefined");
  });
  it("Soll 100, Ist 110 → +10 / +10 %", () => {
    const r = okCalc("soll-ist", undefined, {
      soll: "100",
      ist: "110",
      richtung: "neutral",
    });
    expect(r.main.value.toString()).toBe("10");
    expect(extra(r, "Abweichung absolut")).toBe("10");
  });
  it("Kostenüberschreitung ist nicht „günstig“", () =>
    expect(
      okCalc("soll-ist", undefined, {
        soll: "100",
        ist: "110",
        richtung: "niedriger",
      }).tone,
    ).toBe("negative"));
  it("Soll 0: relative Abweichung nicht definiert", () =>
    expect(
      calc("soll-ist", undefined, { soll: "0", ist: "5", richtung: "neutral" })!
        .status,
    ).toBe("undefined"));
  it("Auslastung 75 %, über 100 % nicht abgeschnitten", () => {
    expect(
      okCalc("auslastung", undefined, {
        genutzt: "75",
        verfuegbar: "100",
      }).main.value.toString(),
    ).toBe("75");
    expect(
      okCalc("auslastung", undefined, {
        genutzt: "120",
        verfuegbar: "100",
      }).main.value.toString(),
    ).toBe("120");
  });
  it("Lager: 6 Umschläge, 60 Tage", () => {
    const r = okCalc("lager", "durchschnitt", {
      we: "120000",
      bestand: "20000",
      basis: "360",
    });
    expect(r.main.value.toString()).toBe("6");
    expect(extra(r, "Rechnerische Lagerdauer")).toBe("60");
  });
  it("Lager aus Anfangs- und Endbestand", () =>
    expect(
      okCalc("lager", "anfang-ende", {
        we: "120000",
        anfang: "18000",
        ende: "22000",
        basis: "360",
      }).main.value.toString(),
    ).toBe("6"));
  it("Lager: Bestand 0 bzw. Wareneinsatz 0", () => {
    expect(
      calc("lager", "durchschnitt", {
        we: "120000",
        bestand: "0",
        basis: "360",
      })!.status,
    ).toBe("undefined");
    expect(
      calc("lager", "durchschnitt", {
        we: "0",
        bestand: "20000",
        basis: "360",
      })!.status,
    ).toBe("undefined");
  });
});
