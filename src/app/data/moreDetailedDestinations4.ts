import type { DestinationDetails } from "./types";

// Lot 4: Destinations supplémentaires ultra-détaillées
export const moreDetailedDestinations4: Record<string, DestinationDetails> = {

  "rome-italy": {
    id: "rome-italy",
    name: "Rome",
    country: "Italie",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 78,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+1 (CET)",
    language: "Italien (Anglais parlé zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Rome est modérément sûre mais les pickpockets sont OMNIPRÉSENTS dans tous les lieux touristiques. Les gangs organisés (souvent mineurs roms) opèrent au Colisée, Fontaine de Trevi, Vatican, métro, bus. Arnaques restaurants/taxis fréquentes. Évitez Termini et certains quartiers périphériques la nuit. Circulation chaotique (scooters partout). Chaleur extrême été (38-40°C).",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Recrudescence pickpockets",
        summary: "Forte activité signalée métro A et zone Colisée-Forum. Gangs de mineurs très actifs.",
        date: "Aujourd'hui, 11:00"
      },
      {
        id: 2,
        type: "info",
        title: "Canicule prévue",
        summary: "Températures 39-41°C cette semaine. Colisée et Forum fermés 11h-17h. Hydratez-vous.",
        date: "Il y a 1 jour"
      }
    ],
    dangerousAreas: [
      "Gare Termini et alentours après 22h (dealers, prostitution, ivrognes)",
      "Esquilino la nuit (quartier gare)",
      "Certaines zones de Tor Bella Monaca et Corviale (banlieues)",
      "Ostiense tard le soir",
      "Parcs isolés la nuit (Villa Borghese après tombée nuit)"
    ],
    safetyTips: [
      "Pickpockets PARTOUT zones touristiques: sac devant fermé, main sur fermeture éclair TOUJOURS",
      "Technique classique: 1 enfant/ado distrait devant, 2-3 autres volent derrière. Criez fort si approche",
      "Métro lignes A et B: Gangs très actifs aux heures pointe. Sac DEVANT, fermé, protégé",
      "Colisée, Fontaine Trevi, Vatican: Paradis pickpockets. Vigilance maximale en admirant monuments",
      "Ne laissez JAMAIS sac/veste sur chaise restaurant (vols à l'arraché fréquents même terrasses)",
      "Faux policiers: VRAIS flics ne demandent JAMAIS portefeuille. Exigez aller commissariat",
      "Bus touristiques ouverts: Cible privilégiée. Gardez TOUT dans sac fermé sur vous"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Système de santé public italien correct mais débordé. Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE. Hôpitaux: Policlinico Gemelli, Policlinico Umberto I. Pharmacies nombreuses. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, etc.",
    entryDocuments: "Carte d'identité ou passeport valide pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Pickpockets gangs organisés",
        desc: "Gangs de 3-6 mineurs (souvent roms) opèrent partout. Technique: distraction devant (carton, journal, bébé), vol derrière. Au métro: vous coincent entre eux pendant montée/descente. SOLUTION: Sac DEVANT fermé, criez FORT 'Vai via!' (partez!) si approche suspecte, repoussez physiquement si nécessaire."
      },
      {
        title: "Faux policiers",
        desc: "2-3 personnes en civil, faux badges, prétendent contrôle drogues/faux billets, demandent portefeuille. SOLUTION: VRAIS policiers NE demandent JAMAIS portefeuille. Exigez voir carte officielle avec photo. Proposez aller commissariat. Appelez 112.",
      },
      {
        title: "Gladiateurs Colisée",
        desc: "Personnes déguisées proposent photo '5€', puis réclament 50€ par personne agressivement. SOLUTION: Négociez prix AVANT photo (max 5-10€ total) ou refusez complètement.",
      },
      {
        title: "Restaurants pièges touristes",
        desc: "Rabatteurs insistants près monuments, cartes sans prix, addition 80-150€ pour pâtes simples. Certains ajoutent 'service' 20%, 'couvert' 5€/pers, 'pain' 3€ non demandé. SOLUTION: Vérifiez TOUS les prix avant commander. Refusez couvert/pain si vous n'en voulez pas. Mangez dans rues LOIN des monuments (Trastevere, Testaccio).",
      },
      {
        title: "Taxis aéroport sans compteur",
        desc: "Chauffeurs refusent compteur, proposent tarif fixe 80-120€. Tarif officiel Fiumicino-centre: 48€ fixe. Ciampino-centre: 30€ fixe. SOLUTION: Exigez respecter tarif officiel ou prenez Leonardo Express (train 14€).",
      },
      {
        title: "Faux billets coupe-file",
        desc: "Vendeurs rue proposent billets Vatican/Colisée. Contrefaits ou invalides. SOLUTION: Achetez billets sites officiels en ligne UNIQUEMENT.",
      },
      {
        title: "Jet rose/bracelet forcé",
        desc: "Vendeurs lancent rose dans vos mains ou attachent bracelet rapidement, puis réclament 10-20€. Peuvent être agressifs. SOLUTION: Mains dans poches près monuments. Refusez fermement, jetez rose/bracelet par terre, partez.",
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport Fiumicino → centre (tarif fixe)", price: "€48" },
      { item: "Leonardo Express train Fiumicino → Termini", price: "€14" },
      { item: "Taxi Ciampino → centre (tarif fixe)", price: "€30" },
      { item: "Ticket métro/bus simple", price: "€1.50" },
      { item: "Pass 24h transports", price: "€7" },
      { item: "Pass 72h transports", price: "€18" },
      { item: "Caffè espresso comptoir", price: "€1-1.50" },
      { item: "Cappuccino comptoir", price: "€1.50-2" },
      { item: "Pizza al taglio (part)", price: "€3-5" },
      { item: "Supplì (spécialité romaine)", price: "€2-3" },
      { item: "Plat pâtes restaurant local", price: "€10-15" },
      { item: "Restaurant touristique près monuments", price: "€25-40 (éviter!)" },
      { item: "Dîner Trastevere (authentique)", price: "€20-30" },
      { item: "Spritz apéro", price: "€5-8" },
      { item: "Entrée Colisée + Forum + Palatin", price: "€18 (réserver en ligne!)" },
      { item: "Entrée Musées Vatican + Chapelle Sixtine", price: "€17 (réserver en ligne!)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Carabinieri (police)", number: "112", icon: "Shield" },
      { name: "Police d'État", number: "113", icon: "ShieldCheck" },
      { name: "Ambulance", number: "118", icon: "Ambulance" },
      { name: "Pompiers", number: "115", icon: "Flame" }
    ],
    consulateInfo: "Ambassade de France à Rome: Piazza Farnese 67, 00186 Roma. Tél: +39 06 68 60 11. Urgences consulaires 24h/7j disponibles. En cas de vol, déposer plainte commissariat (denuncia) puis contacter consulat.",
    localCustoms: [
      "Caffè culture: Espresso debout au comptoir (1€) vs assis terrasse (5€) - grande différence prix",
      "Ne commandez JAMAIS cappuccino après 11h (considéré bizarre par italiens - boisson du matin)",
      "Aperitivo (18h-21h): Verre + buffet apéritif gratuit dans certains bars (tradition)",
      "Horaires repas: Pranzo (déjeuner) 13h-15h, Cena (dîner) 20h-22h30",
      "Coperto: Frais pain/couverts 1.50-3€ légal mais doit être affiché clairement",
      "Pourboire NON obligatoire (service inclus) mais arrondir apprécié",
      "Tenue modeste églises/Vatican: Épaules et genoux couverts OBLIGATOIRE (shorts/débardeurs interdits)"
    ],
    behaviorsToAvoid: [
      "Commander cappuccino après déjeuner/dîner (faux-pas culturel majeur)",
      "Couper spaghetti avec couteau (sacrilège - enroulez avec fourchette uniquement)",
      "Demander parmesan sur plats de poisson/fruits de mer (interdit culinairement)",
      "S'asseoir sur marches monuments (interdit, amende 50-500€)",
      "Manger en marchant hors zones touristiques (mal vu, peu élégant)",
      "Baignade dans fontaines (interdit, amende 450€)",
      "Torse nu/bikini hors plage (amende 50-300€)",
      "Visiter églises en short/débardeur (refoulé à l'entrée)"
    ]
  },

  "berlin-germany": {
    id: "berlin-germany",
    name: "Berlin",
    country: "Allemagne",
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 84,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Allemand (Anglais bien parlé)",
    currency: "Euro (€)",
    securitySummary: "Berlin est globalement sûre avec faible criminalité violente. Pickpockets actifs zones touristiques (Alexanderplatz, Checkpoint Charlie) et transports. Attention certains quartiers périphériques la nuit (Wedding, Neukölln). Scène alternative/squat dans certaines zones (Friedrichshain, Kreuzberg) - généralement sûre mais ambiance différente. Manifestations politiques fréquentes (souvent pacifiques).",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Manifestation 1er Mai",
        summary: "Défilés et rassemblements prévus Kreuzberg-Friedrichshain. Évitez la zone, tensions possibles.",
        date: "Il y a 1 jour"
      }
    ],
    dangerousAreas: [
      "Görlitzer Park la nuit (dealers présents mais pas violents)",
      "Certaines parties de Wedding et Moabit après minuit",
      "Neukölln certaines zones tard le soir",
      "Ostbahnhof la nuit (gare)",
      "Kottbusser Tor après 23h (dealers, ivrognes)"
    ],
    safetyTips: [
      "Pickpockets actifs Alexanderplatz, Checkpoint Charlie, lignes U-Bahn U8/U9 - sac devant",
      "Validez TOUJOURS ticket transports (contrôles fréquents, amende 60€ sans exception)",
      "Görlitzer Park: Dealers cannabis omniprésents. Ignorez, ne vous arrêtez pas",
      "Vélos prioritaires: Pistes cyclables partout, ne marchez pas dessus",
      "Manifestations fréquentes (1er Mai surtout): Évitez Kreuzberg-Friedrichshain si tensions",
      "Eau robinet excellente (ne payez pas bouteille)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" },
      { name: "Encéphalite à tiques si randonnée forêts", status: "optional" }
    ],
    healthSystem: "Excellent système de santé allemand. Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE. Hôpitaux modernes: Charité, Vivantes. Pharmacies (Apotheke) nombreuses. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, etc.",
    entryDocuments: "Carte d'identité ou passeport valide pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Arnaques rares",
        desc: "Berlin assez sûre, arnaques touristiques peu fréquentes. Allemands respectent généralement les règles."
      },
      {
        title: "Faux billets clubs/événements",
        desc: "Revendeurs rue proposent billets clubs techno/événements. Souvent invalides. SOLUTION: Achetez sur sites officiels RA (Resident Advisor), billetterie des clubs."
      },
      {
        title: "Taxis non officiels gares",
        desc: "Chauffeurs sans licence gares principales. SOLUTION: Utilisez taxis officiels (signe lumineux sur toit) ou apps Uber/Free Now/Bolt."
      },
      {
        title: "Location appartements Airbnb arnaques",
        desc: "Fausses annonces, paiement hors plateforme demandé. SOLUTION: Payez TOUJOURS via plateforme officielle uniquement."
      }
    ],
    priceGuide: [
      { item: "Train S-Bahn/U-Bahn aéroport → centre", price: "€3.80" },
      { item: "Ticket AB (zones Berlin) simple", price: "€3.20" },
      { item: "Ticket journée AB", price: "€9.50" },
      { item: "7-Tage-Ticket (semaine) AB", price: "€41.50" },
      { item: "Café normal", price: "€3-4" },
      { item: "Currywurst (spécialité)", price: "€4-6" },
      { item: "Döner kebab", price: "€5-7" },
      { item: "Bière 0.5L bar", price: "€3.50-5" },
      { item: "Club techno entrée", price: "€10-20" },
      { item: "Restaurant milieu de gamme", price: "€15-25" },
      { item: "Brunch buffet dimanche", price: "€12-18" },
      { item: "Entrée Pergamon Museum", price: "€12" },
      { item: "Entrée Reichstag (Parlement) coupole", price: "Gratuit (réserver!)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "110", icon: "Shield" },
      { name: "Ambulance", number: "112", icon: "Ambulance" },
      { name: "Pompiers", number: "112", icon: "Flame" }
    ],
    consulateInfo: "Ambassade de France à Berlin: Pariser Platz 5, 10117 Berlin. Tél: +49 30 590 03 90 00. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Ponctualité ABSOLUE: Arriver pile à l'heure (pas 5min avance ni retard)",
      "Clubs techno: Berghain, Watergate, Tresor (sélection stricte entrée, tenue sobre noire recommandée)",
      "Pfand: Consigne bouteilles/canettes (0.08-0.25€). Rendez en supermarché pour récupérer",
      "Sonntagsruhe: Dimanche = jour calme. Pas de bruit, travaux interdits (amende possible)",
      "Feu rouge piéton: TOUJOURS respecté, même si aucune voiture (amende + mal vu)",
      "Recyclage: Tri strict déchets (bio, papier, plastique, verre par couleur)",
      "Pourboire: 5-10% standard, arrondir montant",
      "FKK: Nudisme accepté certains parcs/lacs (Tiergarten, Plötzensee) - zones désignées"
    ],
    behaviorsToAvoid: [
      "Traverser feu rouge piéton (amende 5€ + très mal vu)",
      "Ne pas valider ticket transports (contrôle fréquent, amende 60€)",
      "Être en retard (ponctualité sacrée allemande)",
      "Parler fort transports/restaurants (allemands discrets)",
      "Jeter déchets sans trier (mal vu socialement)",
      "Faire du bruit dimanche (Sonntagsruhe = jour silence)",
      "Salut nazi/symboles nazis (ILLÉGAL, prison possible)",
      "Comparer Berlin Est/Ouest négativement (sujet sensible, réunification récente)"
    ]
  },

  "sydney-australia": {
    id: "sydney-australia",
    name: "Sydney",
    country: "Australie",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 86,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+10 (AEDT en été)",
    language: "Anglais",
    currency: "Dollar australien (AUD) - 1€ ≈ 1.65 AUD",
    securitySummary: "Sydney est très sûre avec faible criminalité violente. Attention pickpockets zones touristiques (Circular Quay, Bondi Beach) et transports. Kings Cross la nuit peut être bruyant (bars, ivrognes) mais pas dangereux. DANGER NATURE: Requins, méduses mortelles (box jellyfish), araignées venimeuses, serpents. Soleil TRÈS intense (cancer peau). Ville CHÈRE.",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Méduses dangereuses détectées",
        summary: "Présence méduses 'Bluebottle' signalée plages nord. Drapeaux rouges installés. Baignade interdite.",
        date: "Aujourd'hui, 08:00"
      },
      {
        id: 2,
        type: "info",
        title: "Vague de chaleur extrême",
        summary: "Températures 38-42°C prévues cette semaine. Risque feux de brousse. Restez hydratés.",
        date: "Il y a 1 jour"
      }
    ],
    dangerousAreas: [
      "Kings Cross tard le soir (bruyant, ivrognes, bagarres occasionnelles)",
      "Certaines zones de Redfern la nuit",
      "Western Sydney banlieues éloignées après minuit",
      "Centre-ville sûr, plages très sûres en journée"
    ],
    safetyTips: [
      "SOLEIL MORTEL: SPF 50+ obligatoire, chapeau, crème solaire toutes les 2h. Cancer peau #1 en Australie",
      "PLAGES: Baignez UNIQUEMENT entre drapeaux rouge-jaune (zones surveillées). Courants très dangereux",
      "MÉDUSES: Ne vous baignez JAMAIS si drapeau rouge (méduses mortelles). Vinaigre sur piqûres",
      "REQUINS: Très rares mais existent. Évitez aube/crépuscule, eaux troubles, embouchures rivières",
      "SERPENTS/ARAIGNÉES: Vérifiez chaussures le matin, ne mettez pas mains dans trous/crevasses",
      "ALCOOL: Boire dans rue interdit (amende 500 AUD). Zones sans alcool nombreuses",
      "Eau robinet excellente (meilleure que beaucoup bouteilles)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé public (Medicare). Urgences gratuites. Assurance voyage recommandée pour soins non-urgents (chers). Hôpitaux modernes: St Vincent's, RPA. Pharmacies partout. Urgence: 000.",
    visaRequired: true,
    visaDetails: "eVisitor (gratuit) ou ETA (20 AUD) obligatoire AVANT départ pour citoyens européens, américains, canadiens. Valable 1 an, séjours max 90 jours. Demande en ligne 72h avant minimum. Contrôles biosécurité stricts (amendes nourriture).",
    entryDocuments: "Passeport valide + visa eVisitor/ETA approuvé. Déclaration douanière stricte (nourriture, médicaments). Amendes lourdes (420 AUD+) si déclarations fausses.",
    commonScams: [
      {
        title: "Arnaques quasi inexistantes",
        desc: "Sydney très sûre, arnaques touristiques rares. Australiens généralement honnêtes et directs."
      },
      {
        title: "Faux taxis aéroport",
        desc: "Quelques chauffeurs non licenciés. SOLUTION: Utilisez taxis officiels (jaunes), Uber, ou Sydney Airport Train (18 AUD)."
      },
      {
        title: "Bars à backpackers Kings Cross",
        desc: "Certains bars majorent prix boissons. SOLUTION: Vérifiez prix avant commander, demandez addition détaillée."
      },
      {
        title: "Tours Opéra/Harbour Bridge surpayés",
        desc: "Revendeurs rue prix gonflés. SOLUTION: Réservez directement sites officiels (Opera House, BridgeClimb)."
      }
    ],
    priceGuide: [
      { item: "Airport Link train aéroport → centre", price: "18 AUD (~11€)" },
      { item: "Uber aéroport → centre", price: "45-65 AUD (~27-40€)" },
      { item: "Ticket train/bus/ferry simple", price: "3.61-5.73 AUD (~2.20-3.50€)" },
      { item: "Opal Card journée (dimanche 2.80 AUD!)", price: "16.80 AUD (~10€)" },
      { item: "Café flat white", price: "4-5 AUD (~2.40-3€)" },
      { item: "Bière 'schooner' (425ml) pub", price: "8-12 AUD (~5-7.30€)" },
      { item: "Fish & chips", price: "12-18 AUD (~7.30-11€)" },
      { item: "Restaurant milieu de gamme", price: "30-50 AUD (~18-30€)" },
      { item: "BridgeClimb (escalade Harbour Bridge)", price: "268-388 AUD (~163-236€)" },
      { item: "Ferry Circular Quay ↔ Manly", price: "8.30 AUD (~5€)" },
      { item: "Entrée Taronga Zoo", price: "50 AUD (~30€)" },
      { item: "Visite guidée Opera House", price: "42 AUD (~25.50€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences (Police/Ambulance/Pompiers)", number: "000", icon: "AlertCircle" },
      { name: "Police non-urgence", number: "131 444", icon: "Shield" },
      { name: "Surf Life Saving (urgence plage)", number: "000", icon: "Waves" }
    ],
    consulateInfo: "Consulat général de France à Sydney: Level 26, St Martins Tower, 31 Market St. Tél: +61 2 9268 2400. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "G'day mate: Salut typiquement australien (très décontracté)",
      "BBQ culture: Barbecues publics gratuits partout dans parcs (apportez votre viande)",
      "Café culture: Flat white, long black (pas 'latte' - considéré trop laiteux)",
      "Slip Slop Slap: Slogan santé publique (Slip on shirt, Slop on sunscreen, Slap on hat)",
      "BYO: Bring Your Own (apportez votre alcool restaurant - frais bouchon 5-10 AUD)",
      "Tipping: NON obligatoire (salaires corrects) mais 10% apprécié bon service",
      "Mateship: Camaraderie, entraide, égalitarisme (valeur nationale)",
      "Tall poppy syndrome: Ne pas se vanter (humilité valorisée)"
    ],
    behaviorsToAvoid: [
      "Se baigner hors zones surveillées drapeaux rouge-jaune (courants mortels)",
      "Ignorer drapeaux rouges plages (méduses/requins/conditions dangereuses)",
      "Sortir sans crème solaire SPF 50+ (cancer peau très fréquent)",
      "Boire alcool dans rue/transports (amende 500 AUD)",
      "Nourrir animaux sauvages (ibis, mouettes) - amende 330 AUD",
      "Se vanter ou paraître arrogant (tall poppy syndrome)",
      "Comparer Australie à Angleterre (pays indépendant, identité forte)",
      "Appeler 'shrimp' (crevettes) - ce sont des 'prawns' ('shrimp on barbie' = cliché américain)"
    ]
  },

  "toronto-canada": {
    id: "toronto-canada",
    name: "Toronto",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 85,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-5 (EST)",
    language: "Anglais, Français",
    currency: "Dollar canadien (CAD) - 1€ ≈ 1.50 CAD",
    securitySummary: "Toronto est très sûre avec faible criminalité. Pickpockets rares mais présents zones touristiques (Dundas Square, CN Tower). Évitez certains quartiers périphériques la nuit (Jane & Finch, Regent Park, Scarborough certaines zones). Hiver EXTRÊMEMENT froid (-20°C possible). Ville multiculturelle, propre, organisée. ATTENTION: Cher (presque autant que New York).",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Froid extrême polar vortex",
        summary: "Températures ressenties -30°C avec vent. Restez maximum 10min dehors. Risque engelures.",
        date: "Aujourd'hui, 07:00"
      }
    ],
    dangerousAreas: [
      "Jane & Finch la nuit (criminalité plus élevée)",
      "Certaines zones de Scarborough après minuit",
      "Moss Park la nuit (sans-abris, drogue)",
      "Regent Park certaines zones (en amélioration)",
      "Centre-ville très sûr, même tard le soir"
    ],
    safetyTips: [
      "HIVER: Équipement grand froid INDISPENSABLE décembre-février (-20°C courant, -30°C possible)",
      "PATH: Réseau souterrain 30km relie buildings downtown (utilisez en hiver)",
      "Pickpockets rares mais restez vigilant Dundas Square, TTC (métro) bondés",
      "Cannabis légal: Achat 19+ ans dans magasins Ontario Cannabis Store. Ne fumez pas en marchant",
      "Pourboire 15-20% OBLIGATOIRE restaurants/taxis (comme USA)",
      "Eau robinet excellente (ne payez pas bouteille)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé public universel (OHIP) mais pour résidents. Assurance voyage INDISPENSABLE touristes (soins très chers sans assurance). Hôpitaux modernes: Toronto General, Mount Sinai, SickKids. Pharmacies nombreuses. Urgence: 911.",
    visaRequired: false,
    visaDetails: "AVE (Autorisation Voyage Électronique) obligatoire citoyens français/européens exemptés visa (7 CAD, valable 5 ans). Demande en ligne avant départ. Visa requis autres nationalités.",
    entryDocuments: "Passeport valide + AVE approuvée. Contrôles immigration stricts. Preuve fonds + billet retour peuvent être demandés.",
    commonScams: [
      {
        title: "Arnaques quasi inexistantes",
        desc: "Toronto très sûre, arnaques touristiques rares. Canadiens réputés honnêtes et polis."
      },
      {
        title: "Faux billets événements sportifs",
        desc: "Revendeurs rue billets Raptors, Maple Leafs, Blue Jays contrefaits. SOLUTION: Achetez sites officiels (Ticketmaster, billetterie stades) uniquement."
      },
      {
        title: "Taxis non licenciés aéroport",
        desc: "Chauffeurs proposent tarifs fixes excessifs. SOLUTION: Taxis officiels (Beck, Co-op) ou Uber/Lyft. Tarif aéroport-downtown: 53 CAD fixe."
      },
      {
        title: "Restaurants ajoutent auto-gratuity",
        desc: "Certains ajoutent automatiquement pourboire 18% sans prévenir. SOLUTION: Vérifiez addition avant payer pour éviter double pourboire."
      }
    ],
    priceGuide: [
      { item: "UP Express train aéroport → downtown (25min)", price: "12.35 CAD (~8€)" },
      { item: "Taxi aéroport → downtown (tarif fixe)", price: "53 CAD (~35€)" },
      { item: "TTC ticket métro/streetcar/bus simple", price: "3.35 CAD (~2.20€)" },
      { item: "TTC day pass", price: "13.50 CAD (~9€)" },
      { item: "Café", price: "3-5 CAD (~2-3.30€)" },
      { item: "Poutine (plat typique)", price: "8-12 CAD (~5.30-8€)" },
      { item: "Restaurant milieu de gamme", price: "25-40 CAD (~17-27€)" },
      { item: "Bière locale 500ml pub", price: "7-10 CAD (~4.70-6.70€)" },
      { item: "Entrée CN Tower (sommet)", price: "40 CAD (~27€)" },
      { item: "Entrée ROM (Royal Ontario Museum)", price: "23 CAD (~15€)" },
      { item: "Chutes Niagara tour journée depuis Toronto", price: "100-150 CAD (~67-100€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences (Police/Ambulance/Pompiers)", number: "911", icon: "AlertCircle" },
      { name: "Police non-urgence", number: "416-808-2222", icon: "Shield" },
      { name: "Telehealth Ontario (conseils médicaux)", number: "1-866-797-0000", icon: "Hospital" }
    ],
    consulateInfo: "Consulat général de France à Toronto: 2 Bloor Street East, Suite 2200. Tél: +1 416-847-1900. Urgences consulaires 24h/7j disponibles via ambassade Ottawa: +1 613-562-3400.",
    localCustoms: [
      "Politesse extrême: 'Sorry', 'please', 'thank you' constamment (cliché mais vrai)",
      "Multiculturalisme: 50% population née à l'étranger, 180 langues parlées, mosaïque culturelle",
      "Pourboire 15-20% OBLIGATOIRE restaurants, cafés, taxis, livraisons",
      "Tim Hortons: Chaîne café nationale iconique (double-double = café 2 crème 2 sucre)",
      "Hockey religion nationale: Maple Leafs = équipe sacrée (chers billets 150-500 CAD)",
      "Poutine: Plat typique québécois adopté Ontario (frites, sauce, fromage en grains)",
      "Taux + taxes séparés: Prix affichés SANS taxes (ajoutez 13% HST au total)",
      "PATH: Réseau piétonnier souterrain 30km relie downtown (indispensable hiver)"
    ],
    behaviorsToAvoid: [
      "Oublier le pourboire 15-20% (serveurs comptent dessus, salaire base très bas)",
      "Comparer Canada aux USA négativement (Canadiens fiers différences)",
      "Assumer tout le monde parle français (Toronto anglophone, français limité)",
      "Ne pas s'habiller chaudement hiver (froid extrême dangereux)",
      "Fumer cannabis en marchant/public (légal mais règles strictes où fumer)",
      "Critiquer hockey/Maple Leafs (religion nationale)",
      "Dire 'aboot' pour imiter accent (cliché agaçant)",
      "Ignorer signaux piétons (amendes possibles)"
    ]
  },

  "mexico-city-mexico": {
    id: "mexico-city-mexico",
    name: "Mexico",
    country: "Mexique",
    image: "https://images.unsplash.com/photo-1669352977004-564294e1025b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNZXhpY28lMjBDaXR5JTIwWm9jYWxvJTIwY2F0aGVkcmFsfGVufDF8fHx8MTc3MjExNjUzNXww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 72,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-6 (CST)",
    language: "Espagnol (Anglais limité hors zones touristiques)",
    currency: "Peso mexicain (MXN) - 1€ ≈ 20 MXN",
    securitySummary: "Mexico City nécessite vigilance accrue. Criminalité existe: vols, pickpockets fréquents, enlèvements express (rares mais existent). Quartiers sûrs: Polanco, Condesa, Roma, Coyoacán. ÉVITEZ ABSOLUMENT: Tepito, Iztapalapa, certaines zones périphériques. Taxis rue dangereux (kidnappings). Pollution air élevée. Altitude 2250m = essoufflement. MAIS: Culture riche, nourriture incroyable, gens chaleureux.",
    alerts: [
      {
        id: 1,
        type: "warning",
        title: "Recrudescence vols violents",
        summary: "Augmentation vols avec arme signalée Doctores, Guerrero. Évitez zones après 20h.",
        date: "Il y a 2 heures"
      },
      {
        id: 2,
        type: "vigilance",
        title: "Pollution air élevée",
        summary: "Alerte qualité air. Évitez activités extérieures intenses. Consultez medias.",
        date: "Aujourd'hui, 10:00"
      }
    ],
    dangerousAreas: [
      "TEPITO (marché noir) - NE JAMAIS Y ALLER (très dangereux)",
      "Iztapalapa - Évitez complètement",
      "Ciudad Nezahualcóyotl - Évitez",
      "Doctores et Guerrero la nuit",
      "Certaines zones de Gustavo A. Madero",
      "Gare routière Autobuses del Norte après 22h",
      "Quartiers sûrs: Polanco, Roma, Condesa, Coyoacán, San Ángel"
    ],
    safetyTips: [
      "TAXIS: JAMAIS taxis rue (enlèvements 'secuestro express'). Utilisez Uber/DiDi UNIQUEMENT ou taxis sitio (appelés)",
      "DISTRIBUTEURS: Retirez argent banques en journée, JAMAIS rue/nuit (braquages fréquents)",
      "TÉLÉPHONE: Ne l'utilisez pas en marchant (vols à l'arraché depuis motos)",
      "BIJOUX: Ne portez RIEN de valeur visible (montre, bijoux = cible)",
      "ALTITUDE: 2250m = essoufflement normal. Hydratez-vous, premiers jours calmes",
      "EAU: NE buvez JAMAIS eau robinet (turista = diarrhée garantie). Bouteille capsulée uniquement",
      "POLLUTION: Qualité air mauvaise certains jours. App pour vérifier"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A et typhoïde FORTEMENT recommandées", status: "recommended" },
      { name: "Vaccins universels à jour", status: "recommended" }
    ],
    healthSystem: "Système de santé public surchargé. Hôpitaux privés excellents mais chers. Assurance voyage INDISPENSABLE. Évitez eau robinet, glaçons, salades crues (turista). Pharmacies partout. Urgence: 911.",
    visaRequired: false,
    visaDetails: "Pas de visa pour citoyens français/européens/américains/canadiens (séjour max 180 jours). Formulaire FMM rempli dans avion. Passeport valide 6 mois minimum.",
    entryDocuments: "Passeport valide 6 mois après date retour. Billet retour recommandé. Formulaire FMM (carte tourisme) gratuit.",
    commonScams: [
      {
        title: "Taxis pirates/enlèvements express",
        desc: "Taxis rue (libres) impliqués dans enlèvements express (secuestro express): obligent retirer argent ATM sous menace arme. SOLUTION: Uber/DiDi UNIQUEMENT ou taxis sitio (radio appelés). Ne prenez JAMAIS taxi rue même jour.",
      },
      {
        title: "Faux policiers",
        desc: "Faux policiers (ou vrais corrompus) arrêtent touristes, inventent infraction, demandent 'amende' 200-500 USD cash. SOLUTION: Restez calme, demandez aller commissariat ('comisaría'), ne donnez pas passeport/argent. Notez badge numéro.",
      },
      {
        title: "Distributeurs ATM trafiqués/braquages",
        desc: "Skimmers sur ATM rue + braquages juste après retrait. SOLUTION: Retirez UNIQUEMENT dans banques en journée, jamais rue/nuit. Couvrez code PIN.",
      },
      {
        title: "Restaurants addition gonflée",
        desc: "Ajoutent plats non commandés, facturent 'service' non mentionné 15-20%, prix différents touristes. SOLUTION: Vérifiez addition ligne par ligne, exigez détails, calculez vous-même.",
      },
      {
        title: "Fausses excursions Teotihuacan",
        desc: "Vendeurs rue proposent tours pyramides, vous abandonnent là-bas, réclamèrent 100 USD supplémentaires. SOLUTION: Réservez tours compagnies reconnues (Turibus, guides officiels) ou prenez bus public 50 MXN.",
      },
      {
        title: "Change arnaques",
        desc: "Bureaux change aéroport taux catastrophiques (30-40% commission cachée). SOLUTION: Retirez ATM banques (meilleur taux) ou payez carte (évitez frais change cash).",
      }
    ],
    priceGuide: [
      { item: "Uber aéroport → centre (45-60min)", price: "300-450 MXN (~15-23€)" },
      { item: "Metrobús ticket", price: "6 MXN (~0.30€)" },
      { item: "Tacos al pastor (3)", price: "30-50 MXN (~1.50-2.50€)" },
      { item: "Comida corrida (menu déjeuner complet)", price: "80-120 MXN (~4-6€)" },
      { item: "Restaurant touristique Polanco", price: "300-500 MXN (~15-25€)" },
      { item: "Mezcal verre", price: "60-150 MXN (~3-7.50€)" },
      { item: "Bière locale Corona/Modelo", price: "30-60 MXN (~1.50-3€)" },
      { item: "Entrée Musée Anthropologie", price: "90 MXN (~4.50€)" },
      { item: "Entrée Frida Kahlo (Casa Azul)", price: "270 MXN (~13.50€)" },
      { item: "Teotihuacan pyramides", price: "80 MXN (~4€)" },
      { item: "Spectacle Lucha Libre", price: "150-500 MXN (~7.50-25€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "911", icon: "AlertCircle" },
      { name: "Urgences touristiques (anglais)", number: "078", icon: "Info" },
      { name: "Cruz Roja (ambulance)", number: "065", icon: "Ambulance" },
      { name: "Ángeles Verdes (assistance routière touristes)", number: "078", icon: "Car" }
    ],
    consulateInfo: "Ambassade de France au Mexique: Havre 15, Colonia Juárez. Tél: +52 55 9171 9700. Urgences consulaires 24h/7j: +52 55 9171 9800. En cas agression, appelez immédiatement consulat.",
    localCustoms: [
      "Propinas (pourboires): 10-15% restaurants, 10-20 MXN porteurs/femmes ménage",
      "Horaires décalés: Comida (déjeuner principal) 14h-17h, cena (dîner léger) 20h-22h",
      "Mañana: Concept temps flexible, ponctualité moins stricte qu'Europe/USA",
      "Antojitos: Petits plats mexicains (tacos, quesadillas, tamales) - cœur gastronomie",
      "Día de Muertos: Fête des Morts (1-2 nov) = fête joyeuse célébrant défunts (pas lugubre)",
      "Lucha Libre: Catch mexicain théâtralisé masqué - spectacle populaire authentique",
      "Salsa/pico de gallo: Sauces piquantes omniprésentes. Niveau piquant varie beaucoup",
      "Mariachis Plaza Garibaldi: Musiciens traditionnels (20-30 USD chanson)"
    ],
    behaviorsToAvoid: [
      "Prendre taxis rue (danger kidnapping express)",
      "Montrer objets valeur/bijoux/grosses liasses billets",
      "Utiliser téléphone en marchant (vol à l'arraché)",
      "Aller à Tepito même en journée (danger réel)",
      "Retirer argent ATM rue/nuit (braquages fréquents)",
      "Boire eau robinet ou glaçons (turista garantie)",
      "Critiquer Mexique ou comparer défavorablement aux USA (nationalisme fort)",
      "Confondre Día de Muertos avec Halloween (fête traditionnelle importante)"
    ]
  },

  "cairo-egypt": {
    id: "cairo-egypt",
    name: "Le Caire",
    country: "Égypte",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 68,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 3 heures",
    timezone: "GMT+2 (EET)",
    language: "Arabe (Anglais parlé zones touristiques)",
    currency: "Livre égyptienne (EGP) - 1€ ≈ 55 EGP",
    securitySummary: "Le Caire nécessite vigilance importante. Harcèlement constant vendeurs/faux guides épuisant. Arnaques omniprésentes (taxis, pyramides, bazars). Femmes seules subissent harcèlement verbal/physique. Criminalité violente rare contre touristes mais vols pickpockets fréquents. Circulation ultra-chaotique (pire au monde). Pollution air très élevée. Chaleur extrême été (45°C). Respectez culture locale (tenue modeste). MAIS: Pyramides incroyables, histoire fascinante.",
    alerts: [
      {
        id: 1,
        type: "warning",
        title: "Zone Sinaï interdite",
        summary: "Péninsule Sinaï (sauf stations balnéaires) zone rouge - Attentats terroristes possibles. N'y allez pas.",
        date: "Permanent"
      },
      {
        id: 2,
        type: "vigilance",
        title: "Canicule extrême",
        summary: "Températures 42-45°C prévues. Pyramides ferment 12h-16h. Hydratation vitale.",
        date: "Aujourd'hui, 09:00"
      }
    ],
    dangerousAreas: [
      "Péninsule du Sinaï (sauf Charm el-Cheikh, Dahab stations balnéaires)",
      "Frontière libyenne - Zone interdite",
      "Certains quartiers populaires la nuit",
      "Zones touristiques (Pyramides, Khan el-Khalili) sûres mais harcèlement intense"
    ],
    safetyTips: [
      "HARCÈLEMENT: Vendeurs/faux guides OMNIPRÉSENTS pyramides. Ignorez, dites fermement 'La shokran' (non merci)",
      "FEMMES: Tenue modeste OBLIGATOIRE (genoux, épaules couverts). Foulard recommandé mosquées. Harcèlement constant",
      "TAXIS: Négociez prix AVANT monter (compteurs inexistants/non utilisés). Prix normal aéroport-centre: 150-200 EGP. Ou Uber",
      "EAU: NE buvez JAMAIS robinet. Bouteille capsulée uniquement. Refusez glaçons",
      "ARNAQUES: Méfiez-vous de TOUTE personne vous abordant (faux guides, vendeurs, pseudo-officiels)",
      "NOURRITURE: Mangez restaurants réputés uniquement. Évitez stands rue (turista)",
      "RAMADAN: Ne mangez/buvez/fumez pas en public pendant journée (respect)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A et typhoïde FORTEMENT recommandées", status: "recommended" },
      { name: "Rage si contact animaux", status: "optional" },
      { name: "Vaccins universels à jour", status: "recommended" }
    ],
    healthSystem: "Système de santé public très limité. Hôpitaux privés corrects pour touristes mais chers. Assurance voyage INDISPENSABLE. Évitez eau robinet, nourriture rue. Pharmacies nombreuses. Urgence: 123.",
    visaRequired: true,
    visaDetails: "Visa obligatoire ALL nationalités. Visa à l'arrivée aéroport (25 USD, 30 jours) ou e-visa en ligne avant départ (25 USD + frais). Passeport valide 6 mois minimum.",
    entryDocuments: "Passeport valide 6 mois après date retour. Billet retour obligatoire. Visa payable en USD/EUR cash ou e-visa.",
    commonScams: [
      {
        title: "Faux guides pyramides",
        desc: "Personnes vous abordent prétendant être guides officiels, police touristique, gardiens. Vous emmènent zones interdites, photos dos chameau puis réclament 50-100 USD. SOLUTION: Ignorez TOUTES approches. Guides officiels portent badges avec photo. Achetez billets guichets officiels uniquement.",
      },
      {
        title: "Taxis compteurs trafiqués",
        desc: "Compteurs (rares) truqués ou chauffeurs refusent les utiliser, facturent 10x le prix. SOLUTION: Négociez FERMEMENT prix avant monter (150-200 EGP aéroport-centre) OU Uber (meilleur option).",
      },
      {
        title: "Balade chameau/cheval arnaque",
        desc: "Vendeurs disent '5 EGP balade', vous montez, puis réclament 500 EGP (50 USD) et refusent vous laisser descendre. Peuvent devenir agressifs. SOLUTION: Négociez prix TOTAL avant, payez MOITIÉ avant/après, ou refusez complètement.",
      },
      {
        title: "Parfums/papyrus/cartouches surévalués",
        desc: "Vendeurs bazars annoncent prix 100x valeur réelle. 'Prix spécial ami' reste 20x trop cher. SOLUTION: Divisez prix initial par 10 minimum. Acceptez de partir (rappellent souvent avec meilleur prix).",
      },
      {
        title: "Fausses antiquités",
        desc: "Vendeurs prétendent statues/bijoux 'antiques'. 100% faux, souvent fabriqués en Chine. Exporter vraies antiquités = PRISON. SOLUTION: Ne croyez jamais 'antique'. Achetez souvenirs modernes uniquement.",
      },
      {
        title: "Restaurants prix différents touristes",
        desc: "Cartes menu en anglais prix 3-5x plus chers que cartes arabes. SOLUTION: Demandez voir carte en arabe, comparez prix (photos), ou mangez où mangent égyptiens.",
      },
      {
        title: "Baksheesh (pourboire) forcé",
        desc: "Gardiens toilettes, personnes ouvrant portes, aidant sans demander réclament 'baksheesh'. SOLUTION: Préparez petites coupures 5-10 EGP. Refusez services non demandés.",
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport → centre (négocié)", price: "150-250 EGP (~3-4.50€)" },
      { item: "Uber aéroport → centre", price: "200-300 EGP (~3.60-5.50€)" },
      { item: "Ticket métro", price: "5-7 EGP (~0.09-0.13€)" },
      { item: "Foul (fèves, plat local)", price: "10-20 EGP (~0.18-0.36€)" },
      { item: "Koshary (plat national)", price: "15-30 EGP (~0.27-0.55€)" },
      { item: "Restaurant touristique", price: "200-400 EGP (~3.60-7.30€)" },
      { item: "Thé/café ahwa (café local)", price: "5-10 EGP (~0.09-0.18€)" },
      { item: "Entrée Pyramides Gizeh", price: "540 EGP (~10€)" },
      { item: "Entrée Grande Pyramide intérieur", price: "900 EGP (~16.40€)" },
      { item: "Entrée Musée Égyptien", price: "450 EGP (~8.20€)" },
      { item: "Son et lumière pyramides", price: "1,000 EGP (~18€)" },
      { item: "Croisière Nil felouque (négocié)", price: "100-200 EGP/h (~1.80-3.60€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "122", icon: "Shield" },
      { name: "Ambulance", number: "123", icon: "Ambulance" },
      { name: "Police touristique", number: "126", icon: "ShieldCheck" },
      { name: "Pompiers", number: "180", icon: "Flame" }
    ],
    consulateInfo: "Ambassade de France en Égypte: 29 Avenue Charles de Gaulle, Guiza. Tél: +20 2 3567 3200. Urgences consulaires 24h/7j: +20 2 3567 3232. En cas problème grave, appelez immédiatement.",
    localCustoms: [
      "Baksheesh: Culture du pourboire omniprésente. 5-20 EGP pour petits services",
      "Marchandage OBLIGATOIRE: Divisez prix initial par 3-10. C'est le jeu normal",
      "Main droite: Mangez, donnez argent, serrez mains main droite (gauche impure)",
      "Tenue modeste: Genoux et épaules couverts (femmes ET hommes mosquées)",
      "As-salamu alaykum: Salutation standard (paix sur vous) → réponse 'Wa alaykum as-salam'",
      "Inshallah: 'Si Dieu veut' - expression constante (concept temps flexible)",
      "Shisha (chicha): Tradition sociale fumée partout dans ahwas (cafés)",
      "Ramadan: Ne mangez/buvez/fumez pas public pendant journée (respect)",
      "Photos: Demandez permission photographier personnes (surtout femmes)"
    ],
    behaviorsToAvoid: [
      "Tenue inappropriée (shorts courts, débardeurs) - irrespect culture",
      "Montrer affection publique (main OK, s'embrasser NON)",
      "Manger/boire public pendant Ramadan (manque respect)",
      "Photographier installations militaires/police (ILLÉGAL, prison possible)",
      "Critiquer Islam, gouvernement, président (prudence extrême)",
      "Manger/donner argent main gauche (main impure)",
      "Pointer plantes pieds vers quelqu'un (insultant)",
      "Suivre inconnus qui vous abordent (99% arnaques)",
      "Acheter sans négocier (payerez 10x prix juste)"
    ]
  }

};