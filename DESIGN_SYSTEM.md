# Design system Lokadia

Référence unique de l'interface. Écrite au Lot 6, à jour du code au
18/08/2026. Elle vit à la racine du dépôt (et non dans `Document/`, qui
n'est pas versionné) parce que c'est un document de développement.

Ce document décrit **ce qui existe réellement dans le dépôt**, y compris ce
qui n'est pas propre : la dette assumée est signalée comme telle, avec la
raison de ne pas l'avoir soldée tout de suite.

---

## 1. Jetons (tokens)

Tous les jetons vivent dans `src/styles/theme.css` (thème clair) et
`src/styles/dark.css` (thème sombre). **Aucune valeur hexadécimale en dur
dans un composant** : un composant qui code sa couleur en dur ne suit pas le
thème, et c'est exactement ce qui a cassé au moment d'activer le mode
sombre.

### Marque

| Jeton | Clair | Sombre | Usage |
|---|---|---|---|
| `--lokadia-primary` | `#0F4C81` | `#3B82C4` | CTA, liens, accents |
| `--lokadia-primary-dark` | `#0A3A5F` | `#2A6FA8` | Fonds pleins portant du texte blanc |
| `--lokadia-secondary` | `#06B6D4` | `#22D3EE` | Accent voyage |
| `--lokadia-accent` | `#8B5CF6` | `#A78BFA` | Premium, ponctuel |

En sombre, le navy de marque tombe sous le seuil de contraste : la teinte
est conservée, la luminosité montée. `#3B82C4` est le compromis qui passe
**des deux côtés** — ~4,0 avec du blanc (bouton plein) et ~4,5 sur le fond
sombre (texte).

### États sémantiques

`--lokadia-success`, `--lokadia-warning`, `--lokadia-danger`,
`--lokadia-info`, chacun avec un `-bg` (fond teinté). En sombre, la couleur
s'éclaircit et le `-bg` s'assombrit — les rôles sont conservés, les
composants n'ont rien à changer.

### Catégories

`safety`, `health`, `transport`, `culture`, `food`, `accommodation`, chacune
avec un `-bg`. **Ces jetons servent de couleur de texte et d'icône**, posés
sur leur `-bg` : ils sont donc volontairement foncés en clair (`#B45309`
pour l'ambre, pas `#F59E0B`) et clairs en sombre. Un ambre vif sur un fond
crème donnait 1,9:1 — illisible.

### Neutres

Échelle `--lokadia-gray-50` → `-900`. **En mode sombre, l'échelle est
inversée mais les rôles sont préservés** : `gray-900` reste « la couleur du
texte principal », `gray-100` reste « la bordure discrète ». C'est ce choix
qui a permis de basculer 300 composants sans les toucher.

Surfaces : `--lokadia-surface` (cartes), `--lokadia-background` (page),
`--lokadia-background-subtle`.

### Bandes de risque

`--risk-high`, `--risk-mid`, `--risk-low`. **La couleur n'est jamais le seul
signal** : toujours libellé + valeur chiffrée (daltonisme).

### Alias hérités — dette assumée

`--lokadia-text-dark`, `--lokadia-text-light`, `--lokadia-blue`,
`--lokadia-deep-blue`, `--lokadia-soft-white`, `--lokadia-emergency-orange`,
`--lokadia-warning-orange`, `--lokadia-success-green`,
`--lokadia-vigilance`.

Ces noms étaient utilisés à **plus de 200 endroits sans avoir jamais été
définis** : `var(--lokadia-text-dark)` ne résolvait rien, la couleur
retombait sur l'héritage et les fonds concernés étaient transparents.
Invisible sur fond blanc, béant en sombre. Ils sont désormais définis comme
alias des vrais jetons, donc dark-aware.

**Dépréciés.** Tout nouveau code utilise les jetons cibles.

---

## 2. Mode sombre

Trois états : `clair`, `sombre`, `système` (défaut). Le choix est mémorisé
sur l'appareil (`lokadia_theme`) et l'emporte ensuite sur le réglage
système, qui reste suivi en direct s'il n'y a pas de choix explicite.

- Contexte : `src/app/context/ThemeContext.tsx`
- Bascule : `src/app/components/ThemeToggle.tsx`
  (`variant="icon"` en barre, `variant="segmented"` dans les réglages)
- Amorçage : `public/theme-boot.js`, chargé **avant** le rendu. Sans lui,
  une page sombre commence par un éclair blanc. C'est un fichier externe et
  non un script en ligne parce que la CSP interdit `unsafe-inline`.

### Le pont Tailwind — dette assumée

`src/styles/dark.css` remappe, sous `.dark`, les utilitaires Tailwind
écrits en dur dans les écrans : `bg-white`, `bg-*-50/100`, `text-gray-*`,
`text-red-800`… Il y en a plus de 600 dans l'application ; les réécrire un
par un aurait été long et risqué.

**Règle** : ce pont est transitoire, isolé dans un seul fichier pour
pouvoir être retiré au fil de l'eau. **Un nouveau composant utilise les
jetons**, pas ces classes.

### Vérification

La bascule a été validée par un audit de contraste exécuté dans la page :
pour chaque élément textuel visible, la couleur effective est comparée au
fond effectif (premier ancêtre opaque) et le ratio WCAG calculé. Les écrans
vérifiés (accueil, fiche destination et ses 9 onglets, profil, alertes)
ressortent à **0 élément sous 3:1**, dans les deux thèmes.

À relancer après toute grosse modification d'écran — c'est plus fiable que
l'œil, et ça trouve les couleurs héritées invisibles à la relecture.

---

## 3. États d'une donnée

Composant unique : `src/app/components/AsyncState.tsx`.

Ordre de priorité imposé — **hors-ligne avant erreur** : « vous êtes hors
connexion » est une information utile, « une erreur est survenue » n'en est
pas une. En voyage, c'est le cas le plus fréquent.

| État | Rendu |
|---|---|
| Chargement | `SkeletonLoader` (`card`, `list`, `text`) — jamais un spinner plein écran |
| Hors-ligne | Icône réseau + rappel que les données déjà consultées restent lisibles avec leur date |
| Erreur | Message + bouton « Réessayer » quand un `onRetry` est fourni |
| Vide | `EmptyState` : titre, explication, action de sortie |

Un écran qui affiche une liste doit passer par ce composant plutôt que de
bricoler son propre `{loading ? … : …}`.

---

## 4. Animations

Couche `.lk-*` dans `src/styles/animations.css` : easings, durées, classes
d'entrée (`.lk-fade-in-up`, `.lk-scale-in`…), interactions
(`.lk-card-hover`, `.lk-btn`), états (`.lk-skeleton`, `.lk-pulse`).

`prefers-reduced-motion` est traité **globalement** à deux endroits, et il
fallait les deux :

1. une règle CSS qui neutralise animations et transitions ;
2. `<MotionConfig reducedMotion="user">` dans `App.tsx` — les animations
   Framer Motion sont pilotées en JavaScript et ignorent la règle CSS.

Ne pas redupliquer la gestion dans les composants.

---

## 5. Raccourcis clavier

Palette : `src/app/components/CommandPalette.tsx`. Le catalogue de
destinations (~190 ko) y est chargé **à la première ouverture**, pas au
démarrage — la palette est montée globalement, un import statique
ramènerait tout le jeu de données dans le bundle initial.

| Touche | Action |
|---|---|
| `⌘K` / `Ctrl K` | Ouvrir la palette |
| `?` | Aide raccourcis |
| `T` | Basculer clair / sombre |
| `↑` `↓`, `Entrée`, `Échap` | Navigation dans la palette |

Les touches simples sont **inhibées pendant une saisie** : sans cela, taper
« t » dans un champ basculerait le thème. Le bouton « Rechercher ⌘K » de la
barre annonce le raccourci — un raccourci qu'on ne découvre qu'en lisant la
documentation n'existe pas.

---

## 6. Règles de composants

- Cible tactile ≥ 44×44 px (appliqué globalement dans `mobile.css`).
- Contraste WCAG AA minimum, texte et icônes.
- Tout composant prévoit : défaut, survol, focus visible clavier, pressé,
  désactivé, chargement, vide, erreur, hors-ligne.
- **Le Lokascore ne s'affiche jamais nu** : `LokascoreBadge` /
  `LokascoreInfo` portent la valeur, la bande de risque, la mention
  « indicatif », les sources et la date. Il n'apparaît ni dans les titres de
  page, ni dans les métadonnées, ni dans les données structurées — hors de
  son contexte, il perdrait tout ce qui le rend honnête.
- Badge d'alerte : couleur **+** icône **+** libellé de sévérité.
- Contenu partenaire : badge de transparence commerciale.
- Donnée en cache : date de capture visible (`NetworkStatus`, `fromCache`).

---

## 7. Où ajouter quoi

| Besoin | Endroit |
|---|---|
| Nouvelle couleur | `theme.css` **et** `dark.css`, jamais dans un composant |
| Nouveau composant métier | `src/app/components/<Nom>.tsx`, PascalCase |
| Primitive d'interface | `src/app/components/ui/` (shadcn/Radix existants d'abord) |
| État asynchrone | `AsyncState`, pas un ternaire local |
| Raccourci clavier | `CommandPalette.tsx` + la table `SHORTCUTS` (elle alimente l'aide) |
