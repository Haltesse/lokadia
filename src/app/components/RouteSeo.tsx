import { useLocation } from 'react-router';
import { LOKASCORE_FAQ } from '../data/lokascoreFaq';
import { Seo, SITE_URL } from '../lib/seo';
import { resolveRouteMeta } from '../lib/seo/config';
import {
  faqPageJsonLd,
  organizationJsonLd,
  webSiteJsonLd,
  type JsonLd,
} from '../lib/seo/structuredData';

/**
 * Métadonnées pilotées par la route.
 *
 * Monté une seule fois, au-dessus du routeur : aucune page ne peut être
 * oubliée, et tout chemin non déclaré part en `noindex` plutôt que d'être
 * exposé par défaut. Les écrans dont le titre dépend des données (fiche
 * destination) posent leur propre `<Seo>` ; `resolveRouteMeta` renvoie
 * alors `null` et ce composant s'efface.
 *
 * Ce composant ne doit importer aucun jeu de données volumineux : il vit
 * dans le bundle initial.
 */
export function RouteSeo() {
  const { pathname } = useLocation();
  const resolved = resolveRouteMeta(pathname);

  if (!resolved) return null;

  const { meta, noindex } = resolved;
  const jsonLd: JsonLd[] = [];

  if (meta.path === '/global-home') {
    jsonLd.push(webSiteJsonLd(SITE_URL), organizationJsonLd(SITE_URL));
  } else if (meta.path === '/lokascore') {
    jsonLd.push(faqPageJsonLd(LOKASCORE_FAQ));
  }

  return (
    <Seo
      title={meta.title}
      description={meta.description}
      canonicalPath={meta.path}
      noindex={noindex}
      jsonLd={jsonLd}
    />
  );
}
