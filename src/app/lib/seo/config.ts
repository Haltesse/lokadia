/**
 * Métadonnées de référencement — source unique.
 *
 * Ce fichier est volontairement **pur** (aucun `import.meta`, aucun JSX,
 * aucun import React) : il est consommé à la fois par le composant `Seo`
 * côté navigateur et par le plugin de build qui prérend les pages, génère
 * `sitemap.xml` et `robots.txt`. Une seule table de vérité, donc pas de
 * dérive entre ce que voit le robot et ce que voit l'utilisateur.
 */
import type { DestinationDetails } from '../../data/types';

/** Domaine canonique par défaut — surchargeable par `VITE_LOKADIA_SITE_URL`. */
export const DEFAULT_SITE_URL = 'https://lokadia.fr';

export const SITE_NAME = 'Lokadia';
export const SITE_LOCALE = 'fr_FR';

export const DEFAULT_TITLE = 'Lokadia — Voyagez informé';
export const DEFAULT_DESCRIPTION =
  "Avant de partir : niveau de sécurité indicatif par destination, alertes issues de sources officielles, formalités d'entrée et itinéraires — consultables même hors connexion.";

/** Image de partage par défaut (générée par `npm run gen:og`). */
export const DEFAULT_OG_IMAGE = '/og-default.png';

