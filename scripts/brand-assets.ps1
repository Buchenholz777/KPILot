# Erzeugt die KPILot-Markendateien aus der transparenten Logo-Vorlage.
# Aufruf (im Projektordner): powershell -ExecutionPolicy Bypass -File scripts\brand-assets.ps1 -Source "<pfad>\kpilot-logo-v2.png"
param([Parameter(Mandatory = $true)][string]$Source)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices;
public static class Brand {
  // Ordnet jedes Pixel der nächstliegenden Markenfarbe zu und ersetzt sie (Alpha bleibt erhalten).
  // maskX/maskY >= 0: nur Pixel links von maskX ODER oberhalb von maskY behalten (Emblem ohne Schriftzug)
  public static Bitmap Recolor(Bitmap src, int[][] from, int[][] to, int maskX, int maskY) {
    var b = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
    var r = new Rectangle(0, 0, src.Width, src.Height);
    var sd = src.LockBits(r, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    var dd = b.LockBits(r, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    int n = sd.Stride * src.Height; var px = new byte[n]; Marshal.Copy(sd.Scan0, px, 0, n);
    for (int y = 0; y < src.Height; y++) for (int x = 0; x < src.Width; x++) {
      int i = y * sd.Stride + x * 4;
      if (maskX >= 0 && !(x < maskX || y < maskY)) { px[i + 3] = 0; continue; }
      if (px[i + 3] == 0 || to == null) continue;
      int best = 0; double bd = double.MaxValue;
      for (int k = 0; k < from.Length; k++) {
        double d = Math.Pow(px[i + 2] - from[k][0], 2) + Math.Pow(px[i + 1] - from[k][1], 2) + Math.Pow(px[i] - from[k][2], 2);
        if (d < bd) { bd = d; best = k; }
      }
      px[i + 2] = (byte)to[best][0]; px[i + 1] = (byte)to[best][1]; px[i] = (byte)to[best][2];
    }
    Marshal.Copy(px, 0, dd.Scan0, n); src.UnlockBits(sd); b.UnlockBits(dd); return b;
  }
  public static Rectangle Bounds(Bitmap b) {
    int minX = b.Width, minY = b.Height, maxX = 0, maxY = 0;
    for (int y = 0; y < b.Height; y++) for (int x = 0; x < b.Width; x++) if (b.GetPixel(x, y).A > 16) {
      if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }
    return Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
  }
  public static Bitmap Fit(Bitmap src, Rectangle crop, int w, int h, int pad, Color bg) {
    var b = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(b)) {
      g.Clear(bg); g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality; g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
      double s = Math.Min((w - 2.0 * pad) / crop.Width, (h - 2.0 * pad) / crop.Height);
      int dw = (int)Math.Round(crop.Width * s), dh = (int)Math.Round(crop.Height * s);
      g.DrawImage(src, new Rectangle((w - dw) / 2, (h - dh) / 2, dw, dh), crop, GraphicsUnit.Pixel);
    }
    return b;
  }
}
'@

$out = Join-Path (Get-Location) 'public\brand'
New-Item -ItemType Directory -Force $out | Out-Null
$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $Source))
$navy = @(11, 31, 55); $indigo = @(60, 47, 188); $teal = @(2, 102, 100)
$from = [int[][]]@($navy, $indigo, $teal)
$png = [System.Drawing.Imaging.ImageFormat]::Png

# 1) Vollständiges Logo, Original (für helle Flächen) und Dunkelvariante (für Markenbereich)
$light = [Brand]::Recolor($src, $from, $null, -1, -1)
$dark = [Brand]::Recolor($src, $from, [int[][]]@(@(255, 255, 255), @(165, 180, 252), @(94, 234, 212)), -1, -1)
$bounds = [Brand]::Bounds($light)
$h = 160; $w = [int][Math]::Round($bounds.Width * $h / $bounds.Height)
([Brand]::Fit($light, $bounds, $w, $h, 0, [System.Drawing.Color]::Transparent)).Save("$out\kpilot-logo.png", $png)
([Brand]::Fit($dark, $bounds, $w, $h, 0, [System.Drawing.Color]::Transparent)).Save("$out\kpilot-logo-dark.png", $png)
"Logo: ${w}x${h}"

