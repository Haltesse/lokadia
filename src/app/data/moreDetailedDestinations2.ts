import type { DestinationDetails } from "./types";

// Lot 2: Destinations supplémentaires ultra-détaillées
export const moreDetailedDestinations2: Record<string, DestinationDetails> = {

  "oslo-norway": {
    id: "oslo-norway",
    name: "Oslo",
    country: "Norvège",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 93,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+1 (CET)",
    language: "Norvégien (Anglais excellemment parlé)",
    currency: "Couronne norvégienne (NOK) - 1€ ≈ 11 NOK",
    securitySummary: "Oslo est l'une des capitales les plus sûres d'Europe. La criminalité violente est quasi inexistante. Les pickpockets sont rares mais peuvent opérer dans certaines zones touristiques et le métro. La ville est propre, organisée et les Norvégiens sont respectueux. ATTENTION: Ville EXTRÊMEMENT chère (alcool surtout). Températures très froides en hiver (-15°C possible).",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Froid extrême",
        summary: "Températures -10°C prévues cette semaine avec neige. Équipez-vous chaudement.",
        date: "Aujourd'hui, 08:00"
      }
    ],
    dangerousAreas: [
      "Grønland tard le soir (dealers présents mais pas dangereux pour touristes)",
      "Gare centrale (Oslo S) après minuit (quelques ivrognes)",
      "Aucune zone vraiment dangereuse (ville très sûre)"
    ],
    safetyTips: [
      "Pickpockets rares mais restez vigilant dans Tøyen et Grønland",
      "Équipement hiver INDISPENSABLE octobre-avril (températures négatives)",
      "Alcool HORS DE PRIX: bière bar 80-120 NOK (7-11€). Achetez à Vinmonopolet (monopole État)",
      "Transports publics: validez toujours ticket (contrôles fréquents, amende 1150 NOK = 105€)",
      "Eau du robinet excellente (meilleure que bouteille)",
      "Respectez nature: droit d'accès 'Allemannsretten' permet camper mais respecter environnement"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" },
      { name: "Encéphalite à tiques si randonnée forêts été", status: "optional" }
    ],
    healthSystem: "Excellent système de santé publique (meilleur au monde). Carte Européenne d'Assurance Maladie (CEAM) acceptée pour citoyens UE/EEE. Urgences gratuites. Pharmacies bien équipées. Numéro urgence: 113.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/EEE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, Suisse, etc.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour UE/EEE. Passeport valide pour non-UE.",
    commonScams: [
      {
        title: "Escroqueries quasi inexistantes",
        desc: "Oslo est tellement sûre que les arnaques touristiques classiques n'existent quasiment pas. Les Norvégiens sont honnêtes et respectent les règles."
      },
      {
        title: "Bars à prix exorbitants",
        desc: "Seul 'piège': certains bars touristiques facturent 150-200 NOK (14-18€) la bière. SOLUTION: Consultez prix avant, ou achetez alcool à Vinmonopolet (magasin État)."
      },
      {
        title: "Restaurants touristiques sur quais",
        desc: "Restaurants front de mer Aker Brygge très chers pour qualité moyenne. SOLUTION: Mangez dans quartiers Grünerløkka, Majorstuen (plus authentique, moins cher)."
      }
    ],
    priceGuide: [
      { item: "Train aéroport Gardermoen → centre (Flytoget)", price: "220 NOK (~20€)" },
      { item: "Train régional aéroport → centre (moins cher)", price: "118 NOK (~11€)" },
      { item: "Ticket métro/tram/bus simple", price: "42 NOK (~3.80€)" },
      { item: "Billet 24h transports", price: "130 NOK (~12€)" },
      { item: "Billet 7 jours transports", price: "340 NOK (~31€)" },
      { item: "Café espresso", price: "40-50 NOK (~3.60-4.50€)" },
      { item: "Pinte bière bar", price: "90-120 NOK (~8-11€)" },
      { item: "Demi-bière supermarché", price: "35-45 NOK (~3-4€)" },
      { item: "Menu fast-food (McDo)", price: "120-140 NOK (~11-13€)" },
      { item: "Repas restaurant moyen", price: "200-350 NOK (~18-32€)" },
      { item: "Restaurant haute gamme", price: "500-800 NOK (~45-73€)" },
      { item: "Kebab/pizza", price: "120-180 NOK (~11-16€)" },
      { item: "Entrée Musée Munch", price: "160 NOK (~15€)" },
      { item: "Entrée Musée Fram (bateau polaire)", price: "150 NOK (~14€)" },
      { item: "Opéra Oslo (visite gratuite terrasse)", price: "Gratuit" }
    ],
    emergencyNumbers: [
      { name: "Urgences médicales", number: "113", icon: "Ambulance" },
      { name: "Police", number: "112", icon: "Shield" },
      { name: "Pompiers", number: "110", icon: "Flame" },
      { name: "Urgences générales EU", number: "112", icon: "AlertCircle" }
    ],
    consulateInfo: "Ambassade de France en Norvège: Drammensveien 69, 0271 Oslo. Tél: +47 23 28 46 00. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Égalité absolue: société très égalitaire, pas de hiérarchie marquée, tout le monde se tutoie",
      "Ponctualité sacrée: arriver à l'heure IMPÉRATIF (même 5min retard = très impoli)",
      "Respect nature: ne jetez RIEN dans nature, ramassez même déchets d'autres",
      "Allemannsretten: droit accès nature (camper, randonner partout sauf propriétés privées clôturées)",
      "Silence dans transports: Norvégiens très silencieux, discrets",
      "Alcool réglementé: vente alcool fort seulement dans Vinmonopolet (magasins État, fermés dimanche)",
      "Pourboire NON obligatoire (salaires élevés) mais arrondir apprécié",
      "Enlever chaussures en entrant chez quelqu'un (TOUJOURS)"
    ],
    behaviorsToAvoid: [
      "Être en retard (ponctualité sacrée, arriver même 5min tard = impoli)",
      "Parler fort transports/restaurants (Norvégiens très discrets)",
      "Se vanter ou montrer richesse (culture 'Janteloven' = humilité)",
      "Jeter déchets nature (respect environnement absolu)",
      "Fumer près des entrées bâtiments (interdit 4m des portes)",
      "Ne pas enlever chaussures en entrant chez quelqu'un (très impoli)",
      "Comparer Norvège à Suède (rivalité sportive)",
      "Se plaindre des prix (vous saviez que c'était cher)"
    ]
  },

  "stockholm-sweden": {
    id: "stockholm-sweden",
    name: "Stockholm",
    country: "Suède",
    image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 89,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Suédois (Anglais excellemment parlé par 90% population)",
    currency: "Couronne suédoise (SEK) - 1€ ≈ 11 SEK",
    securitySummary: "Stockholm est une ville très sûre avec faible taux criminalité. La criminalité violente est rare dans le centre. Attention pickpockets zones touristiques (Gamla Stan, Sergels Torg) et métro. Évitez certaines banlieues périphériques la nuit (Rinkeby, Tensta). Ville propre, organisée, respectueuse environnement. ATTENTION: Très cher (presque autant que Oslo/Copenhague).",
    alerts: [],
    dangerousAreas: [
      "Rinkeby, Tensta, Husby (banlieues nord-ouest) la nuit",
      "Järvafältet après minuit",
      "T-Centralen (gare centrale métro) tard le soir - quelques ivrognes",
      "Centre historique sûr mais pickpockets zones touristiques"
    ],
    safetyTips: [
      "Pickpockets actifs Gamla Stan (vieille ville), métro, bus touristiques",
      "Équipement hiver nécessaire novembre-mars (neige, -10°C possible)",
      "Alcool cher: bière bar 70-90 SEK (6.30-8€). Achetez Systembolaget (monopole État)",
      "Société sans cash: 99% transactions par carte, apportez Visa/Mastercard",
      "Eau robinet excellente (ne payez pas bouteille)",
      "Transports: validez ticket (contrôles fréquents, amende 1500 SEK = 135€)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" },
      { name: "Encéphalite à tiques si randonnée archipel été", status: "optional" }
    ],
    healthSystem: "Excellent système de santé publique. Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE/EEE. Urgences gratuites. Pharmacies (Apotek) bien équipées. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/EEE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, Suisse, etc.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour UE/EEE. Passeport valide pour non-UE.",
    commonScams: [
      {
        title: "Arnaques rares",
        desc: "Stockholm très sûre, arnaques touristiques quasi inexistantes. Suédois honnêtes et respectent règles."
      },
      {
        title: "Faux taxis",
        desc: "Quelques taxis non-licenciés à aéroport Arlanda. SOLUTION: Utilisez seulement Taxi Stockholm (jaune), Taxi Kurir, Taxi 020, ou Uber/Bolt."
      },
      {
        title: "Restaurants pièges Gamla Stan",
        desc: "Certains restaurants vieille ville prix excessifs pour qualité moyenne. SOLUTION: Vérifiez avis Google, mangez quartiers Södermalm, Vasastan (meilleur rapport qualité/prix)."
      }
    ],
    priceGuide: [
      { item: "Arlanda Express aéroport → centre (20min)", price: "299 SEK (~27€)" },
      { item: "Pendeltåg (train régional) aéroport → centre", price: "150 SEK (~14€)" },
      { item: "Flygbussarna (bus) aéroport → centre", price: "129 SEK (~12€)" },
      { item: "Ticket métro/bus simple", price: "40 SEK (~3.60€)" },
      { item: "Pass 24h transports", price: "165 SEK (~15€)" },
      { item: "Pass 7 jours transports", price: "430 SEK (~39€)" },
      { item: "Café latte", price: "45-55 SEK (~4-5€)" },
      { item: "Fika (café + kanelbulle)", price: "60-80 SEK (~5.40-7.20€)" },
      { item: "Pinte bière bar", price: "75-95 SEK (~6.80-8.60€)" },
      { item: "Menu déjeuner 'dagens rätt'", price: "95-130 SEK (~8.60-12€)" },
      { item: "Repas restaurant moyen soir", price: "200-350 SEK (~18-32€)" },
      { item: "Kebab/pizza", price: "90-120 SEK (~8-11€)" },
      { item: "Entrée Musée Vasa", price: "190 SEK (~17€)" },
      { item: "Entrée Palais Royal", price: "180 SEK (~16€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales (Police/Ambulance/Pompiers)", number: "112", icon: "AlertCircle" },
      { name: "Police non-urgence", number: "114 14", icon: "Shield" },
      { name: "Assistance médicale (1177 Vårdguiden)", number: "1177", icon: "Hospital" }
    ],
    consulateInfo: "Ambassade de France en Suède: Kommendörsgatan 13, 114 48 Stockholm. Tél: +46 8 459 53 00. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Fika: pause café sacrée avec kanelbulle (brioche cannelle) - tradition sociale importante",
      "Lagom: concept 'ni trop ni trop peu', équilibre, modération dans tout",
      "Ponctualité importante (mais moins stricte que Norvège)",
      "Égalité sociale: pas de hiérarchie marquée, société égalitaire",
      "Société sans cash: paiement par carte PARTOUT (même toilettes publiques)",
      "Allemansrätten: droit accès nature (camper, cueillir baies/champignons partout)",
      "Enlever chaussures en entrant chez quelqu'un (toujours)",
      "Pourboire NON obligatoire mais arrondir facture apprécié",
      "Recyclage: 7 poubelles différentes (Suédois très écolos)"
    ],
    behaviorsToAvoid: [
      "Être trop en retard (ponctualité appréciée)",
      "Parler fort dans transports (Suédois discrets)",
      "Se vanter de réussite/argent (humilité valorisée)",
      "Jeter déchets par terre (respect environnement absolu)",
      "Ne pas enlever chaussures chez quelqu'un (très impoli)",
      "Fumer près entrées bâtiments (interdit)",
      "Comparer Suède à Norvège négativement (rivalité)",
      "Critiquer monarchie (roi Carl XVI Gustaf populaire)"
    ]
  },

  "copenhagen-denmark": {
    id: "copenhagen-denmark",
    name: "Copenhague",
    country: "Danemark",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 88,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Danois (Anglais excellemment parlé)",
    currency: "Couronne danoise (DKK) - 1€ ≈ 7.45 DKK",
    securitySummary: "Copenhague est une ville très sûre avec faible criminalité violente. Attention pickpockets zones touristiques (Nyhavn, Strøget, Tivoli) et vélos qui roulent vite. Le quartier de Christiania (communauté hippie) est généralement sûr mais ne photographiez JAMAIS Pusher Street (vente cannabis). Évitez certaines zones de Nørrebro tard le soir. Ville vélo-friendly avec pistes cyclables partout - ATTENTION avant de traverser!",
    alerts: [],
    dangerousAreas: [
      "Nørrebro certaines rues tard le soir (généralement sûr mais restez vigilant)",
      "Christiania Pusher Street: NE PHOTOGRAPHIEZ JAMAIS (danger réel)",
      "Vesterbro ouest après minuit (quelques dealers)",
      "Centre sûr mais pickpockets zones ultra-touristiques"
    ],
    safetyTips: [
      "VÉLOS PARTOUT: regardez pistes cyclables avant traverser (priorité absolue aux vélos)",
      "Christiania: OK visiter mais NE PHOTOGRAPHIEZ JAMAIS Pusher Street (dealers cannabis, peuvent devenir violents)",
      "Pickpockets actifs Nyhavn, Strøget (rue piétonne), Tivoli - sac devant vous",
      "Équipement vélo si vous louez: feu avant/arrière obligatoire (amende 700 DKK = 94€)",
      "Alcool supermarché (cheap) vs bar (cher) - grande différence prix",
      "Eau robinet excellente (ne payez pas bouteille)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé publique danois. Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE/EEE. Urgences gratuites. Pharmacies bien équipées. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/EEE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, Suisse, etc.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour UE/EEE. Passeport valide pour non-UE.",
    commonScams: [
      {
        title: "Arnaques rares",
        desc: "Copenhague très sûre, arnaques quasi inexistantes. Danois honnêtes."
      },
      {
        title: "Location vélo arnaque",
        desc: "Rares loueurs non-officiels avec vélos en mauvais état. SOLUTION: Bycyklen (vélos ville officiels), Donkey Republic, ou Swapfiets."
      },
      {
        title: "Restaurants pièges Nyhavn",
        desc: "Front de mer Nyhavn: restaurants très chers pour qualité moyenne (200-300 DKK plat). SOLUTION: Mangez dans rues adjacentes ou quartiers Vesterbro, Nørrebro (meilleur rapport qualité/prix)."
      }
    ],
    priceGuide: [
      { item: "Train aéroport Kastrup → centre (12min)", price: "39 DKK (~5.20€)" },
      { item: "Métro aéroport → centre", price: "39 DKK (~5.20€)" },
      { item: "Ticket métro/bus simple", price: "25 DKK (~3.35€)" },
      { item: "City Pass 24h", price: "150 DKK (~20€)" },
      { item: "City Pass 72h", price: "300 DKK (~40€)" },
      { item: "Café latte", price: "45-55 DKK (~6-7.40€)" },
      { item: "Pinte bière bar", price: "60-85 DKK (~8-11.40€)" },
      { item: "Bière supermarché (50cl)", price: "8-15 DKK (~1-2€)" },
      { item: "Hot-dog stand rue", price: "30-40 DKK (~4-5.40€)" },
      { item: "Smørrebrød (sandwich ouvert typique)", price: "70-120 DKK (~9.40-16€)" },
      { item: "Repas restaurant moyen", price: "200-350 DKK (~27-47€)" },
      { item: "Entrée Tivoli", price: "145 DKK (~19.50€)" },
      { item: "Entrée Nyhavn canal tour", price: "95 DKK (~12.75€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales (Police/Ambulance/Pompiers)", number: "112", icon: "AlertCircle" },
      { name: "Police non-urgence", number: "114", icon: "Shield" },
      { name: "Assistance médicale", number: "1813", icon: "Hospital" }
    ],
    consulateInfo: "Ambassade de France au Danemark: Øster Allé 46C, 2100 København Ø. Tél: +45 33 67 01 00. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Hygge: concept danois cocooning, confort, bien-être (bougies, ambiance chaleureuse)",
      "Vélo = religion: 50% déplacements à vélo, pistes cyclables partout, priorité absolue",
      "Ponctualité importante (arriver à l'heure)",
      "Égalité sociale: société très égalitaire, pas de classes marquées",
      "Carte bancaire partout (société quasi sans cash)",
      "Pourboire NON obligatoire (service inclus) mais arrondir apprécié",
      "Enlever chaussures en entrant chez quelqu'un",
      "Smørrebrød: sandwich ouvert typique danois (pain noir, garnitures)",
      "Bière et aquavit: boissons traditionnelles, 'skål' (santé) avant de boire"
    ],
    behaviorsToAvoid: [
      "Marcher/s'arrêter sur pistes cyclables (danger + danois très énervés)",
      "Photographier Pusher Street à Christiania (dangereux, dealers peuvent être violents)",
      "Être en retard (ponctualité appréciée)",
      "Parler trop fort transports/restaurants",
      "Se vanter de réussite/argent (humilité valorisée)",
      "Ne pas enlever chaussures chez quelqu'un",
      "Comparer Danemark à Suède négativement (rivalité)",
      "Critiquer monarchie (reine Margrethe II très aimée)"
    ]
  },

  "reykjavik-iceland": {
    id: "reykjavik-iceland",
    name: "Reykjavik",
    country: "Islande",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 98,
    safetyLevel: "safe",
    lastUpdate: "Il y a 3 heures",
    timezone: "GMT+0 (toute l'année, pas de changement heure)",
    language: "Islandais (Anglais excellemment parlé par quasi 100% population)",
    currency: "Couronne islandaise (ISK) - 1€ ≈ 150 ISK",
    securitySummary: "Reykjavik et l'Islande sont EXTRÊMEMENT sûres - parmi les pays les plus sûrs au monde. La criminalité est quasi inexistante. Les portes des maisons sont souvent laissées ouvertes. Aucun pickpocket, aucune arnaque. Le SEUL danger vient de la NATURE: météo imprévisible, tempêtes, routes glacées, aurores boréales qui distraient conducteurs. ATTENTION: Prix astronomiques (+ cher qu'Oslo/Zurich). Population: 130,000 habitants à Reykjavik, 380,000 dans tout le pays.",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Tempête hivernale",
        summary: "Vents violents 80-100 km/h prévus samedi. Routes fermées possible. Consultez safetravel.is",
        date: "Aujourd'hui, 12:00"
      },
      {
        id: 2,
        type: "info",
        title: "Activité volcanique",
        summary: "Éruption volcanique en cours péninsule Reykjanes (zone inhabitée). Pas de danger Reykjavik.",
        date: "Il y a 1 jour"
      }
    ],
    dangerousAreas: [
      "AUCUNE zone dangereuse en ville (criminalité quasi inexistante)",
      "DANGER = NATURE: tempêtes, routes glacées, chutes d'eau glissantes, zones géothermiques (eau bouillante)",
      "Ne vous aventurez JAMAIS hors sentiers balisés zones géothermiques (risque brûlure mortelle)"
    ],
    safetyTips: [
      "Criminalité inexistante mais NATURE dangereuse: consultez météo et safetravel.is TOUS LES JOURS",
      "Conduire hiver: 4x4 recommandé, vitesse max 50 km/h routes glacées, tempêtes ferment routes",
      "Zones géothermiques: RESTEZ sur sentiers balisés (eau 100°C+ peut percer croûte terre)",
      "Randonnées: informez hébergement de vos plans, météo change en 10 minutes",
      "Équipement imperméable + chaud INDISPENSABLE toute l'année (vent, pluie soudains)",
      "Ne conduisez JAMAIS hors routes/pistes (illégal, destructeur pour nature fragile, amende 500,000 ISK = 3,300€)",
      "Aurores boréales: ne vous arrêtez pas sur routes (danger accidents)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé. Carte Européenne d'Assurance Maladie (CEAM) acceptée citoyens UE/EEE. Urgences gratuites. Hôpital Landspítali à Reykjavik très moderne. Urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/EEE/Schengen (illimité). Exemption visa 90 jours/180 jours pour USA, Canada, Australie, UK, Suisse, etc.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour UE/EEE. Passeport valide pour non-UE.",
    commonScams: [
      {
        title: "AUCUNE arnaque",
        desc: "L'Islande est tellement sûre et honnête qu'il n'y a AUCUNE arnaque touristique. Les Islandais sont les gens les plus honnêtes au monde. Si vous oubliez votre portefeuille dans un café, il sera là le lendemain."
      },
      {
        title: "Seul 'piège': PRIX",
        desc: "Prix astronomiques sont réels, pas arnaque. Bière bar: 1,200-1,500 ISK (8-10€). Repas restaurant: 3,000-5,000 ISK (20-33€). Essence: 300 ISK/L (2€/L). SOLUTION: Cuisinez vous-même (location avec cuisine), achetez alcool Duty Free aéroport."
      }
    ],
    priceGuide: [
      { item: "Bus Flybus aéroport Keflavík → Reykjavik (45min)", price: "3,500 ISK (~23€)" },
      { item: "Ticket bus ville Reykjavik", price: "490 ISK (~3.30€)" },
      { item: "Café latte", price: "650-800 ISK (~4.30-5.30€)" },
      { item: "Pinte bière bar", price: "1,200-1,500 ISK (~8-10€)" },
      { item: "Bière Duty Free aéroport (beaucoup moins cher)", price: "300 ISK (~2€)" },
      { item: "Hot-dog stand Bæjarins Beztu (fameux)", price: "500 ISK (~3.30€)" },
      { item: "Fish & chips restaurant", price: "2,500 ISK (~17€)" },
      { item: "Repas restaurant moyen", price: "3,000-5,000 ISK (~20-33€)" },
      { item: "Restaurant haute gamme", price: "8,000-15,000 ISK (~53-100€)" },
      { item: "Essence (par litre)", price: "290-320 ISK (~1.90-2.15€)" },
      { item: "Entrée Blue Lagoon (réserver à l'avance)", price: "8,990-12,990 ISK (~60-87€)" },
      { item: "Entrée Sky Lagoon", price: "7,990 ISK (~53€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales (Police/Ambulance/Pompiers)", number: "112", icon: "AlertCircle" },
      { name: "ICE-SAR (Sauvetage montagne)", number: "112", icon: "Mountain" },
      { name: "Safetravel.is (infos météo/routes)", number: "Consultez site", icon: "CloudRain" }
    ],
    consulateInfo: "Ambassade de France en Islande: Tungata 22, 101 Reykjavík. Tél: +354 575 9600. Urgences consulaires disponibles.",
    localCustoms: [
      "Enlever chaussures en entrant PARTOUT (maisons, certains restaurants, boutiques) - OBLIGATOIRE",
      "Honnêteté absolue: portefeuilles oubliés sont toujours rendus intacts",
      "Tutoiement universel: même avec Premier ministre (égalité totale)",
      "Bains thermaux: douche NU AVANT entrer piscine (vestiaires collectifs sans cabines) - contrôleurs surveillent",
      "Respect nature absolu: ne déviez JAMAIS des sentiers, ne cueillez pas mousse (repousse en 100 ans)",
      "Alcool: vente bière forte/vin/spiritueux seulement à Vínbúðin (magasin État, fermé dimanche)",
      "Pourboire NON attendu (service inclus, salaires élevés)",
      "Croyance elfes: 54% Islandais croient aux elfes, ne vous moquez pas (routes construites contournent 'rochers elfes')"
    ],
    behaviorsToAvoid: [
      "Conduire hors routes/pistes (illégal, destructeur nature, amende 500,000 ISK = 3,300€)",
      "Ne pas se doucher nu avant piscines thermales (obligatoire, contrôlé)",
      "Cueillir mousse ou fleurs (repousse très lente, illégal)",
      "Enlever pierres/sable/lave (illégal, douanes contrôlent)",
      "Se moquer croyance elfes (respectez culture locale)",
      "Comparer Islande à Groenland ou Féroé négativement",
      "Laisser moteur voiture tourner inutilement (gaspillage énergie mal vu)",
      "Jeter déchets nature (respect environnement absolu)"
    ]
  }

};
