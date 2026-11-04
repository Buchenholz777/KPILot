// Prüft die Kontraste der Design-Tokens (WCAG 2.x). Aufruf: npm run check:contrast
const hex = (h) =>
  h
    .replace("#", "")
    .match(/../g)
    .map((x) => parseInt(x, 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (h) => {
  const [r, g, b] = hex(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [Vordergrund, Hintergrund, Mindestwert, Beschreibung]
const pairs = [
  ["#12213A", "#FFFFFF", 4.5, "Haupttext auf Karte"],
  ["#12213A", "#EEF2F8", 4.5, "Haupttext auf Fläche"],
  ["#485872", "#FFFFFF", 4.5, "Sekundärtext/Beschreibung auf Karte"],
  ["#485872", "#EEF2F8", 4.5, "Sekundärtext auf Fläche"],
  ["#485872", "#F5F7FB", 4.5, "Sekundärtext auf Einheitenfeld"],
  ["#5F6E87", "#FFFFFF", 4.5, "Platzhalter in Feldern"],
  ["#3730A3", "#FFFFFF", 4.5, "Linktext"],
  ["#3730A3", "#ECEAFD", 4.5, "Hinweis „eingegrenzt“"],
  ["#FFFFFF", "#4338CA", 4.5, "Primärbutton"],
  ["#4338CA", "#FFFFFF", 3, "Fokusring auf Karte"],
  ["#0F766E", "#FFFFFF", 4.5, "Türkis-Text"],
  ["#FFFFFF", "#0B1730", 4.5, "Text auf Markenfläche"],
  ["#B6C2D9", "#0B1730", 4.5, "Sekundärtext auf Markenfläche"],
  ["#B6C2D9", "#102246", 4.5, "Sekundärtext auf Markenfläche (Verlaufsende)"],
  ["#D7DEEB", "#0B1730", 4.5, "Navigation"],
  ["#A5B4FC", "#0B1730", 4.5, "Akzenttext/Links auf Markenfläche"],
  ["#A5B4FC", "#102246", 3, "Fokusring auf Markenfläche"],
  ["#99F6E4", "#0B1730", 4.5, "Claim mobil"],
  ["#7D8BA3", "#FFFFFF", 3, "Eingaberahmen gegen Feld"],
  ["#7D8BA3", "#EEF2F8", 3, "Eingaberahmen/Button-Kontur gegen Fläche"],
  ["#FFFFFF", "#12213A", 4.5, "aktiver Kategorie-Chip"],
  ["#12213A", "#EEF2F8", 3, "aktiver Chip gegen Fläche"],
  ["#485872", "#FFFFFF", 3, "Stern inaktiv"],
  ["#B45309", "#FFF3DC", 3, "Stern aktiv (Symbol)"],
  ["#7A3A00", "#FFF3DC", 4.5, "Favorit-Label aktiv"],
  [
    "#1F1300",
    "#FBBF24",
    4.5,
    "Favoritenzähler / aktiver Favorit im Markenbereich",
  ],
  ["#B42318", "#FFFFFF", 4.5, "Fehlermeldung"],
  ["#B42318", "#FDECEA", 4.5, "Fehler-Ergebnis"],
  ["#8A4B00", "#FFF4E0", 4.5, "Hinweis „nicht definiert“"],
  ["#4338CA", "#FFFFFF", 4.5, "Kategorie Prozent"],
  ["#0F766E", "#FFFFFF", 4.5, "Kategorie Kosten"],
  ["#0B5CAD", "#FFFFFF", 4.5, "Kategorie Finanzen"],
  ["#B4235A", "#FFFFFF", 4.5, "Kategorie Marketing"],
  ["#7A3FC0", "#FFFFFF", 4.5, "Kategorie Produkt"],
  ["#9A4D00", "#FFFFFF", 4.5, "Kategorie Controlling"],
];

let fail = 0;
for (const [fg, bg, min, label] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(
    `${ok ? "✔" : "✘"} ${r.toFixed(2).padStart(5)}:1 (≥ ${min})  ${fg} auf ${bg}  ${label}`,
  );
}
console.log(
  fail
    ? `\n${fail} Kombination(en) unter dem Ziel.`
    : `\nAlle ${pairs.length} Kombinationen erfüllen ihr Ziel.`,
);
process.exit(fail ? 1 : 0);
