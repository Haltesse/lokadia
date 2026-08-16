import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { readFileSync } from 'fs'
import { seoBuild } from './scripts/seo-build'

/** Identifiant de projet Supabase — même source que utils/supabase/info.tsx */
const SUPABASE_PROJECT_ID =
  process.env.VITE_LOKADIA_SUPABASE_PROJECT_ID ?? 'yprdlcqwloydwzxihepw'

/**
 * Le handler push du service worker vit dans public/ (copié tel quel), il
 * ne passe donc pas par la substitution d'env de Vite. Ce plugin y injecte
 * l'URL de l'Edge Function au build, pour éviter de coder la même URL à
 * deux endroits et de la voir dériver.
 */
function pushHandlerUrl(): Plugin {
  const pendingUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/push-pending`
  return {
    name: 'lokadia-push-handler-url',
    generateBundle() {
      const src = readFileSync(path.resolve(__dirname, 'public/push-handler.js'), 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: 'push-handler.js',
        source: src.replace('__PENDING_URL__', pendingUrl),
      })
    },
  }
}

/**
 * Stratégies de cache runtime.
 *
 * Principe : ce qui est vital hors-ligne (Lokascore, alertes, formalités)
 * passe en NetworkFirst — on privilégie la fraîcheur, mais une réponse en
 * cache vaut mieux qu'un écran blanc. Ce qui est lourd et stable (tuiles,
 * images, polices) passe en CacheFirst avec expiration.
 *
 * Rien de ce qui touche à l'authentification ou aux données Pro n'est mis
 * en cache : ce sont des données personnelles, elles ne survivent pas à la
 * session.
 */
const runtimeCaching = [
  {
    // Edge Functions Lokadia : score, alertes mondiales, advisories, lieux
    urlPattern: /^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/.*/i,
    handler: 'NetworkFirst' as const,
    options: {
      cacheName: 'lokadia-donnees-officielles',
      networkTimeoutSeconds: 6,
      expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    // Tuiles OpenStreetMap — lourdes et immuables
    urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: 'lokadia-tuiles-carte',
      expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 30 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    // Illustrations de destination (Wikipedia, Unsplash)
    urlPattern: /^https:\/\/(upload\.wikimedia\.org|images\.unsplash\.com|[a-z]{2}\.wikipedia\.org)\/.*/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: 'lokadia-images',
      expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    // Météo et taux de change : utiles mais périssables
    urlPattern: /^https:\/\/(api\.open-meteo\.com|api\.openweathermap\.org|api\.exchangerate-api\.com)\/.*/i,
    handler: 'NetworkFirst' as const,
    options: {
      cacheName: 'lokadia-meteo-devises',
      networkTimeoutSeconds: 5,
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 6 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    // Sous-ensembles de police non précachés (alphabets non latins) —
    // la police est auto-hébergée, ces requêtes sont donc de même origine.
    urlPattern: /\/fonts\/.*\.woff2$/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: 'lokadia-polices',
      expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
]

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    pushHandlerUrl(),
    // Avant VitePWA : le prérendu réécrit index.html, il faut que Workbox
    // en calcule l'empreinte APRÈS coup, sinon le service worker sert un
    // fichier dont la révision ne correspond plus.
    seoBuild(),
    VitePWA({
      registerType: 'prompt',           // l'utilisateur décide quand recharger
      includeAssets: ['lokadia-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lokadia — Voyagez informé',
        short_name: 'Lokadia',
        description:
          "Préparez vos voyages et partez informé : niveau de sécurité indicatif par destination, alertes issues de sources officielles, formalités et itinéraires — consultables même hors connexion.",
        lang: 'fr',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FAFAFA',
        theme_color: '#0F4C81',
        categories: ['travel', 'navigation', 'lifestyle'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/lokadia-icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
        shortcuts: [
          { name: 'Mes voyages', url: '/trips' },
          { name: 'Alertes en cours', url: '/alerts' },
        ],
      },
      workbox: {
        // Réception des notifications de sécurité (voir public/push-handler.js)
        importScripts: ['/push-handler.js'],
        // Les gros fichiers de données destinations dépassent la limite par défaut
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // push-handler.js est émis par notre plugin : il ne doit pas être
        // précaché sous son nom brut (le SW l'importe directement)
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Les pages prérendues (<route>/index.html) ne sont pas précachées :
        // ce sont 60 copies de l'app shell, utiles aux robots, inutiles au
        // navigateur qui a déjà index.html en repli de navigation.
        // Seuls les sous-ensembles latins de la police sont précachés : le
        // cyrillique, le grec et le vietnamien ne servent à aucune des
        // langues proposées et pèseraient 80 ko pour rien.
        globIgnores: [
          'push-handler.js',
          '**/*/index.html',
          'fonts/inter-cyrillic*.woff2',
          'fonts/inter-greek*.woff2',
          'fonts/inter-vietnamese.woff2',
        ],
        navigateFallback: '/index.html',
        // Le back-office Pro et l'accusé de briefing exigent le réseau :
        // on ne sert jamais l'app shell en fallback pour ces routes.
        navigateFallbackDenylist: [/^\/pro\/app/, /^\/briefing\//],
        cleanupOutdatedCaches: true,
        runtimeCaching,
      },
      devOptions: {
        // Permet de tester le service worker en `npm run dev`
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // En production : aucun console.* ni debugger dans le bundle.
  esbuild: command === 'build' ? { drop: ['console', 'debugger'] } : undefined,
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
}))
