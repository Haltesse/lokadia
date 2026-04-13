import type { DestinationDetails } from "./types";

// Destinations supplémentaires ultra-détaillées (style Paris)
export const moreDetailedDestinations: Record<string, DestinationDetails> = {
  
  "milan-italy": {
    id: "milan-italy",
    name: "Milan",
    country: "Italie",
    image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 81,
    safetyLevel: "safe",
    lastUpdate: "Il y a 3 heures",
    timezone: "GMT+1 (CET)",
    language: "Italien (Anglais parlé dans zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Milan est globalement sûre pour les touristes. La criminalité violente est rare mais les pickpockets sont très actifs, particulièrement dans le métro, autour du Duomo, dans les gares (Centrale, Garibaldi) et dans les zones commerciales. Les arnaques touristiques sont fréquentes autour de la cathédrale. Évitez certaines zones périphériques la nuit (notamment autour de la Gare Centrale). La présence policière est importante dans le centre.",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Grève transports",
        summary: "Perturbations métro et tramway vendredi 28 février - Lignes M1, M2 partiellement fermées",
        date: "Demain, 10:00"
      },
      {
        id: 2,
        type: "vigilance",
        title: "Manifestation étudiants",
        summary: "Rassemblement Piazza del Duomo samedi après-midi - Évitez la zone 14h-18h",
        date: "Il y a 2 heures"
      }
    ],
    dangerousAreas: [
      "Quartier de la Gare Centrale la nuit (après 22h)",
      "Parc Sempione après la tombée de la nuit",
      "Certaines zones de Corvetto et Rogoredo (périphérie sud)",
      "Zone Loreto tard le soir",
      "Quai 21 de la Gare Centrale (dealers présents)"
    ],
    safetyTips: [
      "Pickpockets TRÈS actifs métro lignes M1, M2, M3 aux heures de pointe - sac devant vous",
      "Autour du Duomo: Ignorez vendeurs bracelet 'gratuit' et faux moines (arnaque)",
      "Ne prenez JAMAIS taxi sans compteur - Exigez compteur ou utilisez Uber/Free Now",
      "Gare Centrale: Zone sensible la nuit, prenez taxi/métro pour éviter rues sombres",
      "Galleria Vittorio Emanuele: Attention pickpockets pendant que vous admirez",
      "Ne laissez jamais sac/veste sur chaise terrasse restaurant (vols à l'arraché fréquents)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés (DTP)", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé public italien (SSN). Carte Européenne d'Assurance Maladie (CEAM) acceptée pour citoyens UE. Hôpitaux de qualité (Policlinico, Niguarda, San Raffaele). Pharmacies partout (croix verte). Numéro urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour citoyens UE/Schengen (séjour illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, Suisse, Royaume-Uni, etc.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour UE. Passeport valide pour non-UE.",
    commonScams: [
      {
        title: "Bracelets 'amitié' gratuits Duomo",
        desc: "Des hommes vous attachent un bracelet au poignet en disant 'cadeau', puis réclament 20-50€ de manière agressive. SOLUTION: Mains dans les poches, dites fermement NO et continuez à marcher."
      },
      {
        title: "Faux moines bouddhistes",
        desc: "Donnent médaille/bracelet puis réclament donation minimum 20€. SOLUTION: Refusez poliment, ne prenez rien."
      },
      {
        title: "Restaurant piège touristes",
        desc: "Cartes menu sans prix, addition astronomique (100€+ pour pâtes simples). SOLUTION: Vérifiez TOUJOURS les prix avant de commander."
      },
      {
        title: "Taxi sans compteur aéroport/gare",
        desc: "Chauffeurs proposent tarif fixe exorbitant (80-120€ pour centre-ville). SOLUTION: Exigez compteur (35-50€ normal) ou prenez Malpensa Express (train 13€)."
      },
      {
        title: "Fausses pétitions",
        desc: "Personnes avec clipboard demandent signature + don pour fausse ONG. Complice vole sac pendant distraction. SOLUTION: Ne signez rien, ignorez."
      }
    ],
    priceGuide: [
      { item: "Ticket métro/tram/bus (90 min)", price: "€2.20" },
      { item: "Carnet 10 tickets", price: "€19.50" },
      { item: "Pass journée transports", price: "€7.60" },
      { item: "Caffè (espresso) au comptoir", price: "€1-1.50" },
      { item: "Cappuccino au comptoir", price: "€1.50-2" },
      { item: "Aperitivo (apéro + buffet)", price: "€10-15" },
      { item: "Pizza margherita restaurant", price: "€8-12" },
      { item: "Plat de pâtes restaurant", price: "€10-15" },
      { item: "Dîner restaurant moyen (2 pers)", price: "€50-80" },
      { item: "Spritz terrasse", price: "€6-10" },
      { item: "Bière (33cl) bar/restaurant", price: "€5-8" },
      { item: "Entrée Duomo (terrasses)", price: "€15-30" },
      { item: "Entrée Cène de Vinci (réserver mois à l'avance)", price: "€15" },
      { item: "Taxi aéroport Malpensa-centre", price: "€90 fixe ou €50 compteur" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Carabinieri (police)", number: "112", icon: "Shield" },
      { name: "Ambulance", number: "118", icon: "Ambulance" },
      { name: "Pompiers", number: "115", icon: "Flame" },
      { name: "Police municipale", number: "02-77271", icon: "ShieldCheck" }
    ],
    consulateInfo: "Consulat général de France à Milan: Via Mangili 1, 20121 Milano. Tél: +39 02 659 141. Urgences consulaires 24h/7j: +39 06 68 60 11 (ambassade Rome).",
    localCustoms: [
      "Aperitivo (18h-21h): Verre + buffet gratuit - tradition milanaise sacrée",
      "Café debout au comptoir (moins cher qu'assis en terrasse - 1€ vs 5€)",
      "Fashion capitale: Milanais très élégants, évitez tongs/shorts en ville",
      "Ne commandez JAMAIS cappuccino après 11h (considéré bizarre par italiens)",
      "Pourboire non obligatoire mais arrondir addition apprécié (1-2€)",
      "Service au restaurant peut être lent - c'est normal, profitez",
      "'Pranzo' (déjeuner 12h30-14h30) et 'Cena' (dîner 19h30-22h) - horaires stricts"
    ],
    behaviorsToAvoid: [
      "Commander cappuccino après déjeuner/dîner (faux-pas culturel majeur)",
      "S'asseoir sur marches du Duomo (interdit, amende possible)",
      "Manger en marchant dans rue (mal vu, peu élégant)",
      "Demander pizza ananas (n'existe pas en Italie, insulte culinaire)",
      "Couper spaghetti avec couteau (sacrilège - enroulez avec fourchette)",
      "Parler fort dans transports/restaurants (milanais discrets)",
      "Porter tongs/claquettes en centre-ville (considéré négligé)",
      "Comparer Milan à Rome (rivalité historique)"
    ]
  },

  "venice-italy": {
    id: "venice-italy",
    name: "Venise",
    country: "Italie",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 83,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+1 (CET)",
    language: "Italien (Anglais parlé zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Venise est très sûre pour les touristes. La criminalité violente est quasi inexistante. Les pickpockets opèrent dans les zones ultra-touristiques (Pont du Rialto, Place Saint-Marc, vaporetto bondés). Les arnaques aux restaurants/gondoles sont le principal problème. Attention aux inondations 'acqua alta' en automne/hiver. Ville TRÈS chère et TRÈS touristique.",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Acqua alta prévue",
        summary: "Marée haute exceptionnelle vendredi matin (120cm) - Place St-Marc inondée, prévoyez bottes",
        date: "Aujourd'hui, 16:00"
      },
      {
        id: 2,
        type: "info",
        title: "Carnaval de Venise",
        summary: "Affluence record du 1er au 10 mars - Réservations hébergement obligatoires, prix x3",
        date: "Il y a 1 jour"
      }
    ],
    dangerousAreas: [
      "Aucune zone dangereuse (ville très sûre)",
      "Évitez zones isolées de Mestre la nuit (partie continentale)",
      "Canaux sans barrières: risque de chute, attention la nuit si alcool"
    ],
    safetyTips: [
      "Pickpockets vaporetto (bateau-bus) ligne 1 aux heures de pointe - sac devant vous",
      "Place Saint-Marc et Rialto: Attention sacs et téléphones",
      "Ne suivez JAMAIS rabatteurs restaurants - arnaques fréquentes (100€+ pour pâtes)",
      "Gondole: Prix officiel 80€ (30min jour) / 100€ (nuit) - NÉGOCIEZ AVANT de monter",
      "Achetez eau supermarchés (1€) pas kiosques touristiques (5€)",
      "Téléchargez plan offline - facile de se perdre dans ruelles",
      "Attention marches hautes montée/descente ponts (risque chute)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé italien. Carte Européenne d'Assurance Maladie (CEAM) acceptée UE. Hôpital: Ospedale dell'Angelo (Mestre). Pharmacies dans chaque 'sestiere' (quartier). Urgences: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen (illimité). Exemption 90 jours/180 jours pour USA, Canada, Australie, UK, etc.",
    entryDocuments: "Carte d'identité ou passeport valide pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Restaurants pièges à touristes",
        desc: "Rabatteurs vous invitent, menu sans prix, addition 150€+ pour pâtes simples. Certains ajoutent frais cachés (pain/couverts non consommés). SOLUTION: Vérifiez TOUJOURS menu avec prix affiché dehors. Fuyez si pas de prix clairs."
      },
      {
        title: "Arnaque gondole",
        desc: "Gondolier dit 30€ puis réclame 150€ à l'arrivée. Tarifs officiels: 80€ (30min jour), 100€ (nuit), +50€ si chant. SOLUTION: Exigez confirmation prix AVANT de monter, refusez si pas clair."
      },
      {
        title: "Faux masques vénitiens",
        desc: "Masques 'artisanaux' made in China vendus 50€+. SOLUTION: Vrais ateliers ont label 'Artigiano Veneziano'. Évitez boutiques ultra-touristiques."
      },
      {
        title: "Verre de Murano contrefait",
        desc: "Vendeurs prétendent verre authentique de Murano, en fait importé d'Asie. SOLUTION: Achetez sur île de Murano directement dans ateliers certifiés."
      },
      {
        title: "Terrasse Place St-Marc",
        desc: "Café 12€, avec musique live service forcé 6€ supplémentaires non mentionné. SOLUTION: Consommez au comptoir (moins cher) ou rues adjacentes (prix normaux)."
      }
    ],
    priceGuide: [
      { item: "Vaporetto (bateau-bus) trajet simple", price: "€9.50" },
      { item: "Pass vaporetto 24h", price: "€25" },
      { item: "Pass vaporetto 72h", price: "€40" },
      { item: "Café espresso comptoir", price: "€1-1.50" },
      { item: "Café terrasse Place St-Marc", price: "€10-12" },
      { item: "Pizza margherita", price: "€10-15" },
      { item: "Plat de pâtes restaurant", price: "€15-25" },
      { item: "Cicchetti (tapas vénitiennes) bacaro", price: "€2-4/pièce" },
      { item: "Spritz (apéro typique)", price: "€4-8" },
      { item: "Gondole 30 min (officiel)", price: "€80 jour / €100 nuit" },
      { item: "Entrée Palais des Doges", price: "€30" },
      { item: "Entrée Basilique St-Marc tour", price: "€5" },
      { item: "Traghetto (gondole-bus traversée)", price: "€2" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "112", icon: "Shield" },
      { name: "Ambulance bateau", number: "118", icon: "Ambulance" },
      { name: "Police touristique Venise", number: "041-274-8225", icon: "ShieldCheck" }
    ],
    consulateInfo: "Consulat de France à Venise: Palazzo Morosini, Castello 6140. Tél: +39 041 522 43 19. Ambassade France à Rome: +39 06 68 60 11 (urgences 24h/7j).",
    localCustoms: [
      "Bacaro tour: Tradition apéro vénitien - bars à cicchetti (petites tapas) + spritz",
      "Acqua alta (marée haute): Bottes en caoutchouc vendues partout, passerelles installées",
      "Vaporetto: Laissez descendre avant de monter, tenez-vous bien (pas de sièges souvent)",
      "Venise pour Vénitiens: Évitez zones ultra-touristiques, explorez Cannaregio/Castello",
      "Pourboire: Coperto (pain/couverts 2-3€) déjà inclus, arrondir addition suffit",
      "Sieste sacrée: Commerces ferment 13h-15h30, rouvrent jusqu'à 19h30"
    ],
    behaviorsToAvoid: [
      "Pique-niquer assis Place St-Marc ou ponts (interdit, amende 50-500€)",
      "Se baigner canaux (interdit, très sale, amende 450€)",
      "Nourrir pigeons Place St-Marc (interdit, amende 500€)",
      "Marcher en maillot de bain/torse nu (interdit centre historique, amende 50-200€)",
      "Bloquer passage sur ponts pour photos (vénitiens agacés)",
      "Traîner valise bruyante tard la nuit (nuisance sonore)",
      "Comparer Venise à Amsterdam ou Bruges (les vénitiens détestent)",
      "Se plaindre du prix (vous saviez que c'était cher en venant)"
    ]
  },

  "madrid-spain": {
    id: "madrid-spain",
    name: "Madrid",
    country: "Espagne",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 80,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Espagnol (Castillan) - Anglais limité hors zones touristiques",
    currency: "Euro (€)",
    securitySummary: "Madrid est globalement sûre mais les pickpockets sont omniprésents dans le métro (lignes 1, 2, 5), autour de Sol/Gran Vía, au Rastro (marché dimanche), dans les musées (Prado, Reina Sofía) et zones touristiques. Les vols à l'arraché (sac, téléphone) sont fréquents. Évitez Lavapiés et certaines zones de Carabanchel tard la nuit. Attention manifestations fréquentes (souvent pacifiques). Ville animée jusqu'à 3-4h du matin.",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Manifestation syndicale",
        summary: "Défilé Puerta del Sol samedi 1er mars 11h-14h - Perturbations métro lignes 1, 2, 3",
        date: "Aujourd'hui, 09:00"
      },
      {
        id: 2,
        type: "info",
        title: "Vague de chaleur",
        summary: "Températures 35-38°C prévues toute la semaine - Hydratez-vous, évitez soleil 14h-17h",
        date: "Il y a 3 heures"
      }
    ],
    dangerousAreas: [
      "Certaines parties de Lavapiés la nuit (après minuit)",
      "Usera et Carabanchel périphérique sud la nuit",
      "Parc Casa de Campo la nuit (prostitution, drogues)",
      "Zone autour Gare Atocha tard le soir",
      "Plaza de España la nuit (dealers présents)"
    ],
    safetyTips: [
      "Pickpockets TRÈS actifs métro lignes 1, 2, 5 - Sac toujours devant vous, fermé",
      "Sol, Gran Vía, Plaza Mayor: Surveillez sacs/téléphones constamment",
      "Rastro (marché aux puces dimanche): Paradise pour pickpockets - vigilance maximale",
      "Ne laissez RIEN visible dans voiture (vitres brisées fréquentes)",
      "Sorties nocturnes: Gardez téléphone en poche, pas à la main dans la rue",
      "Musées (Prado, Reina Sofía): Vols pendant que vous admirez œuvres",
      "Faux policiers: VRAIS flics ne demandent JAMAIS votre portefeuille - arnaque classique"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé public espagnol (Seguridad Social). Carte Européenne d'Assurance Maladie (CEAM) acceptée pour citoyens UE. Hôpitaux de qualité (La Paz, Gregorio Marañón, 12 de Octubre). Pharmacies partout (croix verte). Urgences: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen (séjour illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, Suisse, etc.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour UE. Passeport valide pour non-UE.",
    commonScams: [
      {
        title: "Faux policiers en civil",
        desc: "2-3 personnes en civil montrent faux badge, prétendent contrôle drogue/faux billets, demandent voir portefeuille puis volent argent/cartes. SOLUTION: VRAIS policiers NE demandent JAMAIS portefeuille. Exigez aller au commissariat si doute. Appelez 091."
      },
      {
        title: "Technique de la moutarde",
        desc: "Quelqu'un renverse substance sur vous, complice 'aide' à nettoyer pendant qu'il vole sac/portefeuille. SOLUTION: Refusez aide, allez vous nettoyer ailleurs, gardez sac."
      },
      {
        title: "Menu del día piège",
        desc: "Restaurant affiche 'Menu del día 10€' mais vous facture 35€. SOLUTION: Confirmez menu ET prix avant de commander. Menu del día normal: 10-15€."
      },
      {
        title: "Taxe touristique inventée",
        desc: "Restaurant/hôtel invente taxe touristique (n'existe pas à Madrid). SOLUTION: Exigez justificatif légal, refusez frais non détaillés."
      },
      {
        title: "Bracelet 'gratuit' Rastro",
        desc: "Vendeur attache bracelet, dit gratuit, puis réclame 20€ agressivement. SOLUTION: Mains dans poches, refusez fermement, partez."
      }
    ],
    priceGuide: [
      { item: "Ticket métro/bus", price: "€1.50-2" },
      { item: "Pass touristique 1 jour", price: "€8.40" },
      { item: "Pass touristique 3 jours", price: "€18.40" },
      { item: "Café con leche bar", price: "€1.50-2" },
      { item: "Caña (petite bière)", price: "€2-3" },
      { item: "Menú del día (déjeuner complet)", price: "€10-15" },
      { item: "Tapas variées (ración)", price: "€8-15" },
      { item: "Jamón ibérico (assiette)", price: "€20-30" },
      { item: "Dîner restaurant moyen (2 pers)", price: "€50-80" },
      { item: "Entrée Musée du Prado", price: "€15 (gratuit 18h-20h lun-sam)" },
      { item: "Entrée Reina Sofía", price: "€12 (gratuit 19h-21h lun-sam)" },
      { item: "Palais Royal", price: "€13" },
      { item: "Spectacle flamenco avec boisson", price: "€25-40" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police Nationale", number: "091", icon: "Shield" },
      { name: "Police Municipale", number: "092", icon: "ShieldCheck" },
      { name: "Ambulance (SAMUR)", number: "112", icon: "Ambulance" },
      { name: "Pompiers", number: "080", icon: "Flame" }
    ],
    consulateInfo: "Ambassade de France à Madrid: Calle Salustiano Olózaga 9, 28001 Madrid. Tél: +34 914 238 900. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Horaires décalés: Déjeuner 14h-16h, dîner 21h-23h (restaurants fermés entre deux)",
      "Tapas culture: Commander boissons = tapas gratuites dans certains bars traditionnels",
      "Sieste: Commerces ferment 14h-17h (grandes surfaces ouvertes)",
      "Vie nocturne: Sorties commencent 23h-minuit, boîtes de nuit 2h-6h du matin",
      "Tutoiement facile: Espagnols passent vite au 'tú' (tu), ne vous offusquez pas",
      "Bruyant et animé: Parler fort, gesticuler = normal, ce n'est pas de l'agressivité",
      "Pourboire: 5-10% apprécié mais PAS obligatoire (contrairement USA)"
    ],
    behaviorsToAvoid: [
      "Dîner à 19h (restaurants vides, vous serez seul touriste)",
      "Comparer Madrid à Barcelone (rivalité sportive/politique intense)",
      "Parler catalan à Madrid (parlez espagnol/castillan)",
      "Appeler langue 'español' dans resto catalan (dites 'castellano')",
      "Commander paella à Madrid (plat valencien, pas madrilène - cocido madrilène typique)",
      "Être pressé au restaurant (service peut être lent, c'est la culture)",
      "Traverser hors passages piétons (amendes possibles)",
      "Parler politique indépendance Catalogne (sujet très sensible)"
    ]
  }

};
