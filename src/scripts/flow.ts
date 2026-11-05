import {
  FLOW_ID,
  FLOW_SCHEMA,
  emptyFlow,
  evaluate,
  exampleFlow,
  fromRaw,
  outText,
  periodLabel,
  priceForQuote,
  toRaw,
  type CaseResult,
  type FlowState,
  type FlowSummary,
} from "../calc/workflow";
import { formatValue, parseNumber } from "../lib/number";
import { FLOW_KEY, setTransfer, sessionStore, readJson, writeJson } from "../lib/storage";
import { addProject, addSaved, getProjects, getSavedItem, updateSaved } from "../lib/workspace";
import { track } from "../lib/analytics";
import { esc, toast } from "./ui";

import type { Decimal } from "../lib/decimal";
const numOf = (s: string): Decimal | undefined => {
  const p = parseNumber(s);
  return p.kind === "ok" ? p.value : undefined;
};
const root = document.querySelector<HTMLElement>("[data-flow]");
if (root) init(root);

function init(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>("[data-flow-form]")!;
  const sections = [...form.querySelectorAll<HTMLElement>("[data-step]")];
  const stepBtns = [...root.querySelectorAll<HTMLButtonElement>("[data-goto]")];
  const side = root.querySelector<HTMLElement>("[data-side]")!;
  const notice = root.querySelector<HTMLElement>("[data-flow-notice]")!;
  const exFlag = root.querySelector<HTMLElement>("[data-flow-example-flag]")!;
  const saveStatus = root.querySelector<HTMLElement>("[data-flow-save-status]")!;
  const live = (k: string) => form.querySelector<HTMLElement>(`[data-live="${k}"]`);
  const el = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  const stepTitles = (JSON.parse(document.getElementById("flow-meta")!.textContent!) as { steps: string[] }).steps;

  let state: FlowState = emptyFlow();
  let step = 1;
  let isExample = false;
  let opened: { id: string; name: string; raw: string } | null = null;

  /* ---------- Zustand ↔ Formular ---------- */
  const textKeys = ["title", "zeitraum", "unit", "costType", "v", "F", "p", "q", "z", "cap", "priceDelta", "costDelta", "note"] as const;
  function readForm(): FlowState {
    const s: FlowState = { ...state, origin: {}, scenarios: state.scenarios };
    for (const k of textKeys) (s as unknown as Record<string, string>)[k] = el(k).value;
    for (const k of ["p", "v", "F", "q"] as const) {
      const o = el(`origin-${k}`).value;
      if (o === "beobachtet" || o === "geschaetzt") s.origin[k] = o;
    }
    return s;
  }
  function writeForm(s: FlowState) {
    for (const k of textKeys) el(k).value = (s as unknown as Record<string, string>)[k] ?? "";
    for (const k of ["p", "v", "F", "q"] as const) el(`origin-${k}`).value = s.origin[k] ?? "";
    renderScenarios();
  }

  /* ---------- Schritte ---------- */
  function showStep(n: number, focus = true) {
    step = Math.min(Math.max(n, 1), sections.length);
    sections.forEach((s, i) => (s.hidden = i + 1 !== step));
    stepBtns.forEach((b) => b.toggleAttribute("aria-current", Number(b.dataset.goto) === step));
    stepBtns.forEach((b) => {
      if (Number(b.dataset.goto) === step) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    form.querySelector<HTMLButtonElement>("[data-prev]")!.disabled = step === 1;
    const next = form.querySelector<HTMLButtonElement>("[data-next]")!;
    next.disabled = step === sections.length;
    next.textContent = step === sections.length - 1 ? "Zur Übersicht →" : "Weiter →";
    if (focus) sections[step - 1].querySelector<HTMLElement>("h2")?.setAttribute("tabindex", "-1"), sections[step - 1].querySelector<HTMLElement>("h2")?.focus();
    render();
  }
  stepBtns.forEach((b) => b.addEventListener("click", () => showStep(Number(b.dataset.goto))));
  form.querySelector("[data-prev]")!.addEventListener("click", () => showStep(step - 1));
  form.querySelector("[data-next]")!.addEventListener("click", () => showStep(step + 1));

  /* ---------- Darstellung ---------- */
  const row = (label: string, value: string, strong = false) =>
    `<div><dt>${esc(label)}</dt><dd${strong ? ' class="strong"' : ""}>${esc(value)}</dd></div>`;
  const dl = (rows: string) => `<dl class="result-extra">${rows}</dl>`;
  const u = (s: FlowSummary) => s.unit;

  function caseRows(c: CaseResult, s: FlowSummary): string {
    let r = "";
    if (c.dbUnit) r += row("Deckungsbeitrag je Einheit", outText(c.dbUnit), true);
    if (c.dbQuote) r += row("Deckungsbeitragsquote", outText(c.dbQuote));
    if (c.qMin) r += row(`Mindestabsatz zur Kostendeckung (${s.period})`, outText(c.qMin), true);
    if (c.profitFrom) r += row("Positiver Gewinn ab", outText(c.profitFrom));
    if (c.profit) r += row(c.profit.main.label + ` (${s.period})`, outText(c.profit.main), true);
    return r;
  }

  function problems(c: CaseResult): string {
    return c.breakEvenProblem ? `<p class="notice notice-warn" role="note">${esc(c.breakEvenProblem)}</p>` : "";
  }

  function missingHtml(s: FlowSummary, withLinks = true): string {
    if (!s.missing.length) return '<p class="small muted">✓ Alle für die Auswertung nötigen Angaben sind vorhanden.</p>';
    const stepOf = { v: 1, F: 1, p: 2, q: 3 } as const;
    return `<p class="small"><strong>Noch offen:</strong></p><ul class="bullets small">${s.missing
      .map((m) => `<li>${esc(m.label)} – gebraucht für ${esc(m.neededFor)}${withLinks ? ` · <button type="button" class="link-btn" data-goto-link="${stepOf[m.key]}">zu Schritt ${stepOf[m.key]}</button>` : ""}</li>`)
      .join("")}</ul>`;
  }

  function render() {
    const s = evaluate(state);
    form.querySelector<HTMLElement>("[data-voll]")!.hidden = state.costType !== "voll";
    exFlag.hidden = !isExample;

    // Zwischenstand
    side.innerHTML = s.blocked
      ? `<p class="notice notice-warn">${esc(s.blocked)}</p>`
      : `${dl(caseRows(s.base, s) || row("Ergebnis", "noch nicht berechenbar"))}${problems(s.base)}${missingHtml(s)}<p class="small muted">Zeitraum: ${esc(s.period)} · Einheit: ${esc(u(s))}</p>`;

    // Schritt 2: Quotenhilfe + Beitrag
    const l2 = live("2");
    if (l2) l2.innerHTML = s.blocked ? "" : s.base.dbUnit ? dl(caseRows({ ...s.base, qMin: undefined, profit: undefined, profitFrom: undefined }, s)) : '<p class="small muted">Trage Preis und variable Kosten ein, um den Deckungsbeitrag zu sehen.</p>';
    const q = readQuote();
    const qr = form.querySelector<HTMLElement>("[data-quote-result]")!;
    const take = form.querySelector<HTMLButtonElement>("[data-take-price]")!;
    take.hidden = !q.price;
    qr.textContent = q.price ? `Mindestpreis für diese Quote: ${outText(q.price)} (netto). Prüfe, ob er am Markt tragfähig ist.` : form.querySelector<HTMLInputElement>("#flow-quote")!.value ? (q.message ?? "") : "";
    take.dataset.price = q.price ? String(q.price.value.toDecimalPlaces(2).toFixed()).replace(".", ",") : "";

    // Schritt 3
    const l3 = live("3");
    if (l3) {
      let h = "";
      if (!s.blocked) {
        h += s.base.qMin ? dl(row(`Mindestabsatz zur Kostendeckung (${s.period})`, outText(s.base.qMin), true) + (s.base.profitFrom ? row("Positiver Gewinn ab", outText(s.base.profitFrom)) : "")) : problems(s.base) || '<p class="small muted">Für den Mindestabsatz fehlen noch Angaben (siehe Zwischenstand).</p>';
        if (s.targetQty) h += dl(row(`Menge für ${(numOf(state.z) ? formatValue(numOf(state.z)!, "money") : "gewünschten")} Zielgewinn`, outText(s.targetQty.main), true));
        if (s.capacity)
          h += `<p class="capacity-result" data-tone="${s.capacity.enough ? "positive" : "negative"}" role="status">${s.capacity.enough ? `✓ Die Kapazität reicht: ${formatValue(s.capacity.available, "integer", u(s))} verfügbar, ${formatValue(s.capacity.required, "integer", u(s))} erforderlich (Reserve ${formatValue(s.capacity.reserve, "integer", u(s))}, jeweils ${esc(s.period)}).` : `✗ Die Kapazität reicht nicht: Es fehlen ${formatValue(s.capacity.gap, "integer", u(s))} (${esc(s.period)}).`}</p>`;
      }
      l3.innerHTML = h;
    }

    // Schritt 4
    const l4 = live("4");
    if (l4) {
      l4.innerHTML = s.blocked ? "" : s.base.profit ? `<p class="result-main-label">${esc(s.base.profit.main.label)} bei ${esc(numOf(state.q) ? formatValue(numOf(state.q)!, "integer", u(s)) : "")} ${esc(s.period === "Monat" ? "im Monat" : "pro " + s.period)}</p><p class="result-main" data-tone="${s.base.profit.tone ?? ""}">${esc(outText(s.base.profit.main))}</p><p class="result-meaning">${esc(s.base.profit.meaning)}</p>${dl(caseRows({ ...s.base, profit: undefined }, s))}` : `${problems(s.base)}<p class="notice notice-info" role="note">${s.missing.some((m) => m.key === "q") ? "Für den Gewinn fehlt die geplante Absatzmenge (Schritt 3). Sie wird nicht als 0 angenommen." : "Für den Gewinn fehlen noch Angaben (siehe Zwischenstand)."}</p>`;
    }
    const l4b = live("4b");
    if (l4b) {
      const eff = (label: string, e: typeof s.priceEffect, unit: string) =>
        e && !s.blocked
          ? `<div class="effect"><h4>${esc(label)} um ${esc(formatValue(e.delta, "money", unit, true))}</h4>${dl((e.after.qMin ? row("Mindestabsatz", `${outText(e.after.qMin)} (vorher ${outText(s.base.qMin)})`) : "") + (e.after.profit ? row("Ergebnis bei geplanter Menge", `${outText(e.after.profit.main)} (vorher ${outText(s.base.profit?.main)})`) : ""))}${problems(e.after)}</div>`
          : "";
      l4b.innerHTML = eff("Wenn sich der Preis ändert", s.priceEffect, "je Einheit") + eff("Wenn sich die variablen Kosten ändern", s.costEffect, "je Einheit");
    }

    // Schritt 5: Tabelle
    const l5 = live("5");
    if (l5) l5.innerHTML = s.blocked ? "" : compareTable(s);

    // Schritt 6: Übersicht
    const l6 = live("6");
    if (l6) l6.innerHTML = summaryHtml(s);
    updateSaveStatus();
    persistDraft();
  }

  function readQuote() {
    return priceForQuote(el("v").value, (form.querySelector<HTMLInputElement>("#flow-quote")!).value);
  }

  function compareTable(s: FlowSummary): string {
    if (!s.scenarios.length) return '<p class="small muted">Noch keine Variante angelegt. Lege oben eine vorsichtige, realistische oder optimistische Variante an.</p>';
    const cases = [s.base, ...s.scenarios];
    const inp = (c: CaseResult, k: "p" | "v" | "F" | "q") => {
      const raw = c.inputs[k] ?? "";
      const n = parseNumber(raw);
      return n.kind === "ok" ? formatValue(n.value, k === "q" ? "integer" : "money") : "–";
    };
    const differs = (c: CaseResult, k: "p" | "v" | "F" | "q") => c !== s.base && (s.differing[c.name] ?? []).includes(k);
    const labels = { p: "Verkaufspreis", v: "Variable Kosten je Einheit", F: "Fixkosten im Zeitraum", q: "Absatzmenge" } as const;
    const inputRows = (["p", "v", "F", "q"] as const)
      .map((k) => `<tr><th scope="row">${labels[k]}</th>${cases.map((c) => `<td${differs(c, k) ? ' class="differs"' : ""}>${esc(inp(c, k))}${differs(c, k) ? ' <span class="differs-flag">weicht ab</span>' : ""}</td>`).join("")}</tr>`)
      .join("");
    const out = (label: string, f: (c: CaseResult) => string) => `<tr><th scope="row">${label}</th>${cases.map((c) => `<td>${esc(f(c))}</td>`).join("")}</tr>`;
    return `<div class="table-scroll" tabindex="0" role="region" aria-label="Variantenvergleich – bei Bedarf horizontal scrollbar"><table class="compare-table"><caption>Varianten im Vergleich – alle für den Zeitraum „${esc(s.period)}“</caption><thead><tr><th scope="col">Größe</th>${cases.map((c) => `<th scope="col">${esc(c.name)}</th>`).join("")}</tr></thead><tbody>
      <tr class="group"><th scope="rowgroup" colspan="${cases.length + 1}">Eingaben</th></tr>${inputRows}
      <tr class="group"><th scope="rowgroup" colspan="${cases.length + 1}">Ergebnisse</th></tr>
      ${out("Deckungsbeitrag je Einheit", (c) => outText(c.dbUnit))}
      ${out("Mindestabsatz zur Kostendeckung", (c) => (c.qMin ? outText(c.qMin) : c.breakEvenProblem ? "nicht erreichbar" : "–"))}
      ${out("Ergebnis bei geplanter Menge", (c) => (c.profit ? outText(c.profit.main) : "–"))}
    </tbody></table></div>`;
  }

  function summaryHtml(s: FlowSummary): string {
    if (s.blocked) return `<p class="notice notice-warn">${esc(s.blocked)}</p>`;
    const title = state.title.trim() || "Ohne Titel";
    const b = s.base;
    const steps = [...(b.breakEven?.steps ?? []), ...(b.profit?.steps ?? [])];
    let h = `<div class="summary"><h3>${esc(title)}</h3><p class="small muted">Zeitraum: ${esc(s.period)} · Einheit: ${esc(u(s))} · alle Beträge netto</p>`;
    h += dl(
      row("Verkaufspreis", numOf(state.p) ? formatValue(numOf(state.p)!, "money", "je Einheit") : "noch offen") +
        row("Deckungsbeitrag je Einheit", outText(b.dbUnit), true) +
        row("Mindestabsatz zur Kostendeckung", outText(b.qMin), true) +
        row("Ergebnis bei geplanter Menge", b.profit ? outText(b.profit.main) : "noch offen (Menge fehlt)", true),
    );
    if (b.breakEvenProblem) h += problems(b);
    if (s.priceEffect || s.costEffect) {
      h += "<h4>Ausgewählte Änderungen</h4>";
      for (const [label, e] of [["Preis", s.priceEffect], ["Variable Kosten", s.costEffect]] as const)
        if (e) h += `<p class="small">${label} ${esc(formatValue(e.delta, "money", "je Einheit", true))}: Mindestabsatz ${esc(outText(e.after.qMin))}, Ergebnis ${esc(outText(e.after.profit?.main))}.</p>`;
    }
    if (s.scenarios.length) h += `<h4>Varianten</h4>${compareTable(s)}`;
    h += "<h4>Offene und unsichere Annahmen</h4>";
    h += missingHtml(s, false);
    if (s.uncertain.length) h += `<ul class="bullets small">${s.uncertain.map((x) => `<li>${esc(x.text)}</li>`).join("")}</ul>`;
    if (state.note.trim()) h += `<p class="small"><strong>Notiz:</strong> ${esc(state.note.trim())}</p>`;
    h += `<details class="result-details"><summary>Rechenwege</summary><ol class="steps">${steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></details>`;
    h += `<details class="result-details"><summary>Modellgrenzen</summary><ul class="bullets small"><li>Preise, variable Kosten und Fixkosten bleiben im Zeitraum konstant; eine gleichartige Leistung.</li><li>Nettobeträge ohne Umsatzsteuer, ganze Einheiten.</li><li>Ein Ergebnis über null bedeutet Gewinn nur in diesem Modell – es ersetzt keinen Jahresabschluss und keine Steuer- oder Finanzberatung.</li><li>Ob die geplante Menge am Markt erreichbar ist, prüft der Ablauf nicht.</li></ul></details></div>`;
    return h;
  }

  /* ---------- Varianten bearbeiten ---------- */
  const cards = form.querySelector<HTMLElement>("[data-scn-cards]")!;
  function renderScenarios() {
    cards.replaceChildren();
    state.scenarios.forEach((sc, i) => {
      const d = document.createElement("div");
      d.className = "scn-card";
      d.innerHTML = `<h3>Variante ${i + 1}</h3>
        <div class="fields">
          <div class="field"><label for="sc${i}-name">Name</label><div class="input-wrap"><input id="sc${i}-name" data-sc="${i}" data-k="name" value="${esc(sc.name)}" maxlength="30" autocomplete="off" list="sc-names" /></div></div>
          ${(["p", "v", "F", "q"] as const).map((k) => `<div class="field"><label for="sc${i}-${k}">${{ p: "Verkaufspreis netto", v: "Variable Kosten je Einheit", F: "Fixkosten im Zeitraum", q: "Absatzmenge" }[k]} <span class="muted">(leer = wie Basis)</span></label><div class="input-wrap"><input id="sc${i}-${k}" data-sc="${i}" data-k="${k}" value="${esc(sc[k])}" inputmode="decimal" maxlength="24" autocomplete="off" /></div></div>`).join("")}
        </div>
        <button type="button" class="btn btn-ghost" data-rm-scn="${i}">Variante entfernen</button>`;
      cards.append(d);
    });
    if (!document.getElementById("sc-names")) {
      const dlst = document.createElement("datalist");
      dlst.id = "sc-names";
      for (const n of ["Vorsichtig", "Realistisch", "Optimistisch"]) dlst.append(new Option(n));
      cards.after(dlst);
    }
  }
  form.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const add = t.closest<HTMLElement>("[data-add-scn]");
    const rm = t.closest<HTMLElement>("[data-rm-scn]");
    const go = t.closest<HTMLElement>("[data-goto-link]");
    if (add) {
      if (state.scenarios.length >= 3) return toast("Es sind höchstens drei Varianten möglich.");
      state.scenarios.push({ name: add.dataset.addScn ?? "", p: "", v: "", F: "", q: "" });
      renderScenarios();
      cards.querySelector<HTMLInputElement>(`#sc${state.scenarios.length - 1}-p`)?.focus();
      render();
    } else if (rm) {
      state.scenarios.splice(Number(rm.dataset.rmScn), 1);
      renderScenarios();
      render();
    } else if (go) showStep(Number(go.dataset.gotoLink));
  });
  side.addEventListener("click", (e) => {
    const go = (e.target as HTMLElement).closest<HTMLElement>("[data-goto-link]");
    if (go) showStep(Number(go.dataset.gotoLink));
  });
  root.addEventListener("click", (e) => {
    const go = (e.target as HTMLElement).closest<HTMLElement>("[data-goto-link]");
    if (go && !form.contains(go) && !side.contains(go)) showStep(Number(go.dataset.gotoLink));
  });

  /* ---------- Ereignisse ---------- */
  let timer: number | undefined;
  let started = false;
  form.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.sc !== undefined) {
      const sc = state.scenarios[Number(t.dataset.sc)];
      (sc as unknown as Record<string, string>)[t.dataset.k!] = t.value;
    }
    state = { ...readForm(), scenarios: state.scenarios };
    isExample = false;
    if (!started && t.value.trim() && t.dataset.k !== "name" && t.name !== "title") {
      started = true;
      track("calc_started", { calc: FLOW_ID });
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      render();
      const s = evaluate(state);
      if (s.base.qMin || s.base.profit) track("calc_result", { calc: FLOW_ID });
      if (s.scenarios.some((c) => c.qMin || c.profit)) track("scenario_used", { calc: FLOW_ID });
    }, 150);
  });
  form.addEventListener("change", () => {
    state = { ...readForm(), scenarios: state.scenarios };
    render();
  });
  form.querySelector("[data-take-price]")!.addEventListener("click", (e) => {
    const price = (e.currentTarget as HTMLElement).dataset.price;
    if (!price) return;
    el("p").value = price;
    state = { ...readForm(), scenarios: state.scenarios };
    render();
    toast(`Preis ${price} € übernommen.`);
  });
  form.querySelector("[data-flow-example]")!.addEventListener("click", () => {
    state = exampleFlow();
    writeForm(state);
    isExample = true;
    started = true;
    track("calc_started", { calc: FLOW_ID });
    opened = null;
    render();
    toast("Beispielwerte eingesetzt. Du kannst sie jetzt durch eigene Zahlen ersetzen.");
  });
  form.querySelector("[data-flow-reset]")!.addEventListener("click", () => {
    state = emptyFlow();
    writeForm(state);
    isExample = false;
    opened = null;
    notice.hidden = true;
    showStep(1);
  });

  /* ---------- Übersicht: kopieren, drucken ---------- */
  function summaryText(): string {
    const s = evaluate(state);
    const b = s.base;
    const lines = [
      `Preis & Wirtschaftlichkeit – ${state.title.trim() || "Ohne Titel"}`,
      `Zeitraum: ${s.period} · Einheit: ${s.unit} · netto`,
      `Verkaufspreis: ${state.p || "offen"}`,
      `Deckungsbeitrag je Einheit: ${outText(b.dbUnit)}`,
      `Mindestabsatz zur Kostendeckung: ${outText(b.qMin)}`,
      `Ergebnis bei geplanter Menge: ${b.profit ? outText(b.profit.main) : "offen (Menge fehlt)"}`,
    ];
    for (const c of s.scenarios) lines.push(`Variante ${c.name}: Mindestabsatz ${outText(c.qMin)}, Ergebnis ${outText(c.profit?.main)}`);
    if (s.missing.length) lines.push(`Noch offen: ${s.missing.map((m) => m.label).join(", ")}`);
    if (isExample) lines.push("(Beispielwerte)");
    lines.push("", `Berechnet mit KPILot (${location.origin}${location.pathname})`);
    return lines.join("\n");
  }
  form.querySelector("[data-flow-copy]")!.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      toast("Übersicht in die Zwischenablage kopiert.");
    } catch {
      toast("Kopieren wurde vom Browser blockiert.");
    }
  });
  form.querySelector("[data-flow-print]")!.addEventListener("click", () => {
    // Druckansicht: alle Schritte außer der Übersicht ausblenden
    document.body.classList.add("print-flow-summary");
    window.print();
    window.setTimeout(() => document.body.classList.remove("print-flow-summary"), 500);
  });

  /* ---------- Weiterverwenden ---------- */
  form.querySelectorAll<HTMLButtonElement>("[data-flow-transfer]").forEach((b) =>
    b.addEventListener("click", () => {
      const t = b.dataset.flowTransfer!;
      const vals: Record<string, string> = {};
      const put = (k: string, v: string) => {
        if (parseNumber(v).kind === "ok") vals[k] = v;
      };
      put("p", state.p);
      put("v", state.v);
      if (t !== "deckungsbeitrag") {
        put("F", state.F);
        vals.zeitraum = state.zeitraum;
      }
      if (t === "gewinn" || t === "deckungsbeitrag") put("q", state.q);
      if (!Object.keys(vals).length) return toast("Es gibt noch keine Werte zum Übernehmen.");
      const ok = setTransfer({ from: FLOW_ID, fromTitle: "Preis & Wirtschaftlichkeit", target: t, values: vals, describe: "Werte aus dem Ablauf" });
      if (!ok) return toast("Die Übernahme braucht den Sitzungsspeicher des Browsers, der hier nicht verfügbar ist.");
      track("values_transferred", { calc: FLOW_ID, variant: t });
      location.href = `/${{ "break-even": "break-even-rechner", gewinn: "gewinnrechner", deckungsbeitrag: "deckungsbeitragsrechner" }[t]}/`;
    }),
  );

  /* ---------- Speichern ---------- */
  const dialog = root.querySelector<HTMLDialogElement>("[data-flow-dialog]")!;
  const dName = dialog.querySelector<HTMLInputElement>('input[name="name"]')!;
  const dProj = dialog.querySelector<HTMLSelectElement>('select[name="project"]')!;
  const dNewWrap = dialog.querySelector<HTMLElement>("[data-fsave-newwrap]")!;
  const dNew = dialog.querySelector<HTMLInputElement>('input[name="newproject"]')!;
  dProj.addEventListener("change", () => {
    dNewWrap.hidden = dProj.value !== "__new";
  });
  form.querySelector("[data-flow-save]")!.addEventListener("click", () => {
    const existing = opened ? getSavedItem(opened.id) : undefined;
    dName.value = existing?.name ?? (state.title.trim() || `Preis & Wirtschaftlichkeit (${new Date().toLocaleDateString("de-DE")})`);
    dProj.replaceChildren(new Option("Ohne Vorhaben", ""), ...getProjects().map((p) => new Option(p.name, p.id)), new Option("Neues Vorhaben anlegen …", "__new"));
    dProj.value = existing?.projectId ?? "";
    dNewWrap.hidden = true;
    dialog.showModal();
    dName.select();
  });
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "save") return;
    let projectId: string | undefined = dProj.value || undefined;
    if (dProj.value === "__new") projectId = addProject(dNew.value)?.id;
    const raw = toRaw(state);
    const payload = { name: dName.value.trim() || "Preis & Wirtschaftlichkeit", projectId, inputs: raw, variantId: "standard", schema: FLOW_SCHEMA, note: state.note };
    const saved = opened && getSavedItem(opened.id) ? updateSaved(opened.id, payload) : addSaved({ ...payload, calcId: FLOW_ID });
    if (saved) {
      opened = { id: saved.id, name: saved.name, raw: JSON.stringify(raw) };
      track("calc_saved", { calc: FLOW_ID });
    }
    toast(saved ? `Gespeichert als „${saved.name}“. Du findest den Ablauf unter „Meine Berechnungen“.` : "Speichern ist fehlgeschlagen: Dein Browser erlaubt hier keine lokale Speicherung, der Speicher ist voll oder es sind schon 100 Berechnungen gespeichert.", 6000);
    updateSaveStatus();
  });
  function updateSaveStatus() {
    if (!opened) return void (saveStatus.hidden = true);
    const same = JSON.stringify(toRaw(state)) === opened.raw;
    saveStatus.hidden = false;
    saveStatus.dataset.state = same ? "saved" : "dirty";
    saveStatus.textContent = same ? `✓ Gespeichert als „${opened.name}“ – keine ungespeicherten Änderungen.` : `● Änderungen gegenüber „${opened.name}“ sind noch nicht gespeichert (Speichern aktualisiert den Eintrag).`;
  }

  /* ---------- Entwurf in der Sitzung ---------- */
  function persistDraft() {
    writeJson(sessionStore(), FLOW_KEY, { v: 1, raw: toRaw(state), example: isExample });
  }

  /* ---------- Start ---------- */
  const hash = decodeURIComponent(location.hash.slice(1));
  const draft = readJson<{ v: number; raw: Parameters<typeof fromRaw>[0]; example?: boolean }>(sessionStore(), FLOW_KEY);
  if (hash.startsWith("gespeichert=")) {
    const item = getSavedItem(hash.slice("gespeichert=".length));
    if (item && item.calcId === FLOW_ID) {
      state = fromRaw(item.inputs);
      opened = { id: item.id, name: item.name, raw: JSON.stringify(toRaw(state)) };
      notice.innerHTML = `<p><strong>Gespeicherter Ablauf „${esc(item.name)}“ geöffnet</strong> (zuletzt geändert am ${new Date(item.updatedAt).toLocaleDateString("de-DE")}).</p>`;
      notice.hidden = false;
      track("saved_reopened", { calc: FLOW_ID });
    } else {
      notice.innerHTML = "<p>Dieser gespeicherte Ablauf wurde in diesem Browser nicht gefunden.</p>";
      notice.hidden = false;
    }
  } else if (hash === "beispiel") {
    state = exampleFlow();
    isExample = true;
  } else if (draft?.v === 1) {
    state = fromRaw(draft.raw);
    isExample = !!draft.example;
  }
  writeForm(state);
  showStep(hash === "beispiel" ? 1 : 1, false);
  void stepTitles;
  void periodLabel;
}
