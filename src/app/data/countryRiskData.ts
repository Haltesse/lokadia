/**
 * Mapping géographique destination → code pays ISO 3166-1 alpha-2.
 *
 * ⚠️ Le dataset des indices de risque par pays (advisories MAE/FCDO/US/DFAT,
 * indices WJP/CPI/EM-DAT, etc.), les tables de normalisation et les
 * pondérations ont été DÉPLACÉS CÔTÉ SERVEUR (Edge Function
 * `lokascore-compute`). Ils ne sont plus présents dans le bundle JS pour
 * protéger le secret de fabrique Lokascore.
 *
 * Ce fichier ne conserve que le mapping géographique (information publique,
 * non sensible) nécessaire pour relier les destinations aux alertes pays
 * sur la carte mondiale et dans le centre d'alertes.
 */

export const DESTINATION_TO_COUNTRY_ISO: Record<string, string> = {
  'paris-france': 'FR', 'nice-france': 'FR', 'london-uk': 'GB', 'edinburgh-uk': 'GB',
  'berlin-germany': 'DE', 'barcelona-spain': 'ES', 'madrid-spain': 'ES', 'seville-spain': 'ES',
  'rome-italy': 'IT', 'milan-italy': 'IT', 'venice-italy': 'IT', 'florence-italy': 'IT',
  'lisbon-portugal': 'PT', 'porto-portugal': 'PT', 'amsterdam-netherlands': 'NL',
  'brussels-belgium': 'BE', 'zurich-switzerland': 'CH', 'vienna-austria': 'AT',
  'dublin-ireland': 'IE', 'stockholm-sweden': 'SE', 'oslo-norway': 'NO',
  'copenhagen-denmark': 'DK', 'helsinki-finland': 'FI', 'reykjavik-iceland': 'IS',
  'warsaw-poland': 'PL', 'krakow-poland': 'PL', 'prague-czech': 'CZ', 'prague-czechia': 'CZ',
  'athens-greece': 'GR', 'santorini-greece': 'GR', 'moscow-russia': 'RU', 'istanbul-turkey': 'TR',
  'new-york-usa': 'US', 'miami-usa': 'US', 'los-angeles-usa': 'US', 'san-francisco-usa': 'US',
  'toronto-canada': 'CA', 'vancouver-canada': 'CA', 'montreal-canada': 'CA',
  'mexico-city-mexico': 'MX', 'rio-de-janeiro-brazil': 'BR', 'buenos-aires-argentina': 'AR',
  'marrakech-morocco': 'MA', 'cairo-egypt': 'EG', 'dubai-uae': 'AE', 'tel-aviv-israel': 'IL',
  'cape-town-south-africa': 'ZA', 'tokyo-japan': 'JP', 'shanghai-china': 'CN',
  'hong-kong-china': 'HK', 'seoul-south-korea': 'KR', 'bangkok-thailand': 'TH',
  'phuket-thailand': 'TH', 'singapore-singapore': 'SG', 'kuala-lumpur-malaysia': 'MY',
  'bali-indonesia': 'ID', 'mumbai-india': 'IN', 'sydney-australia': 'AU',
};
