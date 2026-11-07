import { loadCalc } from "../calc/load";
import { run } from "../calc/engine";
import type {
  CalcDef,
  CalcResult,
  FieldDef,
  FollowUpDef,
  Out,
  RawInputs,
  VariantDef,
} from "../calc/types";
import { compareScenarios, PERIOD_KEY } from "../calc/scenario";
import { formatValue, parseNumber } from "../lib/number";
import { setTransfer, takeTransfer } from "../lib/storage";
import {
  addProject,
  addSaved,
  getProjects,
  getSavedItem,
  touchRecent,
  updateSaved,
} from "../lib/workspace";
import { track } from "../lib/analytics";
import { barsChart, breakEvenChart } from "./charts";
import { esc, toast } from "./ui";

type Ok = Extract<CalcResult, { status: "ok" }>;
const fmt = (o: Out) => formatValue(o.value, o.format, o.unit, o.signed);

const root = document.querySelector<HTMLElement>("[data-calc]");
if (root) void init(root);

async function init(root: HTMLElement) {
  const def: CalcDef = await loadCalc(root.dataset.calc!);
  const title = root.dataset.title!;
  const forms = new Map(
    def.variants.map((v) => [
      v.id,
      root.querySelector<HTMLFormElement>(`[data-form="${v.id}"]`)!,
    ]),
  );
  const resultEl = root.querySelector<HTMLElement>("[data-result]")!;
  const announceEl = root.querySelector<HTMLElement>("[data-announce]")!;
  const toolsEl = root.querySelector<HTMLElement>("[data-tools]")!;
  const transfersEl = root.querySelector<HTMLElement>("[data-transfers]");
  const noticeEl = root.querySelector<HTMLElement>("[data-notice]")!;
  const chartEl = root.querySelector<HTMLElement>("[data-chart]")!;
  // Nur vorhanden, wenn der Rechner Folgeschritte bzw. einen Kapazitätsabgleich anbietet.
  const followEl = root.querySelector<HTMLElement>("[data-followups]");
  const followList = followEl?.querySelector<HTMLElement>("[data-followup-list]");
  const capacityEl = followEl?.querySelector<HTMLElement>("[data-capacity]");
  const saveStatusEl = root.querySelector<HTMLElement>("[data-save-status]")!;
  /** Aktuell geöffnete gespeicherte Berechnung (für „Änderungen speichern“). */
  let opened: { id: string; name: string; inputs: RawInputs; variantId: string } | null = null;
  let exampleActive = false;
  const touched = new Set<string>();
  let variant: VariantDef = def.variants[0];
  let last: {
    raw: RawInputs;
    result: CalcResult | null;
    inputs?: ReturnType<typeof run>["validation"]["inputs"];
  } = { raw: {}, result: null };
  let announceTimer: number | undefined;

  /* ---------- Formularwerte lesen / schreiben ---------- */
  function readRaw(form: HTMLFormElement, v: VariantDef): RawInputs {
    const raw: RawInputs = {};
    for (const f of v.fields) {
      const el = form.elements.namedItem(f.key) as
        HTMLInputElement | HTMLSelectElement | null;
      raw[f.key] = el?.value ?? "";
    }
    if (v.rows) {
      raw[v.rows.key] = [
        ...form.querySelectorAll<HTMLTableRowElement>("[data-rows-body] tr"),
      ].map((tr) =>
        [...tr.querySelectorAll<HTMLInputElement>("input[data-col]")].map(
          (i) => i.value,
        ),
      );
    }
    return raw;
  }

  function writeRaw(form: HTMLFormElement, v: VariantDef, raw: RawInputs) {
    for (const f of v.fields) {
      const el = form.elements.namedItem(f.key) as
        HTMLInputElement | HTMLSelectElement | null;
      if (!el) continue;
      const val = raw[f.key];
      if (f.type === "select")
        el.value =
          typeof val === "string" && f.options?.some((o) => o.value === val)
            ? val
            : (f.defaultValue ?? f.options![0].value);
      else el.value = typeof val === "string" ? val : "";
    }
    if (v.rows) {
      const rows = Array.isArray(raw[v.rows.key])
        ? (raw[v.rows.key] as string[][])
        : [];
      const body = form.querySelector<HTMLElement>("[data-rows-body]")!;
      const n = Math.max(v.rows.minRows, 2, rows.length);
      setRowCount(form, v, n);
      [...body.querySelectorAll("tr")].forEach((tr, ri) =>
        tr
          .querySelectorAll<HTMLInputElement>("input[data-col]")
          .forEach((inp, ci) => (inp.value = rows[ri]?.[ci] ?? "")),
      );
    }
  }

  function setRowCount(form: HTMLFormElement, v: VariantDef, n: number) {
    const body = form.querySelector<HTMLElement>("[data-rows-body]")!;
    const rowsDef = v.rows!;
    const tpl = body.querySelector("tr")!;
    while (body.children.length < n) {
      const tr = tpl.cloneNode(true) as HTMLTableRowElement;
      tr.querySelectorAll("input").forEach((i) => (i.value = ""));
      body.appendChild(tr);
    }
    while (body.children.length > n && body.children.length > 1)
      body.lastElementChild!.remove();
    [...body.children].forEach((tr, ri) => {
      tr.querySelectorAll<HTMLInputElement>("input[data-col]").forEach(
        (inp, ci) =>
          inp.setAttribute(
            "aria-label",
            `${rowsDef.columns[ci].label}, Zeile ${ri + 1}`,
          ),
      );
      tr.querySelector("[data-remove-row]")?.setAttribute(
        "aria-label",
        `Zeile ${ri + 1} entfernen`,
      );
    });
    const add = form.querySelector<HTMLButtonElement>("[data-add-row]");
    if (add) add.disabled = body.children.length >= rowsDef.maxRows;
  }

  /* ---------- Fehleranzeige am Feld ---------- */
  function showFieldErrors(
    form: HTMLFormElement,
    v: VariantDef,
    errors: Record<string, string>,
    showAll: boolean,
  ) {
    for (const f of v.fields) {
      const wrap = form.querySelector<HTMLElement>(`[data-field="${f.key}"]`);
      if (!wrap) continue;
      const msg =
        errors[f.key] && (showAll || touched.has(f.key) || errors[`!${f.key}`])
          ? errors[f.key]
          : "";
      const p = wrap.querySelector<HTMLElement>("[data-error]")!;
      const input = wrap.querySelector("input, select");
      p.hidden = !msg;
      p.innerHTML = msg
        ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10v4.5M12 17.2v.2" stroke="currentColor" stroke-width="2"/></svg><span>${esc(msg)}</span>`
        : "";
      if (msg) {
        wrap.dataset.invalid = "";
        input?.setAttribute("aria-invalid", "true");
      } else {
        delete wrap.dataset.invalid;
        input?.removeAttribute("aria-invalid");
      }
    }
    if (v.rows) {
      form
        .querySelectorAll<HTMLTableRowElement>("[data-rows-body] tr")
        .forEach((tr, ri) =>
          tr.querySelectorAll<HTMLElement>("td").forEach((td, ci) => {
            const p = td.querySelector<HTMLElement>("[data-cell-error]");
            if (!p) return;
            const key = `rows:${v.rows!.key}:${ri}:${ci}`;
            const msg =
              errors[key] && (showAll || touched.has(key)) ? errors[key] : "";
            p.hidden = !msg;
            p.textContent = msg;
            td.querySelector("input")?.toggleAttribute("aria-invalid", !!msg);
          }),
        );
    }
  }

  const fieldLabel = (v: VariantDef, key: string) => {
    if (key.startsWith("rows:"))
      return v.rows ? `mindestens ${v.rows.minRows} vollständige Zeile` : key;
    return v.fields.find((f) => f.key === key)?.label ?? key;
  };

  /* ---------- Berechnen und darstellen ---------- */
  const analyticsId = () => ({ calc: def.id, variant: variant.id });

  function update(opts: { showAll?: boolean; announce?: boolean } = {}) {
    const form = forms.get(variant.id)!;
    const raw = readRaw(form, variant);
    const { validation, result } = run(variant, raw);
    last = { raw, result, inputs: validation.inputs };
    const errors: Record<string, string> = { ...validation.fieldErrors };
    if (result && "fieldErrors" in result && result.fieldErrors) {
      for (const [k, m] of Object.entries(result.fieldErrors)) {
        errors[k] = m;
        errors[`!${k}`] = "1"; // fachliche Fehler immer zeigen
      }
    }
    showFieldErrors(form, variant, errors, !!opts.showAll);
    updateSaveStatus();

    if (!result) {
      const hasErrors = Object.keys(validation.fieldErrors).length > 0;
      // Auswahlfelder haben immer einen Wert und zählen nicht als Eingabe
      const anyInput =
        variant.fields.some(
          (f) =>
            f.type !== "select" &&
            typeof raw[f.key] === "string" &&
            (raw[f.key] as string).trim() !== "",
        ) ||
        (!!variant.rows &&
          (raw[variant.rows.key] as string[][]).some((r) =>
            r.some((c) => c.trim()),
          ));
      if (
        hasErrors &&
        (opts.showAll ||
          Object.keys(validation.fieldErrors).some((k) => touched.has(k)))
      ) {
        setResult(
          "error",
          `<p class="result-tag">Kein Ergebnis</p><p class="result-missing"><strong>Bitte die markierten Eingaben prüfen.</strong> Deine übrigen Angaben bleiben erhalten.</p>`,
        );
      } else if (!anyInput) {
        setResult(
          "empty",
          '<p class="result-missing">Gib deine Werte ein oder setze das Beispiel ein – das Ergebnis erscheint automatisch.</p>',
        );
      } else {
        const missing = [
          ...new Set(validation.missing.concat(validation.incomplete)),
        ].map((k) => fieldLabel(variant, k));
        setResult(
          "empty",
          `<p class="result-missing">${hasErrors ? "Bitte die markierten Eingaben prüfen. " : ""}${missing.length ? `Noch fehlt: <strong>${missing.map(esc).join(", ")}</strong>.` : ""}</p>`,
        );
      }
      toolsEl.hidden = true;
      if (transfersEl) transfersEl.hidden = true;
      if (followEl) followEl.hidden = true;
      chartEl.innerHTML = "";
      if (opts.announce)
        announce(
          "Noch kein Ergebnis – bitte Eingaben vervollständigen oder prüfen.",
        );
      return;
    }
    renderResult(result, raw);
    const ok = result.status === "ok";
    toolsEl.hidden = !ok;
    if (transfersEl) transfersEl.hidden = !ok;
    if (ok) track("calc_result", analyticsId());
    renderChart(result);
    renderFollowUps(result);
    const summary =
      result.status === "ok"
        ? `Ergebnis: ${result.main.label} ${fmt(result.main)}. ${result.meaning}`
        : result.message;
    window.clearTimeout(announceTimer);
    if (opts.announce) announce(summary);
    else announceTimer = window.setTimeout(() => announce(summary), 1400);
  }

  function announce(text: string) {
    announceEl.textContent = "";
    window.setTimeout(() => (announceEl.textContent = text), 60);
  }

  function setResult(state: string, html: string) {
    resultEl.dataset.state = state;
    resultEl.innerHTML = html;
  }

  /** Zeitraum und Einheit des Ergebnisses (Ebene 2: Einordnung). */
  function contextLine(r: Ok, raw: RawInputs): string {
    const parts: string[] = [];
    const pf = variant.fields.find((f) => f.key === PERIOD_KEY);
    if (pf) {
      const v = typeof raw[PERIOD_KEY] === "string" && raw[PERIOD_KEY] ? (raw[PERIOD_KEY] as string) : pf.defaultValue;
      const label = pf.options?.find((o) => o.value === v)?.label;
      if (label) parts.push(`Zeitraum: ${label}`);
    }
    if (r.main.unit) parts.push(`Einheit: ${r.main.unit}`);
    return parts.join(" · ");
  }

  function dl(list: Out[]): string {
    return `<dl class="result-extra">${list.map((o) => `<div><dt>${esc(o.label)}</dt><dd>${esc(fmt(o))}</dd></div>`).join("")}</dl>`;
  }

  function renderResult(r: CalcResult, raw: RawInputs) {
    if (r.status === "ok") {
      const key = (r.extra ?? []).filter((o) => !o.detail);
      const details = (r.extra ?? []).filter((o) => o.detail);
      const ctx = contextLine(r, raw);
      const notes = r.notes?.length
        ? `<ul class="result-notes">${r.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`
        : "";
      const tag = exampleActive ? "Ergebnis mit Beispielwerten" : "Dein Ergebnis";
      setResult(
        "ok",
        `<div class="result-l1">
          <p class="result-tag">${tag}</p>
          <p class="result-main-label">${esc(r.main.label)}</p>
          <p class="result-main"${r.tone ? ` data-tone="${r.tone}"` : ""}>${esc(fmt(r.main))}</p>
          <p class="result-meaning">${esc(r.meaning)}</p>
        </div>
        <div class="result-l2">
          ${key.length ? `<h4 class="result-sub">Einordnung</h4>${dl(key)}` : ""}
          ${ctx ? `<p class="result-context">${esc(ctx)}</p>` : ""}${notes}
        </div>
        <details class="result-details"><summary>Details, Rechenweg und Modellgrenzen</summary>
          ${details.length ? dl(details) : ""}
          <ol class="steps">${r.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          <p class="small muted"><a href="#annahmen">Modellannahmen und Grenzen dieser Berechnung</a></p>
        </details>`,
      );
    } else {
      const head = {
        undefined: "Nicht definiert",
        impossible: "Keine Lösung in diesem Modell",
        ambiguous: "Nicht eindeutig bestimmbar",
        invalid: "Eingabe prüfen",
      }[r.status];
      const partial =
        "partial" in r && r.partial?.length ? dl(r.partial) : "";
      setResult(
        r.status === "invalid" ? "error" : "info",
        `<p class="result-tag">${head}</p><p>${esc(r.message)}</p>${partial}`,
      );
    }
  }

  function renderChart(r: CalcResult) {
    if (r.status !== "ok" || !r.chart) {
      chartEl.innerHTML = "";
      return;
    }
    chartEl.innerHTML =
      r.chart.kind === "break-even"
        ? breakEvenChart(r.chart)
        : barsChart(r.chart);
  }

  /* ---------- Nächste Schritte ---------- */
  function renderFollowUps(r: CalcResult) {
    if (!followEl || !followList) return;
    const list = (def.followUps ?? []).filter(
      (f) => (!f.variantId || f.variantId === variant.id) && f.when(last.inputs, r),
    );
    if (capacityEl) capacityEl.hidden = true;
    followList.replaceChildren(
      ...list.map((f) => {
        const li = document.createElement("li");
        const p = document.createElement("p");
        p.textContent = f.text;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn btn-secondary";
        b.textContent = f.label;
        b.addEventListener("click", () => runFollowUp(f, b));
        li.append(p, b);
        return li;
      }),
    );
    followEl.hidden = list.length === 0;
  }

  function runFollowUp(f: FollowUpDef, btn: HTMLElement) {
    const a = f.action;
    const form = forms.get(variant.id)!;
    if (a.kind === "transfer") {
      root.querySelector<HTMLButtonElement>(`[data-transfer="${a.target}"]`)?.click();
    } else if (a.kind === "focus") {
      const el = a.fields
        .map((k) => form.elements.namedItem(k) as HTMLElement | null)
        .find(Boolean);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    } else if (a.kind === "variant") {
      if (!last.inputs || !last.result) return;
      const values = a.values(last.inputs, last.result);
      track("values_transferred", { calc: def.id, variant: a.variantId });
      switchVariant(a.variantId, true);
      const nf = forms.get(a.variantId)!;
      const nv = def.variants.find((x) => x.id === a.variantId)!;
      writeRaw(nf, nv, values);
      markTransferred(nf, nv, values);
      const missing = nv.fields.filter((x) => !x.optional && x.type !== "select" && !(x.key in values)).map((x) => x.label);
      noticeEl.innerHTML = `<div><p><strong>Übernommen:</strong> ${esc(a.describe)}.</p>${missing.length ? `<p>Noch einzutragen: <strong>${missing.map(esc).join(", ")}</strong> – unbekannte Werte werden nicht als 0 angenommen.</p>` : ""}</div>`;
      noticeEl.hidden = false;
      update({ announce: true });
      const first = nv.fields.find((x) => missing.includes(x.label));
      if (first) (nf.elements.namedItem(first.key) as HTMLElement | null)?.focus();
      root.scrollIntoView({ block: "start" });
    } else if (a.kind === "scenario") {
      const scnEl = root.querySelector<HTMLDetailsElement>("[data-scenario]");
      if (!scnEl) return;
      scnEl.open = true;
      copyToScenarios();
      scnEl.scrollIntoView({ block: "start", behavior: "smooth" });
      const formB = scnEl.querySelector<HTMLFormElement>('[data-scn="B"]')!;
      (a.focus.map((k) => formB.elements.namedItem(k) as HTMLElement | null).find(Boolean))?.focus();
    } else if (a.kind === "capacity") {
      if (!last.inputs || !last.result || !capacityEl) return;
      const qty = a.quantity(last.inputs, last.result);
      if (!qty) return;
      capacityEl.hidden = false;
      const input = capacityEl.querySelector<HTMLInputElement>("[data-capacity-input]")!;
      const resEl = capacityEl.querySelector<HTMLElement>("[data-capacity-result]")!;
      const pf = variant.fields.find((x) => x.key === PERIOD_KEY);
      const pv = (last.raw[PERIOD_KEY] as string) || pf?.defaultValue;
      const period = pf?.options?.find((o) => o.value === pv)?.label;
      capacityEl.querySelector("[data-capacity-label]")!.textContent = `Verfügbare Kapazität${period ? ` (Zeitraum: ${period})` : ""}`;
      capacityEl.querySelector("[data-capacity-unit]")!.textContent = a.unit;
      capacityEl.querySelector("[data-capacity-help]")!.textContent = `Erforderlich sind ${formatValue(qty, "integer", a.unit)}${period ? ` je ${period}` : ""}. Trage die Kapazität in derselben Einheit und für denselben Zeitraum ein.`;
      const check = () => {
        const p = parseNumber(input.value);
        if (p.kind !== "ok" || p.value.isNegative()) {
          resEl.hidden = true;
          return;
        }
        const cap = p.value;
        resEl.hidden = false;
        if (cap.gte(qty)) {
          resEl.textContent = `✓ Die Kapazität reicht: ${formatValue(cap, "integer", a.unit)} verfügbar, ${formatValue(qty, "integer", a.unit)} erforderlich (Reserve ${formatValue(cap.sub(qty), "integer", a.unit)}).`;
          resEl.dataset.tone = "positive";
        } else {
          const gap = qty.sub(cap);
          resEl.textContent = `✗ Die Kapazität reicht nicht: Es fehlen ${formatValue(gap, "integer", a.unit)} (${formatValue(gap.div(qty).mul(100), "percent")} der erforderlichen Menge).`;
          resEl.dataset.tone = "negative";
        }
      };
      input.oninput = check;
      input.focus();
      check();
    }
    void btn;
  }

  function markTransferred(form: HTMLFormElement, v: VariantDef, values: Record<string, string>) {
    for (const k of Object.keys(values)) {
      if (v.fields.some((x) => x.key === k))
        form.querySelector(`[data-field="${k}"]`)?.setAttribute("data-transferred", "");
    }
  }

  /* ---------- Varianten ---------- */
  function switchVariant(id: string, updateHash = true) {
    const v = def.variants.find((x) => x.id === id);
    if (!v) return;
    variant = v;
    for (const [vid, f] of forms) f.hidden = vid !== id;
    root
      .querySelectorAll<HTMLButtonElement>("[data-variant-btn]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.variantBtn === id)),
      );
    root
      .querySelectorAll<HTMLElement>("[data-variant-fav]")
      .forEach((s) => (s.hidden = s.dataset.variantFav !== id));
    touched.clear();
    setExample(false);
    if (updateHash && def.variants.length > 1)
      history.replaceState(null, "", `#${id}`);
    update();
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-variant-btn]")
    .forEach((b) =>
      b.addEventListener("click", () => switchVariant(b.dataset.variantBtn!)),
    );

  function setExample(on: boolean) {
    exampleActive = on;
    for (const form of forms.values())
      form.querySelector<HTMLElement>("[data-example-flag]")!.hidden = !on || form.hidden;
  }

  /* ---------- Formular-Ereignisse ---------- */
  let inputTimer: number | undefined;
  for (const [vid, form] of forms) {
    const v = def.variants.find((x) => x.id === vid)!;
    form.addEventListener("input", (e) => {
      const t = e.target as HTMLInputElement;
      t.closest("[data-field]")?.removeAttribute("data-transferred");
      if (exampleActive) setExample(false);
      if (t.value && t.value.trim()) track("calc_started", analyticsId());
      window.clearTimeout(inputTimer);
      inputTimer = window.setTimeout(() => update(), 160);
    });
    form.addEventListener("change", () => update());
    form.addEventListener("focusout", (e) => {
      const t = e.target as HTMLInputElement;
      const key = t.name || cellKey(v, t);
      if (key && t.value.trim()) touched.add(key);
      update();
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      v.fields.forEach((f) => touched.add(f.key));
      update({ showAll: true, announce: true });
      const firstInvalid = form.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      firstInvalid?.focus();
    });
    form
      .querySelector('[data-action="example"]')!
      .addEventListener("click", () => applyExample(form, v));
    form
      .querySelector('[data-action="reset"]')!
      .addEventListener("click", () => {
        writeRaw(form, v, {});
        touched.clear();
        noticeEl.hidden = true;
        opened = null;
        setExample(false);
        form
          .querySelectorAll("[data-transferred]")
          .forEach((el) => el.removeAttribute("data-transferred"));
        update();
        (form.querySelector("input, select") as HTMLElement | null)?.focus();
      });
    if (v.rows) {
      form.querySelector("[data-add-row]")!.addEventListener("click", () => {
        const body = form.querySelector<HTMLElement>("[data-rows-body]")!;
        setRowCount(form, v, body.children.length + 1);
        (
          body.lastElementChild!.querySelector("input") as HTMLInputElement
        ).focus();
        update();
      });
      form.querySelector("[data-rows-body]")!.addEventListener("click", (e) => {
        const btn = (e.target as HTMLElement).closest("[data-remove-row]");
        if (!btn) return;
        const body = form.querySelector<HTMLElement>("[data-rows-body]")!;
        const tr = btn.closest("tr")!;
        if (body.children.length <= Math.max(v.rows!.minRows, 1)) {
          tr.querySelectorAll("input").forEach((i) => (i.value = ""));
        } else tr.remove();
        setRowCount(form, v, body.children.length);
        (body.querySelector("input") as HTMLInputElement | null)?.focus();
        update();
      });
    }
  }
  function applyExample(form: HTMLFormElement, v: VariantDef) {
    writeRaw(form, v, v.example);
    form
      .querySelectorAll("[data-transferred]")
      .forEach((el) => el.removeAttribute("data-transferred"));
    touched.clear();
    opened = null;
    setExample(true);
    track("calc_started", { calc: def.id, variant: v.id });
    update({ announce: true });
    toast(
      "Beispielwerte eingesetzt. Du kannst sie jetzt durch eigene Zahlen ersetzen.",
    );
  }
  function cellKey(v: VariantDef, input: HTMLInputElement) {
    if (!v.rows || input.dataset.col === undefined) return "";
    const tr = input.closest("tr")!;
    const ri = [...tr.parentElement!.children].indexOf(tr);
    return `rows:${v.rows.key}:${ri}:${input.dataset.col}`;
  }

  /* ---------- Werkzeuge ---------- */
  function resultText(): string {
    const r = last.result;
    if (!r || r.status !== "ok") return "";
    const inputs = variant.fields
      .map((f) => {
        const v = last.raw[f.key];
        if (typeof v !== "string" || !v) return "";
        const shown =
          f.type === "select"
            ? (f.options?.find((o) => o.value === v)?.label ?? v)
            : `${v}${f.unit ? ` ${f.unit}` : ""}`;
        return `- ${f.label}: ${shown}`;
      })
      .filter(Boolean);
    return [
      `${title}${def.variants.length > 1 ? ` – ${variant.label}` : ""}`,
      `${r.main.label}: ${fmt(r.main)}`,
      ...(r.extra ?? []).filter((o) => !o.detail).map((o) => `${o.label}: ${fmt(o)}`),
      r.meaning,
      ...(inputs.length ? ["", "Eingaben:", ...inputs] : []),
      ...(exampleActive ? ["", "(Beispielwerte)"] : []),
      "",
      `Berechnet mit KPILot (${location.origin}${location.pathname})`,
    ].join("\n");
  }

  root
    .querySelector('[data-tool="copy"]')!
    .addEventListener("click", async () => {
      const text = resultText();
      try {
        await navigator.clipboard.writeText(text);
        toast("Ergebnis in die Zwischenablage kopiert.");
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        toast(
          ok
            ? "Ergebnis in die Zwischenablage kopiert."
            : "Kopieren wurde vom Browser blockiert.",
        );
      }
    });
  root
    .querySelector('[data-tool="print"]')!
    .addEventListener("click", () => window.print());
  root.querySelector('[data-tool="compare"]')?.addEventListener("click", () => {
    const scnEl = root.querySelector<HTMLDetailsElement>("[data-scenario]");
    if (!scnEl) return;
    scnEl.open = true;
    copyToScenarios();
    scnEl.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  /* ----- Speichern ----- */
  const dialog = root.querySelector<HTMLDialogElement>("[data-save-dialog]")!;
  const saveForm = dialog.querySelector<HTMLFormElement>("[data-save-form]")!;
  const nameInput = dialog.querySelector<HTMLInputElement>('input[name="name"]')!;
  const noteInput = dialog.querySelector<HTMLTextAreaElement>('textarea[name="note"]')!;
  const projectSel = dialog.querySelector<HTMLSelectElement>("[data-save-project]")!;
  const newProjectWrap = dialog.querySelector<HTMLElement>("[data-save-newproject]")!;
  const newProjectInput = dialog.querySelector<HTMLInputElement>('input[name="newproject"]')!;
  projectSel.addEventListener("change", () => {
    newProjectWrap.hidden = projectSel.value !== "__new";
    if (!newProjectWrap.hidden) newProjectInput.focus();
  });
  function openSaveDialog(asNew: boolean) {
    const existing = !asNew && opened ? getSavedItem(opened.id) : undefined;
    nameInput.value = existing
      ? existing.name
      : `${title}${def.variants.length > 1 ? ` – ${variant.label}` : ""} (${new Date().toLocaleDateString("de-DE")})`;
    noteInput.value = existing?.note ?? "";
    projectSel.replaceChildren(
      new Option("Ohne Vorhaben", ""),
      ...getProjects().map((p) => new Option(p.name, p.id)),
      new Option("Neues Vorhaben anlegen …", "__new"),
    );
    projectSel.value = existing?.projectId ?? "";
    newProjectWrap.hidden = true;
    newProjectInput.value = "";
    saveForm.dataset.mode = existing ? "update" : "new";
    dialog.showModal();
    nameInput.select();
  }
  root.querySelector('[data-tool="save"]')!.addEventListener("click", () => openSaveDialog(false));
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "save") return;
    let projectId: string | undefined = projectSel.value || undefined;
    if (projectSel.value === "__new") {
      const p = addProject(newProjectInput.value);
      projectId = p?.id;
      if (!p) toast("Das Vorhaben konnte nicht angelegt werden – die Berechnung wird ohne Vorhaben gespeichert.", 6000);
    }
    const payload = {
      name: nameInput.value.trim() || title,
      note: noteInput.value,
      projectId,
      inputs: last.raw,
      variantId: variant.id,
      schema: def.schema,
    };
    const updating = saveForm.dataset.mode === "update" && opened;
    const saved = updating
      ? updateSaved(opened!.id, payload)
      : addSaved({ ...payload, calcId: def.id });
    if (saved) {
      opened = { id: saved.id, name: saved.name, inputs: structuredClone(last.raw), variantId: variant.id };
      track("calc_saved", analyticsId());
    }
    toast(
      saved
        ? `Gespeichert als „${saved.name}“. Du findest die Berechnung unter „Meine Berechnungen“.`
        : "Speichern ist fehlgeschlagen: Dein Browser erlaubt hier keine lokale Speicherung, der Speicher ist voll oder es sind schon 100 Berechnungen gespeichert.",
      6000,
    );
    updateSaveStatus();
  });

  /** Zeigt nachvollziehbar, ob Änderungen schon gespeichert sind. */
  function updateSaveStatus() {
    if (!opened) {
      saveStatusEl.hidden = true;
      return;
    }
    const same =
      opened.variantId === variant.id && JSON.stringify(opened.inputs) === JSON.stringify(last.raw);
    saveStatusEl.hidden = false;
    saveStatusEl.dataset.state = same ? "saved" : "dirty";
    saveStatusEl.replaceChildren();
    const t = document.createElement("span");
    t.textContent = same
      ? `✓ Gespeichert als „${opened.name}“ – keine ungespeicherten Änderungen.`
      : `● Änderungen gegenüber „${opened.name}“ sind noch nicht gespeichert.`;
    saveStatusEl.append(t);
    if (!same) {
      const b1 = document.createElement("button");
      b1.type = "button";
      b1.className = "btn btn-ghost";
      b1.textContent = "Änderungen speichern";
      b1.addEventListener("click", () => openSaveDialog(false));
      const b2 = document.createElement("button");
      b2.type = "button";
      b2.className = "btn btn-ghost";
      b2.textContent = "Als neue Berechnung speichern";
      b2.addEventListener("click", () => openSaveDialog(true));
      saveStatusEl.append(" ", b1, b2);
    }
  }

  /* ---------- Werteübernahme zu anderen Rechnern ---------- */
  root.querySelectorAll<HTMLButtonElement>("[data-transfer]").forEach((b) =>
    b.addEventListener("click", () => {
      const t = def.transfers?.find((x) => x.target === b.dataset.transfer);
      const r = last.result;
      if (!t || !r || r.status !== "ok" || !last.inputs) return;
      const ok = setTransfer({
        from: def.id,
        fromTitle: title,
        target: t.target,
        values: t.values(last.inputs, r),
        describe: t.describe,
      });
      if (!ok) {
        toast(
          "Die Übernahme braucht den Sitzungsspeicher des Browsers, der hier nicht verfügbar ist.",
        );
        return;
      }
      track("values_transferred", { calc: def.id, variant: t.target });
      location.href = b.dataset.transferUrl!;
    }),
  );

  function applyIncoming() {
    const tr = takeTransfer(def.id);
    if (!tr) return false;
    const keys = Object.keys(tr.values);
    const v =
      def.variants.find((x) =>
        keys.every((k) => x.fields.some((f) => f.key === k)),
      ) ?? def.variants[0];
    switchVariant(v.id, def.variants.length > 1);
    const form = forms.get(v.id)!;
    writeRaw(form, v, tr.values);
    const labels: string[] = [];
    for (const k of keys) {
      const f = v.fields.find((x) => x.key === k);
      if (!f) continue;
      form
        .querySelector(`[data-field="${k}"]`)
        ?.setAttribute("data-transferred", "");
      labels.push(
        f.type === "select"
          ? `${f.label}: ${f.options?.find((o) => o.value === tr.values[k])?.label}`
          : `${f.label} (${tr.values[k]}${f.unit ? ` ${f.unit}` : ""})`,
      );
    }
    const missing = v.fields
      .filter(
        (f: FieldDef) =>
          !f.optional && f.type !== "select" && !keys.includes(f.key),
      )
      .map((f) => f.label);
    const period = v.fields.find(
      (f) => f.key === "zeitraum" || f.key === "periode",
    );
    const periodNote =
      period && !keys.includes(period.key)
        ? `<p>Bitte den <strong>${esc(period.label)}</strong> prüfen – er wurde nicht übernommen.</p>`
        : "";
    noticeEl.innerHTML = `<div><p><strong>Aus „${esc(tr.fromTitle)}“ übernommen:</strong> ${labels.map(esc).join(", ")}.</p>${missing.length ? `<p>Noch einzutragen: <strong>${missing.map(esc).join(", ")}</strong> – unbekannte Werte werden nicht als 0 angenommen.</p>` : ""}${periodNote}</div>`;
    noticeEl.hidden = false;
    track("calc_started", { calc: def.id, variant: v.id });
    update();
    const firstMissing = v.fields.find((f) => missing.includes(f.label));
    if (firstMissing)
      (
        form.elements.namedItem(firstMissing.key) as HTMLElement | null
      )?.focus();
    return true;
  }

  /* ---------- Gespeicherte Berechnung öffnen ---------- */
  function applySaved(id: string) {
    const item = getSavedItem(id);
    if (!item || item.calcId !== def.id) {
      noticeEl.innerHTML =
        "<p>Diese gespeicherte Berechnung wurde in diesem Browser nicht gefunden.</p>";
      noticeEl.hidden = false;
      update();
      return;
    }
    const v = def.variants.find((x) => x.id === item.variantId);
    if (!v) {
      noticeEl.innerHTML = `<p>„${esc(item.name)}“ verwendet einen Rechenmodus, den es nicht mehr gibt. Bitte die Werte neu eingeben.</p>`;
      noticeEl.hidden = false;
      return;
    }
    switchVariant(v.id, def.variants.length > 1);
    writeRaw(forms.get(v.id)!, v, item.inputs);
    noticeEl.innerHTML = `<p><strong>Gespeicherte Berechnung „${esc(item.name)}“ geöffnet</strong> (zuletzt geändert am ${new Date(item.updatedAt).toLocaleDateString("de-DE")}).${item.schema !== def.schema ? " Sie stammt aus einer älteren Version – bitte die Werte prüfen." : ""}${item.note ? ` Notiz: ${esc(item.note)}` : ""}</p>`;
    noticeEl.hidden = false;
    update({ announce: true });
    opened = { id: item.id, name: item.name, inputs: structuredClone(last.raw), variantId: v.id };
    updateSaveStatus();
    track("saved_reopened", { calc: def.id, variant: v.id });
  }

  /* ---------- Szenariovergleich ---------- */
  const scn = root.querySelector<HTMLElement>("[data-scenario]");
  let copyToScenarios = () => {};
  if (scn) {
    const sv = def.variants.find((x) => x.id === scn.dataset.scenario)!;
    const formA = scn.querySelector<HTMLFormElement>('[data-scn="A"]')!;
    const formB = scn.querySelector<HTMLFormElement>('[data-scn="B"]')!;
    const shared = scn.querySelector<HTMLSelectElement>(`select[name="${PERIOD_KEY}"]`);
    const outEl = scn.querySelector<HTMLElement>("[data-scn-result]")!;
    const nameOf = (f: HTMLFormElement, fallback: string) =>
      (f.elements.namedItem("scnName") as HTMLInputElement).value.trim() || fallback;
    const scnRaw = (f: HTMLFormElement): RawInputs => {
      const raw = readRaw(f, { ...sv, fields: sv.fields.filter((x) => x.key !== PERIOD_KEY) });
      if (shared) raw[PERIOD_KEY] = shared.value;
      return raw;
    };
    const compare = () => {
      const a = scnRaw(formA),
        b = scnRaw(formB);
      const nA = nameOf(formA, "A"),
        nB = nameOf(formB, "B");
      const c = compareScenarios(sv, a, b);
      // abweichende Eingaben kennzeichnen
      for (const f of sv.fields) {
        const w = formB.querySelector<HTMLElement>(`[data-field="${f.key}"]`);
        if (!w) continue;
        const differs = c.differingFields.includes(f.key) && c.state !== "empty";
        w.toggleAttribute("data-differs", differs);
      }
      if (c.state === "empty") {
        outEl.innerHTML =
          '<p class="small muted">Trage in beiden Szenarien Werte ein, um sie zu vergleichen.</p>';
        return;
      }
      const head = (n: string, s: string) => (n === s ? s : `${s}: ${n}`);
      const warn = c.warnings.map((w) => `<p class="notice notice-warn" role="note">${esc(w)}</p>`).join("");
      const same = c.differingLabels.length
        ? `<p class="small"><strong>Abweichende Eingaben:</strong> ${c.differingLabels.map(esc).join(", ")}.</p>`
        : '<p class="small muted">Beide Szenarien haben dieselben Eingaben.</p>';
      const period = c.periodsMatch && c.periodA ? `<p class="small muted">Gemeinsamer Betrachtungszeitraum: ${esc(c.periodA)}. Alle Werte beider Szenarien beziehen sich darauf.</p>` : "";
      const rows = c.rows
        .map(
          (r) =>
            `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.a ?? "")}</td><td>${esc(r.b ?? "")}</td><td>${r.diff ? esc(r.diff) : `<span class="muted">${esc(r.diffNote ?? "–")}</span>`}</td></tr>`,
        )
        .join("");
      outEl.innerHTML = `${warn}${same}${period}<div class="table-scroll" tabindex="0" role="region" aria-label="Szenariovergleich – bei Bedarf horizontal scrollbar"><table class="compare-table"><caption>Deine Szenarien im Vergleich</caption><thead><tr><th scope="col">Kennzahl</th><th scope="col">${esc(head(nA, "A"))}${c.periodsMatch ? "" : ` (${esc(c.periodA ?? "")})`}</th><th scope="col">${esc(head(nB, "B"))}${c.periodsMatch ? "" : ` (${esc(c.periodB ?? "")})`}</th><th scope="col">${esc(nB)} − ${esc(nA)}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      if (c.state === "ok") track("scenario_used", { calc: def.id, variant: sv.id });
    };
    for (const f of [formA, formB]) {
      f.addEventListener("input", compare);
      f.addEventListener("change", compare);
    }
    shared?.addEventListener("change", compare);
    copyToScenarios = () => {
      const raw = variant.id === sv.id ? readRaw(forms.get(sv.id)!, sv) : {};
      writeRaw(formA, { ...sv, fields: sv.fields.filter((x) => x.key !== PERIOD_KEY) }, raw);
      writeRaw(formB, { ...sv, fields: sv.fields.filter((x) => x.key !== PERIOD_KEY) }, raw);
      if (shared && typeof raw[PERIOD_KEY] === "string" && raw[PERIOD_KEY]) shared.value = raw[PERIOD_KEY] as string;
      compare();
    };
    scn.querySelector("[data-scn-copy]")!.addEventListener("click", () => {
      copyToScenarios();
      (formB.querySelector("input:not([name=scnName])") as HTMLInputElement | null)?.focus();
    });
    compare();
  }

  /* ---------- Start ---------- */
  touchRecent(def.id);
  const hash = decodeURIComponent(location.hash.slice(1));
  const [hVariant, hFlag] = hash.includes(":") ? hash.split(":") : [hash, ""];
  if (!applyIncoming()) {
    if (hash.startsWith("gespeichert="))
      applySaved(hash.slice("gespeichert=".length));
    else if (hash === "beispiel" || hFlag === "beispiel") {
      const v = def.variants.find((x) => x.id === hVariant) ?? def.variants[0];
      switchVariant(v.id, false);
      applyExample(forms.get(v.id)!, v);
    } else if (def.variants.some((v) => v.id === hash)) {
      switchVariant(hash, false);
      root.scrollIntoView({ block: "start" });
    } else update();
  }
  window.addEventListener("hashchange", () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (def.variants.some((v) => v.id === h) && h !== variant.id)
      switchVariant(h, false);
  });
}
