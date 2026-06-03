---
name: lokadia-product-context
description: Core product context, hard constraints, and vocabulary for the Lokadia travel web app. Load this skill at the start of ANY Lokadia work — design, code, spec, testing, copy. It defines the four product pillars (Lokascore, alertes, formalités, réservation), the non-negotiables (Lokascore always shown as "indicatif" with its source, official sources only for safety/formality data, RGPD/geoloc opt-in, offline-first essentials, partner transparency), and the user profile (18–40 Gen Z travelers, B2B side). Trigger it whenever Lokadia is mentioned — even casually ("Lokadia", "le score", "une alerte", "formalités", "réservation") — so the hard rules never get bypassed.
---

# Lokadia — Contexte produit

Référence centrale pour tout travail Lokadia. Les autres skills ([[lokadia-design-system]], [[lokadia-dev-conventions]], [[lokadia-feature-spec]], [[lokadia-testing]]) s'appuient dessus pour leurs règles dures.

## Qu'est-ce que Lokadia

App web (PWA mobile-first) d'aide à la décision voyage pour un public **18–40 ans, Gen Z**. Une version B2B (entreprises envoyant des collaborateurs en mission) est dans le plan produit.

## Quatre piliers (toute feature DOIT s'y rattacher)

1. **Lokascore** — score 0–100 de risque global par destination, calculé côté serveur à partir de sources officielles.
2. **Alertes** — événements de sécurité/santé géolocalisés (manifestations, catastrophes, alertes sanitaires…).
3. **Formalités** — visas, vaccins, documents d'entrée par couple (nationalité × destination).
4. **Réservation** — e-SIM, assurance, hôtel, vols, activités via partenaires (revenu d'affiliation).

Si quelque chose n'entre dans aucun pilier : signaler, ne pas inventer un cinquième pilier.

## Sources officielles confirmées

Les Edge Functions Supabase qui alimentent le Lokascore et les alertes (`supabase/functions/`) :

- **FCDO** (UK Foreign, Commonwealth & Development Office) — `advisories-fcdo`
- **MAE** (Ministère français des Affaires Étrangères — Conseils aux voyageurs) — `advisories-mae`
- **US State Department** (Travel Advisories) — `advisories-us-state`
- **OMS / WHO** (alertes sanitaires) — `advisories-who`
- Agrégation alertes mondiales — `world-alerts`
- Calcul du score — `lokascore-compute`

Toute donnée de sécurité/formalité affichée doit pointer vers UNE de ces sources (ou une nouvelle source officielle ajoutée explicitement). **Pas de blog, pas de Wikipédia, pas de scraping non-officiel.**

## Contraintes dures (non négociables)

### 1. Lokascore « indicatif » + source — exigence juridique

Le Lokascore est un **indicateur synthétique, pas une garantie**. Partout où il s'affiche :

- la mention **« indicatif »** doit être présente,
- la/les **source(s) officielle(s)** ayant servi au calcul doivent être citées,
- la **date de mise à jour** doit être visible.

Afficher le score nu = bug bloquant, pas cosmétique. C'est ce qui protège Lokadia juridiquement.

### 2. Sources officielles uniquement pour la sécurité/formalités

Chaque enregistrement de sécurité ou formalité porte une `source` (officielle) et un `updated_at`. Une feature qui n'a pas de source identifiable est **bloquée en spec**, pas implémentée « en attendant ».

### 3. RGPD & permissions

- Géolocalisation : **opt-in explicite**, finalité claire à l'utilisateur, comportement défini si refus.
- Minimisation : ne collecter que le strict nécessaire.
- Pas de PII dans les URL, les logs, ou les analytics.
- Consentement traçable.

### 4. Offline-first sur l'essentiel

Le voyageur n'a pas toujours de réseau. Doivent rester consultables hors-ligne (après premier chargement) :

- Lokascore et bandes de risque des destinations consultées,
- formalités déjà ouvertes,
- alertes récentes en cache,
- voyage sauvegardé / itinéraire.

Un indicateur « hors-ligne / données du [date] » est obligatoire dans ce mode (composant existant : `NetworkStatus.tsx`).

### 5. Transparence commerciale

Les sections Réservation génèrent du revenu via partenaires. Tout contenu partenaire doit être **visuellement signalé** (badge « Partenaire » ou équivalent). Pas de fausse neutralité éditoriale sur du contenu sponsorisé.

## Bandes de risque du Lokascore

- **0–33** : risque élevé
- **34–66** : risque modéré
- **67–100** : risque faible

La couleur n'est JAMAIS le seul signal (a11y / daltonisme) : toujours libellé + valeur chiffrée.

## Vocabulaire à utiliser

- « Lokascore » (un mot, majuscule L) — pas « score Lokadia » ni « Loka-score ».
- « indicatif » — pas « estimatif » ni « approximatif ».
- « alerte » — pas « warning » ni « incident ».
- « formalités » — pas « papiers » ni « documents requis » en titre principal.
- « destination » — pas « pays » (une destination peut être sous-nationale).

## Quand charger ce skill

Avant TOUT travail Lokadia : design, code, spec, tests, copywriting, support. C'est la base sur laquelle les autres skills s'appuient.
