/**
 * Données structurées schema.org (JSON-LD).
 *
 * Règles suivies ici :
 *  - on ne balise que ce qui est **réellement visible** sur la page (une
 *    FAQ balisée sans FAQ affichée est une pénalité, pas une astuce) ;
 *  - **aucun `aggregateRating`** sur les destinations : le Lokascore ne
 *    peut pas être exposé nu, sans « indicatif », sans source ni date —
 *    un balisage de notation le sortirait précisément de ce contexte ;
 *  - fichier pur, partagé par le rendu navigateur et le prérendu de build.
 */
import type { DestinationDetails } from '../../data/types';
import { SITE_NAME, absoluteUrl, destinationPath } from './config';

/** Un objet JSON-LD quelconque — sérialisé tel quel dans la page. */
export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl,
    logo: absoluteUrl(siteUrl, '/icon-512.png'),
    description:
      "Lokadia agrège les publications officielles de sécurité, de santé et de formalités pour aider les voyageurs à préparer leur départ.",
  };
}

/**
 * WebSite + action de recherche. Le gabarit pointe sur `/search?q=` : la
 * page lit réellement ce paramètre, sinon le balisage serait mensonger.
 */
export function webSiteJsonLd(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function touristDestinationJsonLd(
  siteUrl: string,
  destination: DestinationDetails,
  description: string,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${destination.name}, ${destination.country}`,
    url: absoluteUrl(siteUrl, destinationPath(destination.id)),
    description,
    image: destination.image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: destination.name,
      addressCountry: destination.country,
    },
    touristType: 'Voyageur individuel',
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(siteUrl: string, items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqPageJsonLd(entries: FaqEntry[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}