export interface PageMeta {
  /** Chemin absolu commençant par « / », sans slash final */
  path: string;
  title: string;
  description: string;
  /** Priorité sitemap (0 → 1). Absente = page hors sitemap. */
  priority?: number;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Pages publiques fixes. Tout ce qui n'est pas listé ici et n'est pas une
 * fiche destination reste hors sitemap : espace personnel, tunnel de
 * réservation, back-office Pro et pages tokenisées n'ont rien à faire dans
 * un index de moteur de recherche.
 */
export const STATIC_PAGES: PageMeta[] = [
  {
    path: '/global-home',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    priority: 1,
    changefreq: 'daily',
  },
  {
    path: '/lokascore',
    title: 'Le Lokascore : méthode, sources et limites',
    description:
      "Comment le Lokascore est calculé : quatre dimensions, sources officielles (MAE, FCDO, US State Department, OMS, GDACS), échelle de lecture et ce que l'indicateur ne dit pas.",
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/search',
    title: 'Explorer les destinations',
    description:
      "Cherchez une ville ou un pays — les fautes de frappe sont tolérées — et consultez sécurité indicative, formalités et alertes avant de réserver.",
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/all-destinations',
    title: 'Toutes les destinations couvertes',
    description:
      'Le catalogue complet des destinations Lokadia : sécurité indicative, formalités, santé et conseils pratiques, avec la date de dernière consolidation.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/alerts',
    title: 'Alertes de sécurité et de santé en cours',
    description:
      "Les alertes publiées par les organismes officiels (OMS, GDACS, ministères des Affaires étrangères), affichées dans leur texte d'origine, sans traduction automatique.",
    priority: 0.8,
    changefreq: 'daily',
  },
  {
    path: '/services',
    title: 'Nos services pour préparer votre voyage',
    description:
      "Ce que Lokadia fait pour vous : sécurité indicative, alertes officielles, formalités d'entrée et réservation via partenaires identifiés.",
    priority: 0.6,
    changefreq: 'monthly',
  },
  {
    path: '/pro',
    title: 'Lokadia Pro — devoir de protection des collaborateurs',
    description:
      "La solution entreprise : briefings avec accusé de réception nominatif, obligation de sécurité prouvable, cellule de crise, check-in et veille sur les pays où vos équipes se trouvent.",
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/premium',
    title: 'Lokadia Premium',
    description:
      'Les fonctions avancées de préparation de voyage réservées aux membres Premium.',
    priority: 0.5,
    changefreq: 'monthly',
  },
  {
    path: '/mentions-legales',
    title: 'Mentions légales',
    description: "Éditeur, hébergeur et responsabilités du site Lokadia.",
    priority: 0.3,
    changefreq: 'yearly',
  },
  {
    path: '/cgu',
    title: "Conditions générales d'utilisation",
    description:
      "Les règles d'usage de Lokadia, la portée exacte des informations de sécurité fournies et les limites de responsabilité.",
    priority: 0.3,
    changefreq: 'yearly',
  },
  {
    path: '/confidentialite',
    title: 'Politique de confidentialité',
    description:
      'Quelles données Lokadia traite, pourquoi, combien de temps, et comment exercer vos droits RGPD.',
    priority: 0.3,
    changefreq: 'yearly',
  },
  {
    path: '/rate',
    title: 'Noter Lokadia',
    description:
      "Donnez votre avis sur Lokadia : ce qui vous a servi, ce qui vous a manqué. Les retours décident de ce qui sera construit ensuite.",
    priority: 0.3,
    changefreq: 'monthly',
  },
  {
    path: '/statut',
    title: 'Statut des services et des sources',
    description:
      'Vérification en direct, depuis votre navigateur, de la disponibilité des services Lokadia et des flux de données officiels.',
    priority: 0.3,
    changefreq: 'daily',
  },
];

/**
 * Écrans privés ou transactionnels : titre d'onglet correct, mais jamais
 * indexés. Un espace personnel, un tunnel de réservation ou une page
 * tokenisée n'ont rien à faire dans un moteur de recherche — et les pages
 * `/briefing/:token` et `/checkin/:token` contiennent des données
 * nominatives d'entreprise.
 *
 * Liste ordonnée : le premier préfixe qui correspond gagne, du plus
 * spécifique au plus général.
 */
export const PRIVATE_PAGES: { prefix: string; title: string }[] = [
  { prefix: '/trips/map-planner', title: 'Planificateur d’itinéraire' },
  { prefix: '/trips/create', title: 'Créer un voyage' },
  { prefix: '/trip/create', title: 'Créer un voyage' },
  { prefix: '/trips', title: 'Mes voyages' },
  { prefix: '/checklist', title: 'Ma checklist de départ' },
  { prefix: '/checkout', title: 'Finaliser la demande' },
  { prefix: '/booking', title: 'Réserver' },
  { prefix: '/favorites', title: 'Mes favoris' },
  { prefix: '/profile', title: 'Mon profil' },
  { prefix: '/login', title: 'Connexion' },
  { prefix: '/destination-count', title: 'Destinations' },
  { prefix: '/pro/demo', title: 'Démonstration Lokadia Pro' },
  { prefix: '/pro/app', title: 'Espace Lokadia Pro' },
  { prefix: '/briefing', title: 'Accusé de réception de briefing' },
  { prefix: '/checkin', title: 'Check-in de sécurité' },
];

/**
 * Chemins dont les métadonnées sont posées par l'écran lui-même, parce
 * qu'elles dépendent de données que le routeur ne connaît pas.
 */
const SCREEN_MANAGED = [/^\/destination(\/|$)/];

export interface ResolvedRouteMeta {
  meta: PageMeta;
  noindex: boolean;
}

/**
 * Métadonnées à appliquer pour un chemin donné.
 *
 * Renvoie `null` quand l'écran s'en charge lui-même. Un chemin inconnu est
 * traité comme non indexable : par défaut on n'expose pas, on n'invente
 * pas de titre.
 */
export function resolveRouteMeta(pathname: string): ResolvedRouteMeta | null {
  const path = normalizePath(pathname);
  if (SCREEN_MANAGED.some((re) => re.test(path))) return null;

  const staticPage = STATIC_PAGES.find((page) => page.path === path);
  if (staticPage) return { meta: staticPage, noindex: false };

  if (path === '/') {
    return { meta: STATIC_PAGES[0], noindex: false };
  }

  const priv = PRIVATE_PAGES.find(
    (page) => path === page.prefix || path.startsWith(`${page.prefix}/`),
  );
  if (priv) {
    return {
      meta: { path, title: priv.title, description: DEFAULT_DESCRIPTION },
      noindex: true,
    };
  }

  // Route inconnue → 404 applicative.
  return {
    meta: {
      path,
      title: 'Page introuvable',
      description: "Cette adresse ne correspond à aucune page de Lokadia.",
    },
    noindex: true,
  };
}

/** Retire le slash final et garantit un chemin absolu. */
export function normalizePath(path: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
}

/** URL absolue à partir d'un chemin ou d'une URL déjà absolue. */
export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl.replace(/\/+$/, '')}${normalizePath(pathOrUrl)}`;
}

/** Titre affiché dans l'onglet : « Page · Lokadia », sans doubler la marque. */
export function formatTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
}

/**
 * Tronque proprement une description : on coupe à la fin d'une phrase si
 * possible, sinon au dernier mot entier, et on n'ajoute « … » que si on a
 * réellement coupé.
 */
export function truncateDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const window = clean.slice(0, max);
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '));
  if (sentenceEnd > max * 0.5) return window.slice(0, sentenceEnd + 1);
  return `${window.slice(0, window.lastIndexOf(' '))}…`;
}

/** Chemin canonique d'une fiche destination. */
export function destinationPath(id: string): string {
  return `/destination/${id}`;
}

/**
 * Métadonnées d'une fiche destination.
 *
 * La description reprend le résumé sécurité **déjà affiché sur la page** :
 * pas de promesse ajoutée pour le robot que l'utilisateur ne verrait pas.
 * Le Lokascore n'y figure jamais — un score hors de son contexte (mention
 * « indicatif », sources, date) n'a pas le droit d'exister.
 */
export function destinationMeta(destination: DestinationDetails): PageMeta {
  const label = `${destination.name}, ${destination.country}`;
  const summary = destination.securitySummary?.trim();
  return {
    path: destinationPath(destination.id),
    title: `${label} — sécurité, formalités et alertes`,
    description: summary
      ? truncateDescription(summary)
      : `Sécurité indicative, formalités d'entrée, santé et conseils pratiques pour préparer un voyage à ${label}.`,
    priority: 0.7,
    changefreq: 'weekly',
  };
}
