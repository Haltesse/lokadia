/**
 * Catalogue de cartes "hébergement" visuelles pour le planner.
 *
 * Plutôt qu'une simple liste de noms (Booking, Airbnb…), on propose
 * 4 vibes différentes — boutique, luxe, appart, auberge — chacune
 * avec une photo représentative et un lien direct vers la recherche
 * filtrée du partenaire (dates + ville pré-remplies).
 *
 * Les images viennent d'Unsplash (CDN stable, libres de droit).
 */
import {
  bookingLink,
  airbnbLink,
  hostelworldLink,
  type HotelLinkOpts,
} from './partnerLinks';

export interface HotelCard {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  priceHint: string;
  provider: 'Booking.com' | 'Airbnb' | 'Hostelworld';
  providerColor: string;
  href: string;
  badge?: string;
}

// Photos Unsplash — chambres / intérieurs, optimisées 600px
const IMG = {
  boutique:
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80&auto=format&fit=crop',
  luxury:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&auto=format&fit=crop',
  apartment:
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80&auto=format&fit=crop',
  hostel:
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80&auto=format&fit=crop',
  view:
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80&auto=format&fit=crop',
  cozy:
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&auto=format&fit=crop',
};

export function getHotelCards(opts: HotelLinkOpts): HotelCard[] {
  // Filtre Booking par catégorie d'étoiles : nflt=class%3DN
  const bookingBase = bookingLink(opts);
  const sep = bookingBase.includes('?') ? '&' : '?';

  return [
    {
      id: 'boutique',
      title: `Boutique de charme à ${opts.city}`,
      subtitle: 'Hôtels 4★ avec personnalité',
      imageUrl: IMG.boutique,
      priceHint: 'Dès 90 €/nuit',
      provider: 'Booking.com',
      providerColor: '#003580',
      href: `${bookingBase}${sep}nflt=class%3D4`,
      badge: 'Coup de cœur',
    },
    {
      id: 'luxury',
      title: 'Suites & rooftops 5★',
      subtitle: 'Spa, vue panoramique, room service',
      imageUrl: IMG.luxury,
      priceHint: 'Dès 250 €/nuit',
      provider: 'Booking.com',
      providerColor: '#003580',
      href: `${bookingBase}${sep}nflt=class%3D5`,
    },
    {
      id: 'apartment',
      title: 'Appartements & lofts',
      subtitle: 'Cuisine équipée, comme à la maison',
      imageUrl: IMG.apartment,
      priceHint: 'Dès 60 €/nuit',
      provider: 'Airbnb',
      providerColor: '#FF385C',
      href: airbnbLink(opts),
      badge: 'Familles',
    },
    {
      id: 'hostel',
      title: 'Auberges & dortoirs',
      subtitle: 'Ambiance backpacker, prix mini',
      imageUrl: IMG.hostel,
      priceHint: 'Dès 18 €/nuit',
      provider: 'Hostelworld',
      providerColor: '#F58220',
      href: hostelworldLink(opts),
      badge: 'Budget',
    },
  ];
}
