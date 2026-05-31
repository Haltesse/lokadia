/**
 * Service de traduction automatique via API MyMemory (gratuite).
 *
 * Robustesse :
 *  - Cache mémoire + localStorage persistant (une phrase n'est traduite qu'une fois)
 *  - Pool de concurrence limité (MyMemory throttle au-delà de quelques req/s)
 *  - Déduplication des textes identiques dans un même batch
 *  - Timeout par requête pour ne jamais bloquer l'UI
 */

const LS_PREFIX = 'lokadia_tr_';
const MAX_CONCURRENT = 4;      // MyMemory limite fortement au-delà
const REQ_TIMEOUT = 6000;
const API_URL = 'https://api.mymemory.translated.net/get';

// Cache mémoire (chargé depuis localStorage à la demande par langue)
const memoryCache: Record<string, string> = {};
const loadedLangs = new Set<string>();

function lsKey(lang: string) { return `${LS_PREFIX}${lang}`; }

function ensureLangLoaded(lang: string) {
  if (loadedLangs.has(lang)) return;
  loadedLangs.add(lang);
  try {
    const raw = localStorage.getItem(lsKey(lang));
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, string>;
      for (const [k, v] of Object.entries(obj)) memoryCache[`${k}_${lang}`] = v;
    }
  } catch { /* ignore */ }
}

// Persistance throttlée (évite d'écrire localStorage à chaque mot)
let persistTimer: number | null = null;
function schedulePersist(lang: string) {
  if (persistTimer) return;
  persistTimer = (typeof window !== 'undefined' ? window.setTimeout : setTimeout)(() => {
    persistTimer = null;
    try {
      const out: Record<string, string> = {};
      const suffix = `_${lang}`;
      for (const [k, v] of Object.entries(memoryCache)) {
        if (k.endsWith(suffix)) out[k.slice(0, -suffix.length)] = v;
      }
      localStorage.setItem(lsKey(lang), JSON.stringify(out));
    } catch { /* quota plein → on garde juste le cache mémoire */ }
  }, 1500) as unknown as number;
}

async function fetchTranslation(text: string, targetLang: string): Promise<string> {
  const cacheKey = `${text}_${targetLang}`;
  if (memoryCache[cacheKey] !== undefined) return memoryCache[cacheKey];

  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), REQ_TIMEOUT);
    const res = await fetch(
      `${API_URL}?q=${encodeURIComponent(text)}&langpair=fr|${targetLang}`,
      { signal: ctrl.signal }
    );
    clearTimeout(to);
    const data = await res.json();
    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      const translated: string = data.responseData.translatedText;
      memoryCache[cacheKey] = translated;
      schedulePersist(targetLang);
      return translated;
    }
    // Échec API → on renvoie le texte original SANS le cacher (retry possible)
    return text;
  } catch {
    return text;
  }
}

/** Traduit un texte unique (avec cache). */
export async function translateText(text: string, targetLang: string): Promise<string> {
  ensureLangLoaded(targetLang);
  return fetchTranslation(text, targetLang);
}

/**
 * Traduit plusieurs textes avec un pool de concurrence limité.
 * Déduplique les textes identiques pour ne faire qu'un appel par phrase unique.
 */
export async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  ensureLangLoaded(targetLang);

  // Déduplication : on ne traduit chaque phrase unique qu'une fois
  const unique = Array.from(new Set(texts));
  const resultByText: Record<string, string> = {};

  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const i = cursor++;
      const t = unique[i];
      resultByText[t] = await fetchTranslation(t, targetLang);
    }
  }
  const workers = Array.from({ length: Math.min(MAX_CONCURRENT, unique.length) }, worker);
  await Promise.all(workers);

  return texts.map((t) => resultByText[t] ?? t);
}
