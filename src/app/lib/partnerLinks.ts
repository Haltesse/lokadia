/**
 * Partner deep links — destination & date aware.
 *
 * Génère des URLs vers les principaux partenaires (Booking, Skyscanner,
 * Saily, Airalo, GetYourGuide, Viator, Tiqets) en pré-remplissant la
 * destination, les dates et le nombre de voyageurs. L'utilisateur clique
 * et arrive directement sur la page de résultats du partenaire.
 *
 * Tous les liens sont à ouvrir avec rel="noopener nofollow sponsored".
 */

const slugify = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ────── Hôtels ──────

export interface HotelLinkOpts {
  city: string;
  country?: string;
  checkIn?: string;  // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  adults?: number;
}

export function bookingLink(opts: HotelLinkOpts): string {
  const u = new URL('https://www.booking.com/searchresults.fr.html');
  const q = opts.country ? `${opts.city}, ${opts.country}` : opts.city;
  u.searchParams.set('ss', q);
  if (opts.checkIn) u.searchParams.set('checkin', opts.checkIn);
  if (opts.checkOut) u.searchParams.set('checkout', opts.checkOut);
  u.searchParams.set('group_adults', String(opts.adults || 1));
  u.searchParams.set('group_children', '0');
  u.searchParams.set('no_rooms', '1');
  return u.toString();
}

export function airbnbLink(opts: HotelLinkOpts): string {
  const path = encodeURIComponent(opts.country ? `${opts.city}, ${opts.country}` : opts.city);
  const u = new URL(`https://www.airbnb.fr/s/${path}/homes`);
  if (opts.checkIn) u.searchParams.set('checkin', opts.checkIn);
  if (opts.checkOut) u.searchParams.set('checkout', opts.checkOut);
  if (opts.adults) u.searchParams.set('adults', String(opts.adults));
  return u.toString();
}

export function hostelworldLink(opts: HotelLinkOpts): string {
  const q = opts.country ? `${opts.city}, ${opts.country}` : opts.city;
  return `https://www.hostelworld.com/findabed.php/ChosenCity.${encodeURIComponent(q)}`;
}

// ────── Vols ──────

export interface FlightLinkOpts {
  fromIata?: string;
  toIata?: string;
  fromCity?: string;
  toCity: string;
  depart: string;  // YYYY-MM-DD
  return?: string; // YYYY-MM-DD
  adults?: number;
}

const fmtSkyscanner = (d: string) => d.slice(2).replace(/-/g, ''); // YYYY-MM-DD → YYMMDD

export function skyscannerLink(opts: FlightLinkOpts): string {
  // Si on a les IATA, on construit l'URL canonique. Sinon on tombe sur la search box.
  if (opts.fromIata && opts.toIata) {
    const ret = opts.return ? `/${fmtSkyscanner(opts.return)}` : '';
    return `https://www.skyscanner.fr/transport/vols/${opts.fromIata.toLowerCase()}/${opts.toIata.toLowerCase()}/${fmtSkyscanner(opts.depart)}${ret}/?adults=${opts.adults || 1}`;
  }
  const q = `${opts.fromCity || ''} ${opts.toCity}`.trim();
  return `https://www.skyscanner.fr/transport/vols/?adultsv2=${opts.adults || 1}&query=${encodeURIComponent(q)}`;
}

export function googleFlightsLink(opts: FlightLinkOpts): string {
  const from = opts.fromCity || opts.fromIata || '';
  const parts = [`Vols de ${from} à ${opts.toCity}`, `le ${opts.depart}`];
  if (opts.return) parts.push(`retour ${opts.return}`);
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(parts.join(' '))}`;
}

export function kiwiLink(opts: FlightLinkOpts): string {
  const from = encodeURIComponent(opts.fromCity || opts.fromIata || 'paris');
  const to = encodeURIComponent(opts.toCity);
  const ret = opts.return ? `/${opts.return}` : '';
  return `https://www.kiwi.com/fr/search/results/${from}/${to}/${opts.depart}${ret}`;
}

// ────── eSIM ──────

export function sailyLink(country?: string): string {
  // Saily (powered by NordVPN) — page d'accueil + landing pays quand disponible.
  if (country) {
    return `https://saily.com/destinations/${slugify(country)}/`;
  }
  return 'https://saily.com/';
}

export function airaloLink(country?: string): string {
  if (country) {
    return `https://www.airalo.com/fr/${slugify(country)}-esim`;
  }
  return 'https://www.airalo.com/fr';
}

