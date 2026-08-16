/**
 * Génère l'image de partage par défaut `public/og-default.png`
 * (1200 × 630, le format attendu par Open Graph et Twitter Cards).
 *
 * Aucune dépendance, comme pour les icônes : la composition est décrite
 * analytiquement — dégradé de fond, pin Lokadia repris de l'icône, et le
 * mot « LOKADIA » tracé au trait (segments et arcs), ce qui évite
 * d'embarquer une police et un moteur de rendu de texte pour sept lettres.
 *
 *   node scripts/generate-og.mjs
 *
 * Les fiches destination, elles, partagent leur propre photo : cette image
 * ne sert que pour l'accueil et les pages sans visuel propre.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePng } from './png.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og-default.png');

const W = 1200, H = 630;
const NAVY = [15, 76, 129];        // #0F4C81 — primaire de la marque
const NAVY_DEEP = [8, 42, 74];
const WHITE = [255, 255, 255];

// ─── Pin de la marque (même géométrie que l'icône, à l'échelle) ───
const PIN = { cx: 600, cy: 232, r: 88, tipY: 386, holeR: 36 };

function inPin(x, y) {
  const dx = x - PIN.cx, dy = y - PIN.cy;
  const inHole = dx * dx + dy * dy <= PIN.holeR * PIN.holeR;
  if (inHole) return false;
  if (dx * dx + dy * dy <= PIN.r * PIN.r) return true;
  if (y < PIN.cy || y > PIN.tipY) return false;
  const t = (y - PIN.cy) / (PIN.tipY - PIN.cy);
  return Math.abs(dx) <= PIN.r * (1 - t);
}

// ─── Lettrage au trait ───
// Chaque lettre est un jeu de segments épais et d'arcs elliptiques, décrits
// dans une boîte locale de hauteur CAP. La distance analytique à ces formes
// donne un anticrénelage propre sans sur-échantillonnage.
const CAP = 78;          // hauteur de capitale
const STROKE = 14;       // épaisseur du trait
const GAP = 26;          // chasse entre lettres

/** Distance d'un point à un segment. */
function distSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  const qx = x1 + t * dx, qy = y1 + t * dy;
  return Math.hypot(px - qx, py - qy);
}

/** Distance approchée à une ellipse (positive à l'extérieur). */
function distEllipse(px, py, cx, cy, rx, ry) {
  const u = (px - cx) / rx, v = (py - cy) / ry;
  const f = Math.hypot(u, v);
  if (f === 0) return -Math.min(rx, ry);
  const grad = Math.hypot(u / rx, v / ry) / f;
  return (f - 1) / grad;
}

/**
 * Alphabet nécessaire à « LOKADIA ». `w` est la chasse de la lettre ;
 * `parts` décrit ses traits dans le repère (0,0)–(w,CAP).
 */
const GLYPHS = {
  L: { w: 50, parts: [{ seg: [0, 0, 0, CAP] }, { seg: [0, CAP, 46, CAP] }] },
  O: { w: 60, parts: [{ arc: [30, CAP / 2, 30, CAP / 2] }] },
  K: {
    w: 52,
    parts: [
      { seg: [0, 0, 0, CAP] },
      { seg: [0, CAP * 0.55, 46, 0] },
      { seg: [0, CAP * 0.5, 50, CAP] },
    ],
  },
  A: {
    w: 58,
    parts: [
      { seg: [2, CAP, 29, 0] },
      { seg: [29, 0, 56, CAP] },
      { seg: [13, CAP * 0.68, 45, CAP * 0.68] },
    ],
  },
  D: {
    w: 56,
    parts: [
      { seg: [0, 0, 0, CAP] },
      { seg: [0, 0, 14, 0] },
      { seg: [0, CAP, 14, CAP] },
      { arc: [14, CAP / 2, 40, CAP / 2], halfRight: true },
    ],
  },
  I: { w: 16, parts: [{ seg: [8, 0, 8, CAP] }] },
};

const WORD = 'LOKADIA';
const wordWidth =
  [...WORD].reduce((sum, ch) => sum + GLYPHS[ch].w, 0) + GAP * (WORD.length - 1);
