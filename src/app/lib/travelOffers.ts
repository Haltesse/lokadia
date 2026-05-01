/**
 * Travel offers generator.
 *
 * Produit des offres vols + hôtels réalistes (prix seedés par destination + dates)
 * avec des deep-links partenaires qui ouvrent des résultats réels sur Skyscanner /
 * Booking.com / GetYourGuide. L'utilisateur voit un prix plausible dans l'app,
 * puis obtient le vrai prix live sur le site partenaire (commission à la clé).
 */

// Mapping ville → IATA pour les destinations les plus courantes.
// Fallback : nom de ville utilisé dans l'URL Skyscanner si absent.
// Liste affichable des villes de départ principales (pour autocomplete)
export const DEPARTURE_CITIES: Array<{ id: string; label: string; iata: string; lat: number; lon: number; country: string }> = [
  { id: 'paris', label: 'Paris', iata: 'PARI', lat: 48.8566, lon: 2.3522, country: 'France' },
  { id: 'lyon', label: 'Lyon', iata: 'LYS', lat: 45.7640, lon: 4.8357, country: 'France' },
  { id: 'marseille', label: 'Marseille', iata: 'MRS', lat: 43.2965, lon: 5.3698, country: 'France' },
  { id: 'toulouse', label: 'Toulouse', iata: 'TLS', lat: 43.6047, lon: 1.4442, country: 'France' },
  { id: 'nice', label: 'Nice', iata: 'NCE', lat: 43.7102, lon: 7.2620, country: 'France' },
  { id: 'bordeaux', label: 'Bordeaux', iata: 'BOD', lat: 44.8378, lon: -0.5792, country: 'France' },
  { id: 'nantes', label: 'Nantes', iata: 'NTE', lat: 47.2184, lon: -1.5536, country: 'France' },
  { id: 'strasbourg', label: 'Strasbourg', iata: 'SXB', lat: 48.5734, lon: 7.7521, country: 'France' },
  { id: 'london', label: 'Londres', iata: 'LOND', lat: 51.5074, lon: -0.1278, country: 'Royaume-Uni' },
  { id: 'brussels', label: 'Bruxelles', iata: 'BRU', lat: 50.8503, lon: 4.3517, country: 'Belgique' },
  { id: 'geneva', label: 'Genève', iata: 'GVA', lat: 46.2044, lon: 6.1432, country: 'Suisse' },
  { id: 'zurich', label: 'Zurich', iata: 'ZRH', lat: 47.3769, lon: 8.5417, country: 'Suisse' },
  { id: 'madrid', label: 'Madrid', iata: 'MAD', lat: 40.4168, lon: -3.7038, country: 'Espagne' },
  { id: 'barcelona', label: 'Barcelone', iata: 'BCN', lat: 41.3851, lon: 2.1734, country: 'Espagne' },
  { id: 'rome', label: 'Rome', iata: 'ROME', lat: 41.9028, lon: 12.4964, country: 'Italie' },
  { id: 'milan', label: 'Milan', iata: 'MIL', lat: 45.4642, lon: 9.1900, country: 'Italie' },
  { id: 'berlin', label: 'Berlin', iata: 'BER', lat: 52.5200, lon: 13.4050, country: 'Allemagne' },
  { id: 'amsterdam', label: 'Amsterdam', iata: 'AMS', lat: 52.3676, lon: 4.9041, country: 'Pays-Bas' },
  { id: 'lisbon', label: 'Lisbonne', iata: 'LIS', lat: 38.7223, lon: -9.1393, country: 'Portugal' },
  { id: 'new-york', label: 'New York', iata: 'NYCA', lat: 40.7128, lon: -74.0060, country: 'États-Unis' },
  { id: 'montreal', label: 'Montréal', iata: 'YMQ', lat: 45.5017, lon: -73.5673, country: 'Canada' },
  { id: 'dubai', label: 'Dubaï', iata: 'DXB', lat: 25.2048, lon: 55.2708, country: 'Émirats Arabes Unis' },
];

