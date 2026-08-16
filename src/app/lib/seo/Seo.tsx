import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_URL,
  SITE_LOCALE,
  SITE_NAME,
  absoluteUrl,
  formatTitle,
  normalizePath,
} from './config';
import type { JsonLd } from './structuredData';

/**
 * Gestion des métadonnées de page, sans dépendance (pas de react-helmet).
 *
 * Le besoin est simple — un jeu de balises par écran, un seul écran affiché
 * à la fois — et une bibliothèque de plus pour ça ne se justifie pas.
 *
 * Toutes les balises produites portent `data-lk-seo` : le composant efface
 * puis réécrit exactement ce lot, sans jamais toucher au reste du `<head>`.
 * Les pages prérendues au build posent le même attribut, si bien que
 * l'hydratation remplace proprement le balisage statique du robot.
 *
 * Un seul `<Seo>` par écran.
 */

const MANAGED_ATTR = 'data-lk-seo';

/** Domaine canonique effectif (surchargé par l'environnement Vercel). */
export const SITE_URL = (
  (import.meta.env.VITE_LOKADIA_SITE_URL as string | undefined) || DEFAULT_SITE_URL
).replace(/\/+$/, '');

export interface SeoProps {
  title: string;
  description: string;
  /** Chemin canonique. Par défaut : l'URL courante, sans query ni hash. */
  canonicalPath?: string;
  /** Image de partage (chemin local ou URL absolue). */
  image?: string;
  /** Retire la page des index — espace personnel, tunnels, 404. */
  noindex?: boolean;
  /** `og:type` — « website » par défaut. */
  type?: 'website' | 'article';
  jsonLd?: JsonLd[];
}

function meta(kind: 'name' | 'property', key: string, content: string): HTMLMetaElement {
  const el = document.createElement('meta');
  el.setAttribute(kind, key);
  el.setAttribute('content', content);
  el.setAttribute(MANAGED_ATTR, '');
  return el;
}

export function useSeo({
  title,
  description,
  canonicalPath,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  type = 'website',
  jsonLd = [],
}: SeoProps): void {
  const { pathname } = useLocation();
  // Sérialisé pour servir de dépendance stable : les objets JSON-LD sont
  // reconstruits à chaque rendu et compareraient toujours différent.
  const jsonLdKey = JSON.stringify(jsonLd);

  useEffect(() => {
    const path = normalizePath(canonicalPath ?? pathname);
    const canonical = absoluteUrl(SITE_URL, path);
    const imageUrl = absoluteUrl(SITE_URL, image);
    const fullTitle = formatTitle(title);

    document.title = fullTitle;

    const head = document.head;
    head.querySelectorAll(`[${MANAGED_ATTR}]`).forEach((node) => node.remove());

    const nodes: Element[] = [
      meta('name', 'description', description),
      meta(
        'name',
        'robots',
        noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
      ),
      meta('property', 'og:type', type),
      meta('property', 'og:site_name', SITE_NAME),
      meta('property', 'og:locale', SITE_LOCALE),
      meta('property', 'og:title', fullTitle),
      meta('property', 'og:description', description),
      meta('property', 'og:url', canonical),
      meta('property', 'og:image', imageUrl),
      meta('name', 'twitter:card', 'summary_large_image'),
      meta('name', 'twitter:title', fullTitle),
      meta('name', 'twitter:description', description),
      meta('name', 'twitter:image', imageUrl),
    ];

    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonical);
    link.setAttribute(MANAGED_ATTR, '');
    nodes.push(link);

    for (const data of jsonLd) {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute(MANAGED_ATTR, '');
      script.textContent = JSON.stringify(data);
      nodes.push(script);
    }

    nodes.forEach((node) => head.appendChild(node));
    // jsonLdKey remplace `jsonLd` : voir la sérialisation ci-dessus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonicalPath, pathname, image, noindex, type, jsonLdKey]);
}

/** Version composant — à poser une fois par écran. */
export function Seo(props: SeoProps) {
  useSeo(props);
  return null;
}
