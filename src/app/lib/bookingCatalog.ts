/**
 * Catalogue de réservation — génère des offres réalistes et déterministes
 * pour chaque catégorie d'un voyage, prêtes à être ajoutées au panier.
 *
 * ⚠️ Prix = ESTIMATIONS réalistes (seedées par destination + dates), pas des
 * prix live. L'architecture est prête à recevoir les vraies API partenaires
 * (Airalo Partner pour l'e-SIM, Chapka/AXA pour l'assurance, Trainline/SNCF
 * pour le rail, Amadeus/Duffel pour les vols) — chaque generateXxx() peut être
 * remplacé par un fetch sans changer l'UI ni le panier.
 */
import type { CartCategory } from './cart';

export interface CatalogOffer {
  id: string;
  category: CartCategory;
  title: string;
  subtitle: string;
  price: number;
  meta: string;
  /** badge optionnel (ex: "Le moins cher", "Recommandé") */
  badge?: string;
  destinationId?: string;
}

// ─── RNG déterministe (même offre pour mêmes paramètres) ───
function seeded(str: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const round = (n: number, step = 1) => Math.round(n / step) * step;
function daysBetween(a: string, b: string): number {
  const d = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  return Number.isFinite(d) && d > 0 ? d : 7;
}

// Pays atteignables en train depuis la France (rail pertinent)
const RAIL_COUNTRIES = new Set(['France', 'Belgique', 'Pays-Bas', 'Allemagne', 'Suisse', 'Italie', 'Espagne', 'Royaume-Uni', 'Luxembourg', 'Autriche']);

// ─── e-SIM (style Airalo) ───────────────────────────────────────────────────
export function generateEsimOffers(destinationId: string, countryName: string): CatalogOffer[] {
  const rng = seeded(`esim-${destinationId}`);
  const factor = 0.9 + rng() * 0.4; // variation régionale plausible
  const plans = [
    { gb: '1 GB', days: 7, base: 4.5 },
    { gb: '3 GB', days: 30, base: 11 },
    { gb: '5 GB', days: 30, base: 16 },
    { gb: '10 GB', days: 30, base: 26 },
    { gb: '20 GB', days: 30, base: 37 },
  ];
  return plans.map((p, i) => ({
    id: `esim-${destinationId}-${i}`,
    category: 'esim' as CartCategory,
    title: `e-SIM ${countryName}`,
    subtitle: `${p.gb} · valable ${p.days} jours · 4G/5G`,
    price: round(p.base * factor * 2) / 2,
    meta: `${p.gb} / ${p.days}j`,
    badge: i === 2 ? 'Populaire' : undefined,
    destinationId,
  }));
}

// ─── Assurance voyage (style Chapka / AXA) ──────────────────────────────────
export function generateInsuranceOffers(destinationId: string, startDate: string, endDate: string, travelers: number): CatalogOffer[] {
  const days = daysBetween(startDate, endDate);
  const tiers = [
    { name: 'Essentiel', perDay: 2.2, cap: 'Frais médicaux 100 000 €', badge: undefined as string | undefined },
    { name: 'Confort', perDay: 3.6, cap: 'Frais médicaux 300 000 € + annulation', badge: 'Recommandé' },
    { name: 'Premium', perDay: 5.5, cap: 'Frais médicaux illimités + rapatriement + sports', badge: undefined },
  ];
  return tiers.map((t, i) => ({
    id: `ins-${destinationId}-${i}`,
    category: 'insurance' as CartCategory,
    title: `Assurance ${t.name}`,
    subtitle: t.cap,
    price: Math.max(9, round(t.perDay * days * travelers)),
    meta: `${days} j · ${travelers} voyageur${travelers > 1 ? 's' : ''}`,
    badge: t.badge,
    destinationId,
  }));
}

// ─── Train (rail pertinent depuis l'Europe) ─────────────────────────────────
export function generateTrainOffers(destinationId: string, countryName: string, startDate: string, travelers: number): CatalogOffer[] {
  if (!RAIL_COUNTRIES.has(countryName)) return [];
  const rng = seeded(`train-${destinationId}-${startDate}`);
  const base = 39 + Math.floor(rng() * 120);
  const options = [
    { label: 'TGV / train direct', mult: 1, cls: '2nde classe', badge: 'Le moins cher' },
    { label: 'Train + flexibilité', mult: 1.35, cls: '2nde classe échangeable', badge: undefined as string | undefined },
    { label: '1ère classe', mult: 1.8, cls: '1ère classe', badge: undefined },
  ];
  return options.map((o, i) => ({
    id: `train-${destinationId}-${i}`,
    category: 'train' as CartCategory,
    title: `Train → ${countryName}`,
    subtitle: `${o.label} · ${o.cls}`,
    price: round(base * o.mult * travelers),
    meta: `${travelers} voyageur${travelers > 1 ? 's' : ''}`,
    badge: o.badge,
    destinationId,
  }));
}

// ─── Hébergements alternatifs : appartements & maisons (style Airbnb) ───────
const STAY_TEMPLATES = [
  { type: 'Appartement', label: 'Studio cosy centre-ville', base: 75, guests: '1-2 voyageurs' },
  { type: 'Appartement', label: 'Appartement 2 chambres', base: 110, guests: '2-4 voyageurs' },
  { type: 'Appartement', label: 'Loft design avec balcon', base: 135, guests: '2-3 voyageurs' },
  { type: 'Maison', label: 'Maison entière avec jardin', base: 180, guests: '4-6 voyageurs' },
  { type: 'Maison', label: 'Villa avec terrasse', base: 240, guests: '6-8 voyageurs' },
];
export function generateStayOffers(destinationId: string, destinationName: string, startDate: string, endDate: string, travelers: number): CatalogOffer[] {
  const nights = daysBetween(startDate, endDate);
  const rng = seeded(`stay-${destinationId}`);
  const cityFactor = 0.85 + rng() * 0.5; // coût de la vie local
  return STAY_TEMPLATES.map((s, i) => {
    const perNight = round(s.base * cityFactor * 5) / 5;
    return {
      id: `stay-${destinationId}-${i}`,
      category: 'hotel' as CartCategory, // même catégorie panier qu'un hébergement
      title: `${s.type} — ${s.label}`,
      subtitle: `${destinationName} · ${s.guests} · annulation gratuite`,
      price: round(perNight * nights),
      meta: `${nights} nuit${nights > 1 ? 's' : ''} · ${perNight}€/nuit`,
      badge: i === 0 ? 'Coup de cœur' : i === 3 ? 'Idéal famille' : undefined,
      destinationId,
    };
  });
}

// ─── Activités (style GetYourGuide) ─────────────────────────────────────────
const ACTIVITY_TEMPLATES = [
  { t: 'Visite guidée à pied', d: 'Cœur historique avec guide local', base: 22 },
  { t: 'Pass musées', d: 'Accès coupe-file aux musées majeurs', base: 38 },
  { t: 'Food tour', d: 'Dégustation des spécialités locales', base: 55 },
  { t: 'Excursion à la journée', d: 'Découverte des environs en petit groupe', base: 79 },
  { t: 'Croisière / panorama', d: 'Vue emblématique au coucher du soleil', base: 34 },
  { t: 'Expérience culturelle', d: 'Atelier ou spectacle traditionnel', base: 45 },
];
export function generateActivityOffers(destinationId: string, destinationName: string, travelers: number): CatalogOffer[] {
  const rng = seeded(`act-${destinationId}`);
  return ACTIVITY_TEMPLATES.map((a, i) => {
    const price = round(a.base * (0.85 + rng() * 0.5));
    return {
      id: `act-${destinationId}-${i}`,
      category: 'activity' as CartCategory,
      title: `${a.t} — ${destinationName}`,
      subtitle: a.d,
      price: price * travelers,
      meta: `${travelers} pers · annulation gratuite`,
      badge: i === 0 ? 'Best-seller' : undefined,
      destinationId,
    };
  });
}
