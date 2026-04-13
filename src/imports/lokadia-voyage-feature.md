Tu es une équipe complète de développement (Mobile + Backend + Produit/UX) chargée d’ajouter une fonctionnalité majeure à l’application Lokadia : l’espace Voyage. Le produit existe déjà : l’app est une aide au voyage qui centralise les informations par destination. Nous avons déjà environ 30 destinations détaillées (pays / villes) avec les informations importantes. Maintenant, nous voulons que l’expérience utilisateur, lorsqu’il crée un voyage et clique dessus dans l’onglet “Voyages”, soit exceptionnelle : elle doit couvrir tout l’avant-voyage (préparation) et tout le pendant-voyage (sur place), et proposer un itinéraire multi-étapes sur une carte avec les meilleurs moyens de transport et des suggestions intelligentes.

Objectif principal

Quand l’utilisateur ouvre un voyage (ex : “Japon – 10/06 → 24/06”), l’app doit afficher un dashboard complet et actionnable, basé sur :

la destination principale (pays)

les villes/étapes de son itinéraire (Tokyo, Kyoto, Nara, Osaka…)

les dates (avant / pendant)

le profil voyage (solo/couple/famille, rythme, intérêts)

les contenus destination déjà existants dans Lokadia (ne pas les re-rédiger : les réutiliser et les assembler intelligemment)

Contraintes à respecter

Le contenu déjà présent (les 30 destinations) doit être réutilisé via une couche “assemblage” : on ne duplique pas les textes, on les référence.

Le voyage doit fonctionner même avec réseau instable : chargement progressif + cache local, et si Premium existe, permettre un mode offline du voyage.

Les écrans doivent être clairs, ultra actionnables, et orientés “check / faire maintenant”.

1) UX / Écrans à créer
1.1 Onglet “Voyages” (liste)

Liste des voyages de l’utilisateur : à venir / en cours / passés.

Chaque carte voyage affiche :

Pays + villes principales (chips : Tokyo, Kyoto, Osaka…)

Dates

Statut (à venir / en cours)

Progression préparation (ex : checklist 12/40)

Action : tap sur une carte → ouvre Détail Voyage.

1.2 Écran “Détail Voyage” (le cœur)

Cet écran doit être un hub avec 4 sous-onglets (tabs) :

Aperçu

Avant le départ

Pendant le voyage

Itinéraire / Carte

Onglet 1 — Aperçu (Dashboard)

Afficher en haut :

Destination principale (Japon)

Dates

Bouton “Modifier itinéraire”

Bouton “Partager voyage”

Blocs (cards) :

“À faire maintenant” (3–5 actions prioritaires calculées)

ex : vérifier passeport/visa, activer eSIM, ajouter assurance, télécharger offline, lire alertes

“Alertes importantes” liées au pays + villes de l’itinéraire

“Météo / saison” (si source dispo)

“Checklist progression” + CTA “Ouvrir checklist”

“Récap transport” (nombre d’étapes, temps total approximatif, meilleur pass conseillé si disponible)

“Contacts utiles” (urgences, consulat, etc.)

Onglet 2 — Avant le départ (Préparation)

Regrouper tout ce qui est nécessaire avant de partir, alimenté par les contenus destination existants :

Entrée / Visa / Passeport

Santé (vaccins, recommandations)

Assurance (CTA affiliation si produit le prévoit)

Argent (carte, cash, change)

Télécom (eSIM recommandée)

Sécurité (risques connus + conseils)

Culture / règles (respect local, usages)

Documents à emporter (généré dans checklist)

Chaque section doit avoir :

un résumé court (bullet points)

un bouton “Voir détails” (ouvre la page destination existante ou une version filtrée)

un bouton “Ajouter à ma checklist” si l’élément n’y est pas encore

Onglet 3 — Pendant le voyage (Sur place)

C’est un “mode terrain” : affichage rapide, utile, consultable vite.
Contenu :

“Infos locales aujourd’hui” (selon ville active)

“Urgences” (appeler numéros, consulat, hôpitaux proches si possible)

“Sécurité & zones sensibles” (si disponible)

“Arnaques fréquentes” (rappel court)

“Transports locaux” (rappels : IC card, trains, etc. selon destination)

“Phrases utiles / notes perso” (mini bloc-notes)

“Mes étapes” (timeline du voyage : Tokyo → Kyoto → …)

Bouton “Je suis à…” (permet de sélectionner la ville active pour adapter les infos)

Onglet 4 — Itinéraire / Carte (la partie “wow”)

C’est la fonctionnalité phare : une carte avec l’itinéraire multi-villes.
Exigences :

Carte affichant des marqueurs pour chaque étape (Tokyo, Kyoto, Nara, Osaka…)

Ligne(s) reliant les étapes dans l’ordre

Pour chaque segment (Tokyo → Kyoto), afficher :

moyens de transport suggérés (train, bus, avion, voiture)

durée estimée

coût estimatif si possible (sinon “variable”)

recommandation “le plus pratique” (ex : Shinkansen)

conseils : “réserver à l’avance”, “pass conseillé”, “bagages”

UI : chaque segment est cliquable → ouvre une fiche segment :

options de transport classées (pratique/rapide/éco)

liens utiles (si existants) ou notes

“Ajouter rappel” (ex : réserver billets)

