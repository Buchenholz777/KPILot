# Visualisierungskonzept

Stand: 21.11.2026 (zusammengeführt). Grundsatz: Ein Diagramm wird nur ergänzt, wenn es etwas zeigt, das die Zahl allein nicht zeigt. Alle Ergebnisse bleiben als Zahlen bestehen; das Diagramm ist zusätzlich, aktualisiert sich mit jeder Eingabe, hat eine Textbeschreibung und eine Tabellenalternative.

Beim Zusammenführen der parallelen Arbeitsstände wurde die umfassendere Umsetzung übernommen: **alle 41 Rechner und alle 55 Modi** zeigen „Deine Berechnung als Diagramm“. Aufbereitung je Kategorie in `src/calc/charts/*.ts` (Typen `src/calc/chart-types.ts`), Zeichnung in `src/scripts/charts.ts`, Tests in `tests/charts-data.test.ts`, Übersicht aller Modi in [`DIAGRAMM-MATRIX.md`](DIAGRAMM-MATRIX.md). Die früheren Einzeldiagramme in den Rechenmodulen (Feld `chart`) sind darin aufgegangen.

Die Spalte „Diagramm“ in `docs/RECHNER-INVENTAR.md` wird bei jedem `npm run docs` aus derselben Aufbereitung erzeugt.
