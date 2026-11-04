import { loadCalc } from "../calc/load";
import { run } from "../calc/engine";
import type {
  CalcDef,
  CalcResult,
  FieldDef,
  Out,
  RawInputs,
  VariantDef,
} from "../calc/types";
import { formatValue, formatDecimal } from "../lib/number";
import { D } from "../lib/decimal";
import { addSaved, getSaved, setTransfer, takeTransfer } from "../lib/storage";
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
      if (opts.announce)
        announce(
          "Noch kein Ergebnis – bitte Eingaben vervollständigen oder prüfen.",
        );
      return;
    }
    renderResult(result);
    toolsEl.hidden = result.status !== "ok";
    if (transfersEl) transfersEl.hidden = result.status !== "ok";
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

  function renderResult(r: CalcResult) {
    if (r.status === "ok") {
      const extra = r.extra?.length
        ? `<dl class="result-extra">${r.extra.map((o) => `<div><dt>${esc(o.label)}</dt><dd>${esc(fmt(o))}</dd></div>`).join("")}</dl>`
        : "";
      const notes = r.notes?.length
        ? `<ul class="result-notes">${r.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`
        : "";
      const chart = r.chart?.kind === "break-even" ? breakEvenChart(r) : "";
      setResult(
        "ok",
        `<p class="result-tag">Dein Ergebnis</p>
        <p class="result-main-label">${esc(r.main.label)}</p>
        <p class="result-main"${r.tone ? ` data-tone="${r.tone}"` : ""}>${esc(fmt(r.main))}</p>
        <p class="result-meaning">${esc(r.meaning)}</p>${extra}${notes}${chart}
        <details><summary>Rechenweg anzeigen</summary><ol class="steps">${r.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></details>`,
      );
    } else {
      const head = {
        undefined: "Nicht definiert",
        impossible: "Keine Lösung in diesem Modell",
        ambiguous: "Nicht eindeutig bestimmbar",
        invalid: "Eingabe prüfen",
      }[r.status];
      const partial =
        "partial" in r && r.partial?.length
          ? `<dl class="result-extra">${r.partial.map((o) => `<div><dt>${esc(o.label)}</dt><dd>${esc(fmt(o))}</dd></div>`).join("")}</dl>`
          : "";
      setResult(
        r.status === "invalid" ? "error" : "info",
        `<p class="result-tag">${head}</p><p>${esc(r.message)}</p>${partial}`,
      );
    }
  }

  function breakEvenChart(r: Ok): string {
    const pts = r.chart!.points;
    const be = r.chart!.breakEven ?? 0;
    const qMax = pts[pts.length - 1].q;
    const vMax = Math.max(...pts.map((p) => Math.max(p.revenue, p.cost))) || 1;
    const W = 320,
      H = 190,
      x0 = 46,
      y0 = 160,
      w = 260,
      h = 140;
    const X = (q: number) => x0 + (q / qMax) * w;
    const Y = (v: number) => y0 - (v / vMax) * h;
    const line = (key: "revenue" | "cost") =>
      `M${X(pts[0].q)} ${Y(pts[0][key])} L${X(pts[1].q)} ${Y(pts[1][key])}`;
    const rev = (q: number) =>
      pts[0].revenue + ((pts[1].revenue - pts[0].revenue) * q) / qMax;
    const n = (v: number, d = 0) => formatDecimal(D(v), { max: d });
    const beY = Y(rev(be));
    const rows = [0, be, qMax].map((q) => {
      const revenue = rev(q),
        cost = pts[0].cost + ((pts[1].cost - pts[0].cost) * q) / qMax;
      return `<tr><td>${n(q, 2)}</td><td>${n(revenue, 2)} €</td><td>${n(cost, 2)} €</td><td>${n(revenue - cost, 2)} €</td></tr>`;
    });
    return `<div class="chart-box">
      <p class="result-tag">Dein Ergebnis als Diagramm</p>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Umsatz- und Gesamtkostenlinie deiner Eingaben; Schnittpunkt bei ${n(be, 2)} Stück.">
        <line x1="${x0}" y1="${y0}" x2="${x0 + w}" y2="${y0}" stroke="#17253D"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - h}" stroke="#17253D"/>
        <path d="${line("cost")}" stroke="#17253D" stroke-width="2" fill="none"/>
        <path d="${line("revenue")}" stroke="#3D4AE8" stroke-width="2.6" fill="none" stroke-dasharray="7 3"/>
        <line x1="${X(be)}" y1="${beY}" x2="${X(be)}" y2="${y0}" stroke="#4A5872" stroke-dasharray="3 3"/>
        <circle cx="${X(be)}" cy="${beY}" r="4" fill="#fff" stroke="#17253D" stroke-width="1.5"/>
        <text x="${X(be)}" y="${y0 + 14}" font-size="10" text-anchor="middle" fill="#17253D" font-weight="700">${n(be, 2)} Stück</text>
        <text x="${x0 - 4}" y="${y0 - h + 4}" font-size="9" text-anchor="end" fill="#4A5872">${n(vMax)} €</text>
        <text x="${x0 - 4}" y="${y0 + 4}" font-size="9" text-anchor="end" fill="#4A5872">0</text>
        <text x="${x0 + w}" y="${y0 + 14}" font-size="9" text-anchor="end" fill="#4A5872">${n(qMax)} Stück</text>
        <line x1="${x0 + 8}" y1="16" x2="${x0 + 26}" y2="16" stroke="#3D4AE8" stroke-width="2.6" stroke-dasharray="7 3"/><text x="${x0 + 30}" y="19" font-size="10" fill="#17253D">Umsatz</text>
        <line x1="${x0 + 86}" y1="16" x2="${x0 + 104}" y2="16" stroke="#17253D" stroke-width="2"/><text x="${x0 + 108}" y="19" font-size="10" fill="#17253D">Gesamtkosten</text>
      </svg>
      <details><summary>Werte als Tabelle</summary><div class="table-scroll"><table><thead><tr><th scope="col">Stück</th><th scope="col">Umsatz</th><th scope="col">Gesamtkosten</th><th scope="col">Ergebnis</th></tr></thead><tbody>${rows.join("")}</tbody></table></div></details>
    </div>`;
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
    if (updateHash && def.variants.length > 1)
      history.replaceState(null, "", `#${id}`);
    update();
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-variant-btn]")
    .forEach((b) =>
      b.addEventListener("click", () => switchVariant(b.dataset.variantBtn!)),
    );

  /* ---------- Formular-Ereignisse ---------- */
  let inputTimer: number | undefined;
  for (const [vid, form] of forms) {
    const v = def.variants.find((x) => x.id === vid)!;
    form.addEventListener("input", (e) => {
      const t = e.target as HTMLElement;
      t.closest("[data-field]")?.removeAttribute("data-transferred");
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
      .addEventListener("click", () => {
        writeRaw(form, v, v.example);
        form
          .querySelectorAll("[data-transferred]")
          .forEach((el) => el.removeAttribute("data-transferred"));
        touched.clear();
        update({ announce: true });
        toast(
          "Beispielwerte eingesetzt. Du kannst sie jetzt durch eigene Zahlen ersetzen.",
        );
      });
    form
      .querySelector('[data-action="reset"]')!
      .addEventListener("click", () => {
        writeRaw(form, v, {});
        touched.clear();
        noticeEl.hidden = true;
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
      ...(r.extra ?? []).map((o) => `${o.label}: ${fmt(o)}`),
      r.meaning,
      ...(inputs.length ? ["", "Eingaben:", ...inputs] : []),
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

  const dialog = root.querySelector<HTMLDialogElement>("[data-save-dialog]")!;
  const nameInput =
    dialog.querySelector<HTMLInputElement>('input[name="name"]')!;
  root.querySelector('[data-tool="save"]')!.addEventListener("click", () => {
    nameInput.value = `${title}${def.variants.length > 1 ? ` – ${variant.label}` : ""} (${new Date().toLocaleDateString("de-DE")})`;
    dialog.showModal();
    nameInput.select();
  });
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "save") return;
    const saved = addSaved({
      name: nameInput.value.trim() || title,
      calcId: def.id,
      variantId: variant.id,
      schema: def.schema,
      inputs: last.raw,
    });
    toast(
      saved
        ? `Gespeichert als „${saved.name}“. Du findest die Rechnung unter „Gespeichert“.`
        : "Speichern ist fehlgeschlagen: Dein Browser erlaubt hier keine lokale Speicherung oder der Speicher ist voll.",
      6000,
    );
  });

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
    update();
    const firstMissing = v.fields.find((f) => missing.includes(f.label));
    if (firstMissing)
      (
        form.elements.namedItem(firstMissing.key) as HTMLElement | null
      )?.focus();
    return true;
  }

  /* ---------- Gespeicherte Rechnung öffnen ---------- */
  function applySaved(id: string) {
    const item = getSaved().find((s) => s.id === id);
    if (!item || item.calcId !== def.id) {
      noticeEl.innerHTML =
        "<p>Diese gespeicherte Rechnung wurde in diesem Browser nicht gefunden.</p>";
      noticeEl.hidden = false;
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
    noticeEl.innerHTML = `<p><strong>Gespeicherte Rechnung „${esc(item.name)}“ geöffnet</strong> (gespeichert am ${new Date(item.savedAt).toLocaleDateString("de-DE")}).${item.schema !== def.schema ? " Sie stammt aus einer älteren Version – bitte die Werte prüfen." : ""}</p>`;
    noticeEl.hidden = false;
    update({ announce: true });
  }

  /* ---------- Szenariovergleich ---------- */
  const scn = root.querySelector<HTMLElement>("[data-scenario]");
  if (scn) {
    const sv = def.variants.find((x) => x.id === scn.dataset.scenario)!;
    const formA = scn.querySelector<HTMLFormElement>('[data-scn="A"]')!;
    const formB = scn.querySelector<HTMLFormElement>('[data-scn="B"]')!;
    const out = scn.querySelector<HTMLElement>("[data-scn-result]")!;
    const compare = () => {
      const a = run(sv, readRaw(formA, sv)).result;
      const b = run(sv, readRaw(formB, sv)).result;
      if (!a && !b) {
        out.innerHTML =
          '<p class="small muted">Trage in beiden Szenarien Werte ein, um sie zu vergleichen.</p>';
        return;
      }
      const list = (r: CalcResult | null) =>
        r && r.status === "ok" ? [r.main, ...(r.extra ?? [])] : [];
      const la = list(a),
        lb = list(b);
      const nRows = Math.max(la.length, lb.length);
      const cell = (r: CalcResult | null, o?: Out) =>
        o
          ? esc(fmt(o))
          : r
            ? r.status === "ok"
              ? "–"
              : esc(
                  r.status === "invalid"
                    ? "Eingabe prüfen"
                    : "nicht bestimmbar",
                )
            : "fehlt noch";
      let rows = "";
      for (let i = 0; i < nRows; i++) {
        const oa = la[i],
          ob = lb[i];
        const label =
          oa && ob && oa.label !== ob.label
            ? `${oa.label} / ${ob.label}`
            : (oa ?? ob)!.label;
        const diff =
          oa && ob && oa.format === ob.format && oa.format !== "factor"
            ? formatValue(
                ob.value.sub(oa.value),
                oa.format === "pp" ? "pp" : oa.format,
                oa.unit,
                true,
              )
            : "–";
        rows += `<tr><th scope="row">${esc(label)}</th><td>${cell(a, oa)}</td><td>${cell(b, ob)}</td><td>${esc(diff)}</td></tr>`;
      }
      out.innerHTML = `<div class="table-scroll"><table class="compare-table"><caption>Deine Szenarien im Vergleich</caption><thead><tr><th scope="col">Kennzahl</th><th scope="col">A</th><th scope="col">B</th><th scope="col">B − A</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    };
    formA.addEventListener("input", compare);
    formB.addEventListener("input", compare);
    formA.addEventListener("change", compare);
    formB.addEventListener("change", compare);
    scn.querySelector("[data-scn-copy]")!.addEventListener("click", () => {
      const raw = variant.id === sv.id ? readRaw(forms.get(sv.id)!, sv) : {};
      writeRaw(formA, sv, raw);
      writeRaw(formB, sv, raw);
      compare();
      (formB.querySelector("input") as HTMLInputElement | null)?.focus();
    });
    compare();
  }

  /* ---------- Start ---------- */
  const hash = decodeURIComponent(location.hash.slice(1));
  if (!applyIncoming()) {
    if (hash.startsWith("gespeichert="))
      applySaved(hash.slice("gespeichert=".length));
    else if (def.variants.some((v) => v.id === hash)) {
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
