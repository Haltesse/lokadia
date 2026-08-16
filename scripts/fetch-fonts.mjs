/**
 * Rapatrie la police Inter (SIL Open Font License 1.1) dans `public/fonts`
 * et régénère `src/styles/fonts.css`.
 *
 *   node scripts/fetch-fonts.mjs
 *
 * Pourquoi auto-héberger. Charger la police depuis fonts.googleapis.com
 * envoie l'adresse IP de chaque visiteur à Google, sans son consentement
 * et sans que ce transfert soit nécessaire au service : c'est exactement
 * le cas jugé non conforme au RGPD (LG München, janvier 2022). En prime,
 * cela supprime deux connexions à un tiers dans le chemin critique du
 * premier rendu et permet de retirer Google de la politique de sécurité
 * de contenu.
 *
 * Le script demande la feuille de style avec un en-tête de navigateur
 * moderne pour obtenir les fichiers woff2 variables, puis réécrit les
 * `src:` vers les fichiers locaux. Les plages Unicode sont conservées
 * telles quelles : le navigateur ne télécharge que les sous-ensembles
 * dont la page a besoin.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = join(ROOT, 'public', 'fonts');
const CSS_OUT = join(ROOT, 'src', 'styles', 'fonts.css');

// Police variable : un seul fichier par sous-ensemble couvre 400 → 800.
const CSS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400..800&display=swap';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const css = await fetch(CSS_URL, { headers: { 'User-Agent': UA } }).then((r) => {
  if (!r.ok) throw new Error(`Feuille de style indisponible : HTTP ${r.status}`);
  return r.text();
});

mkdirSync(FONT_DIR, { recursive: true });

const blocks = css.split('@font-face').slice(1);
const out = [];
let downloaded = 0;

for (const block of blocks) {
  const subset = /\/\*\s*([a-z-]+)\s*\*\//.exec(css.slice(0, css.indexOf(block)).split('/*').pop() ?? '');
  const nameMatch = /\/\*\s*([a-z0-9-]+)\s*\*\/\s*$/i.exec(
    css.slice(0, css.indexOf(`@font-face${block}`)),
  );
  const label = (nameMatch?.[1] ?? subset?.[1] ?? `subset-${out.length}`).trim();
  const urlMatch = /url\((https:\/\/[^)]+\.woff2)\)/.exec(block);
  const rangeMatch = /unicode-range:\s*([^;]+);/.exec(block);
  const weightMatch = /font-weight:\s*([^;]+);/.exec(block);
  if (!urlMatch) continue;

  const file = `inter-${label}.woff2`;
  const bytes = Buffer.from(
    await fetch(urlMatch[1], { headers: { 'User-Agent': UA } }).then((r) => {
      if (!r.ok) throw new Error(`Fichier de police indisponible : HTTP ${r.status}`);
      return r.arrayBuffer();
    }),
  );
  writeFileSync(join(FONT_DIR, file), bytes);
  downloaded++;
  console.log(`${file.padEnd(28)} ${(bytes.length / 1024).toFixed(1)} ko`);

  out.push(
    [
      '@font-face {',
      "  font-family: 'Inter';",
      '  font-style: normal;',
      `  font-weight: ${(weightMatch?.[1] ?? '400 800').trim()};`,
      '  font-display: swap;',
      `  src: url('/fonts/${file}') format('woff2');`,
      rangeMatch ? `  unicode-range: ${rangeMatch[1].trim()};` : null,
      '}',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

const header = `/**
 * Police Inter auto-hébergée — SIL Open Font License 1.1.
 *
 * Fichier GÉNÉRÉ par \`node scripts/fetch-fonts.mjs\` : ne pas modifier à
 * la main. Les fichiers woff2 sont dans \`public/fonts\`, servis depuis
 * notre propre domaine — aucune requête vers Google, donc aucune adresse
 * IP de visiteur transmise à un tiers.
 */

`;

writeFileSync(CSS_OUT, header + out.join('\n\n') + '\n');
console.log(`\n${downloaded} sous-ensembles écrits dans public/fonts, fonts.css régénéré.`);
