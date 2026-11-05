import { loadWorkspace, type SavedCalc } from "../lib/workspace";
import { compareScenarios } from "../calc/scenario";
import { loadCalc } from "../calc/load";
import { FLOW_ID, evaluate, fromRaw, outText, periodLabel } from "../calc/workflow";
import { formatValue } from "../lib/number";
import type { RawInputs, VariantDef } from "../calc/types";
import { esc, readJson, toast } from "./ui";
import { previewFor } from "./preview";

type Meta = Record<string, { title: string; url: string; schema: number; variants: Record<string, string>; assumptions: string[]; misconceptions: string[] }>;
const meta = readJson<Meta>("kr-calcs") ?? {};
const rootEl = document.querySelector<HTMLElement>("[data-sum-root]")!;
let plain = "";

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("de-DE");

function inputsList(v: VariantDef, raw: RawInputs): [string, string][] {
  const rows: [string, string][] = [];
  for (const f of v.fields) {
    const val = raw[f.key];
    if (typeof val !== "string" || !val.trim()) continue;
    rows.push([f.label, f.type === "select" ? (f.options?.find((o) => o.value === val)?.label ?? val) : `${val}${f.unit ? ` ${f.unit}` : ""}`]);
  }
  if (v.rows && Array.isArray(raw[v.rows.key])) {
    (raw[v.rows.key] as string[][]).forEach((r, i) => {
      if (r.some((c) => c.trim())) rows.push([`${v.rows!.label}, Zeile ${i + 1}`, r.join(" · ")]);
    });
  }
  return rows;
}