# 2) Emblem allein (Rakete + Balken): links vom „K“ bzw. oberhalb seiner Oberkante
$kLeft = [int]($src.Width * 0.295); $kTop = [int]($src.Height * 0.36)
$emblemLight = [Brand]::Recolor($src, $from, $null, $kLeft, $kTop)
$eb = [Brand]::Bounds($emblemLight)
"Emblem-Bereich: $eb"
foreach ($s in 32, 180, 512) {
  $pad = [int]($s * 0.12)
  $icon = [Brand]::Fit($emblemLight, $eb, $s, $s, $pad, [System.Drawing.Color]::White)
  # abgerundete weiße Fläche (für dunkle und helle Browser-Tabs gleichermaßen sichtbar)
  $rounded = New-Object System.Drawing.Bitmap $s, $s
  $g = [System.Drawing.Graphics]::FromImage($rounded); $g.SmoothingMode = 'AntiAlias'; $g.Clear([System.Drawing.Color]::Transparent)
  $r = [int]($s * 0.22); $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc(0, 0, 2 * $r, 2 * $r, 180, 90); $path.AddArc($s - 2 * $r - 1, 0, 2 * $r, 2 * $r, 270, 90); $path.AddArc($s - 2 * $r - 1, $s - 2 * $r - 1, 2 * $r, 2 * $r, 0, 90); $path.AddArc(0, $s - 2 * $r - 1, 2 * $r, 2 * $r, 90, 90); $path.CloseFigure()
  $g.SetClip($path); $g.DrawImage($icon, 0, 0); $g.Dispose()
  $rounded.Save("$out\kpilot-icon-$s.png", $png)
}
# Emblem transparent (für Footer/Verwendung auf Flächen)
$eh = 128; $ew = [int][Math]::Round($eb.Width * $eh / $eb.Height)
([Brand]::Fit($emblemLight, $eb, $ew, $eh, 0, [System.Drawing.Color]::Transparent)).Save("$out\kpilot-emblem.png", $png)

# 3) favicon.ico (32 px, PNG im ICO-Container)
$ico = [System.IO.File]::ReadAllBytes("$out\kpilot-icon-32.png")
$fs = [System.IO.File]::Create((Join-Path (Get-Location) 'public\favicon.ico')); $bw = New-Object System.IO.BinaryWriter $fs
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1); $bw.Write([byte]32); $bw.Write([byte]32); $bw.Write([byte]0); $bw.Write([byte]0); $bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$ico.Length); $bw.Write([UInt32]22); $bw.Write($ico); $bw.Close()

# 4) Social-Sharing-Bild 1200x630 mit Dunkelvariante
$og = New-Object System.Drawing.Bitmap 1200, 630
$g = [System.Drawing.Graphics]::FromImage($og); $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'; $g.InterpolationMode = 'HighQualityBicubic'
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point(0, 630)), [System.Drawing.ColorTranslator]::FromHtml('#0B1730'), [System.Drawing.ColorTranslator]::FromHtml('#102246'))
$g.FillRectangle($bg, 0, 0, 1200, 630)
$grid = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(14, 255, 255, 255)), 1
for ($i = 0; $i -lt 1200; $i += 40) { $g.DrawLine($grid, $i, 0, $i, 630) }; for ($j = 0; $j -lt 630; $j += 40) { $g.DrawLine($grid, 0, $j, 1200, $j) }
$lw = 620; $lh = [int]($bounds.Height * $lw / $bounds.Width)
$g.DrawImage($dark, (New-Object System.Drawing.Rectangle(84, 90, $lw, $lh)), $bounds, [System.Drawing.GraphicsUnit]::Pixel)
function Br($hx) { New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hx)) }
$g.DrawString('Orientierung durch Kennzahlen', (New-Object System.Drawing.Font('Segoe UI', 24)), (Br '#99F6E4'), 90, (110 + $lh))
$g.DrawString('Prozente, Kosten und Kennzahlen', (New-Object System.Drawing.Font('Segoe UI Semibold', 40)), [System.Drawing.Brushes]::White, 84, 360)
$g.DrawString('einfach verstehen und berechnen.', (New-Object System.Drawing.Font('Segoe UI Semibold', 40)), (Br '#A5B4FC'), 84, 422)
$g.DrawString('40 Rechner · Erklärung · Beispielbild · Rechenweg', (New-Object System.Drawing.Font('Segoe UI', 22)), (Br '#B6C2D9'), 90, 530)
$g.Dispose(); $og.Save((Join-Path (Get-Location) 'public\og-image.png'), $png)
$src.Dispose()
"fertig"
