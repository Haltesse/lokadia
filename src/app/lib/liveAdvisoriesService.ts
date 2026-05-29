/**
 * Live Advisories Service — appels aux Edge Functions Supabase pour
 * récupérer les advisories officielles MAE / US State / OMS en temps réel.
 *
 * À activer UNE FOIS que les Edge Functions `advisories-mae`,
 * `advisories-us-state` et `advisories-who` sont déployées sur Supabase
 * (cf. supabase/functions/README.md).
 *
 * Tant que les fonctions ne sont pas déployées, le service tombe silencieusement
 * en erreur et le système continue de fonctionner avec les valeurs curées
 * statiques de countryRiskData.ts.
 */

import { COUNTRY_RISK_DATA, type MaeLevel, type FcdoLevel, type UsStateLevel } from '../data/countryRiskData';

// ─── Mapping pays → slug France Diplomatie ────────────────────────────────
// Tous les slugs nécessaires pour appeler /advisories-mae?country={slug}
const ISO_TO_MAE_SLUG: Record<string, string> = {
  FR: 'france', DE: 'allemagne', ES: 'espagne', IT: 'italie', GB: 'royaume-uni',
  PT: 'portugal', NL: 'pays-bas', BE: 'belgique', CH: 'suisse', AT: 'autriche',
  IE: 'irlande', SE: 'suede', NO: 'norvege', DK: 'danemark', FI: 'finlande',
  IS: 'islande', PL: 'pologne', CZ: 'republique-tcheque', GR: 'grece',
  RU: 'russie', TR: 'turquie', US: 'etats-unis-d-amerique', CA: 'canada',
  MX: 'mexique', BR: 'bresil', AR: 'argentine', MA: 'maroc', EG: 'egypte',
  AE: 'emirats-arabes-unis', IL: 'israel-territoires-palestiniens',
  ZA: 'afrique-du-sud', JP: 'japon', CN: 'chine', HK: 'hong-kong',
  KR: 'coree-du-sud', TH: 'thailande', SG: 'singapour', MY: 'malaisie',
  ID: 'indonesie', IN: 'inde', AU: 'australie', VN: 'vietnam',
  PH: 'philippines', TW: 'taiwan', CL: 'chili', CO: 'colombie', PE: 'perou',
  UY: 'uruguay', KE: 'kenya', TN: 'tunisie', JO: 'jordanie',
  SA: 'arabie-saoudite', QA: 'qatar', NZ: 'nouvelle-zelande',
  HU: 'hongrie', RO: 'roumanie', HR: 'croatie', SI: 'slovenie',
  SK: 'slovaquie', EE: 'estonie',
};

interface LiveAdvisoriesResult {
  mae?: MaeLevel;
  fcdo?: FcdoLevel;
  usState?: UsStateLevel;
  whoActiveAlerts?: number;
  lastUpdate: number;
}

// ─── Mapping ISO → slug UK FCDO ────────────────────────────────────────────
// Tous les slugs nécessaires pour appeler /advisories-fcdo?country={slug}
const ISO_TO_FCDO_SLUG: Record<string, string> = {
  FR: 'france', DE: 'germany', ES: 'spain', IT: 'italy', PT: 'portugal',
  NL: 'netherlands', BE: 'belgium', CH: 'switzerland', AT: 'austria',
  IE: 'ireland', SE: 'sweden', NO: 'norway', DK: 'denmark', FI: 'finland',
  IS: 'iceland', PL: 'poland', CZ: 'czech-republic', GR: 'greece',
  RU: 'russia', TR: 'turkey', US: 'usa', CA: 'canada', MX: 'mexico',
  BR: 'brazil', AR: 'argentina', MA: 'morocco', EG: 'egypt',
  AE: 'united-arab-emirates', IL: 'israel', ZA: 'south-africa',
  JP: 'japan', CN: 'china', HK: 'hong-kong', KR: 'south-korea',
  TH: 'thailand', SG: 'singapore', MY: 'malaysia', ID: 'indonesia',
  IN: 'india', AU: 'australia', VN: 'vietnam', PH: 'philippines',
  TW: 'taiwan', CL: 'chile', CO: 'colombia', PE: 'peru', UY: 'uruguay',
  KE: 'kenya', TN: 'tunisia', JO: 'jordan', SA: 'saudi-arabia',
  QA: 'qatar', NZ: 'new-zealand', HU: 'hungary', RO: 'romania',
  HR: 'croatia', SI: 'slovenia', SK: 'slovakia', EE: 'estonia',
};

const SESSION_KEY = 'lokadia_live_advisories_v1';
const CACHE_DURATION = 60 * 60 * 1000; // 1h
const cache = new Map<string, LiveAdvisoriesResult>();

// Hydratation depuis sessionStorage au démarrage
if (typeof window !== 'undefined') {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Record<string, LiveAdvisoriesResult>;
      for (const [iso, val] of Object.entries(stored)) {
        if (Date.now() - val.lastUpdate < CACHE_DURATION) {
          cache.set(iso, val);
        }
      }
    }
  } catch {
    // Ignore
  }
}

function persistCache(): void {
  try {
    const obj = Object.fromEntries(cache);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(obj));
  } catch {
    // Ignore
  }
}

