/**
 * Vérificateur des liens officiels.
 *
 *   npm run check:links
 *
 * Pourquoi ce script existe. Tout le produit repose sur une promesse : la
 * source officielle est à un clic. Un lien mort casse cette promesse au
 * pire moment — celui où quelqu'un vérifie s'il peut entrer dans un pays.
 * Or les ministères réorganisent leurs sites sans prévenir : c'est
 * exactement comme ça que le lien « États-Unis » du ministère français
 * était devenu une 404 (`etats-unis-d-amerique` → `etats-unis`).
 *
 * Trois verdicts, et la distinction compte :
 *   OK          la page répond ;
 *   INTROUVABLE 404/410 — le lien est cassé, il faut le corriger ;
 *   NON VÉRIFIÉ 403 ou connexion refusée — le serveur bloque les robots
 *               (travel.state.gov, eda.admin.ch, smartraveller). Ce n'est
 *               pas une preuve d'absence : l'adresse est validée à la main
 *               et marquée `botProtected` dans les données.
 *
 * Le script lit les mêmes tables que l'application (extraites du TypeScript
 * par expression régulière, pour rester sans dépendance ni étape de
 * compilation).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const MAE_BASE =
  'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination';

/** Pays exclus des fiches OMS, tels que déclarés par l'application. */
function readWithoutWhoProfile() {
  const source = readFileSync(join(ROOT, 'src/app/lib/officialSources.ts'), 'utf8');
  const declared = /const WITHOUT_WHO_PROFILE = new Set\(\[([^\]]*)\]\)/.exec(source);
  if (!declared) return new Set();
  return new Set([...declared[1].matchAll(/'([A-Z]{2})'/g)].map((m) => m[1]));
}

/** Lit les slugs France Diplomatie déclarés dans la table pays. */
function readCountryTargets() {
  const source = readFileSync(join(ROOT, 'src/app/data/countries.ts'), 'utf8');
  const withoutWho = readWithoutWhoProfile();
  const targets = [];
  const entry = /iso2: '([A-Z]{2})', nameFr: '([^']+)', maeSlug: (null|'[a-z0-9-]+')/g;
  let match;
  while ((match = entry.exec(source)) !== null) {
    const [, iso2, nameFr, rawSlug] = match;
    if (rawSlug !== 'null') {
      targets.push({
        group: 'France Diplomatie',
        label: nameFr,
        url: `${MAE_BASE}/${rawSlug.slice(1, -1)}/`,
      });
    }
    // Fiche pays de l'OMS, indexée en ISO alpha-3
    const iso3 = ISO2_TO_ISO3[iso2];
    if (iso3 && !withoutWho.has(iso2)) {
      targets.push({
        group: 'OMS',
        label: nameFr,
        url: `https://www.who.int/countries/${iso3.toLowerCase()}`,
      });
    }
  }
  return targets;
}

/** Lit les autorités consulaires déclarées par nationalité. */
function readNationalityTargets() {
  const source = readFileSync(join(ROOT, 'src/app/data/nationalities.ts'), 'utf8');
  const targets = [];
  const blocks = source.split('iso2:').slice(1);
  for (const block of blocks) {
    const label = /label: '([^']+)'/.exec(block)?.[1];
    const url = /url: '([^']+)'/.exec(block)?.[1];
    if (!label || !url) continue;
    targets.push({
      group: 'Autorité consulaire',
      label,
      url,
      botProtected: /botProtected: true/.test(block),
    });
  }
  return targets;
}

/** Constantes de sources officielles (SOURCE_HOMEPAGES). */
function readHomepageTargets() {
  const source = readFileSync(join(ROOT, 'src/app/lib/officialSources.ts'), 'utf8');
  const block = source.slice(
    source.indexOf('export const SOURCE_HOMEPAGES'),
    source.indexOf('export function getOfficialSources'),
  );
  const targets = [];
  const entry = /(\w+):\s*'?(https:\/\/[^'\s]+)'/g;
  let match;
  while ((match = entry.exec(block)) !== null) {
    targets.push({ group: 'Source de référence', label: match[1], url: match[2] });
  }
  return targets;
}

// ISO2 → ISO3, relu depuis la table du projet
const ISO2_TO_ISO3 = (() => {
  const source = readFileSync(join(ROOT, 'src/app/lib/countryIsoMapping.ts'), 'utf8');
  const map = {};
  const entry = /([A-Z]{3}):\s*'([A-Z]{2})'/g;
  let match;
  while ((match = entry.exec(source)) !== null) map[match[2]] = match[1];
  return map;
})();

/**
 * Adresses valides que ce script ne peut pas vérifier lui-même : le serveur
 * refuse la poignée de main de Node (empreinte TLS) ou exige une
 * négociation de contenu particulière, alors qu'un navigateur — et `curl` —
 * obtiennent bien un 200. Vérifiées à la main le 18/08/2026.
 */
const MANUALLY_VERIFIED = new Set([
  'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/',
  'https://reliefweb.int/countries',
]);

async function probe(target) {
  if (MANUALLY_VERIFIED.has(target.url)) {
    return { ...target, status: 200, verdict: 'OK', manual: true };
  }

  try {
    const response = await fetch(target.url, {
      // Sans en-tête Accept, certains serveurs répondent 406 alors que la
      // page existe : on se présente comme un navigateur, pas comme un
      // client anonyme.
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
    if (response.status === 404 || response.status === 410) return { ...target, status: response.status, verdict: 'INTROUVABLE' };
    if (response.ok) return { ...target, status: response.status, verdict: 'OK' };
    return { ...target, status: response.status, verdict: 'NON VÉRIFIÉ' };
  } catch {
    return { ...target, status: 0, verdict: 'NON VÉRIFIÉ' };
  }
}

/** Exécute les sondes par lots, pour ne pas marteler les serveurs. */
async function probeAll(targets, concurrency = 6) {
  const results = [];
  for (let i = 0; i < targets.length; i += concurrency) {
    const batch = targets.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map(probe))));
    process.stdout.write(`\r  ${Math.min(i + concurrency, targets.length)}/${targets.length} vérifiés`);
  }
  process.stdout.write('\r');
  return results;
}

const targets = [
  ...readCountryTargets(),
  ...readNationalityTargets(),
  ...readHomepageTargets(),
];

console.log(`Vérification de ${targets.length} liens officiels…\n`);
const results = await probeAll(targets);

const broken = results.filter((r) => r.verdict === 'INTROUVABLE');
const unverified = results.filter((r) => r.verdict === 'NON VÉRIFIÉ');
const unexpected = unverified.filter((r) => !r.botProtected);

for (const result of broken) {
  console.log(`INTROUVABLE  ${result.group} — ${result.label}\n             ${result.url}`);
}
for (const result of unexpected) {
  console.log(`NON VÉRIFIÉ  ${result.group} — ${result.label} (HTTP ${result.status})\n             ${result.url}`);
}

console.log(
  `\n${results.length - broken.length - unverified.length} OK · ` +
    `${broken.length} introuvable(s) · ${unverified.length} non vérifié(s) ` +
    `(dont ${unverified.length - unexpected.length} bloqué(s) volontairement aux robots)`,
);

// Seuls les liens réellement cassés font échouer la vérification : une
// protection anti-robot n'est pas un défaut du produit.
process.exit(broken.length > 0 ? 1 : 0);
