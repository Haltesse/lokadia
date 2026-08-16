/**
 * Plugin de build SEO : prérendu des pages publiques, `sitemap.xml`,
 * `robots.txt`.
 *
 * Pourquoi un prérendu. L'application est une SPA : sans JavaScript, le
 * HTML servi est une coquille vide. Google exécute le JS, mais les robots
 * des réseaux sociaux et des messageries (Facebook, LinkedIn, WhatsApp,
 * Slack, Signal…) ne l'exécutent pas — un lien partagé vers une fiche
 * destination n'affichait donc ni titre, ni description, ni image.
 *
 * Ce que fait ce plugin : après le build, il copie `index.html` sous
 * `<route>/index.html` pour chaque page publique, en y injectant les
 * balises de cette page-là. L'hébergeur sert le fichier statique s'il
 * existe (la réécriture SPA ne s'applique qu'à défaut), le robot lit le
 * bon `<head>`, et l'application prend ensuite la main normalement — le
 * composant `Seo` réécrit les mêmes balises, qui portent `data-lk-seo`.
 *
 * Ces fichiers ne sont volontairement PAS précachés par le service worker
 * (voir `globIgnores` dans vite.config.ts) : ils dupliqueraient l'app
 * shell autant de fois qu'il y a de destinations.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

import allDestinations from '../src/app/data/allDestinations';
import { DATASET_CONSOLIDATED_ON } from '../src/app/data/provenance';
import { LOKASCORE_FAQ } from '../src/app/data/lokascoreFaq';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_URL,
  SITE_LOCALE,
  SITE_NAME,
  STATIC_PAGES,
  absoluteUrl,
  destinationMeta,
  formatTitle,
  type PageMeta,
} from '../src/app/lib/seo/config';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  touristDestinationJsonLd,
  webSiteJsonLd,
  type JsonLd,
} from '../src/app/lib/seo/structuredData';

interface PrerenderPage extends PageMeta {
  image?: string;
  type?: 'website' | 'article';
  jsonLd: JsonLd[];
  /** Date ISO de dernière modification, si elle est réellement connue. */
  lastmod?: string;
}

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** `</script>` dans du JSON-LD fermerait la balise : on neutralise. */
const escapeJsonLd = (data: JsonLd) =>
  JSON.stringify(data).replace(/</g, '\\u003c');

function buildPages(siteUrl: string): PrerenderPage[] {
  const pages: PrerenderPage[] = STATIC_PAGES.map((page) => ({
    ...page,
    jsonLd:
      page.path === '/global-home'
        ? [webSiteJsonLd(siteUrl), organizationJsonLd(siteUrl)]
        : page.path === '/lokascore'
          ? [faqPageJsonLd(LOKASCORE_FAQ)]
          : [],
  }));

  for (const destination of Object.values(allDestinations)) {
    const meta = destinationMeta(destination);
    pages.push({
      ...meta,
      image: destination.image,
      type: 'article',
      // Date honnête : celle de la consolidation du jeu de données, pas
      // celle du build — un déploiement ne modifie pas le contenu.
      lastmod: DATASET_CONSOLIDATED_ON,
      jsonLd: [
        touristDestinationJsonLd(siteUrl, destination, meta.description),
        breadcrumbJsonLd(siteUrl, [
          { name: 'Accueil', path: '/global-home' },
          { name: 'Destinations', path: '/all-destinations' },
          { name: `${destination.name}, ${destination.country}`, path: meta.path },
        ]),
      ],
    });
  }

  return pages;
}