async function build() {
  const hash = decodeURIComponent(location.hash.slice(1));
  const ws = loadWorkspace();
  let title = "Alle Berechnungen";
  let projectNote = "";
  let items: SavedCalc[] = ws.items;
  if (hash.startsWith("projekt=")) {
    const p = ws.projects.find((x) => x.id === hash.slice("projekt=".length));
    if (!p) {
      rootEl.innerHTML = '<p class="notice notice-warn">Dieses Vorhaben wurde in diesem Browser nicht gefunden. <a href="/gespeichert/">Zu Meine Berechnungen</a></p>';
      return;
    }
    title = p.name;
    projectNote = p.note ?? "";
    items = ws.items.filter((i) => i.projectId === p.id);
  }
  if (!items.length) {
    rootEl.innerHTML = '<p class="notice notice-info">In diesem Vorhaben ist noch keine Berechnung gespeichert. <a href="/gespeichert/">Zu Meine Berechnungen</a></p>';
    return;
  }
  let html = `<header><p class="eyebrow">Zusammenfassung · Stand ${esc(new Date().toLocaleDateString("de-DE"))}</p><h2>${esc(title)}</h2></header>`;
  html += `<section><h3>Fragestellung</h3><p>Berechnungen zum Vorhaben „${esc(title)}“ (${items.length}): ${items.map((i) => esc(i.name)).join("; ")}.</p>${projectNote ? `<p><strong>Gemeinsame Annahmen / Notiz:</strong> ${esc(projectNote)}</p>` : ""}</section>`;
  const txt: string[] = [`Zusammenfassung: ${title}`, ""];
  const assumptions = new Set<string>();
  const notes: string[] = [];
  const uncertain: string[] = [];
  const groups = new Map<string, SavedCalc[]>();
  for (const it of items) {
    const k = `${it.calcId}|${it.variantId}`;
    groups.set(k, [...(groups.get(k) ?? []), it]);
  }
  html += "<section><h3>Berechnungen im Überblick</h3>";
  for (const it of items) {
    const m = meta[it.calcId];
    const pr = await previewFor(it, m?.schema ?? it.schema);
    (m?.assumptions ?? []).forEach((a) => assumptions.add(a));
    if (it.note) notes.push(`${it.name}: ${it.note}`);
    if (pr.warning) uncertain.push(`${it.name}: ${pr.warning}`);
    let inputs: [string, string][] = [];
    let problems = "";
    if (it.calcId === FLOW_ID) {
      const f = fromRaw(it.inputs);
      const s = evaluate(f);
      inputs = [["Zeitraum", periodLabel(f.zeitraum)], ["Einheit", f.unit], ["Verkaufspreis", f.p], ["Variable Kosten je Einheit", f.v], ["Fixkosten im Zeitraum", f.F], ["Geplante Menge", f.q]].filter(([, v]) => v) as [string, string][];
      s.uncertain.forEach((u) => uncertain.push(`${it.name}: ${u.text}`));
      s.missing.forEach((x) => uncertain.push(`${it.name}: ${x.label} fehlt noch.`));
      if (s.scenarios.length) problems = `<p class="small">Enthaltene Varianten: ${s.scenarios.map((c) => `${esc(c.name)} (Mindestabsatz ${esc(outText(c.qMin))}, Ergebnis ${esc(outText(c.profit?.main))})`).join("; ")}.</p>`;
    } else {
      try {
        const def = await loadCalc(it.calcId);
        const v = def.variants.find((x) => x.id === it.variantId);
        if (v) inputs = inputsList(v, it.inputs);
      } catch {
        /* Rechner nicht mehr vorhanden */
      }
    }
    const outsHtml = pr.outs?.filter((o) => !o.detail).slice(0, 5).map((o) => `<li>${esc(o.label)}: <strong>${esc(formatValue(o.value, o.format, o.unit, o.signed))}</strong></li>`).join("") ?? "";
    html += `<div class="sum-item"><h4>${esc(it.name)}</h4><p class="small muted">${esc(m?.title ?? it.calcId)}${m && Object.keys(m.variants).length > 1 ? ` · ${esc(m.variants[it.variantId] ?? it.variantId)}` : ""} · gespeichert ${esc(fmtDate(it.savedAt))}${it.updatedAt !== it.savedAt ? `, geändert ${esc(fmtDate(it.updatedAt))}` : ""}</p>
      <p><strong>${esc(pr.label || "Ergebnis")}:</strong> ${esc(pr.value)} <span class="muted">${esc(pr.context)}</span></p>
      ${outsHtml ? `<ul class="bullets small">${outsHtml}</ul>` : ""}
      ${inputs.length ? `<details open class="sum-inputs"><summary>Eingaben</summary><dl class="vars">${inputs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></details>` : ""}${problems}
      ${it.note ? `<p class="small"><strong>Notiz:</strong> ${esc(it.note)}</p>` : ""}</div>`;
    txt.push(`• ${it.name} (${m?.title ?? it.calcId}): ${pr.label ? pr.label + " " : ""}${pr.value} ${pr.context}`.trim());
  }
  html += "</section>";

  // Variantenvergleich: gleiche Rechner/Modi nebeneinander, mit Zeitraumprüfung
  let compare = "";
  for (const [key, list] of groups) {
    if (list.length < 2 || list[0].calcId === FLOW_ID) continue;
    try {
      const def = await loadCalc(list[0].calcId);
      const v = def.variants.find((x) => x.id === list[0].variantId);
      if (!v) continue;
      const base = list[0];
      for (const other of list.slice(1)) {
        const c = compareScenarios(v, base.inputs as RawInputs, other.inputs as RawInputs);
        if (c.state === "empty") continue;
        compare += `<div class="table-scroll" tabindex="0" role="region" aria-label="Vergleich ${esc(base.name)} und ${esc(other.name)}"><table class="compare-table"><caption>${esc(meta[base.calcId]?.title ?? key)}: ${esc(base.name)} ↔ ${esc(other.name)}</caption><thead><tr><th scope="col">Kennzahl</th><th scope="col">${esc(base.name)}</th><th scope="col">${esc(other.name)}</th><th scope="col">Differenz</th></tr></thead><tbody>${c.rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.a ?? "")}</td><td>${esc(r.b ?? "")}</td><td>${esc(r.diff ?? r.diffNote ?? "–")}</td></tr>`).join("")}</tbody></table></div>${c.warnings.map((w) => `<p class="notice notice-warn">${esc(w)}</p>`).join("")}<p class="small">Abweichende Eingaben: ${c.differingLabels.length ? c.differingLabels.map(esc).join(", ") : "keine"}.</p>`;
      }
    } catch {
      /* ignorieren */
    }
  }
  html += `<section><h3>Variantenvergleich</h3>${compare || '<p class="small muted">Für einen Vergleich werden mindestens zwei Berechnungen desselben Rechners und Modus im Vorhaben gebraucht.</p>'}</section>`;
  html += `<section><h3>Offene Annahmen und Notizen</h3>${notes.length || uncertain.length ? `<ul class="bullets small">${[...notes, ...uncertain].map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : '<p class="small muted">Keine Notizen und keine als offen markierten Annahmen gespeichert.</p>'}</section>`;
  html += `<section><h3>Modellgrenzen</h3><ul class="bullets small">${[...assumptions].map((a) => `<li>${esc(a)}</li>`).join("")}<li>Die Rechner nutzen bewusst vereinfachte Modelle und ersetzen keine Steuer-, Rechts- oder Finanzberatung.</li></ul></section>`;
  html += `<p class="small muted">Erstellt mit KPILot (${esc(location.origin)}). Die Daten stammen aus diesem Browser; es gibt keinen Freigabelink.</p>`;
  rootEl.innerHTML = html;
  txt.push("", "Offene Annahmen und Notizen:", ...(notes.length || uncertain.length ? [...notes, ...uncertain].map((n) => `- ${n}`) : ["- keine"]), "", "Modellgrenzen: " + [...assumptions].join(" · "), "", `Erstellt mit KPILot (${location.origin})`);
  plain = txt.join("\n");
}

document.querySelector("[data-sum-copy]")!.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(plain);
    toast("Zusammenfassung in die Zwischenablage kopiert.");
  } catch {
    toast("Kopieren wurde vom Browser blockiert.");
  }
});
document.querySelector("[data-sum-print]")!.addEventListener("click", () => window.print());
window.addEventListener("hashchange", () => void build());
void build();
