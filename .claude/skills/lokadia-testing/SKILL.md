---
name: lokadia-testing
description: Testing strategy and quality gates for the Lokadia web travel app. Stack is Vite + React + TypeScript + Supabase. Use this skill whenever writing, planning, or reviewing tests for Lokadia, setting up CI/quality checks, or deciding what to cover — unit, component, integration, end-to-end, accessibility, and Supabase Row Level Security policy tests. Trigger it even when the user just says "ajoute des tests", "comment tester", "couverture", "ça casse rien ?" in the Lokadia context. It prioritizes the product's risk areas — the Lokascore is never shown without its "indicative" label and source, alert severity rendering, offline behavior, and the geolocation/RGPD permission flows.
---

# Lokadia — Tests & qualité

Charge ce skill pour tout ce qui touche aux tests et à la qualité. Le « pourquoi » de chaque test découle des contraintes produit : voir [[lokadia-product-context]].

## État actuel

Aucun runner de tests n'est encore installé. Les recommandations ci-dessous sont la cible. **Quand tu introduis le premier test, installe la stack en une fois et documente-la dans ce skill** plutôt que d'empiler des outils au coup par coup.

## Stack cible (web)

- **Unitaires + composants** : **Vitest** + **@testing-library/react** + **@testing-library/jest-dom** + **jsdom**.
- **E2E** : **Playwright** (web, multi-navigateur).
- **RLS Supabase** : Supabase CLI + base de test locale (`supabase start`) + scripts SQL/TS qui valident chaque policy avec des sessions utilisateur réelles.
- **A11y** : `@axe-core/playwright` pour les parcours clés.

Pas de Jest, pas de React Native Testing Library, pas de Maestro/Detox — c'est un projet web.

## Pyramide

- **Unitaires** : logique pure (normalisation du Lokascore côté client, formatage, mappers, helpers `date-fns`, `cn()`). Rapides, nombreux.
- **Composants** : rendu et interactions (Testing Library). Vérifier les états : chargement (skeleton), vide, erreur, hors-ligne, focus clavier.
- **Intégration** : hooks/Contexts de data + cache localStorage, avec Supabase mické au niveau du client.
- **E2E** (parcours critiques, peu nombreux) : Playwright.

## À tester en priorité (spécifique Lokadia)

Ces tests protègent des contraintes produit/juridiques :

1. **Lokascore jamais nu** : tout écran/compo affichant le score affiche AUSSI la mention « indicatif », la **source** et la **date de MAJ**. Assertion explicite — c'est une exigence juridique, pas cosmétique. Cibler `LokascoreInfo.tsx` et toute vue qui le consomme.
2. **Bandes de risque** : la bonne bande (élevé/modéré/faible) et le bon libellé pour des valeurs limites (0, 33, 34, 66, 67, 100), avec un signal non-coloré (a11y).
3. **Alertes** : sévérité rendue avec icône + libellé (pas couleur seule) ; tri/affichage géolocalisé.
4. **Offline** : les données essentielles (score, formalités, alertes en cache, voyage sauvegardé) restent consultables et l'indicateur hors-ligne (`NetworkStatus.tsx`) s'affiche.
5. **Permissions / RGPD** : flux d'opt-in géoloc, et comportement correct en cas de **refus**.
6. **RLS Supabase** : tests de policy — un utilisateur ne peut lire/écrire que ce qu'il doit. À exécuter contre une base de test (`supabase start`), pas en mockant tout. Couvrir au minimum : voyages, profils, favoris.
7. **Edge Functions advisories** : que la normalisation des réponses FCDO/MAE/US State/OMS préserve toujours `source` et `updated_at` — c'est la donnée qui alimente la conformité juridique.

## Portes de qualité (CI)

- `tsc --noEmit` + `npm run lint` : **bloquants**.
- Tests unitaires + composants : **bloquants** sur les fichiers touchés par le diff.
- **Couverture** : viser une cible pragmatique sur les chemins critiques (Lokascore, alertes, auth, parcours de réservation, RLS) plutôt qu'un % global vanté.
- A11y de base (axe) sur les composants clés et au moins une route E2E.
- E2E des parcours majeurs en pré-release (pas à chaque commit).

## Bonnes pratiques

- Tester le **comportement**, pas l'implémentation. Préférer « l'utilisateur voit X » à « le composant appelle Y ».
- Mocker Supabase au niveau du **client** (`src/app/lib/supabase.ts`), pas dans chaque composant.
- Données de test réalistes (destinations, scores, alertes) factorisées en **fixtures** réutilisables.
- Un test = une intention, nom descriptif (FR ou EN, mais cohérent dans un fichier).
- Pour le Lokascore spécifiquement : un helper `expectLokascoreShownProperly(screen, { value, source, updatedAt })` réutilisable rend les assertions juridiques uniformes — à factoriser dès le 2ᵉ test concerné.

## Décisions verrouillées

- **Base Supabase de test** : `supabase start` en local (Docker), et en CI on monte une instance jetable via la même CLI au début du job. **Pas de base mutualisée partagée** — chaque run a son schéma propre, appliqué via `supabase/migrations`.
- **Couverture** : pas de seuil % global vanté. Par feature, couvrir au minimum (1) la logique pure, (2) le composant principal, (3) un parcours d'erreur, (4) le hors-ligne si applicable. Le typecheck + lint + RLS tests font le reste du gros du travail.
- **E2E** : Playwright local + **GitHub Actions** (job dédié, pas à chaque commit, mais sur PR vers `master` et en pré-release). Pas de service tiers.
