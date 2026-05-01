export type DesktopMode = 'tourism' | 'local' | 'smart';

export type LocalPlaceType = 'tourism' | 'restaurant' | 'shop' | 'event' | 'service';

export interface LocalPlace {
  id: string;
  name: string;
  type: LocalPlaceType;
  category: string;
  neighborhood: string;
  description: string;
  distance: string;
  walkingTime: string;
  rating: number;
  openNow: boolean;
  offer?: string;
  price: 'free' | 'low' | 'medium' | 'high';
  image: string;
  x: number;
  y: number;
  color: string;
  tags: string[];
  insight: string;
  nextAction: string;
}

export const DESKTOP_FILTERS = [
  { id: 'culture', label: 'Culture' },
  { id: 'food', label: 'Restaurants' },
  { id: 'shops', label: 'Commerces' },
  { id: 'events', label: 'Evenements' },
  { id: 'services', label: 'Services utiles' },
];

export const LOCAL_PLACES: LocalPlace[] = [
  {
    id: 'canal-saint-martin',
    name: 'Canal Saint-Martin',
    type: 'tourism',
    category: 'culture',
    neighborhood: '10e arrondissement',
    description: 'Balade iconique entre passerelles, ecluses et petites librairies de quartier.',
    distance: '450 m',
    walkingTime: '6 min',
    rating: 4.7,
    openNow: true,
    price: 'free',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80',
    x: 45,
    y: 31,
    color: '#0EA5E9',
    tags: ['photo', 'balade', 'patrimoine'],
    insight: 'Meilleur passage a pied avant 11 h, puis cafes plus calmes cote Valmy.',
    nextAction: 'Ajouter au parcours',
  },
  {
    id: 'atelier-nord',
    name: 'Atelier Nord',
    type: 'shop',
    category: 'shops',
    neighborhood: 'Rue des Vinaigriers',
    description: 'Ceramiques et affiches imprimees localement, avec petites series de createurs parisiens.',
    distance: '620 m',
    walkingTime: '8 min',
    rating: 4.8,
    openNow: true,
    offer: '-15 % sur les pieces de la collection printemps',
    price: 'medium',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80',
    x: 62,
    y: 40,
    color: '#F59E0B',
    tags: ['artisanat', 'cadeaux', 'made local'],
    insight: 'Le stock bouge vite le samedi, bon spot apres le canal.',
    nextAction: "Voir l'offre",
  },
  {
    id: 'marche-popincourt',
    name: 'Marche Popincourt',
    type: 'event',
    category: 'events',
    neighborhood: '11e arrondissement',
    description: 'Etals alimentaires, fleurs, fromagers et producteurs franciliens jusqu en debut d apres-midi.',
    distance: '1,2 km',
    walkingTime: '16 min',
    rating: 4.6,
    openNow: true,
    offer: 'Panier degustation local a 12 EUR',
    price: 'low',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&q=80',
    x: 74,
    y: 58,
    color: '#10B981',
    tags: ['marche', 'producteurs', 'matin'],
    insight: 'A combiner avec un pique-nique au square Gardette.',
    nextAction: 'Ouvrir le detail',
  },
  {
    id: 'bistrot-republique',
    name: 'Bistrot Republique',
    type: 'restaurant',
    category: 'food',
    neighborhood: 'Republique',
    description: 'Cuisine courte, produits de saison et table de quartier frequentee par les habitants.',
    distance: '300 m',
    walkingTime: '4 min',
    rating: 4.5,
    openNow: true,
    offer: 'Menu dejeuner local jusqu a 14 h 30',
    price: 'medium',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80',
    x: 35,
    y: 54,
    color: '#EC4899',
    tags: ['dejeuner', 'terrasse', 'produits frais'],
    insight: 'Reserve utile entre 12 h 30 et 13 h 30.',
    nextAction: 'Reserver',
  },
  {
    id: 'musee-picasso',
    name: 'Musee Picasso',
    type: 'tourism',
    category: 'culture',
    neighborhood: 'Le Marais',
    description: 'Collection majeure dans l hotel Sale, ideal pour une sequence culturelle compacte.',
    distance: '1,5 km',
    walkingTime: '20 min',
    rating: 4.6,
    openNow: false,
    price: 'medium',
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=900&q=80',
    x: 55,
    y: 72,
    color: '#8B5CF6',
    tags: ['musee', 'art', 'marais'],
    insight: 'File plus courte en fin de journee hors vacances.',
    nextAction: 'Verifier les horaires',
  },
  {
    id: 'pharmacie-goncourt',
    name: 'Pharmacie Goncourt',
    type: 'service',
    category: 'services',
    neighborhood: 'Goncourt',
    description: 'Service utile pour voyageurs, conseils en anglais et produits essentiels.',
    distance: '700 m',
    walkingTime: '9 min',
    rating: 4.4,
    openNow: true,
    price: 'low',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=900&q=80',
    x: 27,
    y: 36,
    color: '#14B8A6',
    tags: ['sante', 'anglais', 'urgence douce'],
    insight: 'Ouvert plus tard que les commerces voisins.',
    nextAction: 'Y aller',
  },
];

export const LIVE_LOCAL_SIGNALS = [
  {
    label: 'Offres actives',
    value: '14',
    detail: 'restaurants et boutiques independantes',
    tone: '#F59E0B',
  },
  {
    label: 'Ouverts maintenant',
    value: '38',
    detail: 'adresses verifiees dans le quartier',
    tone: '#10B981',
  },
  {
    label: 'Evenements ce soir',
    value: '6',
    detail: 'concerts, ateliers et visites guidees',
    tone: '#8B5CF6',
  },
];

export const SMART_ROUTE = [
  { time: '10:00', title: 'Balade Canal Saint-Martin', kind: 'Patrimoine' },
  { time: '11:20', title: 'Atelier Nord', kind: 'Commerce local' },
  { time: '12:30', title: 'Bistrot Republique', kind: 'Dejeuner' },
  { time: '14:15', title: 'Musee Picasso', kind: 'Culture' },
];