function headFor(page: PrerenderPage, siteUrl: string): string {
  const title = formatTitle(page.title);
  const canonical = absoluteUrl(siteUrl, page.path);
  const image = absoluteUrl(siteUrl, page.image ?? DEFAULT_OG_IMAGE);

  const tags = [
    ['meta', 'name', 'description', page.description],
    ['meta', 'name', 'robots', 'index, follow, max-image-preview:large'],
    ['meta', 'property', 'og:type', page.type ?? 'website'],
    ['meta', 'property', 'og:site_name', SITE_NAME],
    ['meta', 'property', 'og:locale', SITE_LOCALE],
    ['meta', 'property', 'og:title', title],
    ['meta', 'property', 'og:description', page.description],
    ['meta', 'property', 'og:url', canonical],
    ['meta', 'property', 'og:image', image],
    ['meta', 'name', 'twitter:card', 'summary_large_image'],
    ['meta', 'name', 'twitter:title', title],
    ['meta', 'name', 'twitter:description', page.description],
    ['meta', 'name', 'twitter:image', image],
  ] as const;

  const lines = tags.map(
    ([, kind, key, content]) =>
      `    <meta ${kind}="${key}" data-lk-seo content="${escapeAttr(content)}" />`,
  );
  lines.push(`    <link rel="canonical" data-lk-seo href="${escapeAttr(canonical)}" />`);
  for (const data of page.jsonLd) {
    lines.push(
      `    <script type="application/ld+json" data-lk-seo>${escapeJsonLd(data)}</script>`,
    );
  }
  return lines.join('\n');
}

/** Réécrit le `<head>` du gabarit pour une page donnée. */
function renderHtml(template: string, page: PrerenderPage, siteUrl: string): string {
  return template
    // On retire le lot géré par `Seo` (balises marquées) avant de le réécrire.
    .replace(/[ \t]*<meta[^>]*\sdata-lk-seo[^>]*>\r?\n?/g, '')
    .replace(/[ \t]*<link[^>]*\sdata-lk-seo[^>]*>\r?\n?/g, '')
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeAttr(formatTitle(page.title))}</title>`,
    )
    .replace('</head>', `${headFor(page, siteUrl)}\n  </head>`);
}

function renderSitemap(pages: PrerenderPage[], siteUrl: string): string {
  const entries = pages
    .filter((page) => page.priority !== undefined)
    .map((page) => {
      const parts = [`    <loc>${absoluteUrl(siteUrl, page.path)}</loc>`];
      if (page.lastmod) parts.push(`    <lastmod>${page.lastmod}</lastmod>`);
      if (page.changefreq) parts.push(`    <changefreq>${page.changefreq}</changefreq>`);
      parts.push(`    <priority>${page.priority!.toFixed(1)}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

/**
 * `robots.txt`.
 *
 * On n'interdit au crawl que ce qui ne doit jamais être récupéré : le
 * back-office Pro et les pages tokenisées, qui portent des données
 * nominatives d'entreprise. Les écrans personnels (voyages, profil,
 * panier) sont laissés crawlables mais marqués `noindex` — interdire leur
 * exploration empêcherait justement les robots de lire cette consigne.
 */
function renderRobots(siteUrl: string): string {
  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /pro/app
Disallow: /briefing/
Disallow: /checkin/

Sitemap: ${siteUrl}/sitemap.xml
`;
}

export function seoBuild(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'lokadia-seo-build',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    closeBundle() {
      const siteUrl = (
        process.env.VITE_LOKADIA_SITE_URL || DEFAULT_SITE_URL
      ).replace(/\/+$/, '');
      const outDir = config.build.outDir;
      const indexPath = join(outDir, 'index.html');
      const template = readFileSync(indexPath, 'utf8');
      const pages = buildPages(siteUrl);

      // Racine : l'app y redirige vers /global-home, le canonique aussi.
      const home = pages.find((page) => page.path === '/global-home')!;
      writeFileSync(indexPath, renderHtml(template, home, siteUrl));

      for (const page of pages) {
        const file = join(outDir, page.path.slice(1), 'index.html');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, renderHtml(template, page, siteUrl));
      }

      writeFileSync(join(outDir, 'sitemap.xml'), renderSitemap(pages, siteUrl));
      writeFileSync(join(outDir, 'robots.txt'), renderRobots(siteUrl));

      config.logger.info(
        `\x1b[32m✓\x1b[0m SEO : ${pages.length} pages prérendues, sitemap et robots.txt (${siteUrl})`,
      );
    },
  };
}
