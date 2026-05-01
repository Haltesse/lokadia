/**
 * Catalogue de cartes "activités" visuelles pour l'onglet "Pendant".
 *
 * 4 vibes par destination — incontournables, food tours, aventure, billets
 * coupe-file — chacune avec une photo et un lien vers la recherche filtrée
 * sur GetYourGuide / Viator / Tiqets.
 */
import { getYourGuideLink, viatorLink, tiqetsLink } from './partnerLinks';

export interface ActivityCard {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  priceHint: string;
  provider: 'GetYourGuide' | 'Viator' | 'Tiqets';
  providerColor: string;
  href: string;
  badge?: string;
}

// Photos Unsplash — vibes de voyage, optimisées 600px
const IMG = {
  landmarks:
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80&auto=format&fit=crop',
  food:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&auto=format&fit=crop',
  adventure:
    'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=600&q=80&auto=format&fit=crop',
  museum:
    'https://images.unsplash.com/photo-1565060299834-a5cd5c87d33b?w=600&q=80&auto=format&fit=crop',
};

export function getActivityCards(city: string): ActivityCard[] {
  return [
    {
      id: 'must-see',
      title: `Incontournables de ${city}`,
      subtitle: 'Visites guidées des lieux mythiques',
      imageUrl: IMG.landmarks,
      priceHint: 'Dès 25 €/pers.',
      provider: 'GetYourGuide',
      providerColor: '#FF5533',
      href: getYourGuideLink(`${city} incontournables`),
      badge: 'Top vente',
    },
    {
      id: 'food',
      title: 'Food tour & dégustations',
      subtitle: 'Goûte la vraie cuisine locale',
      imageUrl: IMG.food,
      priceHint: 'Dès 45 €/pers.',
      provider: 'GetYourGuide',
      providerColor: '#FF5533',
      href: getYourGuideLink(`${city} food tour`),
    },
    {
      id: 'adventure',
      title: 'Aventures & sensations',
      subtitle: 'Excursions journée, sport, nature',
      imageUrl: IMG.adventure,
      priceHint: 'Dès 60 €/pers.',
      provider: 'Viator',
      providerColor: '#328E04',
      href: viatorLink(`${city} adventure tours`),
    },
    {
      id: 'tickets',
      title: 'Billets coupe-file musées',
      subtitle: 'Mobile · entrée prioritaire',
      imageUrl: IMG.museum,
      priceHint: 'Dès 15 €/pers.',
      provider: 'Tiqets',
      providerColor: '#1B40DA',
      href: tiqetsLink(city),
      badge: 'Sans file',
    },
  ];
}
