---
name: lokadia-feature-spec
description: Feature specification template and workflow for the Lokadia web travel app. Use this skill whenever planning, scoping, specifying, or breaking down a new Lokadia feature BEFORE coding — or whenever the user describes something they want to add ("je veux ajouter", "on pourrait faire", "nouvelle feature", "comment on construit X"). It forces every feature to attach to one of the four product pillars (Lokascore, alertes, formalités, réservation), to address data + sources + RGPD + offline + transparency constraints, and to define testable acceptance criteria. Trigger it even for small features, so nothing ships that ignores the product's hard constraints. Use it to produce a structured spec, not to write the implementation.
---

# Lokadia — Spécification de feature

Charge ce skill AVANT de coder une feature Lokadia. Il produit une **spec structurée**, pas du code. Il s'appuie sur [[lokadia-product-context]] (contraintes dures), [[lokadia-design-system]] (UI) et [[lokadia-dev-conventions]] (technique).

## Quand l'utiliser

Dès que quelqu'un décrit quelque chose à ajouter ou à construire. Même une petite feature passe par ce gabarit, pour ne rien livrer qui ignore une contrainte dure.

## Gabarit de spec (TOUJOURS suivre ce plan)

```
# Feature : [nom]

## 1. Pilier
Rattacher à UN pilier : Lokascore | Alertes | Formalités | Réservation.
(Si ça n'entre dans aucun → signaler, ne pas inventer de pilier.)

## 2. Problème & utilisateur
- Pour qui (voyageur 18–40 / B2B) ?
- Quel problème concret ça résout ?

## 3. User stories
- En tant que…, je veux…, afin de…
- (1 à 5 stories.)

## 4. Données (Supabase)
- Tables / colonnes touchées ou nouvelles.
- Policies RLS associées (qui lit/écrit quoi).
- Edge Function nécessaire (oui/non — quel rôle).
- Si donnée sécurité/formalités : SOURCE officielle obligatoire (FCDO, MAE, US State, OMS, ou nouvelle source officielle à valider) + date de MAJ.

## 5. Écrans & composants
- Routes touchées (react-router) et écrans concernés.
- Composants du design system réutilisés / créés (privilégier ce qui existe dans `src/app/components/ui/`).
- États requis : chargement, vide, erreur, hors-ligne, refus de permission.

## 6. Contraintes produit (cocher et expliquer comment c'est respecté)
- [ ] Sources officielles citées (si applicable)
- [ ] Lokascore présenté comme « indicatif » + source + date (si le score apparaît)
- [ ] RGPD : données minimisées, consentement, géoloc opt-in si utilisée
- [ ] Offline : comportement défini pour l'essentiel
- [ ] Transparence : partenariats commerciaux signalés (si réservation)

## 7. Critères d'acceptation (testables)
- Formulés de façon vérifiable — alimentent [[lokadia-testing]].

## 8. Hors-périmètre
- Ce que cette feature ne fait PAS (pour cadrer).
```

## Règles de cadrage

- **Une feature = un pilier.** Si ça touche plusieurs piliers, la découper.
- Toute donnée de sécurité/formalité **sans source officielle identifiable** = bloquant : ne pas spécifier la feature tant que la source n'est pas définie. Les sources actuelles sont FCDO, MAE, US State, OMS (voir [[lokadia-product-context]]).
- Si le Lokascore apparaît à l'écran, la mention « indicatif » + source + date est **non négociable** dans les critères d'acceptation.
- Préférer un périmètre MVP étroit et livrable à une feature large et floue.

## Sortie attendue

Un document de spec rempli selon le gabarit ci-dessus, prêt à passer au design puis au code. Ne pas commencer l'implémentation tant que les sections 4, 6 et 7 ne sont pas remplies.
