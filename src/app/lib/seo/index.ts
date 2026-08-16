/**
 * Point d'entrée SEO côté application.
 *
 * Le plugin de build, lui, importe `./config` et `./structuredData`
 * directement : ce fichier réexporte `Seo.tsx`, qui lit `import.meta.env`
 * et n'est donc pas chargeable depuis Node.
 */
export { Seo, useSeo, SITE_URL } from './Seo';
export type { SeoProps } from './Seo';
export {
  STATIC_PAGES,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  destinationMeta,
  destinationPath,
  truncateDescription,
  type PageMeta,
} from './config';
export {
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  touristDestinationJsonLd,
  webSiteJsonLd,
  type FaqEntry,
  type JsonLd,
} from './structuredData';

import { STATIC_PAGES, type PageMeta } from './config';

/**
 * Métadonnées d'une page fixe, par son chemin. Lève en développement si le
 * chemin est absent de la table : c'est une erreur de programmation, et
 * une page sans métadonnées passerait autrement inaperçue.
 */
export function staticPageMeta(path: string): PageMeta {
  const page = STATIC_PAGES.find((p) => p.path === path);
  if (!page) {
    throw new Error(`[seo] Aucune métadonnée déclarée pour « ${path} » (voir lib/seo/config.ts)`);
  }
  return page;
}