export function holaflyLink(country?: string): string {
  if (country) {
    return `https://esim.holafly.com/fr/esim-${slugify(country)}/`;
  }
  return 'https://esim.holafly.com/fr/';
}

// ────── Activités ──────

export function getYourGuideLink(city: string): string {
  return `https://www.getyourguide.fr/s/?q=${encodeURIComponent(city)}&searchSource=3`;
}

export function viatorLink(city: string): string {
  return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`;
}

export function tiqetsLink(city: string): string {
  return `https://www.tiqets.com/fr/search?q=${encodeURIComponent(city)}`;
}

// ────── Assurance & Transports ──────

export function chapkaLink(): string {
  return 'https://www.chapkadirect.fr/';
}

export function omioLink(opts: { fromCity?: string; toCity: string; depart: string }): string {
  // Train + bus européen
  const from = encodeURIComponent(opts.fromCity || 'Paris');
  const to = encodeURIComponent(opts.toCity);
  return `https://www.omio.fr/search-frontend/results?destination=${to}&origin=${from}&date=${opts.depart}`;
}

// ────── Catalogue par catégorie pour l'UI ──────

export interface PartnerOption {
  id: string;
  name: string;
  description: string;
  brandColor: string;
  href: string;
  badge?: string;
}

export function getStayOptions(opts: HotelLinkOpts): PartnerOption[] {
  return [
    {
      id: 'booking',
      name: 'Booking.com',
      description: `Hôtels à ${opts.city}${opts.checkIn ? ` du ${formatDateShort(opts.checkIn)}` : ''}`,
      brandColor: '#003580',
      href: bookingLink(opts),
      badge: 'Le + populaire',
    },
    {
      id: 'airbnb',
      name: 'Airbnb',
      description: 'Appartements & locations',
      brandColor: '#FF385C',
      href: airbnbLink(opts),
    },
    {
      id: 'hostelworld',
      name: 'Hostelworld',
      description: 'Auberges & dortoirs économiques',
      brandColor: '#F58220',
      href: hostelworldLink(opts),
      badge: 'Budget',
    },
  ];
}

export function getFlightOptions(opts: FlightLinkOpts): PartnerOption[] {
  return [
    {
      id: 'skyscanner',
      name: 'Skyscanner',
      description: `Vols ${opts.fromCity ? `${opts.fromCity} → ` : ''}${opts.toCity}`,
      brandColor: '#0770E3',
      href: skyscannerLink(opts),
      badge: 'Comparateur',
    },
    {
      id: 'google',
      name: 'Google Flights',
      description: 'Calendrier des prix flexible',
      brandColor: '#34A853',
      href: googleFlightsLink(opts),
    },
    {
      id: 'kiwi',
      name: 'Kiwi.com',
      description: 'Combinaisons multi-compagnies',
      brandColor: '#00A991',
      href: kiwiLink(opts),
      badge: 'Prix bas',
    },
  ];
}

export function getEsimOptions(country?: string): PartnerOption[] {
  return [
    {
      id: 'saily',
      name: 'Saily',
      description: country
        ? `eSIM ${country} — internet dès l'atterrissage`
        : 'eSIM mondiale — internet dès l\'atterrissage',
      brandColor: '#7C3AED',
      href: sailyLink(country),
      badge: 'Recommandé',
    },
    {
      id: 'airalo',
      name: 'Airalo',
      description: '200+ pays · forfaits dès 4 €',
      brandColor: '#F0463E',
      href: airaloLink(country),
    },
    {
      id: 'holafly',
      name: 'Holafly',
      description: 'Data illimitée, support 24/7',
      brandColor: '#FF6B35',
      href: holaflyLink(country),
    },
  ];
}

export function getActivityOptions(city: string): PartnerOption[] {
  return [
    {
      id: 'getyourguide',
      name: 'GetYourGuide',
      description: `Visites guidées & expériences à ${city}`,
      brandColor: '#FF5533',
      href: getYourGuideLink(city),
      badge: 'N°1 EU',
    },
    {
      id: 'viator',
      name: 'Viator',
      description: 'Tours, attractions, billets coupe-file',
      brandColor: '#328E04',
      href: viatorLink(city),
    },
    {
      id: 'tiqets',
      name: 'Tiqets',
      description: 'Musées, monuments, tickets mobile',
      brandColor: '#1B40DA',
      href: tiqetsLink(city),
      badge: 'Sans file',
    },
  ];
}

function formatDateShort(d: string): string {
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return d;
  }
}
