---
name: lokadia-dev-conventions
description: Code architecture, conventions, and Supabase patterns for the Lokadia web travel app. Stack is Vite + React 18 + TypeScript + React Router + Tailwind/Radix + Supabase (auth + DB + Edge Functions). Use this skill whenever writing, structuring, refactoring, or reviewing Lokadia code — project layout, TypeScript style, data models, Supabase (RLS, typed client, Edge Functions, migrations), data fetching, offline support, secrets handling, and security. Trigger it even when the user just says "écris-moi", "refactore", "comment organiser", "ajoute une table", "branche le backend" in the Lokadia context, so that code stays consistent, secure, RGPD-compliant and aligned with the product.
---

# Lokadia — Conventions de code & architecture

Charge ce skill pour tout travail de code Lokadia. Contraintes produit (sources officielles, score indicatif, RGPD, offline, transparence) : voir [[lokadia-product-context]].

## Stack confirmée

- **Build** : Vite 5
- **UI** : React 18 + TypeScript (`strict`) + Tailwind + Radix/shadcn
- **Routing** : `react-router` v6
- **Backend** : Supabase (auth, Postgres, Edge Functions Deno)
- **Maps** : `leaflet` + `react-leaflet`
- **Dates** : `date-fns`
- **Animations** : `motion` (Framer Motion)
- **Notifications** : `sonner`
- **Pas de** : React Native, Expo, Next.js, TanStack Query (à ce jour). Si tu envisages de les introduire, signale-le explicitement — c'est un choix d'archi.

## Structure du projet

Layout actuel — à respecter ; ne pas créer de pattern parallèle sans raison :

```
src/
  app/
    components/      # composants métier (PascalCase)
      ui/            # primitives shadcn/Radix wrappées (kebab-case)
      figma/         # adaptateurs d'assets Figma
    context/         # React Contexts (AuthContext, CurrencyContext)
    data/            # données statiques (destinations, coordonnées, neighbors)
    lib/             # client Supabase, helpers transverses
    App.tsx          # routes
  styles/            # fonts, tailwind, theme, animations, mobile
  utils/             # utils transverses (dont supabase/info)
supabase/
  functions/         # Edge Functions (Deno) — sources d'autorité
```

Organiser **par responsabilité** plutôt que par type quand un nouveau pilier produit grandit (ex. créer un dossier `lokascore/`, `alertes/`, `formalites/`, `reservation/` si une feature pèse plusieurs composants + hooks + types).

## TypeScript

- `tsconfig` en `strict: true` — garder.
- **Interdire `any`** : utiliser `unknown` + garde de type, ou typer correctement.
- Types de données dérivés des **types générés Supabase** (`supabase gen types typescript`) — pas retapés à la main. Si la commande n'a jamais été lancée, l'ajouter au workflow avant de modéliser de nouvelles tables.
- Nommage : composants `PascalCase`, hooks `useXxx`, fichiers de composant = nom du composant.

## Supabase (règles dures)

- **RLS activée sur CHAQUE table**, sans exception. Aucune table publique en écriture par défaut. Écrire les policies dès la création de la table.
- Côté client : **clé `anon` uniquement**. La clé `service_role` ne doit JAMAIS être bundle dans le front.
- **Logique sensible et appels aux API externes** (sources officielles, réservation, e-SIM, assurance) : dans des **Edge Functions** (`supabase/functions/`), pour garder les secrets hors du client. Les fonctions existantes (`advisories-fcdo`, `advisories-mae`, `advisories-us-state`, `advisories-who`, `world-alerts`, `lokascore-compute`) sont le pattern de référence.
- **Migrations versionnées dans le repo** ; pas de modif de schéma à la main en prod.
- Auth via `supabase-js` — déjà configurée avec un `customStorage` localStorage + `flowType: 'pkce'` (voir `src/app/lib/supabase.ts`). Ne pas réintroduire un autre client en parallèle.
- Données sécurité/formalités : chaque enregistrement porte une **source** (officielle, voir [[lokadia-product-context]]) et `updated_at` obligatoires.

## Récupération de données & offline

- **Pas de TanStack Query installé** aujourd'hui : les fetchs passent par des hooks et des Contexts maison (`AuthContext`, `CurrencyContext`…). Si tu introduis React Query, c'est un choix d'archi à signaler et à appliquer cohéremment, pas un patch local.
- **Offline-first** sur l'essentiel (Lokascore, formalités, alertes en cache, voyage sauvegardé) : persister via `localStorage` (déjà utilisé) ou IndexedDB et afficher l'état hors-ligne (`NetworkStatus` existe).
- Pas d'appel `supabase.from(...)` dispersé dans les composants : passer par un hook ou un Context dédié à la feature.

## Sécurité & RGPD (dans le code)

- Aucun secret en dur ni dans le client — variables d'env Vite (`VITE_*`) côté front, secrets Supabase côté Edge Function.
- **Jamais de données perso dans les URL/paramètres** ; pas de log de données sensibles (email, géoloc précise, token).
- Géolocalisation : permission **opt-in explicite**, finalité claire, gérer proprement le refus.
- Valider/typer toute entrée externe (réponses API partenaires, formulaires) — ne pas faire confiance à la forme attendue.

## Git & qualité

- Commits descriptifs courts en français (cf. `git log` du repo : « Détail voyage : bouton... », « Fix: onglet Réserver manquant... »). Rester cohérent.
- Lint ESLint (`npm run lint`) + typecheck (`tsc --noEmit`) **avant merge**.
- Tests sur les chemins critiques (voir [[lokadia-testing]]).

## Décisions verrouillées

- **Types Supabase générés** : commande de référence
  `supabase gen types typescript --linked > src/app/lib/database.types.ts`
  À ajouter comme script `gen:types` dans `package.json` ; à lancer manuellement après chaque migration + en pré-commit (hook léger). Importer via `import type { Database } from '@/app/lib/database.types'`.
- **État global** : **Contexts React uniquement** pour l'instant (`AuthContext`, `CurrencyContext`). Pas de Zustand/Redux. Si une feature dépasse 3 Contexts imbriqués → discussion, mais pas par défaut.
- **Variables d'env Vite** : préfixe `VITE_LOKADIA_*` pour tout ce qui est custom (ex. `VITE_LOKADIA_SUPABASE_URL`). `utils/supabase/info.ts` reste le point d'entrée canonique côté front ; pas de `process.env.X` dans les composants.