Fonction “Suggestions d’étapes”

Si l’utilisateur a Tokyo → Kyoto → Osaka, proposer des suggestions logiques :

Nara (day trip depuis Kyoto/Osaka)

Hakone (depuis Tokyo)

Hiroshima / Miyajima (depuis Osaka/Kyoto)

Les suggestions doivent être basées sur :

proximité géographique

durée du voyage

popularité / tendances internes (si données)

centres d’intérêt (culture, nature, food, etc.)

UX : suggestions affichées en bas de carte avec bouton “Ajouter à mon itinéraire”.

2) Data model et logique backend (à implémenter)
2.1 Structures indispensables

Créer/adapter les entités suivantes :

Trip (Voyage)

id, user_id

country_destination_id (ex : Japon)

start_date, end_date

traveler_profile (json : type de voyage, rythme, centres d’intérêt)

active_city_destination_id (ville “courante” pendant le voyage)

created_at, updated_at

TripStop (Étape)

id, trip_id

destination_id (ville)

order_index

start_date (optionnel), end_date (optionnel)

notes (optionnel)

TripSegment (Trajet entre étapes)

id, trip_id

from_stop_id, to_stop_id

recommended_mode (train/bus/flight/car)

alternatives (json)

distance_km, duration_min_estimated

metadata (json : pass conseillé, réservation, etc.)

source (ex : provider / calcul interne)

TripChecklist

items liés au trip (pré-remplis depuis templates + destination + profil)

2.2 API à livrer (REST ou GraphQL, mais cohérent)

Créer / modifier un voyage

Ajouter / réordonner / supprimer étapes

Récupérer “dashboard voyage” (aperçu)

Récupérer “avant le départ” agrégé

Récupérer “pendant le voyage” agrégé

Récupérer itinéraire + segments + suggestions

Mettre à jour “ville active”

Checklist : CRUD + génération

Exigence de performance :

Un endpoint agrégé GET /trips/{id}/dashboard doit renvoyer tout le nécessaire pour le premier écran (aperçu) en une requête.

3) Moteur “Transport & Route” (sans surpromettre)

Tu dois implémenter une première version robuste :

Calcul de distance entre villes (lat/lon des destinations existantes)

Estimation de durée par mode (règles simples au début) :

train : vitesse moyenne + pénalité correspondances

voiture : vitesse moyenne route

bus : vitesse moyenne + marge

avion : temps check-in + vol + transfert

Puis un “ranking” :

“Le plus pratique” favorise train si infrastructure forte (ex : Japon)

“Le plus économique” favorise bus si plausible

“Le plus rapide” favorise avion au-delà d’un certain seuil distance

Important : si tu utilises un fournisseur externe (Google Directions, Mapbox Directions, Rome2rio, etc.), abstrais-le derrière une interface TransportProvider afin de pouvoir changer de provider plus tard. Si aucun provider n’est configuré, fallback sur les règles internes.

4) Assemblage intelligent des contenus existants

Nous avons déjà des pages destination (Tokyo, Japon, etc.) avec les infos importantes.
Le Voyage ne doit pas dupliquer : il doit composer :

“Avant le départ” = sections du pays + items checklist + sources

“Pendant le voyage” = sections de la ville active + urgences + arnaques + sécurité

“Alertes” = alertes liées à pays + villes du trip

Créer une couche TravelBriefBuilder (ou équivalent) qui :

prend trip + étapes + dates

renvoie des cartes UI prêtes (titre, résumé, actions, liens vers détails)

gère l’ordre de priorité (“à faire maintenant”) selon imminence du départ et criticité (alertes).

5) Détails UI importants (boutons & interactions)

Dans “Détail Voyage” il faut :

Bouton “Modifier itinéraire”

ouvre un éditeur d’étapes (drag & drop, ajouter suggestion)

Bouton “Télécharger offline” (si Premium)

Bouton “Partager”

Bouton “Définir ville active”

Sur chaque section “Avant le départ” :

“Ajouter à checklist”

“Voir détails”

Sur chaque segment de trajet :

“Voir options”

“Ajouter rappel”

Gestion états :

loading skeleton

empty state (pas d’étapes → proposer assistant “Construire mon itinéraire”)

offline state (contenu cache, message clair)

6) “Assistant itinéraire” (flow guidé)

Créer un flow pour construire l’itinéraire :

Étape 1 : ville d’arrivée (Tokyo)

Étape 2 : durée totale + rythme (relax / normal / intense)

Étape 3 : centres d’intérêt (culture, nature, gastronomie, animé, etc.)

Étape 4 : proposition d’itinéraire auto (Tokyo → Kyoto → Osaka + suggestions)

Étape 5 : validation & création des étapes + segments

7) Qualité, tests, et sécurité

Aucun secret Supabase côté client autre que l’ANON key.

Les données voyage sont privées (RLS ou middleware auth).

Tests :

création voyage, ajout étapes, génération brief

route builder fallback

dashboard endpoint performance

Résultat attendu

À la fin, un utilisateur qui crée un voyage “Japon” et l’ouvre voit :

un tableau de bord clair (actions prioritaires)

un onglet préparation avant départ complet

un onglet “pendant” adapté à la ville active

une carte multi-villes avec trajets suggérés, moyens de transport et recommandations

des suggestions d’étapes pertinentes ajoutables en un tap