export const CITY_IATA: Record<string, string> = {
  paris: 'PARI', london: 'LOND', 'new-york': 'NYCA', tokyo: 'TYOA',
  rome: 'ROME', madrid: 'MAD', barcelona: 'BCN', lisbon: 'LIS',
  amsterdam: 'AMS', berlin: 'BER', prague: 'PRG', vienna: 'VIE',
  istanbul: 'IST', dubai: 'DXB', bangkok: 'BKK', 'hong-kong': 'HKG',
  singapore: 'SIN', bali: 'DPS', seoul: 'SEL', osaka: 'OSA',
  mumbai: 'BOM', delhi: 'DEL', cairo: 'CAI', marrakech: 'RAK',
  'cape-town': 'CPT', nairobi: 'NBO', 'los-angeles': 'LAX',
  'san-francisco': 'SFO', chicago: 'CHI', miami: 'MIA',
  toronto: 'YTO', vancouver: 'YVR', mexico: 'MEX', havana: 'HAV',
  'rio-de-janeiro': 'RIO', 'buenos-aires': 'BUE', lima: 'LIM',
  sydney: 'SYD', melbourne: 'MEL', auckland: 'AKL',
  athens: 'ATH', stockholm: 'STO', copenhagen: 'CPH', oslo: 'OSL',
  helsinki: 'HEL', reykjavik: 'REK', dublin: 'DUB', edinburgh: 'EDI',
  zurich: 'ZRH', geneva: 'GVA', brussels: 'BRU', budapest: 'BUD',
  warsaw: 'WAW', moscow: 'MOW', 'st-petersburg': 'LED',
};

const AIRLINES = [
  { code: 'AF', name: 'Air France' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'TK', name: 'Turkish Airlines' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'KL', name: 'KLM' },
  { code: 'IB', name: 'Iberia' },
  { code: 'U2', name: 'easyJet' },
  { code: 'FR', name: 'Ryanair' },
];

const HOTEL_CHAINS = [
  { name: 'Novotel', tier: 'Confort', color: '#0F4C81' },
  { name: 'ibis Styles', tier: 'Essentiel', color: '#E63946' },
  { name: 'Mercure', tier: 'Boutique', color: '#2D3748' },
  { name: 'Sofitel', tier: 'Luxe', color: '#92400E' },
  { name: 'B&B Hotels', tier: 'Budget', color: '#10B981' },
  { name: 'Generator Hostel', tier: 'Backpacker', color: '#8B5CF6' },
];

// Seed deterministic PRNG à partir d'un string.
function seedFrom(str: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  stops: 0 | 1 | 2;
  duration: string;
  departTime: string;
  arriveTime: string;
  price: number;
  currency: string;
  deeplink: string;
  tag?: string;
}

export interface HotelOffer {
  id: string;
  name: string;
  chain: string;
  tier: string;
  color: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  imageUrl: string;
  deeplink: string;
  tag?: string;
}

function formatDateISO(d: string): string {
  // "2026-05-10" → "260510" pour Skyscanner
  const [y, m, day] = d.split('-');
  return y.slice(2) + m + day;
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(1, Math.round((e - s) / 86400000));
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
}

