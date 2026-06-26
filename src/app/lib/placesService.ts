/**
 * placesService — recherche de LIEUX riches (POI) via l'Edge Function
 * `places-search` (Foursquare, clé cachée côté serveur + cache Supabase).
 *
 * Dégradation gracieuse totale : si la fonction n'est pas déployée, ou si la
 * clé Foursquare n'est pas configurée, ou en cas d'erreur réseau, on renvoie
 * simplement [] — le planner continue de marcher avec la recherche Nominatim
 * existante. Après un premier 404 (fonction absente), on coupe les appels
 * pour la session afin de ne pas spammer le réseau.
 */
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export interface PlaceResult {
  id: string;
  name: string;
  category: string;
  categoryIcon?: string;
  lat: number;
  lon: number;
  address: string;
  photoUrl?: string;
}

let functionUnavailable = false;

export async function searchPlaces(
  query: string,
  near?: { lat: number; lon: number },
  signal?: AbortSignal,
): Promise<PlaceResult[]> {
  if (functionUnavailable) return [];
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({ query: q });
  if (near && Number.isFinite(near.lat) && Number.isFinite(near.lon)) {
    params.set('ll', `${near.lat},${near.lon}`);
  }

  try {
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/places-search?${params.toString()}`,
      { headers: { Authorization: `Bearer ${publicAnonKey}`, apikey: publicAnonKey }, signal },
    );
    // 404 = fonction pas (encore) déployée → on arrête d'appeler pour la session
    if (res.status === 404) {
      functionUnavailable = true;
      return [];
    }
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.results) ? (data.results as PlaceResult[]) : [];
  } catch {
    return [];
  }
}
