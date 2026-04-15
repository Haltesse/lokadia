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

export function computeBudgetEstimate(params: {
  flightPrice: number;
  hotelTotal: number;
  travelers: number;
  nights: number;
}) {
  const { flightPrice, hotelTotal, travelers, nights } = params;
  const flights = flightPrice * travelers;
  const food = 35 * travelers * nights; // estimation repas / personne / jour
  const activities = 25 * travelers * nights;
  const essentials = 45; // eSIM + assurance lite
  const total = flights + hotelTotal + food + activities + essentials;
  return { flights, hotel: hotelTotal, food, activities, essentials, total };
}
