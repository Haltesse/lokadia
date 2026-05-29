/**
 * Edge Function : Proxy MAE France (diplomatie.gouv.fr)
 *
 * NOTE 2026 : le site MAE a été refondu en SPA JavaScript et le niveau
 * d'advisory (Vert/Jaune/Orange/Rouge/Noir) n'est plus extractible depuis
 * le HTML statique. Il est rendu côté client via une API JSON privée non
 * documentée. Le scraping nécessiterait un navigateur headless (Playwright)
 * trop coûteux pour une Edge Function.
 *
 * Stratégie actuelle :
 *   1. On essaie de détecter les alertes urgentes sur la page
 *      "dernieres-minutes-et-alertes" (qui reste rendue côté serveur)
 *   2. Si on trouve "vigilance renforcée", "déconseillé", "formellement
 *      déconseillé", on remonte le niveau correspondant
 *   3. Sinon, on retourne "unknown" et le système Lokadia tombe gracieusement
 *      sur le dataset curé countryRiskData.ts
 *
 * Endpoint : GET /functions/v1/advisories-mae?country={slug}
 *
 * Déploiement :
 *   supabase functions deploy advisories-mae --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaeResponse {
  level: 'vert' | 'jaune' | 'orange' | 'rouge' | 'noir' | 'unknown';
  countrySlug: string;
  lastUpdate: string;
  source: string;
  rawAlerts?: number;
}

/**
 * Cherche les alertes urgentes mentionnant le pays sur la page "dernieres
 * minutes et alertes" du MAE. Approximation conservatrice :
 *   - 0 alerte spécifique au pays           → unknown (fallback statique)
 *   - 1+ "vigilance renforcée"              → jaune
 *   - 1+ "déconseillé" (hors "formellement") → orange
 *   - 1+ "formellement déconseillé"         → rouge
 *   - Mots-clés guerre/conflit/évacuation   → noir
 */
function inferLevelFromAlerts(html: string, countrySlug: string): MaeResponse['level'] {
  // Le pays peut être mentionné de plusieurs façons (slug, nom, etc.)
  const lowerSlug = countrySlug.toLowerCase();

  // Extraire seulement les blocs contenant le pays (paragraphes/cartes/titres)
  const countryMentionRegex = new RegExp(`[^<>]{0,200}${lowerSlug}[^<>]{0,200}`, 'gi');
  const matches = html.match(countryMentionRegex);
  if (!matches || matches.length === 0) return 'unknown';

  const context = matches.join(' ').toLowerCase();

  if (/(guerre|évacu|conflit armé|formellement déconseillé)/.test(context)) {
    return 'rouge';
  }
  if (/(déconseillé sauf raison|vivement déconseillé)/.test(context)) {
    return 'orange';
  }
  if (/(déconseillé)/.test(context)) {
    return 'orange';
  }
  if (/(vigilance renforcée|prudence renforcée)/.test(context)) {
    return 'jaune';
  }
  return 'unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const country = url.searchParams.get('country');

  if (!country) {
    return new Response(JSON.stringify({ error: 'Missing country parameter' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Page des alertes récentes (encore rendue server-side, donc scrapable)
    const maeUrl = `https://www.diplomatie.gouv.fr/fr/information-par-pays/${country}/dernieres-minutes-et-alertes`;
    const res = await fetch(maeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia Lokascore aggregator)' },
      redirect: 'follow',
    });

    if (!res.ok) {
      // Pays non trouvé sur le MAE — graceful fallback
      const response: MaeResponse = {
        level: 'unknown',
        countrySlug: country,
        lastUpdate: new Date().toISOString(),
        source: 'MAE France (page non trouvée, fallback dataset curé)',
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const html = await res.text();
    const level = inferLevelFromAlerts(html, country);
    const alertCount = (html.match(/<article|<li class="taxonomy-term/g) ?? []).length;

    const response: MaeResponse = {
      level,
      countrySlug: country,
      lastUpdate: new Date().toISOString(),
      source: level === 'unknown'
        ? 'MAE France · pas d\'alerte spécifique détectée (le niveau exact est rendu côté client)'
        : 'MAE France · dernieres-minutes-et-alertes',
      rawAlerts: alertCount,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e), countrySlug: country, level: 'unknown' }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
