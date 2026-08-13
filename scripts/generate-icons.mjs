/**
 * Génère les icônes PNG de la PWA à partir de la forme vectorielle de
 * `public/lokadia-icon.svg`, sans aucune dépendance : la forme est décrite
 * analytiquement et rastérisée avec anti-crénelage (4×4 sur-échantillons),
 * puis encodée en PNG via le zlib de Node.
 *
 * Lancer après toute modification de l'icône :  node scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const NAVY = [15, 76, 129];      // #0F4C81
const WHITE = [255, 255, 255];

/** Coordonnées de la forme, exprimées dans le viewBox 512×512 du SVG. */
const VB = 512;
const RADIUS = 112;              // rayon des coins de la vignette
const PIN_CX = 256, PIN_CY = 216, PIN_R = 112;   // tête du pin
const PIN_TIP_Y = 408;                            // pointe du pin
const HOLE_R = 46;                                // trou central

/** Le point est-il dans le rectangle arrondi (padding = marge extérieure) ? */
function inRoundedRect(x, y, pad) {
  const min = pad, max = VB - pad, r = Math.max(0, RADIUS - pad);
  if (x < min || x > max || y < min || y > max) return false;
  const dx = Math.max(min + r - x, 0, x - (max - r));
  const dy = Math.max(min + r - y, 0, y - (max - r));
  return dx * dx + dy * dy <= r * r;
}

/**
 * Le point est-il dans la silhouette du pin ? Tête circulaire, prolongée
 * d'un triangle jusqu'à la pointe, tangent au cercle.
 */
function inPin(x, y) {
  const dx = x - PIN_CX, dy = y - PIN_CY;
  if (dx * dx + dy * dy <= PIN_R * PIN_R) return true;
  if (y < PIN_CY || y > PIN_TIP_Y) return false;
  // Largeur qui décroît linéairement du cercle vers la pointe
  const t = (y - PIN_CY) / (PIN_TIP_Y - PIN_CY);
  const halfWidth = PIN_R * (1 - t);
  return Math.abs(dx) <= halfWidth;
}

function inHole(x, y) {
  const dx = x - PIN_CX, dy = y - PIN_CY;
  return dx * dx + dy * dy <= HOLE_R * HOLE_R;
}

/**
 * Rastérise l'icône.
 * @param size côté en pixels
 * @param safePadRatio marge de sécurité (icônes maskable : 0.1 → zone sûre)
 * @param fullBleed true = fond navy sur tout le carré (maskable)
 */
function raster(size, { safePadRatio = 0, fullBleed = false } = {}) {
  const SS = 4;                       // sur-échantillonnage
  const px = Buffer.alloc(size * size * 4);
  const scale = VB / size;
  // Marge : rétrécit la forme pour qu'elle tienne dans la zone sûre
  const shrink = 1 - safePadRatio * 2;
  const offset = (VB * safePadRatio);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgHits = 0, fgHits = 0, samples = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const vx = (x + (sx + 0.5) / SS) * scale;
          const vy = (y + (sy + 0.5) / SS) * scale;
          // Coordonnée dans le repère de la forme (avec marge de sécurité)
          const fx = (vx - offset) / shrink;
          const fy = (vy - offset) / shrink;
          samples++;
          if (fullBleed || inRoundedRect(vx, vy, 0)) bgHits++;
          if (inPin(fx, fy) && !inHole(fx, fy)) fgHits++;
        }
      }
      const bgA = bgHits / samples;
      const fgA = fgHits / samples;
      const i = (y * size + x) * 4;
      // Composition : pin blanc sur fond navy, le tout sur transparent
      const alpha = Math.max(bgA, fgA);
      if (alpha === 0) { px[i + 3] = 0; continue; }
      const mix = fgA;                       // part de blanc
      px[i] = Math.round(NAVY[0] * (1 - mix) + WHITE[0] * mix);
      px[i + 1] = Math.round(NAVY[1] * (1 - mix) + WHITE[1] * mix);
      px[i + 2] = Math.round(NAVY[2] * (1 - mix) + WHITE[2] * mix);
      px[i + 3] = Math.round(alpha * 255);
    }
  }
  return px;
}

// ─── Encodage PNG (RGBA, filtre 0) ───
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;    // profondeur 8 bits
  ihdr[9] = 6;    // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;  // filtre None
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });

const TARGETS = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  // Maskable : fond plein bord à bord, forme dans la zone sûre (80 %)
  { file: 'icon-maskable-512.png', size: 512, opts: { safePadRatio: 0.1, fullBleed: true } },
  // iOS n'affiche pas la transparence : fond plein également
  { file: 'apple-touch-icon.png', size: 180, opts: { fullBleed: true } },
];

for (const { file, size, opts } of TARGETS) {
  const png = encodePng(size, raster(size, opts));
  writeFileSync(join(OUT_DIR, file), png);
  console.log(`${file.padEnd(26)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} ko`);
}
