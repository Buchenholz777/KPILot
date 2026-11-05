import type { Builder } from "./kit";
import { niceMax, bars, meter, none, num, outOf, pct, plain, val } from "./kit";
import { D } from "../../lib/decimal";
import { formatDecimal, formatValue } from "../../lib/number";

const sollIst: Builder = (i, r) => {
  const soll = val(i, "soll")!,
    ist = val(i, "ist")!;
  const abs = outOf(r, "Abweichung absolut")?.value ?? ist.sub(soll);
  const rel = outOf(r, "Abweichung relativ");
  const dir = i.choices.richtung === "niedriger" ? "Niedriger ist besser" : "Höher ist besser";
  return {
    charts: [
      bars({
        title: "Soll, Ist und Abweichung",
        panels: [{ title: "Werte (gleiche Einheit)", bars: [{ label: "Soll", value: num(soll), text: plain(soll, true) }, { label: "Ist", value: num(ist), text: plain(ist, true), emphasis: true }, { label: "Abweichung absolut", value: num(abs), text: plain(abs, true) }] }],
        caption: `Ist ${plain(ist, true)} gegenüber Soll ${plain(soll, true)}: ${plain(abs, true)} absolut${rel ? `, ${pct(rel.value, true)} relativ` : "; relative Abweichung bei Soll 0 nicht definiert"}. Gewählte Bewertungsrichtung: ${dir} – ob ein positives Vorzeichen gut ist, hängt von der Kennzahl ab.`,
      }),
    ],
  };
};

const auslastung: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne verfügbare Kapazität > 0 ist keine Auslastung definiert – es gibt keine Grafik.");
  const used = val(i, "genutzt")!,
    avail = val(i, "verfuegbar")!;
  const v = num(r.main.value);
  return {
    charts: [
      meter({
        title: "Genutzte im Verhältnis zur verfügbaren Kapazität",
        rows: [{ label: `Auslastung (${plain(used)} von ${plain(avail)})`, value: v, text: pct(r.main.value), ref: { value: 100, label: "100 % = verfügbare Kapazität" } }],
        max: niceMax(Math.max(100, v) * 1.1),
        axisFormat: (x) => `${formatDecimal(D(x), { max: 0 })} %`,
        caption: v > 100 ? `Genutzt werden ${plain(used)} bei ${plain(avail)} verfügbar: ${pct(r.main.value)} – die Überlastung über 100 % bleibt sichtbar.` : `Genutzt werden ${plain(used)} von ${plain(avail)} verfügbaren Einheiten: ${pct(r.main.value)} Auslastung, ${plain(avail.sub(used))} frei.`,
        notice: v > 100 ? "Überlastung: Die Nutzung übersteigt die verfügbare Kapazität." : undefined,
      }),
    ],
  };
};

const lager: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne Bestand > 0 sind Umschlag und Lagerdauer nicht definiert – es gibt keine Grafik.");
  const dur = outOf(r, "Rechnerische Lagerdauer")!;
  const basis = i.choices.basis ?? "360";
  return {
    charts: [
      bars({
        title: "Lagerumschlag und rechnerische Lagerdauer",
        panels: [
          { title: "Umschläge je Jahr", bars: [{ label: "Lagerumschlag", value: num(r.main.value), text: formatValue(r.main.value, "number") }] },
          { title: "Tage", bars: [{ label: "Lagerdauer", value: num(dur.value), text: `${formatValue(dur.value, "number")} Tage`, emphasis: true }] },
        ],
        caption: `Die Ware wird rechnerisch ${formatValue(r.main.value, "number")}-mal umgeschlagen; bei einer Jahresbasis von ${basis} Tagen entspricht das ${formatValue(dur.value, "number")} Tagen Lagerdauer. Das ist eine Kennzahl, kein tatsächlicher Bestandsverlauf.`,
      }),
    ],
  };
};

export const controllingCharts: Record<string, Builder> = { "soll-ist": sollIst, auslastung, lager };