export function generateFlightOffers(params: {
  destinationId: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  travelers: number;
  originIata?: string; // default PARI
}): FlightOffer[] {
  const { destinationId, destinationName, startDate, endDate, travelers, originIata = 'PARI' } = params;
  const rng = seedFrom(`${destinationId}-${startDate}-flight`);
  const destIata = CITY_IATA[destinationId] || destinationId.slice(0, 3).toUpperCase();

  // Prix de base proportionnel à une distance "vague" (on utilise la 1ère lettre du code comme proxy simple)
  const charSum = destIata.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const basePrice = 120 + (charSum % 420); // 120€ → 540€

  // Fenêtre avancée
  const daysAhead = Math.max(0, Math.round((new Date(startDate).getTime() - Date.now()) / 86400000));
  const advanceMultiplier = daysAhead < 14 ? 1.45 : daysAhead < 45 ? 1.1 : 0.88;

  const skyscannerBase = 'https://www.skyscanner.fr/transport/vols';
  const outbound = formatDateISO(startDate);
  const inbound = formatDateISO(endDate);

  const offers: FlightOffer[] = [];
  for (let i = 0; i < 3; i++) {
    const airline = AIRLINES[Math.floor(rng() * AIRLINES.length)];
    const stops = (i === 0 ? 0 : i === 1 ? 1 : rng() > 0.5 ? 0 : 1) as 0 | 1;
    const stopPenalty = stops === 0 ? 1.25 : 0.82;
    const variance = 0.85 + rng() * 0.3;
    const price = Math.round((basePrice * advanceMultiplier * stopPenalty * variance) / 5) * 5;

    const depH = 6 + Math.floor(rng() * 16);
    const depM = Math.floor(rng() * 12) * 5;
    const durH = stops === 0 ? 2 + Math.floor(rng() * 4) : 5 + Math.floor(rng() * 8);
    const durM = Math.floor(rng() * 12) * 5;
    const arrTotal = depH * 60 + depM + durH * 60 + durM;
    const arrH = Math.floor(arrTotal / 60) % 24;
    const arrM = arrTotal % 60;

    offers.push({
      id: `fl-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      stops,
      duration: `${durH}h${String(durM).padStart(2, '0')}`,
      departTime: formatTime(depH, depM),
      arriveTime: formatTime(arrH, arrM),
      price,
      currency: 'EUR',
      deeplink: `${skyscannerBase}/${originIata.toLowerCase()}/${destIata.toLowerCase()}/${outbound}/${inbound}/?adults=${travelers}`,
      tag: stops === 0 ? 'Direct' : undefined,
    });
  }

  // Tri par prix croissant — tag "Meilleur prix" uniquement le moins cher
  offers.sort((a, b) => a.price - b.price);
  offers[0].tag = 'Meilleur prix';
  return offers;
}

// Banque d'images Unsplash par type d'hôtel (photos libres)
const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=70',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=70',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=70',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=70',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=70',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=70',
];

export function generateHotelOffers(params: {
  destinationId: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  travelers: number;
}): HotelOffer[] {
  const { destinationId, destinationName, startDate, endDate, travelers } = params;
  const rng = seedFrom(`${destinationId}-${startDate}-hotel`);
  const nights = daysBetween(startDate, endDate);

  const basePriceMap: Record<string, number> = {
    Budget: 55, Backpacker: 40, Essentiel: 85, Confort: 130, Boutique: 175, Luxe: 290,
  };

  const bookingUrl = `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(destinationName)}&checkin=${startDate}&checkout=${endDate}&group_adults=${travelers}&group_children=0&no_rooms=1`;

  // 3 hôtels: budget, confort, boutique
  const tiers = [
    HOTEL_CHAINS.find((h) => h.tier === 'Budget')!,
    HOTEL_CHAINS.find((h) => h.tier === 'Confort')!,
    HOTEL_CHAINS.find((h) => h.tier === 'Boutique')!,
  ];

  return tiers.map((chain, i) => {
    const variance = 0.8 + rng() * 0.5;
    const pricePerNight = Math.round((basePriceMap[chain.tier] * variance) / 5) * 5;
    const rating = Math.round((7.8 + rng() * 1.9) * 10) / 10;
    const reviewCount = 200 + Math.floor(rng() * 2800);
    return {
      id: `ht-${i}`,
      name: `${chain.name} ${destinationName}`,
      chain: chain.name,
      tier: chain.tier,
      color: chain.color,
      rating,
      reviewCount,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      currency: 'EUR',
      imageUrl: HOTEL_IMAGES[(i + destinationId.length) % HOTEL_IMAGES.length],
      deeplink: bookingUrl,
      tag: i === 0 ? 'Meilleur rapport qualité-prix' : i === 2 ? 'Coup de cœur' : undefined,
    };
  });
}

/**
 * Calcule un prix « moyen » cohérent pour une jambe (leg) entre 2 villes.
 * Utilisé pour le budget multi-étapes (vol, train ou bus selon distance).
 * Retourne un prix par personne et le mode de transport suggéré.
 */
export interface LegEstimate {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  distanceKm: number;
  mode: 'plane' | 'train' | 'bus';
  pricePerPerson: number;
  durationLabel: string;
}

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function estimateLeg(params: {
  fromId: string;
  fromName: string;
  fromCoord: { lat: number; lon: number };
  toId: string;
  toName: string;
  toCoord: { lat: number; lon: number };
  startDate: string;
  sameCountry?: boolean;
}): LegEstimate {
  const { fromId, fromName, toId, toName, fromCoord, toCoord, startDate, sameCountry } = params;
  const distanceKm = Math.round(haversine(fromCoord, toCoord));
  const rng = seedFrom(`${fromId}-${toId}-${startDate}-leg`);

  // Mode: < 500 km (ou même pays < 800 km) → train, 500-2500 → vol low-cost, sinon vol
  let mode: 'plane' | 'train' | 'bus';
  let pricePerPerson: number;
  let durationLabel: string;

  if (distanceKm < 120) {
    mode = 'bus';
    pricePerPerson = Math.round((15 + distanceKm * 0.08) * (0.85 + rng() * 0.3));
    const h = Math.max(1, Math.round(distanceKm / 75));
    durationLabel = `${h}h en bus`;
  } else if (distanceKm < (sameCountry ? 800 : 500)) {
    mode = 'train';
    pricePerPerson = Math.round((25 + distanceKm * 0.12) * (0.85 + rng() * 0.35));
    const h = Math.max(1, Math.round(distanceKm / 150));
    durationLabel = `${h}h en train`;
  } else {
    mode = 'plane';
    // Vol court/moyen/long courrier
    const base = 55 + distanceKm * 0.06; // ~55€ base + 6c/km
    const daysAhead = Math.max(0, Math.round((new Date(startDate).getTime() - Date.now()) / 86400000));
    const advance = daysAhead < 14 ? 1.4 : daysAhead < 45 ? 1.1 : 0.9;
    pricePerPerson = Math.round((base * advance * (0.85 + rng() * 0.4)) / 5) * 5;
    const h = Math.max(1, Math.round(distanceKm / 750));
    durationLabel = `${h}h de vol`;
  }

  return { fromId, fromName, toId, toName, distanceKm, mode, pricePerPerson, durationLabel };
}

export function computeBudgetEstimate(params: {
  /** Prix par personne de chaque tronçon (aller origine→stops→retour). Ex: [Paris→Tokyo, Tokyo→Osaka, Osaka→Paris]. */
  legPrices?: number[];
  /** Ancien mode : prix d'un seul vol (aller-retour par personne). Utilisé si legPrices absent. */
  flightPrice?: number;
  hotelTotal: number;
  travelers: number;
  nights: number;
}) {
  const { legPrices, flightPrice, hotelTotal, travelers, nights } = params;
  const flightPerPerson = legPrices && legPrices.length > 0
    ? legPrices.reduce((a, b) => a + b, 0)
    : (flightPrice || 0);
  const flights = flightPerPerson * travelers;
  const food = 35 * travelers * nights;
  const activities = 25 * travelers * nights;
  const essentials = 45;
  const total = flights + hotelTotal + food + activities + essentials;
  return {
    flights,
    flightPerPerson,
    legCount: legPrices?.length ?? 1,
    hotel: hotelTotal,
    food,
    activities,
    essentials,
    total,
  };
}
