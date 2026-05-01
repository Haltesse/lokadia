/**
 * DestinationImage — image de destination avec fallback Wikipedia automatique.
 *
 * Stratégie en 3 étages :
 *   1. Tente l'URL fournie (Unsplash de la base de données)
 *   2. Si échec → fetch Wikipedia REST API summary → utilise le thumbnail officiel
 *   3. Si encore échec → gradient coloré stylé avec initiale ville (jamais de placeholder gris moche)
 *
 * Wikipedia REST API : libre, sans clé, CORS-friendly.
 *   https://en.wikipedia.org/api/rest_v1/page/summary/<title>
 *
 * Cache mémoire pour éviter de re-fetcher la même ville.
 */
import { useEffect, useRef, useState } from 'react';

interface Props {
  src?: string;
  alt: string;
  cityName: string;
  countryName?: string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Si true, tente Wikipedia EN PREMIER (image iconique du lieu)
   * et bascule sur `src` (Unsplash) seulement en fallback.
   * Idéal pour les destinations populaires : la tour Eiffel pour Paris,
   * le Manneken-Pis pour Bruxelles, etc.
   */
  preferWikipedia?: boolean;
}

// Cache des thumbnails Wikipedia déjà résolus (évite fetch en double)
const wikiThumbCache = new Map<string, string | null>();
const wikiInflight = new Map<string, Promise<string | null>>();

/**
 * Filtre les images Wikipedia non-photographiques :
 *   - Drapeaux (Flag of, drapeau, *flag*)
 *   - Blasons / armoiries (coat of arms, blason, COA, escudo, wappen)
 *   - SVG (presque toujours des emblèmes vectoriels, pas des paysages)
 *   - Cartes (locator map, location map)
 * Pour un visiteur, ces images cassent l'esthétique d'une carte de destination.
 */
function isAcceptableImage(url: string): boolean {
  const lower = url.toLowerCase();
  // SVG = presque toujours emblème/drapeau/blason
  if (lower.endsWith('.svg') || lower.endsWith('.svg.png')) return false;
  if (
    lower.includes('flag_of') ||
    lower.includes('flag-of') ||
    lower.includes('/flag') ||
    lower.includes('drapeau') ||
    lower.includes('coat_of_arms') ||
    lower.includes('coat-of-arms') ||
    lower.includes('blason') ||
    lower.includes('armoiries') ||
    lower.includes('escudo') ||
    lower.includes('wappen') ||
    lower.includes('coa_') ||
    lower.includes('locator_map') ||
    lower.includes('location_map') ||
    lower.includes('locatormap')
  ) {
    return false;
  }
  return true;
}

async function fetchWikipediaThumb(
  cityName: string,
  countryName?: string,
): Promise<string | null> {
  const key = `${cityName}|${countryName || ''}`;
  if (wikiThumbCache.has(key)) return wikiThumbCache.get(key)!;

  const existing = wikiInflight.get(key);
  if (existing) return existing;

  // On tente plusieurs requêtes pour maximiser la chance d'avoir
  // une vraie photo et pas un emblème :
  //   1. "Ville, Pays" en FR (souvent désambiguïse vers la fiche ville)
  //   2. "Ville" en FR
  //   3. "Ville, Pays" en EN
  //   4. "Ville" en EN
  const queries: Array<{ lang: 'fr' | 'en'; title: string }> = [];
  if (countryName) {
    queries.push({ lang: 'fr', title: `${cityName}, ${countryName}` });
  }
  queries.push({ lang: 'fr', title: cityName });
  if (countryName) {
    queries.push({ lang: 'en', title: `${cityName}, ${countryName}` });
  }
  queries.push({ lang: 'en', title: cityName });

  const promise = (async (): Promise<string | null> => {
    for (const q of queries) {
      try {
        const title = encodeURIComponent(q.title.replace(/\s+/g, '_'));
        const url = `https://${q.lang}.wikipedia.org/api/rest_v1/page/summary/${title}?redirect=true`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const thumb = data?.thumbnail?.source || data?.originalimage?.source;
        if (thumb && typeof thumb === 'string' && isAcceptableImage(thumb)) {
          // Upgrade le thumb à une résolution lisible (Wikipedia sert 320px par défaut)
          const upgraded = thumb.replace(/\/\d+px-/, '/800px-');
          return upgraded;
        }
      } catch {
        // ignore et passe à la requête suivante
      }
    }
    return null;
  })();

  wikiInflight.set(key, promise);
  const result = await promise;
  wikiThumbCache.set(key, result);
  wikiInflight.delete(key);
  return result;
}

// Couleurs déterministes par ville pour le placeholder de dernier recours
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
];

function gradientForCity(city: string): string {
  let hash = 0;
  for (let i = 0; i < city.length; i++) {
    hash = (hash << 5) - hash + city.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length];
}

// Stages :
//   wiki-first → wikipedia → primary → fallback   (mode preferWikipedia)
//   primary → wikipedia → fallback                (mode classique)
type Stage = 'wiki-first' | 'wikipedia' | 'primary' | 'fallback';

export function DestinationImage({
  src,
  alt,
  cityName,
  countryName,
  className,
  style,
  preferWikipedia = false,
}: Props) {
  const initialStage: Stage = preferWikipedia
    ? 'wiki-first'
    : (src ? 'primary' : 'wikipedia');
  const [stage, setStage] = useState<Stage>(initialStage);
  const [wikiUrl, setWikiUrl] = useState<string | null>(null);
  const wikiAttemptedRef = useRef(false);

  // Reset si la ville change
  useEffect(() => {
    wikiAttemptedRef.current = false;
    setWikiUrl(null);
    setStage(preferWikipedia ? 'wiki-first' : (src ? 'primary' : 'wikipedia'));
  }, [cityName, countryName, src, preferWikipedia]);

  // Quand on est en mode wiki-first ou wikipedia, on fetche
  useEffect(() => {
    if (stage !== 'wiki-first' && stage !== 'wikipedia') return;
    if (wikiAttemptedRef.current) return;
    wikiAttemptedRef.current = true;

    let cancelled = false;
    fetchWikipediaThumb(cityName, countryName).then((url) => {
      if (cancelled) return;
      if (url) {
        setWikiUrl(url);
      } else {
        // Wikipedia n'a rien : tente la src fournie, sinon fallback
        if (stage === 'wiki-first' && src) setStage('primary');
        else setStage('fallback');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [stage, cityName, countryName, src]);

  if (stage === 'fallback') {
    const initial = cityName.charAt(0).toUpperCase();
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
        style={{ background: gradientForCity(cityName), ...style }}
      >
        <span className="text-6xl font-bold text-white/80 drop-shadow-lg">
          {initial}
        </span>
      </div>
    );
  }

  // En wiki-first/wikipedia, on attend wikiUrl. En primary, on utilise src.
  const currentSrc =
    stage === 'wiki-first' || stage === 'wikipedia' ? wikiUrl : src;

  if (!currentSrc) {
    // En attente du fetch Wikipedia → skeleton stylé
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${className ?? ''}`}
        style={style}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => {
        if (stage === 'wiki-first') {
          // L'image Wikipedia a échoué de chargement → tente src
          if (src) setStage('primary');
          else setStage('fallback');
        } else if (stage === 'primary') {
          setStage('wikipedia');
        } else {
          setStage('fallback');
        }
      }}
    />
  );
}