const WORD_X = (W - wordWidth) / 2;
const WORD_Y = 440;      // haut des capitales

/** Formes du mot, en coordonnées image, avec leur boîte englobante. */
const shapes = [];
{
  let x = WORD_X;
  for (const ch of WORD) {
    const glyph = GLYPHS[ch];
    for (const part of glyph.parts) {
      if (part.seg) {
        const [x1, y1, x2, y2] = part.seg;
        shapes.push({
          kind: 'seg',
          a: [x + x1, WORD_Y + y1],
          b: [x + x2, WORD_Y + y2],
          box: [
            Math.min(x + x1, x + x2) - STROKE,
            Math.min(WORD_Y + y1, WORD_Y + y2) - STROKE,
            Math.max(x + x1, x + x2) + STROKE,
            Math.max(WORD_Y + y1, WORD_Y + y2) + STROKE,
          ],
        });
      } else {
        const [cx, cy, rx, ry] = part.arc;
        shapes.push({
          kind: 'arc',
          c: [x + cx, WORD_Y + cy],
          r: [rx, ry],
          halfRight: !!part.halfRight,
          box: [
            x + cx - rx - STROKE,
            WORD_Y + cy - ry - STROKE,
            x + cx + rx + STROKE,
            WORD_Y + cy + ry + STROKE,
          ],
        });
      }
    }
    x += glyph.w + GAP;
  }
}

/** Couverture d'encre du mot en (x, y), entre 0 et 1. */
function wordCoverage(x, y) {
  let best = Infinity;
  for (const shape of shapes) {
    const [x0, y0, x1, y1] = shape.box;
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    let d;
    if (shape.kind === 'seg') {
      d = distSegment(x, y, shape.a[0], shape.a[1], shape.b[0], shape.b[1]) - STROKE / 2;
    } else {
      if (shape.halfRight && x < shape.c[0]) continue;
      d = Math.abs(distEllipse(x, y, shape.c[0], shape.c[1], shape.r[0], shape.r[1])) - STROKE / 2;
    }
    if (d < best) best = d;
  }
  return Math.max(0, Math.min(1, 0.5 - best));
}

// ─── Composition ───
const px = Buffer.alloc(W * H * 4);
const SS = 4;   // sur-échantillonnage, uniquement pour le pin

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // Fond : dégradé diagonal du navy de marque vers un navy profond
    const t = (x / W) * 0.35 + (y / H) * 0.65;
    const bg = [
      NAVY[0] + (NAVY_DEEP[0] - NAVY[0]) * t,
      NAVY[1] + (NAVY_DEEP[1] - NAVY[1]) * t,
      NAVY[2] + (NAVY_DEEP[2] - NAVY[2]) * t,
    ];

    let ink = wordCoverage(x + 0.5, y + 0.5);

    // Pin : test booléen sur-échantillonné, limité à sa boîte
    if (
      ink < 1 &&
      x >= PIN.cx - PIN.r - 2 && x <= PIN.cx + PIN.r + 2 &&
      y >= PIN.cy - PIN.r - 2 && y <= PIN.tipY + 2
    ) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          if (inPin(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS)) hits++;
        }
      }
      ink = Math.max(ink, hits / (SS * SS));
    }

    // Filet sous le mot, discret
    if (y >= 556 && y < 560 && x >= 540 && x < 660) ink = Math.max(ink, 0.55);

    const i = (y * W + x) * 4;
    px[i] = Math.round(bg[0] + (WHITE[0] - bg[0]) * ink);
    px[i + 1] = Math.round(bg[1] + (WHITE[1] - bg[1]) * ink);
    px[i + 2] = Math.round(bg[2] + (WHITE[2] - bg[2]) * ink);
    px[i + 3] = 255;
  }
}

mkdirSync(dirname(OUT), { recursive: true });
const png = encodePng(W, H, px);
writeFileSync(OUT, png);
console.log(`og-default.png  ${W}×${H}  ${(png.length / 1024).toFixed(1)} ko`);
