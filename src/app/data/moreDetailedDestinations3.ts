import type { DestinationDetails } from "./types";

// Lot 3: Destinations supplémentaires ultra-détaillées
export const moreDetailedDestinations3: Record<string, DestinationDetails> = {

  "lisbon-portugal": {
    id: "lisbon-portugal",
    name: "Lisbonne",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 84,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+0 (WET, GMT+1 en été)",
    language: "Portugais (Anglais parlé zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Lisbonne est globalement très sûre pour les touristes. La criminalité violente est rare. Les pickpockets sont actifs dans les zones touristiques (Alfama, Baixa, Bairro Alto, tramway 28) et transports publics. Attention aux vols à l'arraché depuis scooters. Certains quartiers périphériques à éviter la nuit. Ville construite sur 7 collines = nombreuses côtes raides, pavés glissants après pluie.",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Forte chaleur",
        summary: "Canicule prévue 38-40°C cette semaine. Hydratez-vous, évitez soleil 12h-16h.",
        date: "Aujourd'hui, 10:00"
      }
    ],
    dangerousAreas: [
      "Martim Moniz après minuit (dealers présents)",
      "Intendente la nuit (en amélioration mais restez vigilant)",
      "Certaines zones de Mouraria tard le soir",
      "Cova da Moura (favela, touristes déconseillés)",
      "Chelas et Marvila périphérie la nuit"
    ],
    safetyTips: [
      "Tramway 28 (ligne touristique): PARADIS des pickpockets - sac devant vous, bien fermé",
      "Miradouros (points de vue): Attention sacs pendant que vous admirez, téléphone à la main = cible",
      "Vols à l'arraché depuis scooters: Ne marchez pas téléphone/sac côté rue",
      "Pavés glissants quand mouillés: Portez chaussures antidérapantes, attention descentes",
      "Location voiture déconseillée (stationnement impossible, côtes raides, parking cher 20€/jour)",
      "Plages Cascais/Estoril: Surveillez affaires (vols pendant baignade)",
      "Escaliers raides partout: Attention genoux fragiles, personnes âgées"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Bon système de santé public (SNS). Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE/EEE. Urgences gratuites. Hôpitaux: Santa Maria, São José. Pharmacies partout. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, etc.",
    entryDocuments: "Carte d'identité ou passeport valide pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Pickpockets tramway 28",
        desc: "LE tramway touristique est infesté de pickpockets. Gangs organisés opèrent aux heures de pointe. Technique: vous bousculent pendant montée/descente. SOLUTION: Sac devant bien fermé, ou prenez tramway 12 (moins touristique, même trajet)."
      },
      {
        title: "Restaurants pièges Alfama/Baixa",
        desc: "Rabatteurs vous invitent, carte sans prix, addition 80€+ pour plat simple. Certains ajoutent 'couvert' non consommé (pain/olives/beurre). SOLUTION: Vérifiez prix sur carte AVANT commander, refusez couvert si vous n'en voulez pas."
      },
      {
        title: "Faux guides touristiques",
        desc: "Personnes proposent tours 'gratuits' puis réclament 20-30€ minimum. SOLUTION: Clarifiez prix avant d'accepter tour."
      },
      {
        title: "Taxis aéroport sans compteur",
        desc: "Chauffeurs proposent tarif fixe excessif (50-70€). SOLUTION: Exigez compteur (25-35€ normal) ou Uber/Bolt (15-20€), ou métro (1.50€)."
      },
      {
        title: "Dealers Martim Moniz",
        desc: "Vendeurs drogue insistants. Peuvent devenir agressifs si vous refusez. SOLUTION: Ignorez complètement, ne vous arrêtez pas, continuez à marcher."
      }
    ],
    priceGuide: [
      { item: "Métro aéroport → centre", price: "€1.50" },
      { item: "Aerobus aéroport → centre", price: "€4" },
      { item: "Ticket métro/bus/tram simple", price: "€1.50" },
      { item: "Carte Viva Viagem (rechargeable)", price: "€0.50 (+ recharges)" },
      { item: "Pass 24h transports", price: "€6.80" },
      { item: "Tramway 28 (ticket)", price: "€3" },
      { item: "Bica (espresso)", price: "€0.70-1" },
      { item: "Galão (café au lait)", price: "€1.20-1.50" },
      { item: "Pastel de nata (pâtisserie)", price: "€1.20-1.50" },
      { item: "Prato do dia (plat du jour)", price: "€7-12" },
      { item: "Restaurant touristique", price: "€15-25" },
      { item: "Bacalhau (morue) restaurant", price: "€12-18" },
      { item: "Vinho verde (vin)", price: "€3-5 verre" },
      { item: "Super Bock (bière)", price: "€1.50-3" },
      { item: "Entrée Jerónimos Monastery", price: "€10" },
      { item: "Billet combiné Torre Belém + Jerónimos", price: "€12" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police (PSP)", number: "112", icon: "Shield" },
      { name: "Ambulance (INEM)", number: "112", icon: "Ambulance" },
      { name: "Pompiers", number: "112", icon: "Flame" },
      { name: "Police touristique", number: "213 421 634", icon: "ShieldCheck" }
    ],
    consulateInfo: "Ambassade de France au Portugal: Rua Santos-O-Velho 5, 1249-079 Lisboa. Tél: +351 21 393 91 00. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Bica vs Galão: Bica = espresso court, Galão = café au lait (jamais 'café' tout court)",
      "Pastel de nata: Pâtisserie emblématique. Meilleure = Pastéis de Belém (file d'attente mais vaut le coup)",
      "Fado: Musique traditionnelle mélancolique. Spectacles dans Alfama/Bairro Alto (respect silence absolu)",
      "Horaires repas: Déjeuner 12h30-14h30, dîner 20h-22h (plus tôt que Espagne)",
      "Couvert (pain/olives/beurre): Automatiquement servi mais PAYANT (2-3€). Refusez si vous n'en voulez pas",
      "Pourboire: 5-10% apprécié mais non obligatoire",
      "Saudade: Concept portugais de mélancolie nostalgique (similaire au blues)",
      "Portugais ≠ Espagnol: Ne confondez pas les langues (les portugais détestent)"
    ],
    behaviorsToAvoid: [
      "Parler espagnol ou confondre Portugal et Espagne (très vexant pour portugais)",
      "Comparer Lisbonne à Barcelone/Madrid négativement",
      "Commander 'café' (dites 'bica' pour espresso, 'galão' pour café au lait)",
      "Parler pendant spectacles de Fado (silence absolu requis)",
      "Jeter mégot/déchets par terre (amendes possibles)",
      "Manger en marchant hors zones touristiques (mal vu)",
      "Marcher sur pistes vélo jaunes (amende possible)",
      "Critiquer Cristiano Ronaldo (idole nationale)"
    ]
  },

  "prague-czech": {
    id: "prague-czech",
    name: "Prague",
    country: "République tchèque",
    image: "https://images.unsplash.com/photo-1541849546-216549ae216d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 81,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Tchèque (Anglais parlé zones touristiques)",
    currency: "Couronne tchèque (CZK) - 1€ ≈ 25 CZK",
    securitySummary: "Prague est globalement sûre mais les arnaques aux touristes sont TRÈS fréquentes. Pickpockets actifs zones touristiques (Pont Charles, Place Venceslas, Vieille Ville). Arnaques taxis/bureaux change/restaurants courantes. Scams sexuels bars strip-tease (additions 1000€+). Évitez quartiers périphériques la nuit. Attention enterrements vie garçon britanniques ivres.",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Recrudescence arnaques taxis",
        summary: "Nombreux cas signalés taxis sans compteur facturant 100€+ pour trajets courts. Utilisez Uber/Bolt.",
        date: "Il y a 3 heures"
      }
    ],
    dangerousAreas: [
      "Wenceslas Square la nuit (prostitution, dealers)",
      "Žižkov après minuit (bars louches)",
      "Libeň et Vysočany périphérie la nuit",
      "Parcs (Stromovka, Riegrovy sady) après tombée nuit"
    ],
    safetyTips: [
      "TAXIS: N'utilisez JAMAIS taxis de rue (arnaque 100%). Uber/Bolt/Liftago uniquement",
      "BUREAUX DE CHANGE: Évitez centres touristiques (taux catastrophiques). Utilisez ATM banques",
      "BARS STRIP-TEASE: NE RENTREZ JAMAIS (piège classique, addition 2000€+, menaces physiques)",
      "Pont Charles: Pickpockets très actifs. Sac devant vous, fermé",
      "Place Venceslas: Zone sensible nuit (prostitution, dealers, ivrognes)",
      "Restaurants: Vérifiez addition (ajouts frauduleux fréquents)",
      "Bière: Vérifiez taille commandée (serveurs servent 0.5L au lieu de 0.3L puis facturent plus)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" },
      { name: "Encéphalite à tiques si randonnée forêts", status: "optional" }
    ],
    healthSystem: "Bon système de santé. Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE. Urgences: Hospital Na Bulovce, Hospital Na Homolce. Pharmacies nombreuses. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, etc.",
    entryDocuments: "Carte d'identité ou passeport valide pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Taxis escroquerie massive",
        desc: "Taxis de rue = arnaque 95% du temps. Pas de compteur ou compteur trafiqué. Facturent 50-200€ pour 5€ de trajet normal. SOLUTION: Uber/Bolt/Liftago UNIQUEMENT. Ne prenez JAMAIS taxi de rue, surtout aéroport/gares."
      },
      {
        title: "Bars strip-tease piège mortel",
        desc: "Rabatteurs rue invitent dans bars. 2 bières = addition 2000-5000€. Videurs empêchent sortie, menaces physiques, escortent au ATM. SOLUTION: Ne rentrez JAMAIS dans ces bars. Si piégé, appelez police immédiatement (112)."
      },
      {
        title: "Bureaux de change arnaque",
        desc: "Affichent bon taux en gros, mais taux réel catastrophique en petits caractères (commission 30-40%). SOLUTION: Retirez aux ATM banques, ou payez par carte."
      },
      {
        title: "Restaurant addition frauduleuse",
        desc: "Ajoutent plats non commandés, facturent couverts multiples, 'service charge' non mentionné. SOLUTION: Vérifiez ligne par ligne avant payer, exigez détails."
      },
      {
        title: "Faux policiers",
        desc: "Personnes en civil montrent faux badge, veulent voir portefeuille 'contrôle drogues'. Volent argent. SOLUTION: Exigez carte officielle avec photo, proposez aller commissariat. Vrais policiers en uniforme uniquement."
      },
      {
        title: "Photos costume médiéval",
        desc: "Personnes déguisées Place Vieille Ville proposent photo 'gratuite' puis réclament 20-50€ agressivement. SOLUTION: Refusez toute photo avec personnes costumées."
      }
    ],
    priceGuide: [
      { item: "Airport Express bus aéroport → centre", price: "100 CZK (~4€)" },
      { item: "Uber aéroport → centre", price: "350-450 CZK (~14-18€)" },
      { item: "Ticket métro/tram 30min", price: "30 CZK (~1.20€)" },
      { item: "Ticket 90min", price: "40 CZK (~1.60€)" },
      { item: "Pass 24h transports", price: "120 CZK (~4.80€)" },
      { item: "Pass 3 jours", price: "330 CZK (~13.20€)" },
      { item: "Bière pression 0.5L bar", price: "40-70 CZK (~1.60-2.80€)" },
      { item: "Bière pression 0.5L zone touristique", price: "80-120 CZK (~3.20-4.80€)" },
      { item: "Plat traditionnel tchèque", price: "150-250 CZK (~6-10€)" },
      { item: "Restaurant touristique Vieille Ville", price: "300-500 CZK (~12-20€)" },
      { item: "Trdelník (pâtisserie touristique)", price: "80-120 CZK (~3.20-4.80€)" },
      { item: "Entrée Château de Prague", price: "250-350 CZK (~10-14€)" },
      { item: "Concert classique", price: "400-800 CZK (~16-32€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "158", icon: "Shield" },
      { name: "Ambulance", number: "155", icon: "Ambulance" },
      { name: "Pompiers", number: "150", icon: "Flame" },
      { name: "Police municipale", number: "156", icon: "ShieldCheck" }
    ],
    consulateInfo: "Ambassade de France en République tchèque: Velkopřevorské náměstí 2, Malá Strana. Tél: +420 251 171 711. Urgences consulaires disponibles.",
    localCustoms: [
      "Bière moins chère que eau: République tchèque = 1ère consommation bière/habitant monde",
      "Na zdraví!: Santé! en trinquant. Regardez dans les yeux (important)",
      "Pivo (bière): Pilsner Urquell, Budvar, Staropramen (locales). Degrés indiqués en °Plato (12° ≈ 5%)",
      "Svíčková: Plat national (bœuf, sauce crème, airelles, knedlíky)",
      "Knedlíky: Boulettes pain/pomme de terre (accompagnement typique)",
      "Pourboire: 10% standard, arrondissez addition",
      "Dire prix exact au serveur (inclut pourboire): 'To je dobré' = Gardez monnaie"
    ],
    behaviorsToAvoid: [
      "Prendre taxis de rue (arnaque garantie 95%)",
      "Rentrer dans bars strip-tease (piège mortel 2000€+)",
      "Changer argent bureaux de change touristiques (vol légal)",
      "Trinquer sans regarder dans les yeux (porte malheur, mauvais sex 7 ans selon légende)",
      "Comparer République tchèque à Slovaquie (pays séparés depuis 1993)",
      "Appeler Prague 'Tchécoslovaquie' (n'existe plus depuis 1993)",
      "Commander 'Budweiser américain' (Budvar tchèque = originale, américaine = copie)",
      "Manger uniquement Trdelník (pâtisserie = piège touriste, pas traditionnelle)"
    ]
  },

  "athens-greece": {
    id: "athens-greece",
    name: "Athènes",
    country: "Grèce",
    image: "https://images.unsplash.com/photo-1555993539-1732b0258235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 79,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+2 (EET)",
    language: "Grec (Anglais parlé zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Athènes est modérément sûre. Pickpockets très actifs métro, Acropole, Plaka, Monastiraki. Évitez absolument Omonia Square et certaines zones la nuit (Metaxourgio, Exarcheia). Grèves et manifestations fréquentes (souvent violentes). Attention taxis sans compteur. Chaleur extrême été (40°C+). Graffitis partout, ville sale par endroits.",
    alerts: [
      {
        id: 1,
        type: "warning",
        title: "Manifestation syndicale",
        summary: "Grève générale jeudi - Transports publics arrêtés, manifestation Syntagma Square 10h-16h. Évitez la zone.",
        date: "Aujourd'hui, 08:00"
      },
      {
        id: 2,
        type: "vigilance",
        title: "Canicule extrême",
        summary: "Températures 41-43°C prévues cette semaine. Acropole fermée 12h-17h. Hydratez-vous.",
        date: "Il y a 1 jour"
      }
    ],
    dangerousAreas: [
      "Omonia Square JOUR ET NUIT (dealers, prostituées, danger réel)",
      "Metaxourgio la nuit (immigration illégale, drogue)",
      "Exarcheia après 22h (quartier anarchiste, émeutes fréquentes)",
      "Victoria Square la nuit",
      "Certaines rues de Kolonaki tard le soir"
    ],
    safetyTips: [
      "OMONIA: NE TRAVERSEZ JAMAIS cette place. Détour obligatoire même de jour",
      "Pickpockets métro ligne 1 et 3: Sac devant fermé, main sur fermeture",
      "Acropole: Pickpockets pendant visite. Eau obligatoire (chaleur extrême)",
      "Taxis: Exigez compteur OU utilisez app Beat (Uber grec). Arnaque très fréquente",
      "Manifestations: Évitez Syntagma Square lors grèves (gaz lacrymogènes fréquents)",
      "Chaleur été: Visitez Acropole tôt matin (8h) ou fin journée. Fermée mi-journée canicule",
      "Eau robinet: Potable mais goût chlore. Préférez bouteille"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" },
      { name: "Hépatite A recommandée", status: "recommended" }
    ],
    healthSystem: "Système de santé public en difficulté (crise économique). Carte Européenne d'Assurance Maladie (CEAM) acceptée mais délais longs. Hôpitaux privés meilleurs mais chers. Pharmacies partout. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, etc.",
    entryDocuments: "Carte d'identité ou passeport valide pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Taxis sans compteur",
        desc: "Chauffeurs 'oublient' compteur ou prennent chemins longs. Facturent 50€ pour 10€ de trajet. SOLUTION: Exigez compteur avant départ OU utilisez app Beat/Uber. Tarif aéroport → centre: 38€ jour, 54€ nuit (tarif fixe)."
      },
      {
        title: "Faux billets sites archéologiques",
        desc: "Vendeurs rue proposent billets 'coupe-file' Acropole. Contrefaits. SOLUTION: Achetez billets aux guichets officiels ou en ligne sur officiel uniquement."
      },
      {
        title: "Bars à filles Syntagma",
        desc: "Filles dans rue invitent boire verre. Addition 200-500€ pour 2 bières. Videurs menacent. SOLUTION: Refusez toute invitation rue, ne suivez jamais quelqu'un."
      },
      {
        title: "Restaurants pièges Plaka",
        desc: "Rabatteurs insistants, prix non affichés, addition exorbitante. Certains ajoutent plats non commandés. SOLUTION: Vérifiez prix menu avant, refusez rabatteurs."
      },
      {
        title: "Fausses collectes humanitaires",
        desc: "Personnes déguisées en moines ou avec clipboard demandent dons. SOLUTION: Ignorez, ne donnez rien."
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport → centre (tarif fixe)", price: "€38 jour / €54 nuit" },
      { item: "Métro aéroport → centre", price: "€9" },
      { item: "Ticket métro/bus simple", price: "€1.20" },
      { item: "Pass 5 jours transports", price: "€9" },
      { item: "Café grec (elliniko)", price: "€2-3" },
      { item: "Frappé (café glacé)", price: "€3-4" },
      { item: "Gyros (sandwich)", price: "€3-4" },
      { item: "Souvlaki plat", price: "€8-12" },
      { item: "Taverne traditionnelle", price: "€15-25" },
      { item: "Ouzo/vin résiné", price: "€3-5 verre" },
      { item: "Entrée Acropole", price: "€20 (gratuit dimanches hiver)" },
      { item: "Pass combiné 7 sites", price: "€30" },
      { item: "Excursion îles Saronic (Hydra/Poros)", price: "€70-100" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "100", icon: "Shield" },
      { name: "Ambulance (EKAB)", number: "166", icon: "Ambulance" },
      { name: "Pompiers", number: "199", icon: "Flame" },
      { name: "Police touristique", number: "171", icon: "ShieldCheck" }
    ],
    consulateInfo: "Ambassade de France en Grèce: Leoforos Vasilissis Sofias 7, 106 71 Athènes. Tél: +30 210 339 1000. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Café grec traditionnel: Se boit lentement, marc au fond (ne pas boire)",
      "Mézé: Petites assiettes à partager (équivalent tapas espagnoles)",
      "Horaires repas: Déjeuner 14h-16h, dîner 21h-minuit (très tard)",
      "Opa!: Exclamation joie. Casser assiettes interdit maintenant (folklore pour touristes)",
      "Pourboire: 5-10% apprécié, arrondir addition",
      "Sieste sacrée: Commerces fermés 14h-17h (sauf zones touristiques)",
      "Gestuelle: NON = hochement tête HAUT (pas gauche-droite). OUI = inclinaison tête BAS",
      "Filoxenia: Hospitalité grecque légendaire. Grecs très chaleureux, généreux"
    ],
    behaviorsToAvoid: [
      "Jeter papier toilette dans WC (plomberie vétuste, poubelle prévue)",
      "Traverser Omonia Square (danger réel même jour)",
      "Comparer Grèce à Turquie positivement (rivalité historique intense)",
      "Parler de la crise économique négativement (sujet douloureux)",
      "Appeler Macédoine du Nord 'Macédoine' (conflit noms très sensible)",
      "Toucher monastères/églises en short/débardeur (tenue modeste requise)",
      "Insulter sur religion orthodoxe (très importante identité grecque)",
      "Boire ouzo/raki cul sec (se déguste lentement avec mezze)"
    ]
  },

  "vienna-austria": {
    id: "vienna-austria",
    name: "Vienne",
    country: "Autriche",
    image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 87,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Allemand (Anglais bien parlé)",
    currency: "Euro (€)",
    securitySummary: "Vienne est l'une des villes les plus sûres d'Europe. La criminalité violente est rare. Pickpockets présents zones touristiques (Stephansplatz, Naschmarkt) et transports publics. Ville propre, organisée, respectueuse des règles. ATTENTION: Règles strictes (amendes fréquentes pour infractions mineures). Ville élégante, classique, parfois rigide.",
    alerts: [],
    dangerousAreas: [
      "Praterstern (gare) la nuit (quelques ivrognes, dealers)",
      "Gürtel (périphérique) certaines zones la nuit",
      "Quelques quartiers périphériques tard le soir (Favoriten sud)",
      "Centre historique très sûr"
    ],
    safetyTips: [
      "Pickpockets actifs Stephansplatz, Naschmarkt, lignes U1/U3 - sac devant",
      "Transports: Validez TOUJOURS ticket (contrôles fréquents, amende 105€ sans pitié)",
      "Traversez aux passages piétons (feux rouges piétons respectés strictement)",
      "Vélos prioritaires sur pistes cyclables - ne marchez pas dessus",
      "Silence dans transports et lieux publics (chuchotez, ne téléphonez pas)",
      "Eau robinet excellente (Alpes, meilleure que bouteille)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" },
      { name: "Encéphalite à tiques si randonnée Wienerwald", status: "optional" }
    ],
    healthSystem: "Excellent système de santé. Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE. Hôpitaux modernes: AKH, Hanusch. Pharmacies (Apotheke) partout. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, etc.",
    entryDocuments: "Carte d'identité ou passeport valide pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Arnaques quasi inexistantes",
        desc: "Vienne est tellement sûre et organisée que les arnaques touristiques classiques sont rares. Autrichiens respectent règles et lois."
      },
      {
        title: "Faux mendiants/musiciens métro",
        desc: "Certains groupes organisés. Donnez aux organisations caritatives plutôt qu'aux individus."
      },
      {
        title: "Restaurants pièges Stephansplatz",
        desc: "Quelques restaurants zone ultra-touristique prix élevés pour qualité moyenne. SOLUTION: Mangez dans rues adjacentes ou quartiers Neubau, Josefstadt (meilleurs prix, authentique)."
      },
      {
        title: "Concerts Mozart costumés",
        desc: "Vendeurs déguisés proposent concerts 'classiques'. Qualité variable, prix 50-80€. SOLUTION: Vérifiez avis en ligne, préférez Staatsoper, Musikverein, Konzerthaus (officiels)."
      }
    ],
    priceGuide: [
      { item: "Train CAT aéroport → centre (16min)", price: "€13" },
      { item: "Train S7 aéroport → centre (25min)", price: "€4.40" },
      { item: "Ticket métro/tram/bus simple", price: "€2.40" },
      { item: "Pass 24h transports", price: "€8" },
      { item: "Pass 72h transports", price: "€17.10" },
      { item: "Kleiner Brauner (espresso)", price: "€3-4" },
      { item: "Melange (café viennois)", price: "€4-5" },
      { item: "Sachertorte (pâtisserie)", price: "€6-8" },
      { item: "Würstelstand (hot-dog)", price: "€4-6" },
      { item: "Schnitzel restaurant", price: "€15-25" },
      { item: "Heuriger (taverne vin)", price: "€20-30 repas" },
      { item: "Bière 0.5L", price: "€4-6" },
      { item: "Entrée Schönbrunn Palace", price: "€18-28" },
      { item: "Staatsoper debout (standing)", price: "€10-15" },
      { item: "Concert Musikverein", price: "€40-150" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "133", icon: "Shield" },
      { name: "Ambulance", number: "144", icon: "Ambulance" },
      { name: "Pompiers", number: "122", icon: "Flame" }
    ],
    consulateInfo: "Ambassade de France en Autriche: Technikerstraße 2, 1040 Wien. Tél: +43 1 502 75 0. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Kaffeehauskultur: Culture des cafés viennois. Commandez café, restez 3h avec journal (normal)",
      "Sachertorte: Gâteau au chocolat emblématique. Meilleure = Hotel Sacher ou Café Demel",
      "Heuriger: Tavernes vin périphérie. Ambiance locale, buffet, vin nouveau",
      "Grüss Gott: Bonjour formel autrichien (littéralement 'Dieu vous salue')",
      "Pourboire: 5-10% standard, arrondir addition directement au serveur",
      "Opéra standing (Stehplätze): Billets debout 10€ (places 200€+). Arrive 80min avant",
      "Ponctualité SACRÉE: Arriver pile à l'heure (pas 5min avance ni retard)",
      "Tenue élégante appréciée: Viennois s'habillent bien, évitez sportswear en ville"
    ],
    behaviorsToAvoid: [
      "Traverser feu rouge piéton (amende + mal vu socialement)",
      "Ne pas valider ticket transports (amende 105€ sans exception)",
      "Parler fort dans transports/cafés (Viennois discrets)",
      "Marcher sur pistes cyclables (danger + amende)",
      "Être en retard (ponctualité absolue exigée)",
      "Appeler Autriche 'Allemagne' ou confondre les deux (très vexant)",
      "Dire 'Hitler était autrichien' (sujet sensible, évitez)",
      "Manger en marchant dans rue (considéré peu élégant)",
      "Critiquer musique classique (patrimoine culturel sacré)"
    ]
  },

  "marrakech-morocco": {
    id: "marrakech-morocco",
    name: "Marrakech",
    country: "Maroc",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 76,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+1 (pas de changement heure)",
    language: "Arabe, Berbère, Français très parlé",
    currency: "Dirham marocain (MAD) - 1€ ≈ 11 MAD",
    securitySummary: "Marrakech est modérément sûre. Criminalité violente rare mais harcèlement vendeurs/faux guides constant et épuisant. Arnaques multiples (taxis, souks, restaurants). Femmes seules peuvent subir harcèlement verbal. Respectez culture locale (vêtements modestes). Médina labyrinthique (facile se perdre). Circulation chaotique (scooters partout). Chaleur extrême été (45°C+).",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Canicule extrême",
        summary: "Températures 43-46°C prévues cette semaine. Hydratez-vous, évitez sorties 12h-17h.",
        date: "Aujourd'hui, 09:00"
      }
    ],
    dangerousAreas: [
      "Ruelles sombres médina la nuit (risque agression/vol)",
      "Zones périphériques Médina après 22h",
      "Sidi Youssef Ben Ali la nuit",
      "Jardins Menara isolés après tombée nuit",
      "Centre historique sûr mais harcèlement constant"
    ],
    safetyTips: [
      "Faux guides PARTOUT: 'Ami', 'frère', 'je veux juste parler' = arnaque 100%. Ignorez, dites 'la choukrane' (non merci)",
      "Habillez-vous modestement: Épaules et genoux couverts (surtout femmes). Évitez débardeurs/shorts courts",
      "Négociez TOUT prix avant: Taxis, achats souks, activités. Divisez prix initial par 3-4",
      "Médina: Facile se perdre. Téléchargez Maps.me (fonctionne offline). Repérez minarets (points repère)",
      "Vendeurs insistants: 'Non merci' ferme et continuez marcher. Ne vous arrêtez pas",
      "Eau: Bouteille capsulée uniquement (évitez robinet, glaçons)",
      "Femmes seules: Harcèlement verbal fréquent. Ignorez, ne répondez pas, marchandez fermement"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A et typhoïde recommandées", status: "recommended" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Système de santé correct en ville. Cliniques privées pour touristes (Clinique du Sud, Polyclinique du Sud). Assurance voyage recommandée. Pharmacies nombreuses. Urgence: 150.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français/européens/américains/canadiens (séjour max 90 jours). Passeport valide 6 mois minimum.",
    entryDocuments: "Passeport valide 6 mois après date retour. Billet retour recommandé.",
    commonScams: [
      {
        title: "Faux guides 'amis'",
        desc: "Personnes vous abordent 'Bonjour ami, d'où tu viens?'. Proposent 'aider gratuitement' puis réclament 200-500 MAD (20-50€) ou emmènent boutiques avec commission. SOLUTION: Ignorez TOUTES approches rue. Dites fermement 'La choukrane, sir fe halek' (non merci, partez)."
      },
      {
        title: "Taxis sans compteur",
        desc: "Chauffeurs refusent compteur, facturent 10x le prix. SOLUTION: Exigez 'compteur' (taximètre) AVANT monter sinon refusez taxi. Prix typiques: Aéroport-Médina 100 MAD max, trajets ville 15-40 MAD."
      },
      {
        title: "Arnaque tanneries",
        desc: "Faux guide vous emmène tanneries, demande 'pourboire' 500 MAD puis vendeur tapis/cuir insiste lourdement. SOLUTION: Allez tanneries seul (Chouara gratuit, ignore les 'guides')."
      },
      {
        title: "Prix souks gonflés touristes",
        desc: "Vendeurs annoncent prix 10-20x le prix local. SOLUTION: Négociez agressivement, divisez par 4-5 minimum. Acceptez de partir si prix trop haut (ils rappellent souvent)."
      },
      {
        title: "Fausses épices safran",
        desc: "Vendeurs proposent 'safran' à 50 MAD. C'est du curcuma coloré. Vrai safran coûte 500+ MAD. SOLUTION: Achetez épices supermarchés (prix fixes) ou magasins réputés."
      },
      {
        title: "Restaurant place Jemaa el-Fna",
        desc: "Rabatteurs insistants, prix non affichés, addition exorbitante (200+ MAD pour brochettes ordinaires). SOLUTION: Mangez rues adjacentes médina (prix affichés, meilleure qualité)."
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport → Médina (avec compteur)", price: "70-100 MAD (~6-9€)" },
      { item: "Taxi ville (courte distance)", price: "15-30 MAD (~1.50-3€)" },
      { item: "Bus touristique aéroport → ville", price: "30 MAD (~3€)" },
      { item: "Thé à la menthe café", price: "10-20 MAD (~1-2€)" },
      { item: "Jus d'orange frais pressé", price: "4-6 MAD (~0.40-0.60€)" },
      { item: "Tajine restaurant local", price: "40-70 MAD (~4-7€)" },
      { item: "Couscous restaurant", price: "50-80 MAD (~5-8€)" },
      { item: "Restaurant touristique place Jemaa", price: "100-200 MAD (~10-20€)" },
      { item: "Hammam traditionnel", price: "50-150 MAD (~5-15€)" },
      { item: "Entrée Jardin Majorelle", price: "70 MAD (~7€)" },
      { item: "Palais Bahia", price: "70 MAD (~7€)" },
      { item: "Balade dromadaire Palmeraie", price: "200-350 MAD (~20-35€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "19", icon: "Shield" },
      { name: "Gendarmerie", number: "177", icon: "ShieldCheck" },
      { name: "Ambulance (SAMU)", number: "150", icon: "Ambulance" },
      { name: "Pompiers", number: "15", icon: "Flame" },
      { name: "Brigade touristique", number: "0524 38 46 01", icon: "Info" }
    ],
    consulateInfo: "Consulat général de France à Marrakech: Rue Ibn Khaldoun, Guéliz. Tél: +212 5243-88200. Ambassade France à Rabat: +212 537 68 97 00 (urgences 24h/7j).",
    localCustoms: [
      "Marchandage obligatoire: Divisez prix annoncé par 3-4 minimum. C'est le jeu normal",
      "Thé à la menthe: Boisson nationale. Refuser = impoli. Acceptez au moins un verre",
      "Main droite: Mangez, donnez argent, serrez mains avec main droite (gauche impure)",
      "Salutations: 'Salam aleikoum' (paix sur vous) répond 'Wa aleikoum salam'",
      "Pourboire: 10% restaurants, 5-10 MAD porteurs/guides, arrondir taxis",
      "Ramadan: Ne mangez/buvez pas en public pendant journée (respect)",
      "Photographier: Demandez TOUJOURS permission avant photographier personnes",
      "Hammam: Expérience bain traditionnel. Hommes et femmes séparés"
    ],
    behaviorsToAvoid: [
      "Tenue inappropriée (débardeurs/shorts courts) - irrespect culture",
      "Montrer affection en public (se tenir main OK, s'embrasser NON)",
      "Manger/boire en public pendant Ramadan (manque respect)",
      "Photographier personnes sans permission (très impoli)",
      "Refuser thé offert (impoli, acceptez au moins un)",
      "Manger/donner argent main gauche (main impure)",
      "Critiquer l'Islam ou le Roi (illégal, sérieuses conséquences)",
      "Acheter sans négocier (vous payerez 5-10x le prix juste)",
      "Suivre 'faux guides' qui abordent dans rue"
    ]
  },

  "dublin-ireland": {
    id: "dublin-ireland",
    name: "Dublin",
    country: "Irlande",
    image: "https://images.unsplash.com/photo-1549770836-6322922a683d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 82,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0 (GMT+1 en été)",
    language: "Anglais, Irlandais (Gaeilge)",
    currency: "Euro (€)",
    securitySummary: "Dublin est globalement sûre mais attention pickpockets zones touristiques (Temple Bar, O'Connell Street, Grafton Street). Évitez certains quartiers périphériques la nuit (Ballymun, Tallaght). Bagarres d'ivrognes fréquentes tard le soir près des pubs. Alcool très présent dans culture. Météo pluvieuse imprévisible (4 saisons en 1 jour). Ville CHÈRE.",
    alerts: [],
    dangerousAreas: [
      "Ballymun la nuit",
      "Tallaght certaines zones après minuit",
      "Certaines parties de Coolock et Darndale la nuit",
      "O'Connell Street tard le soir (ivrognes, bagarres)",
      "Temple Bar après 1h du matin (bagarres alcoolisées)"
    ],
    safetyTips: [
      "Pickpockets actifs Temple Bar, O'Connell Street, bus - sac devant fermé",
      "Temple Bar: Zone très touristique et chère. Pubs authentiques dans quartiers adjacents",
      "Ivrognes agressifs tard le soir: Évitez O'Connell Street après minuit",
      "Météo imprévisible: Apportez TOUJOURS veste imperméable (pluie soudaine fréquente)",
      "Eau robinet excellente (ne payez pas bouteille)",
      "Pubs: Commandez au bar (pas de service à table), payez au fur et à mesure"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Bon système de santé public (HSE). Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE. Urgences gratuites. Hôpitaux: St James's, Beaumont. Pharmacies nombreuses. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/EEE (illimité). Exemption visa 90 jours pour USA, Canada, Australie, etc. Contrôles frontière (Irlande pas dans Schengen).",
    entryDocuments: "Carte d'identité ou passeport valide pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Arnaques rares",
        desc: "Dublin assez sûre, arnaques touristiques peu fréquentes. Irlandais généralement honnêtes et amicaux."
      },
      {
        title: "Pubs pièges Temple Bar",
        desc: "Zone ultra-touristique avec prix excessifs (pinte 8-10€ vs 5-6€ ailleurs). Qualité moyenne. SOLUTION: Buvez dans pubs quartiers Smithfield, Stoneybatter (authentiques, meilleurs prix)."
      },
      {
        title: "Taxis sans compteur",
        desc: "Quelques taxis refusent compteur, proposent tarif fixe excessif. SOLUTION: Exigez compteur ou utilisez app FREE NOW (Uber irlandais)."
      },
      {
        title: "Tours 'gratuits' pourboire forcé",
        desc: "Free walking tours réclament 15-20€ minimum à la fin. SOLUTION: Clarifiez attentes au début."
      }
    ],
    priceGuide: [
      { item: "Airlink bus aéroport → centre", price: "€7" },
      { item: "Taxi aéroport → centre", price: "€25-35" },
      { item: "Ticket bus/tram simple", price: "€2.20-3" },
      { item: "Leap Card (pass rechargeable)", price: "€5 + recharges" },
      { item: "Café latte", price: "€3.50-4.50" },
      { item: "Pinte Guinness pub normal", price: "€5.50-6.50" },
      { item: "Pinte Temple Bar (piège touriste)", price: "€8-10" },
      { item: "Fish & chips", price: "€10-14" },
      { item: "Pub meal", price: "€15-22" },
      { item: "Restaurant moyen", price: "€20-35" },
      { item: "Entrée Guinness Storehouse", price: "€26" },
      { item: "Entrée Trinity College (Book of Kells)", price: "€16" },
      { item: "Cliff of Moher tour journée", price: "€60-75" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112 ou 999", icon: "AlertCircle" },
      { name: "Garda (police)", number: "112", icon: "Shield" },
      { name: "Ambulance", number: "112", icon: "Ambulance" },
      { name: "Pompiers", number: "112", icon: "Flame" }
    ],
    consulateInfo: "Ambassade de France en Irlande: 66 Fitzwilliam Lane, Dublin 2. Tél: +353 1 277 5000. Urgences consulaires disponibles.",
    localCustoms: [
      "Pub culture: Cœur de vie sociale irlandaise. Commandez au bar, payez direct",
      "Craic: Concept irlandais d'amusement, bonne conversation, ambiance conviviale",
      "Guinness: Se boit lentement. Barman verse en 2 fois (laisse reposer entre deux)",
      "Rounds: Tradition d'acheter tournée pour groupe. Attendu que vous offriez aussi",
      "Pourboire: 10-12% restaurants si service non inclus. Pas obligatoire pubs",
      "Météo imprévisible: '4 saisons en 1 journée'. Toujours veste imperméable",
      "Slainte: Santé! en trinquant (prononcé 'slawn-cha')",
      "Irlandais très bavards et amicaux: conversations avec inconnus normale"
    ],
    behaviorsToAvoid: [
      "Confondre Irlande et Royaume-Uni (pays indépendant depuis 1922)",
      "Imiter accent irlandais de façon moqueuse (mal pris)",
      "Commander Irish Car Bomb (cocktail au nom offensant lié au terrorisme)",
      "Critiquer l'Irlande en comparant au UK (sujet très sensible)",
      "Appeler whisky irlandais 'scotch' (whiskey irlandais ≠ scotch écossais)",
      "Parler politique nord-irlandaise (sujet sensible, évitez)",
      "Boire Guinness rapidement (se déguste lentement)",
      "Ne pas participer aux rounds si vous êtes dans groupe (impoli)"
    ]
  }

};
