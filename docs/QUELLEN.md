# Fachliche und technische Referenzquellen

Die Modelle sind bewusst vereinfacht. Jede Rechnerseite nennt die verwendete Variante. Richtwerte ohne Branchen- und Modellkontext werden nicht übernommen.

| Thema | Quelle | Verwendung |
|---|---|---|
| Liquidität, Eigenkapitalquote, EBIT | [IHK Regensburg: Kennzahlen zur Früherkennung von Krisen](https://www.ihk.de/regensburg/fachthemen/finanzierung-und-krisenmanagement/krisenmanagement/kennzahlen-frueherkennung-krisen-4820236) | Definitionen der Kennzahlen; keine Übernahme pauschaler Ampelwerte |
| Cashflow | [IFRS Foundation: IAS 7 Statement of Cash Flows](https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows.html/) | Trennung operativ / investiv / Finanzierung; das eigene Modell ist keine vollständige Umsetzung des Standards |
| EBITDA | [Deutsche Börse: Glossar EBITDA](https://live.deutsche-boerse.com/en/know-how/glossary/ebitda) | Ergebnisbrücke EBIT + Abschreibungen |
| MRR / ARR | [Stripe: MRR und ARR](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29) | Normierung auf Monate; ARR = MRR × 12 als Run-Rate. Gewählte Abgrenzung: nur wiederkehrende Nettopreise, ohne Einmalgebühren, Steuern und nutzungsabhängige Entgelte |
| NPS | [Bain / Net Promoter System](https://www.netpromotersystem.com/about/measuring-your-net-promoter-score/) | Gruppen 9–10 / 7–8 / 0–6, Score −100 bis +100 |
| Barrierefreiheit | [W3C ARIA APG: Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), [W3C WAI: Complex Images](https://www.w3.org/WAI/tutorials/images/complex/) | Favoritenbutton mit `aria-pressed`, Bildbeschreibungen |
| SEO | [Google Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | Inhalte im ausgelieferten HTML, Rechnen erst im Browser |
| Hosting | [Cloudflare Pages: Konfiguration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) | `wrangler.jsonc` (`pages_build_output_dir`), `.node-version` |

Die übrigen Formeln (Prozentrechnung, Dreisatz, Deckungsbeitrag, Break-even, Zuschlagskalkulation, Marketing-Kennzahlen, CLV, Churn, Lagerkennzahlen) folgen gängiger betriebswirtschaftlicher Lehrbuchdarstellung. Die konkrete Modellvariante steht in [`MODELLANNAHMEN.md`](MODELLANNAHMEN.md) und auf jeder Rechnerseite.