/** Récupère l'URL de base des Edge Functions Supabase */
async function getEdgeFunctionsBaseUrl(): Promise<string> {
  const { projectId } = await import('../../../utils/supabase/info');
  return `https://${projectId}.supabase.co/functions/v1`;
}

/** Récupère le supabase anon key pour authentifier les appels */
async function getAnonKey(): Promise<string> {
  const { publicAnonKey } = await import('../../../utils/supabase/info');
  return publicAnonKey;
}

/**
 * Appelle l'Edge Function MAE pour un pays. Retourne null si la fonction
 * n'est pas déployée ou si elle a échoué.
 */
async function fetchMaeAdvisory(iso: string): Promise<MaeLevel | null> {
  const slug = ISO_TO_MAE_SLUG[iso];
  if (!slug) return null;
  try {
    const baseUrl = await getEdgeFunctionsBaseUrl();
    const key = await getAnonKey();
    const url = `${baseUrl}/advisories-mae?country=${slug}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { level: string };
    if (data.level === 'unknown') return null;
    if (['vert', 'jaune', 'orange', 'rouge', 'noir'].includes(data.level)) {
      return data.level as MaeLevel;
    }
    return null;
  } catch {
    return null;
  }
}

/** Appelle l'Edge Function UK FCDO */
async function fetchFcdoAdvisory(iso: string): Promise<FcdoLevel | null> {
  const slug = ISO_TO_FCDO_SLUG[iso];
  if (!slug) return null;
  try {
    const baseUrl = await getEdgeFunctionsBaseUrl();
    const key = await getAnonKey();
    const url = `${baseUrl}/advisories-fcdo?country=${slug}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { level: string };
    if (data.level === 'unknown') return null;
    if (['none', 'advisory', 'essential', 'donottravel'].includes(data.level)) {
      return data.level as FcdoLevel;
    }
    return null;
  } catch {
    return null;
  }
}

/** Appelle l'Edge Function US State Department */
async function fetchUsStateAdvisory(iso: string): Promise<UsStateLevel | null> {
  try {
    const baseUrl = await getEdgeFunctionsBaseUrl();
    const key = await getAnonKey();
    const url = `${baseUrl}/advisories-us-state?country=${iso}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { level: number | null };
    if (data.level === null) return null;
    if (data.level >= 1 && data.level <= 4) {
      return data.level as UsStateLevel;
    }
    return null;
  } catch {
    return null;
  }
}

/** Appelle l'Edge Function WHO Disease Outbreak News */
async function fetchWhoAdvisory(iso: string): Promise<number | null> {
  try {
    const baseUrl = await getEdgeFunctionsBaseUrl();
    const key = await getAnonKey();
    const url = `${baseUrl}/advisories-who?country=${iso}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { activeAlertCount: number };
    return data.activeAlertCount;
  } catch {
    return null;
  }
}

/**
 * Récupère TOUTES les advisories live pour un pays donné, en parallèle.
 * Fusionne avec les valeurs cached + retourne les valeurs effectives à utiliser.
 *
 * Si les Edge Functions ne sont pas déployées (404), retourne les valeurs
 * du dataset statique (countryRiskData.ts) en fallback transparent.
 */
export async function getLiveAdvisoriesForCountry(iso: string): Promise<LiveAdvisoriesResult | null> {
  // 1. Check cache
  const cached = cache.get(iso);
  if (cached && Date.now() - cached.lastUpdate < CACHE_DURATION) {
    return cached;
  }

  // 2. Fetch les 4 sources en parallèle
  const [mae, fcdo, usState, whoAlerts] = await Promise.all([
    fetchMaeAdvisory(iso),
    fetchFcdoAdvisory(iso),
    fetchUsStateAdvisory(iso),
    fetchWhoAdvisory(iso),
  ]);

  // 3. Si tout est null, on retourne null (les Edge Functions sont down ou pas déployées)
  if (mae === null && fcdo === null && usState === null && whoAlerts === null) {
    return null;
  }

  // 4. Stocker le résultat
  const result: LiveAdvisoriesResult = {
    mae: mae ?? undefined,
    fcdo: fcdo ?? undefined,
    usState: usState ?? undefined,
    whoActiveAlerts: whoAlerts ?? undefined,
    lastUpdate: Date.now(),
  };
  cache.set(iso, result);
  persistCache();
  return result;
}

/**
 * Fusionne les advisories live dans les données pays.
 * Appelé au moment du calcul des dimensions Lokascore.
 *
 * Comportement :
 *  - Si une valeur live existe (MAE, US State, OMS), elle remplace la valeur curée
 *  - Sinon, on garde la valeur curée du dataset statique
 *  - Si rien n'est dispo (live + static), la dimension utilise un fallback Numbeo
 */
export function mergeLiveAdvisoriesWithStatic(iso: string, live: LiveAdvisoriesResult | null): typeof COUNTRY_RISK_DATA[string] | null {
  const staticData = COUNTRY_RISK_DATA[iso];
  if (!live) return staticData ?? null;
  return {
    ...staticData,
    iso,
    name: staticData?.name ?? iso,
    mae: live.mae ?? staticData?.mae,
    fcdo: live.fcdo ?? staticData?.fcdo,
    usState: live.usState ?? staticData?.usState,
    whoActiveAlerts: live.whoActiveAlerts ?? staticData?.whoActiveAlerts,
  };
}
