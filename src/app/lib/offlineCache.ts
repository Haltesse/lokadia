/**
 * offlineCache — persistance locale horodatée des données essentielles.
 *
 * Contrainte produit : le voyageur n'a pas toujours de réseau. Doivent
 * rester consultables hors-ligne, après un premier chargement — Lokascore
 * et bandes de risque, formalités déjà ouvertes, alertes récentes, voyage
 * sauvegardé.
 *
 * Chaque entrée porte sa date de capture : c'est ce qui permet d'afficher
 * « données du JJ/MM » plutôt que de faire passer du cache pour du direct.
 *
 * Stockage : localStorage (survit à la fermeture de l'onglet, contrairement
 * à sessionStorage). Quota ~5 Mo → chaque espace de noms est plafonné et
 * purgé par ancienneté (les entrées les plus vieilles partent d'abord).
 */

export type CacheNamespace = 'lokascore' | 'alerts' | 'formalities' | 'weather';

export interface CachedEntry<T> {
  value: T;
  /** Date de capture (ISO) — affichée à l'utilisateur */
  capturedAt: string;
  /** Ancienneté en millisecondes au moment de la lecture */
  ageMs: number;
}

interface StoredEntry<T> {
  v: T;
  t: number;
}

const PREFIX = 'lokadia_cache_v1:';
/** Au-delà, la donnée n'est plus proposée même hors-ligne (trop vieille). */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
const MAX_ENTRIES: Record<CacheNamespace, number> = {
  lokascore: 200,
  alerts: 60,
  formalities: 120,
  weather: 60,
};

function storageKey(ns: CacheNamespace): string {
  return `${PREFIX}${ns}`;
}

function readNamespace<T>(ns: CacheNamespace): Record<string, StoredEntry<T>> {
  try {
    const raw = localStorage.getItem(storageKey(ns));
    return raw ? (JSON.parse(raw) as Record<string, StoredEntry<T>>) : {};
  } catch {
    return {};
  }
}

function writeNamespace<T>(ns: CacheNamespace, data: Record<string, StoredEntry<T>>): void {
  try {
    localStorage.setItem(storageKey(ns), JSON.stringify(data));
  } catch {
    // Quota dépassé : on repart d'un espace vide plutôt que de laisser
    // l'écriture échouer silencieusement à chaque appel suivant.
    try {
      localStorage.removeItem(storageKey(ns));
    } catch {
      // Stockage totalement indisponible (navigation privée stricte) :
      // l'app fonctionne, simplement sans cache hors-ligne.
    }
  }
}

/** Écrit une entrée et purge l'espace de noms si nécessaire. */
export function cacheWrite<T>(ns: CacheNamespace, key: string, value: T): void {
  const data = readNamespace<T>(ns);
  data[key] = { v: value, t: Date.now() };

  const keys = Object.keys(data);
  if (keys.length > MAX_ENTRIES[ns]) {
    // Purge par ancienneté : les entrées les plus vieilles disparaissent
    keys
      .sort((a, b) => data[a].t - data[b].t)
      .slice(0, keys.length - MAX_ENTRIES[ns])
      .forEach((k) => delete data[k]);
  }

  writeNamespace(ns, data);
}

/**
 * Lit une entrée. Renvoie null si absente ou périmée au-delà de 30 jours.
 * L'appelant décide si l'ancienneté est acceptable selon le contexte
 * (en ligne : on rafraîchit ; hors-ligne : on affiche avec sa date).
 */
export function cacheRead<T>(ns: CacheNamespace, key: string): CachedEntry<T> | null {
  const data = readNamespace<T>(ns);
  const entry = data[key];
  if (!entry) return null;

  const ageMs = Date.now() - entry.t;
  if (ageMs > MAX_AGE_MS) return null;

  return { value: entry.v, capturedAt: new Date(entry.t).toISOString(), ageMs };
}

/** Vide un espace de noms (ou tout le cache si aucun n'est précisé). */
export function cacheClear(ns?: CacheNamespace): void {
  const targets: CacheNamespace[] = ns
    ? [ns]
    : (Object.keys(MAX_ENTRIES) as CacheNamespace[]);
  for (const n of targets) {
    try {
      localStorage.removeItem(storageKey(n));
    } catch {
      // Rien à faire : le cache est déjà inaccessible
    }
  }
}

/** Date de capture la plus récente d'un espace de noms (pour l'indicateur global). */
export function cacheLastUpdate(ns: CacheNamespace): Date | null {
  const data = readNamespace<unknown>(ns);
  const times = Object.values(data).map((e) => e.t);
  return times.length > 0 ? new Date(Math.max(...times)) : null;
}

/**
 * Formatage court et lisible de la date de capture.
 *
 * Le résultat se lit derrière « enregistrées … » ou « Données … » :
 * « aujourd'hui à 16:15 », « hier à 09:02 », « le 13 août ».
 */
export function formatCaptureDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const today = new Date();

  if (d.toDateString() === today.toDateString()) return `aujourd'hui à ${heure}`;

  const yesterday = new Date(today.getTime() - 86_400_000);
  if (d.toDateString() === yesterday.toDateString()) return `hier à ${heure}`;

  return `le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
}
