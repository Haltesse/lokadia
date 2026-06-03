---
name: lokadia-design-system
description: Design system and UI conventions for the Lokadia web travel app (Vite + React + Tailwind + Radix/shadcn). Use this skill whenever building, styling, reviewing, or naming any Lokadia UI — screens, components, buttons, cards, the Lokascore display, alert badges, forms, empty/loading/offline states — or whenever colors, typography, spacing, iconography or accessibility for Lokadia come up. Trigger it even when the user just says "ce composant", "cet écran", "le bouton", "la carte destination" without restating Lokadia. It encodes the brand tokens (primary navy #0F4C81), the Gen Z mobile-first visual direction, the Lokascore risk-band colors, and accessibility rules so the interface stays consistent and the score is always shown as indicative with its source.
---

# Lokadia — Design system

Charge ce skill avant de produire ou revoir de l'UI Lokadia. Les contraintes produit (score indicatif, sources, RGPD, offline, transparence) viennent de [[lokadia-product-context]].

## Stack UI confirmée

- **Tailwind CSS** (`tailwind.config.ts`) — classes utilitaires.
- **Radix UI** primitives, wrappées en composants **shadcn-style** dans `src/app/components/ui/`.
- **CSS variables** pour les tokens, déclarées dans `src/styles/theme.css`, consommées via `hsl(var(--primary))` etc.
- Police : **Inter** (`fontFamily.sans` dans `tailwind.config.ts`).
- Icônes : **lucide-react**.
- Animations : `tailwindcss-animate` + keyframes maison (`fade-in`, `slide-in`, `ken-burns`).
- Maps : **react-leaflet**.
- Toasts : **sonner**.
- Animations avancées : **motion** (Framer Motion).

## Direction visuelle

Public Gen Z / 18–40 : interface **épurée, visuelle, lisible en mobilité**, grandes zones tactiles, hiérarchie claire. **Mobile-first** (majorité du trafic mobile, viewport non zoomable côté PWA).

## Tokens

### Couleurs

Toutes les couleurs sont déclarées comme variables CSS dans `src/styles/theme.css` et exposées dans Tailwind via `tailwind.config.ts` (`hsl(var(--primary))`, etc.). **Jamais de valeur hexadécimale en dur dans un composant** — passer par les classes utilitaires Tailwind (`bg-primary`, `text-foreground`…) ou par une variable CSS.

#### Marque (token `--lokadia-*`)

- **Primaire — Navy `#0F4C81`** (`--lokadia-primary`) + `-light: #1E6BA8`, `-dark: #0A3A5F`. CTA principaux, barres, accents de marque.
- **Secondaire — Cyan `#06B6D4`** (`--lokadia-secondary`) + light/dark. Voyage, fraîcheur.
- **Accent — Violet `#8B5CF6`** (`--lokadia-accent`) + light/dark. Premium, mises en avant ponctuelles.

Le token shadcn `--primary` est **wired sur le navy de marque** (`#0F4C81`) — donc tous les composants shadcn (`Button variant="default"`, `Switch`, `Checkbox`, `Calendar` selected, `Slider` filled, `Tabs` active…) sortent en navy de marque automatiquement. Ne pas re-aligner manuellement.

#### États sémantiques

- `--lokadia-success: #059669` + bg `#ECFDF5`
- `--lokadia-warning: #F59E0B` + bg `#FFFBEB`
- `--lokadia-danger: #DC2626` + bg `#FEF2F2`
- `--lokadia-info: #0EA5E9` + bg `#F0F9FF`

#### Catégories (6, pour tags / filtres)

`safety` (bleu ciel), `health` (émeraude), `transport` (violet), `culture` (ambre), `food` (rose), `accommodation` (cyan) — chacune avec sa variante `-bg` claire.

#### Neutres

Échelle `--lokadia-gray-50` → `--lokadia-gray-900` formalisée. Surfaces : `--lokadia-surface`, `--lokadia-background` (`#FAFAFA`), `--lokadia-background-subtle`.

### Bandes de risque Lokascore

La couleur ne doit **JAMAIS** être le seul signal (a11y daltonisme) : toujours libellé + valeur chiffrée.

- **0–33** : risque élevé
- **34–66** : risque modéré
- **67–100** : risque faible

Choisir des teintes contrastées (WCAG AA). **Ne pas réutiliser le navy de marque** comme couleur de risque. Définir 3 variables CSS dédiées (ex. `--risk-high`, `--risk-mid`, `--risk-low`) — pas `destructive`/`warning`/`success`, qui ont d'autres usages dans shadcn.

### Typographie

- Famille : **Inter** (Google Fonts, graisses 300/400/500/600/700/800/900 préchargées dans `index.html`).
- Échelle custom dans `theme.css` (`--text-xs` 13px → `--text-5xl` 52px) — légèrement plus généreuse que Tailwind par défaut. Utiliser via `text-xs`…`text-5xl` ; les `h1`-`h4` ont déjà un style de base (voir `@layer base` dans `theme.css`).
- Graisses : `--font-weight-normal: 400`, `--font-weight-medium: 500`. 2 graisses suffisent en pratique.

### Espacement & rayons

- Grille **Tailwind 4 px** + tokens sémantiques `--spacing-xs` (4px) → `--spacing-3xl` (64px).
- Rayons : 2 systèmes coexistent —
  - token shadcn `--radius: 0.625rem` (10px) décliné `lg/md/sm` dans Tailwind ;
  - tokens premium `--radius-xs` (8px) → `--radius-2xl` (32px) + `--radius-full` pour les composants Lokadia (cartes, modales, badges).
- Ombres : tokens `--shadow-xs` → `--shadow-2xl` dans `theme.css`. **Toujours** utiliser ces tokens pour les cards ; pas `shadow-lg` Tailwind par défaut, qui sort trop fort.

### Animations

Couche maison `.lk-*` dans `src/styles/animations.css` — c'est la référence à utiliser :

- Easings : `--lk-ease` (swift premium), `--lk-ease-soft`, `--lk-ease-spring`.
- Durées : `--lk-dur-fast` (150ms), `--lk-dur-base` (220ms), `--lk-dur-slow` (320ms).
- Classes d'entrée : `.lk-fade-in`, `.lk-fade-in-up`, `.lk-scale-in`, `.lk-pop-in` + délais staggered `.lk-delay-1`…`.lk-delay-6`.
- Interactions : `.lk-card-hover`, `.lk-card-hover-lift`, `.lk-img-zoom`, `.lk-overlay-fade`, `.lk-btn`.
- États : `.lk-skeleton` (shimmer), `.lk-pulse`, `.lk-toast`.
- `prefers-reduced-motion` est géré globalement → ne pas dupliquer dans chaque composant.

## Règles de composants

- **Cible tactile ≥ 44×44 px**. Espacement suffisant entre actions adjacentes.
- **Contraste WCAG AA** minimum (texte et icônes).
- Tout composant prévoit ses états : **défaut, hover, focus visible (clavier), pressé, désactivé, chargement (skeleton), vide, erreur, hors-ligne**.
- **Composant `LokascoreInfo`** (`src/app/components/LokascoreInfo.tsx`) : affiche la valeur, la bande de risque (couleur + libellé), la mention « indicatif » ET la/les **source(s) officielle(s)** + date de MAJ. **Ne jamais afficher le score nu** ailleurs — passer par ce composant ou un dérivé.
- **Badge d'alerte** : couleur + icône + libellé de sévérité (jamais couleur seule).
- **Contenu partenaire / réservation** : badge « Partenaire » ou équivalent visuel (transparence commerciale, voir [[lokadia-product-context]]).
- **Indicateur hors-ligne** : standardisé pour toute donnée mise en cache (composant existant : `NetworkStatus.tsx`).
- **Skeletons** : utiliser `SkeletonLoader.tsx` et `skeleton.tsx` pour les chargements, pas des spinners en plein écran.

## Application dans le code

- **Toujours** consommer les tokens via Tailwind/CSS variables, jamais en dur.
- Réutiliser les composants shadcn de `src/app/components/ui/` avant d'en créer un nouveau (Button, Card, Dialog, Drawer, Sheet, Tabs, etc. sont déjà là).
- Pour un nouveau composant métier : `src/app/components/<NomComposant>.tsx` (PascalCase), un fichier = un composant exporté.
- Composer avec `cn()` (`src/app/components/ui/utils.ts`) pour merger les classes Tailwind conditionnelles.
- Variantes : `class-variance-authority` (cva), comme dans `button.tsx`.
- Pour les overlays mobiles : préférer `Drawer` (vaul) à `Dialog` quand le contexte est mobile.

## Mobile

Règles globales dans `src/styles/mobile.css` — **ne pas dupliquer** dans les composants :

- Cibles tactiles ≥ 44px auto-appliquées via `@media (pointer: coarse)` (sauf opt-out `data-touch="compact"`).
- Tap-highlight bleu désactivé, feedback `scale(0.97)` au tap, `touch-action: manipulation` (pas de 300ms delay).
- Anti-zoom iOS : tout `input[type=text|email|…]` est forcé à `font-size: 16px` minimum.
- Safe-area : utilitaires `.safe-bottom`, `.safe-top`, `.sticky-bottom-cta` (auto `env(safe-area-inset-*)`).

## Mode sombre

**Status : configuré, pas piloté.** `darkMode: ["class"]` dans Tailwind et un bloc `.dark { ... }` dans `theme.css` existent, mais **aucun toggle UI** + les tokens `--lokadia-*` ne sont pas dark-mode-aware. Traiter comme désactivé.

Si on l'active un jour : il faudra ajouter un bloc `.dark` qui override aussi tous les `--lokadia-*` (palette, surfaces, gris) — pas seulement les tokens shadcn. **Ne pas exposer le toggle tant que ce travail n'est pas fait** (sinon UI cassée).

## Bandes de risque — variables dédiées

À ajouter (pas encore en place) :
```css
--risk-high:  #DC2626;  /* 0–33  — réutilise lokadia-danger */
--risk-mid:   #F59E0B;  /* 34–66 — réutilise lokadia-warning */
--risk-low:   #059669;  /* 67–100 — réutilise lokadia-success */
```
Couplés à un libellé + valeur chiffrée (jamais la couleur seule).
