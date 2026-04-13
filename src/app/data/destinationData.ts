import { additionalDestinations } from "./additionalDestinations";
import { newDestinations } from "./newDestinations";
import { moreDetailedDestinations } from "./moreDetailedDestinations";
import { moreDetailedDestinations2 } from "./moreDetailedDestinations2";
import { moreDetailedDestinations3 } from "./moreDetailedDestinations3";
import { moreDetailedDestinations4 } from "./moreDetailedDestinations4";
import type { DestinationDetails, Alert, HealthRequirement, ScamAlert, VisaInfo, TypicalCost, EmergencyContact } from "./types";

// Re-export types for backward compatibility
export type { DestinationDetails, Alert, HealthRequirement, ScamAlert, VisaInfo, TypicalCost, EmergencyContact };

export const destinationsDatabase: Record<string, DestinationDetails> = {
  "paris-france": {
    id: "paris-france",
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 85,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+1 (CET)",
    language: "Français",
    currency: "Euro (€)",
    securitySummary: "Paris est généralement une destination sûre pour les voyageurs. La ville dispose d'une forte présence policière et d'infrastructures de sécurité modernes. Restez vigilant dans les zones touristiques très fréquentées où les pickpockets opèrent, particulièrement dans le métro et près des attractions majeures comme la Tour Eiffel et le Louvre.",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Grève des transports",
        summary: "Perturbations prévues sur les lignes de métro 1, 4 et 14 jeudi 27 février",
        date: "Aujourd'hui, 14:30"
      },
      {
        id: 2,
        type: "vigilance",
        title: "Manifestation prévue",
        summary: "Rassemblement place de la République samedi 28 février - Évitez la zone entre 14h-19h",
        date: "Demain, 15:00"
      }
    ],
    dangerousAreas: [
      "Certaines zones du 18e et 19e arrondissement la nuit",
      "Gare du Nord et alentours après 22h",
      "Bois de Boulogne et Vincennes la nuit",
      "Stations de métro Châtelet-Les Halles après minuit"
    ],
    safetyTips: [
      "Restez vigilant dans le métro et les zones touristiques très fréquentées",
      "Évitez de montrer des objets de valeur (téléphones, bijoux, sacs de luxe)",
      "Gardez vos sacs fermés et devant vous, particulièrement dans les transports",
      "Utilisez des taxis officiels ou applications de transport reconnues (G7, Uber)",
      "Méfiez-vous des personnes trop amicales qui s'approchent dans les lieux touristiques"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés (tétanos, diphtérie)", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé publique et privée. La Carte Européenne d'Assurance Maladie (CEAM) est acceptée pour les citoyens de l'UE. Pharmacies largement disponibles (croix verte). Numéro d'urgence médicale: 15 (SAMU).",
    visaRequired: false,
    visaDetails: "Pas de visa nécessaire pour les ressortissants de l'UE, de l'espace Schengen, et de nombreux autres pays (USA, Canada, Australie, etc.) pour un séjour de moins de 90 jours.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité requis. Pour les non-européens, passeport valide 6 mois après la date de retour.",
    commonScams: [
      {
        title: "Pétition signature",
        desc: "Des personnes vous demandent de signer une pétition tout en vous volant. Refusez poliment et éloignez-vous."
      },
      {
        title: "Bracelets brésiliens",
        desc: "On vous attache un bracelet au poignet près de Sacré-Cœur puis demande 10-20€. Gardez les mains dans les poches."
      },
      {
        title: "Taxis non-officiels",
        desc: "Aux aéroports, des personnes proposent des taxis sans compteur à prix exorbitants. Utilisez uniquement taxis officiels ou G7."
      },
      {
        title: "Jeu de bonneteau",
        desc: "Jeu d'argent illégal dans la rue. Vous perdrez toujours, c'est une arnaque organisée."
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport CDG → centre", price: "50-70€" },
      { item: "Ticket métro simple", price: "2.10€" },
      { item: "Carnet 10 tickets métro", price: "17.35€" },
      { item: "Restaurant milieu de gamme", price: "20-35€" },
      { item: "Café en terrasse", price: "3-5€" },
      { item: "Bière (50cl)", price: "6-8€" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "17", icon: "Shield" },
      { name: "Pompiers", number: "18", icon: "Flame" },
      { name: "SAMU (Urgences médicales)", number: "15", icon: "Ambulance" },
      { name: "Numéro d'urgence européen", number: "112", icon: "AlertCircle" }
    ],
    consulateInfo: "En cas de perte de papiers, d'arrestation ou de problème consulaire majeur, contactez votre ambassade. La plupart se trouvent dans les 7e et 8e arrondissements.",
    localCustoms: [
      "Toujours dire 'Bonjour' en entrant dans un commerce et 'Au revoir' en sortant",
      "Tutoiement et vouvoiement: vouvoyer les personnes inconnues et les seniors",
      "Pourboire de 5-10% apprécié mais non obligatoire (service compris en France)",
      "Ne pas parler fort dans les lieux publics, c'est considéré comme impoli"
    ],
    behaviorsToAvoid: [
      "Parler fort dans les transports en commun ou restaurants",
      "Manger en marchant dans la rue (considéré comme peu élégant)",
      "Boire de l'alcool dans l'espace public (interdit et amendable)"
    ]
  },

  "tokyo-japan": {
    id: "tokyo-japan",
    name: "Tokyo",
    country: "Japon",
    image: "https://images.unsplash.com/photo-1598785933375-9f14c25f720b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEphcGFuJTIwc2t5bGluZXxlbnwxfHx8fDE3NzE5NTUzMTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 95,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+9 (JST)",
    language: "Japonais",
    currency: "Yen (¥)",
    securitySummary: "Tokyo est l'une des villes les plus sûres au monde. Le taux de criminalité est extrêmement bas et vous pouvez vous promener en toute sécurité à toute heure. Les Japonais sont respectueux et serviables. La ville est très propre et bien organisée.",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Typhon prévu",
        summary: "Saison des typhons: vérifiez la météo régulièrement en août-septembre",
        date: "Il y a 3 heures"
      }
    ],
    dangerousAreas: [
      "Kabukicho (quartier rouge de Shinjuku) tard le soir - restez vigilant",
      "Roppongi la nuit - présence de rabatteurs insistants"
    ],
    safetyTips: [
      "Évitez les bars où des rabatteurs vous abordent dans la rue (prix exorbitants)",
      "Gardez toujours vos effets personnels - les objets perdus sont quasi toujours retrouvés",
      "Respectez les règles strictes: ne pas manger en marchant, ne pas téléphoner dans le train",
      "Ayez toujours de l'argent liquide (beaucoup d'endroits ne prennent pas la carte)",
      "Téléchargez une application de traduction (peu de gens parlent anglais)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" },
      { name: "Encéphalite japonaise si séjour rural prolongé", status: "recommended" }
    ],
    healthSystem: "Système de santé excellent mais coûteux pour les étrangers. Souscrivez impérativement à une assurance voyage. Pharmacies nombreuses mais médicaments différents (apportez les vôtres).",
    visaRequired: false,
    visaDetails: "Exemption de visa pour séjours touristiques de moins de 90 jours pour la plupart des pays occidentaux (France, USA, Canada, etc.).",
    entryDocuments: "Passeport valide pour toute la durée du séjour. Billet retour obligatoire.",
    commonScams: [
      {
        title: "Bars à hôtesses de Roppongi",
        desc: "Des rabatteurs vous invitent dans des bars avec addition de plusieurs milliers d'euros. Refusez toute sollicitation de rue."
      },
      {
        title: "Faux moines bouddhistes",
        desc: "Demandent des dons dans les zones touristiques. Les vrais moines ne sollicitent jamais directement."
      },
      {
        title: "Taxis de l'aéroport",
        desc: "Très chers (200-300€). Utilisez le Narita Express ou Limousine Bus (30-40€)."
      }
    ],
    priceGuide: [
      { item: "Narita Express → Tokyo", price: "¥3,070 (~28€)" },
      { item: "Ticket métro", price: "¥170-320 (~1.5-3€)" },
      { item: "Pass métro journée", price: "¥800 (~7€)" },
      { item: "Ramen restaurant", price: "¥800-1,200 (~7-11€)" },
      { item: "Restaurant milieu de gamme", price: "¥1,500-3,000 (~14-27€)" },
      { item: "Bière locale (500ml)", price: "¥500 (~4.50€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "110", icon: "Shield" },
      { name: "Pompiers/Ambulance", number: "119", icon: "Ambulance" },
      { name: "Assistance touristique", number: "050-3816-2787", icon: "Info" }
    ],
    consulateInfo: "Ambassades situées principalement dans les quartiers de Minato et Chiyoda. Service d'assistance 24h/7j disponible.",
    localCustoms: [
      "S'incliner légèrement pour saluer (15-30° suffit pour les touristes)",
      "Enlever ses chaussures en entrant chez quelqu'un ou dans certains restaurants",
      "Ne jamais laisser de pourboire (considéré comme insultant)",
      "Manger les ramen et soba en faisant du bruit (signe d'appréciation)",
      "Ne pas planter ses baguettes verticalement dans le riz (rituel funéraire)",
      "Parler doucement dans les transports en commun"
    ],
    behaviorsToAvoid: [
      "Téléphoner dans les transports (mode silencieux obligatoire)",
      "Manger en marchant dans la rue",
      "Se moucher bruyamment en public (aller aux toilettes)",
      "Pointer du doigt quelqu'un",
      "Embrasser ou s'enlacer en public"
    ]
  },

  "new-york-usa": {
    id: "new-york-usa",
    name: "New York",
    country: "États-Unis",
    image: "https://images.unsplash.com/photo-1623250308777-924f865bce80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwY2l0eSUyME1hbmhhdHRhbnxlbnwxfHx8fDE3NzIwMDg3OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 78,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 30 minutes",
    timezone: "GMT-5 (EST)",
    language: "Anglais",
    currency: "Dollar américain ($)",
    securitySummary: "New York est globalement sûre, surtout Manhattan et les quartiers touristiques. La présence policière est importante. Cependant, restez vigilant dans le métro tard le soir, évitez certains quartiers du Bronx et de Brooklyn la nuit, et faites attention aux pickpockets dans Times Square.",
    alerts: [
      {
        id: 1,
        type: "vigilance",
        title: "Vague de froid",
        summary: "Températures extrêmes prévues (-15°C ressenti). Couvrez-vous bien si vous sortez.",
        date: "Aujourd'hui, 08:00"
      },
      {
        id: 2,
        type: "info",
        title: "Marathon de NYC",
        summary: "Perturbations de circulation majeures dimanche 2 mars. Ponts et routes fermés 6h-16h.",
        date: "Il y a 1 jour"
      }
    ],
    dangerousAreas: [
      "South Bronx la nuit (éviter après 22h)",
      "Certaines parties de Harlem et East Harlem tard le soir",
      "Brownsville (Brooklyn) à toute heure",
      "Stations de métro isolées après minuit (préférer le taxi/Uber)"
    ],
    safetyTips: [
      "Dans le métro: restez dans les wagons du milieu et près du conducteur la nuit",
      "Ne montrez pas ostensiblement objets de valeur et téléphones dans la rue",
      "Utilisez des applications de transport (Uber, Lyft) plutôt que taxis de rue la nuit",
      "Restez dans les zones bien éclairées et fréquentées après 23h",
      "Gardez un œil sur vos affaires dans Times Square et attractions touristiques",
      "Évitez d'utiliser votre téléphone en marchant dans les zones moins fréquentées"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Système de santé de qualité mais EXTRÊMEMENT COÛTEUX. Assurance voyage avec couverture médicale minimum 200,000$ INDISPENSABLE. Une consultation aux urgences peut coûter 1,000-3,000$. Pharmacies (CVS, Walgreens) partout.",
    visaRequired: true,
    visaDetails: "ESTA obligatoire (autorisation électronique, 21$, valable 2 ans) pour ressortissants français et européens. Demande en ligne 72h avant le départ minimum. Visa B2 requis pour certaines nationalités.",
    entryDocuments: "Passeport biométrique valide + ESTA approuvé. Billet retour obligatoire. Contrôles d'immigration stricts (empreintes + photo).",
    commonScams: [
      {
        title: "CD gratuits à Times Square",
        desc: "Des rappeurs offrent des CD 'gratuits' puis réclament 20-50$. Ne prenez rien de personnes dans la rue."
      },
      {
        title: "Faux moines bouddhistes",
        desc: "Vous offrent un bracelet puis demandent un don minimum de 20$. Ignorez-les poliment."
      },
      {
        title: "Taxis de l'aéroport",
        desc: "Des chauffeurs non officiels proposent des prix fixes excessifs. Utilisez Yellow Cab officiel ou zone Uber/Lyft."
      },
      {
        title: "Cartes à 3 cartes",
        desc: "Jeu d'arnaque dans la rue. Vous perdrez toujours, complices dans la foule."
      },
      {
        title: "Vendeurs de billets de spectacles",
        desc: "Revendeurs de rue avec faux billets. Achetez uniquement sur sites officiels ou guichets."
      }
    ],
    priceGuide: [
      { item: "Taxi JFK → Manhattan", price: "$70 (tarif fixe)" },
      { item: "AirTrain + métro JFK → Manhattan", price: "$11" },
      { item: "Ticket métro simple", price: "$2.90" },
      { item: "Pass métro illimité 7 jours", price: "$34" },
      { item: "Restaurant milieu de gamme", price: "$25-40" },
      { item: "Pizza part (slice)", price: "$3-5" },
      { item: "Café Starbucks", price: "$5-7" },
      { item: "Bière bar", price: "$8-12" }
    ],
    emergencyNumbers: [
      { name: "Urgences (Police/Pompiers/Ambulance)", number: "911", icon: "AlertCircle" },
      { name: "Police non-urgence", number: "311", icon: "Shield" },
      { name: "Poison Control", number: "1-800-222-1222", icon: "Skull" }
    ],
    consulateInfo: "Consulat de France à New York: 934 5th Avenue, New York NY 10021. Permanence consulaire 24h/7j: +1 212-606-3600.",
    localCustoms: [
      "Pourboire OBLIGATOIRE: 18-22% au restaurant, 15-20% pour taxis, 1-2$ par boisson au bar",
      "Les serveurs comptent sur les tips (salaire de base très bas)",
      "File d'attente stricte: ne jamais doubler, très mal vu",
      "Carte de crédit acceptée partout (même pour 1$)",
      "Ne pas fumer dans les lieux publics, parcs, plages (amendes 50-200$)"
    ],
    behaviorsToAvoid: [
      "Ne pas bloquer le passage sur les trottoirs (New-Yorkais pressés)",
      "Ne pas s'arrêter au milieu de Times Square pour prendre des photos",
      "Ne jamais entrer dans le métro par les portes de sortie",
      "Ne pas critiquer les USA ou New York (patriotisme fort)",
      "Éviter les sujets politiques sensibles avec des inconnus"
    ]
  },

  "london-uk": {
    id: "london-uk",
    name: "Londres",
    country: "Royaume-Uni",
    image: "https://images.unsplash.com/photo-1745016176874-cd3ed3f5bfc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBCaWclMjBCZW58ZW58MXx8fHwxNzcxOTA4MjA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 82,
    safetyLevel: "safe",
    lastUpdate: "Il y a 45 minutes",
    timezone: "GMT+0 (BST en été)",
    language: "Anglais",
    currency: "Livre sterling (£)",
    securitySummary: "Londres est une ville globalement sûre avec une forte présence policière. Attention aux pickpockets dans le métro (Tube) et les zones touristiques très fréquentées. Certains quartiers périphériques sont à éviter la nuit. La criminalité au couteau existe mais vise rarement les touristes.",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Grève des trains",
        summary: "Perturbations sur les lignes de trains National Rail jeudi et vendredi. Planifiez à l'avance.",
        date: "Il y a 2 heures"
      }
    ],
    dangerousAreas: [
      "Certains quartiers de South London tard le soir (Brixton, Peckham)",
      "East London: Tower Hamlets, Hackney la nuit",
      "Elephant & Castle après 23h",
      "Parcs isolés la nuit (Hyde Park, Regent's Park après la tombée de la nuit)"
    ],
    safetyTips: [
      "Attention aux pickpockets dans le Tube aux heures de pointe",
      "Regardez à droite en traversant (circulation à gauche)",
      "Restez derrière la ligne jaune sur les quais du métro",
      "N'acceptez pas de 'mini-cabs' non officiels dans la rue",
      "Utilisez uniquement Black Cabs officiels ou Uber",
      "Gardez vos effets personnels fermés et près de vous"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "NHS (système public) gratuit pour urgences vitales. Assurance voyage recommandée pour autres soins. CEAM acceptée pour citoyens UE (vérifier post-Brexit). Pharmacies (Boots) partout.",
    visaRequired: false,
    visaDetails: "Pas de visa pour séjours touristiques de moins de 6 mois pour citoyens UE, USA, Canada, Australie, etc. Contrôles d'immigration depuis le Brexit.",
    entryDocuments: "Passeport valide requis (carte d'identité UE non acceptée depuis Brexit). Preuve de fonds et billet retour peuvent être demandés.",
    commonScams: [
      {
        title: "Faux portiers d'hôtel",
        desc: "À la sortie des gares, proposent 'aide' pour réserver hôtel puis emmènent vers hôtels qui payent commission. Réservez en ligne."
      },
      {
        title: "Pétitions humanitaires",
        desc: "Demandent signature + don. Pendant ce temps, complices volent sacs/portefeuilles. Refusez poliment."
      },
      {
        title: "Jeux bonneteau Oxford Street",
        desc: "Jeux d'arnaque dans la rue. Vous perdrez toujours. Évitez."
      },
      {
        title: "Taxis illégaux",
        desc: "Mini-cabs non licenciés à la sortie des boîtes de nuit. Dangereux et très chers. Black Cab ou Uber uniquement."
      }
    ],
    priceGuide: [
      { item: "Heathrow Express → centre", price: "£25 (~29€)" },
      { item: "Oyster Card métro Zone 1-2", price: "£2.80 (~3.30€)" },
      { item: "Oyster Day Cap Zone 1-2", price: "£8.50 (~10€)" },
      { item: "Restaurant milieu de gamme", price: "£20-35 (~24-41€)" },
      { item: "Pub meal", price: "£12-18 (~14-21€)" },
      { item: "Pinte de bière pub", price: "£6-8 (~7-9.50€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences (Police/Pompiers/Ambulance)", number: "999", icon: "AlertCircle" },
      { name: "Non-urgence police", number: "101", icon: "Shield" },
      { name: "Non-urgence NHS", number: "111", icon: "Hospital" }
    ],
    consulateInfo: "Ambassade de France à Londres: 58 Knightsbridge, London SW1X 7JT. Urgences consulaires 24h/7j.",
    localCustoms: [
      "Faire la queue (queue) de manière ordonnée est SACRÉ - ne jamais doubler",
      "Dire 'sorry' et 'thank you' très fréquemment (politesse britannique)",
      "Pourboire 10-12.5% au restaurant (vérifier si service charge inclus)",
      "Tenez-vous à droite dans les escalators du métro (gauche pour marcher)",
      "Pubs: commander au bar (pas de service à table), payer au fur et à mesure"
    ],
    behaviorsToAvoid: [
      "Ne pas parler fort ou être bruyant dans les transports",
      "Ne jamais doubler dans une file d'attente (très mal vu)",
      "Ne pas bloquer le côté gauche des escalators",
      "Éviter les discussions politiques sur le Brexit (sujet sensible)"
    ]
  },

  "dubai-uae": {
    id: "dubai-uae",
    name: "Dubaï",
    country: "Émirats Arabes Unis",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMHNreWxpbmV8ZW58MXx8fHwxNzcyMDA4Nzk1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 92,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+4",
    language: "Arabe (anglais largement parlé)",
    currency: "Dirham (AED)",
    securitySummary: "Dubaï est l'une des villes les plus sûres au monde. La criminalité est quasi inexistante grâce à des lois très strictes et une surveillance importante. Cependant, soyez conscient des lois locales très différentes: consommation d'alcool réglementée, tenue vestimentaire modeste requise, comportements affectueux en public interdits.",
    alerts: [],
    dangerousAreas: [
      "Aucune zone vraiment dangereuse",
      "Évitez le quartier de Deira tard le soir (mais pas dangereux, juste moins agréable)"
    ],
    safetyTips: [
      "Respectez strictement les lois locales (très sévères)",
      "Ne consommez d'alcool que dans lieux autorisés (hôtels, bars licenciés)",
      "Tenue vestimentaire modeste dans lieux publics (épaules et genoux couverts)",
      "Pas de démonstrations affectueuses en public (amendes, prison possible)",
      "Ne photographiez jamais de personnes sans permission (surtout femmes)",
      "Ramadan: ne pas manger/boire/fumer en public pendant la journée"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A et B recommandées", status: "recommended" }
    ],
    healthSystem: "Système de santé privé excellent mais très coûteux. Assurance voyage avec couverture médicale minimum 100,000$ indispensable. Hôpitaux ultramodernes.",
    visaRequired: true,
    visaDetails: "Visa à l'arrivée pour citoyens français (gratuit, 30 jours). E-visa pour autres nationalités (à vérifier). Passeport valide 6 mois minimum.",
    entryDocuments: "Passeport valide 6 mois après date de retour. Pas de tampon israélien dans le passeport recommandé.",
    commonScams: [
      {
        title: "Taxis compteur trafiqué",
        desc: "Rares mais existent. Utilisez RTA taxis officiels (crème et rouge) ou Uber/Careem. Compteur doit démarrer à 5 AED."
      },
      {
        title: "Faux sites de réservation",
        desc: "Faux sites de réservation d'activités. Utilisez uniquement plateformes officielles ou guichets des sites."
      },
      {
        title: "Vendeurs de tours insistants",
        desc: "Dans les centres commerciaux, vendeurs de tours très insistants. Dites fermement 'no thank you' et continuez."
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport → Downtown", price: "AED 70-90 (~17-22€)" },
      { item: "Ticket métro", price: "AED 3-8.5 (~0.75-2€)" },
      { item: "Nol Card (pass métro)", price: "AED 25 (~6.30€)" },
      { item: "Restaurant milieu de gamme", price: "AED 60-120 (~15-30€)" },
      { item: "Restaurant économique", price: "AED 25-40 (~6-10€)" },
      { item: "Entrée Burj Khalifa (niveau 124)", price: "AED 149-399 (~37-100€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "999", icon: "Shield" },
      { name: "Ambulance", number: "998", icon: "Ambulance" },
      { name: "Pompiers", number: "997", icon: "Flame" },
      { name: "Urgences générales", number: "112", icon: "AlertCircle" }
    ],
    consulateInfo: "Consulat de France à Dubaï: Al Dhafrah Tower, 12th Floor. Urgences consulaires disponibles.",
    localCustoms: [
      "Tenue vestimentaire modeste obligatoire (genoux et épaules couverts dans lieux publics)",
      "Enlever chaussures en entrant dans mosquées ou maisons",
      "Ne jamais pointer la semelle de ses chaussures vers quelqu'un (très insultant)",
      "Main gauche considérée impure: manger et saluer de la main droite",
      "Pendant le Ramadan: ne pas manger, boire, fumer en public de l'aube au coucher du soleil",
      "Pas d'alcool dans lieux publics (seulement hôtels et bars licenciés)",
      "Pourboire 10-15% au restaurant si service non inclus"
    ],
    behaviorsToAvoid: [
      "Démonstrations d'affection en public (même se tenir la main peut poser problème)",
      "Consommer de l'alcool en dehors des lieux autorisés (amende/prison)",
      "Porter des vêtements trop courts ou décolletés",
      "Photographier des personnes (surtout femmes) sans permission",
      "Critiquer la famille royale ou le gouvernement",
      "Tenir des propos blasphématoires",
      "Gestes obscènes (doigt d'honneur = prison possible)"
    ]
  },

  "barcelona-spain": {
    id: "barcelona-spain",
    name: "Barcelone",
    country: "Espagne",
    image: "https://images.unsplash.com/photo-1595685842822-7893ddb30176?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYXJjZWxvbmElMjBTcGFpbiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzE5MDIyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 72,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 30 minutes",
    timezone: "GMT+1 (CET)",
    language: "Catalan, Espagnol",
    currency: "Euro (€)",
    securitySummary: "Barcelone est une belle ville mais connue pour être la capitale européenne du vol à la tire. Soyez EXTRÊMEMENT vigilant avec vos affaires, particulièrement dans Las Ramblas, le métro, la Sagrada Familia et tous les sites touristiques. Les vols sont opportunistes mais très fréquents.",
    alerts: [
      {
        id: 1,
        type: "warning",
        title: "Forte activité de pickpockets",
        summary: "Recrudescence de vols à la tire signalée dans le quartier Gothique et Las Ramblas. Doublez de vigilance.",
        date: "Il y a 1 heure"
      }
    ],
    dangerousAreas: [
      "El Raval la nuit (surtout partie sud près de Sant Pau)",
      "Plaça Reial après minuit (drogue, bagarres)",
      "Certaines parties de Barceloneta la nuit",
      "Stations de métro Liceu, Drassanes, Paral·lel"
    ],
    safetyTips: [
      "CRUCIAL: sac devant vous fermé en permanence, main sur la fermeture éclair",
      "Ne portez JAMAIS de sac à dos dans les lieux touristiques (cible principale)",
      "Téléphone et portefeuille dans poches avant ou ceinture cachée",
      "Méfiez-vous des distractions (quelqu'un vous salue, renverse quelque chose = technique vol)",
      "Ne posez jamais votre sac au sol au restaurant, sur le dossier de chaise",
      "Attention technique sandwich: 2 personnes vous coincent dans métro pendant qu'une 3e vole",
      "Utilisez distributeurs ATM dans banques, jamais dans rue"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Bon système de santé public. Carte Européenne d'Assurance Maladie (CEAM) acceptée. Urgences gratuites. Pharmacies nombreuses (cruz verde).",
    visaRequired: false,
    visaDetails: "Pas de visa pour citoyens UE/Schengen. Exemption visa pour USA, Canada, Australie (90 jours).",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour UE. Passeport pour non-UE.",
    commonScams: [
      {
        title: "Vol à la tire (pickpocket)",
        desc: "LE fléau de Barcelone. Gangs organisés partout: métro, Ramblas, Sagrada Familia, plages. Soyez paranoïaque avec vos affaires."
      },
      {
        title: "Fausse tache sur vêtement",
        desc: "Quelqu'un vous 'aide' à nettoyer une tache (qu'il a faite) pendant que complice vole votre sac. Éloignez-vous immédiatement."
      },
      {
        title: "Jeu bonneteau Ramblas",
        desc: "Jeu de cartes/gobelets. Vous perdrez toujours, complices dans la foule. Évitez."
      },
      {
        title: "Faux policiers",
        desc: "De faux policiers demandent vos papiers et portefeuille 'pour contrôle'. Vrais policiers en uniforme complet ou commissariat uniquement."
      },
      {
        title: "Restaurants pièges Ramblas",
        desc: "Nourriture médiocre à prix exorbitants. Mangez dans rues adjacentes (Raval, Gótico) pour authenticité et meilleurs prix."
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport → centre", price: "€35-40" },
      { item: "Aerobus aéroport → centre", price: "€6.75" },
      { item: "Ticket métro simple", price: "€2.55" },
      { item: "T-Casual 10 trajets", price: "€12.15" },
      { item: "Menu del día", price: "€12-18" },
      { item: "Tapas bar local", price: "€3-6/tapa" },
      { item: "Restaurant touristique Ramblas", price: "€20-30 (éviter!)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police Locale (Guardia Urbana)", number: "092", icon: "Shield" },
      { name: "Police Nationale", number: "091", icon: "Shield" },
      { name: "Urgences médicales", number: "061", icon: "Ambulance" }
    ],
    consulateInfo: "Consulat de France: Ronda Universitat 22 bis. En cas de vol de papiers, déposer plainte à la police (denuncia) puis consulat.",
    localCustoms: [
      "Horaires décalés: déjeuner 14h-16h, dîner 21h-23h (restaurants ouverts tard)",
      "Sieste 14h-17h: commerces fermés (grands magasins restent ouverts)",
      "Tapas: commander plusieurs petites portions à partager",
      "Pourboire non obligatoire mais 5-10% apprécié",
      "On parle catalan ici (pas castillan): 'Bon dia' = Bonjour, 'Gràcies' = Merci"
    ],
    behaviorsToAvoid: [
      "Comparer la Catalogne à l'Espagne (sujet très sensible, identité forte)",
      "Parler castillan en premier (essayez quelques mots catalans ou anglais)",
      "Manger en marchant (sauf dans zones très touristiques)",
      "Se baigner torse nu/en maillot loin de la plage (amende possible)",
      "Boire de l'alcool dans rue (amende €150-600)"
    ]
  },

  "amsterdam-netherlands": {
    id: "amsterdam-netherlands",
    name: "Amsterdam",
    country: "Pays-Bas",
    image: "https://images.unsplash.com/photo-1723152720678-da4ee06f4505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBbXN0ZXJkYW0lMjBOZXRoZXJsYW5kcyUyMGNhbmFsc3xlbnwxfHx8fDE3NzE5MzMxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 83,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Néerlandais, Anglais",
    currency: "Euro (€)",
    securitySummary: "Amsterdam est une destination très sûre avec un taux de criminalité violente faible. La ville dispose d'une excellente infrastructure de sécurité et d'une forte présence policière. Restez vigilant face aux pickpockets dans les zones touristiques très fréquentées comme Centraal Station, Dam Square et le Red Light District. Attention : les vélos sont omniprésents, regardez toujours avant de traverser les pistes cyclables.",
    alerts: [],
    dangerousAreas: [
      "Bijlmer (Amsterdam-Zuidoost) à éviter la nuit",
      "Certaines parties d'Amsterdam Noord après minuit",
      "Alentours de Centraal Station tard le soir (pickpockets)",
      "Vondelpark après la tombée de la nuit"
    ],
    safetyTips: [
      "Attention aux vélos PARTOUT - toujours regarder avant de traverser une piste cyclable (priorité absolue aux cyclistes)",
      "Ne photographiez JAMAIS les prostituées dans le Red Light District (illégal et vous risquez de graves problèmes)",
      "Surveillez vos affaires à Centraal Station, Dam Square et dans les trams bondés",
      "Le cannabis est légal uniquement dans les coffee shops agréés, pas dans la rue",
      "Ne bloquez jamais les pistes cyclables - amende immédiate"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés (tétanos, diphtérie)", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé public et privé. La Carte Européenne d'Assurance Maladie (CEAM) est acceptée pour les citoyens de l'UE. Hôpitaux modernes et bien équipés. Numéro d'urgence : 112. Pharmacies (Apotheek) facilement accessibles.",
    visaRequired: false,
    visaDetails: "Pas de visa nécessaire pour les ressortissants de l'UE, de l'espace Schengen, USA, Canada, Australie et de nombreux autres pays pour un séjour de moins de 90 jours.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour les citoyens de l'UE. Passeport valide 6 mois après la date de retour pour les non-européens.",
    commonScams: [
      {
        title: "Location de vélos non officielle",
        desc: "Des loueurs non agréés proposent des vélos sans assurance ni assistance. Utilisez uniquement Mac Bike, Yellow Bike ou Black Bikes (loueurs officiels)."
      },
      {
        title: "Faux taxis aéroport",
        desc: "Taxis non licenciés à Schiphol proposant des tarifs fixes élevés. Utilisez uniquement les taxis officiels TCA Amsterdam (bleu) ou Uber."
      },
      {
        title: "Cannabis de rue",
        desc: "Dealers dans la rue vendant du cannabis frelaté ou drogues dures. Achetez uniquement dans coffee shops licenciés."
      },
      {
        title: "Change de devises",
        desc: "Bureaux de change touristiques avec taux désavantageux et frais cachés. Utilisez les distributeurs automatiques ou payez par carte."
      }
    ],
    priceGuide: [
      { item: "Train Schiphol Airport → Centre-ville", price: "€5.90" },
      { item: "Ticket tram/métro/bus 1h", price: "€3.40" },
      { item: "GVB Day Pass (transport illimité 24h)", price: "€9.00" },
      { item: "Restaurant milieu de gamme (plat principal)", price: "€20-35" },
      { item: "Bière locale (pinte 0.4L)", price: "€5-7" },
      { item: "Café en terrasse", price: "€3.50-5" },
      { item: "Location vélo journée", price: "€12-15" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police (non-urgence)", number: "0900-8844", icon: "Shield" },
      { name: "Ambulance", number: "112", icon: "Ambulance" },
      { name: "Pompiers", number: "112", icon: "Flame" }
    ],
    consulateInfo: "Consulat de France : Vijzelgracht 2, 1017 AR Amsterdam. Tél : +31 (0)20 530 6969. Assistance consulaire 24h/7j disponible. En cas de perte de papiers, vol ou problème majeur, contactez le consulat immédiatement.",
    localCustoms: [
      "Les Néerlandais sont très directs et francs - ce n'est pas de l'impolitesse, c'est culturel",
      "Tout le monde parle anglais couramment, n'hésitez pas à l'utiliser",
      "Le vélo est LE mode de transport principal - respectez absolument les pistes cyclables",
      "Pourboire : arrondir l'addition ou laisser 5-10% si satisfait du service",
      "Ponctualité très importante - arrivez toujours à l'heure aux rendez-vous"
    ],
    behaviorsToAvoid: [
      "Bloquer ou marcher sur les pistes cyclables (très dangereux et mal vu)",
      "Photographier les prostituées dans le Red Light District (illégal)",
      "Acheter ou consommer du cannabis dans la rue (uniquement coffee shops)",
      "Comparer les Pays-Bas à l'Allemagne ou la Belgique (fierté nationale forte)",
      "Être bruyant ou irrespectueux dans les lieux publics (culture calme et respectueuse)"
    ]
  },

  "singapore-singapore": {
    id: "singapore-singapore",
    name: "Singapour",
    country: "Singapour",
    image: "https://images.unsplash.com/photo-1727880676753-9ba90268d3ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaW5nYXBvcmUlMjBza3lsaW5lJTIwbWFyaW5hfGVufDF8fHx8MTc3MjAwOTQ1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 98,
    safetyLevel: "safe",
    lastUpdate: "Il y a 45 minutes",
    timezone: "GMT+8 (SGT)",
    language: "Anglais, Mandarin, Malais, Tamil",
    currency: "Dollar de Singapour (S$)",
    securitySummary: "Singapour est l'une des villes les plus sûres au monde. Criminalité quasi inexistante grâce à des lois EXTRÊMEMENT strictes. Respectez scrupuleusement les lois locales: amendes astronomiques pour infractions mineures.",
    alerts: [],
    dangerousAreas: ["Aucune zone dangereuse - ville ultra-sûre"],
    safetyTips: [
      "Respectez TOUTES les règles (amendes astronomiques)",
      "Ne mâchez JAMAIS de chewing-gum en public (amende S$1000)",
      "Ne fumez que dans zones autorisées (amende S$1000)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A et B recommandées", status: "recommended" }
    ],
    healthSystem: "Système de santé d'excellence mondiale mais TRÈS COÛTEUX. Assurance voyage obligatoire.",
    visaRequired: false,
    visaDetails: "Exemption visa 90 jours pour citoyens français, européens, américains, canadiens.",
    entryDocuments: "Passeport valide 6 mois minimum. Billet retour obligatoire.",
    commonScams: [
      {
        title: "Taxis sans compteur",
        desc: "Vérifiez que compteur démarre. Ou utilisez Grab (Uber local)."
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport → centre", price: "S$20-30 (~14-21€)" },
      { item: "MRT (métro) ticket", price: "S$1.50-2.50" },
      { item: "Hawker centre meal", price: "S$4-8" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "999", icon: "Shield" },
      { name: "Ambulance/Pompiers", number: "995", icon: "Ambulance" }
    ],
    consulateInfo: "Ambassade de France: 101-103 Cluny Park Road.",
    localCustoms: [
      "Ville ultra-propre: ne jetez RIEN par terre",
      "Chewing-gum interdit (sauf médical)",
      "Fumer seulement zones désignées"
    ],
    behaviorsToAvoid: [
      "Mâcher du chewing-gum (amende S$1000)",
      "Fumer hors zones autorisées (amende S$1000)",
      "Traverser en dehors passages piétons (amende S$500)"
    ]
  }
};

// Ajout des destinations supplémentaires
Object.assign(destinationsDatabase, additionalDestinations);
console.log("✅ Fusion des destinations - Total:", Object.keys(destinationsDatabase).length);
console.log("✅ Shanghai présent ?", "shanghai-china" in destinationsDatabase);

// Ajout des nouvelles destinations
Object.assign(destinationsDatabase, newDestinations);
console.log("✅ Fusion des nouvelles destinations - Total:", Object.keys(destinationsDatabase).length);
console.log("✅ Shanghai présent ?", "shanghai-china" in destinationsDatabase);

// Ajout des destinations plus détaillées
Object.assign(destinationsDatabase, moreDetailedDestinations);
console.log("✅ Fusion des destinations plus détaillées - Total:", Object.keys(destinationsDatabase).length);
console.log("✅ Shanghai présent ?", "shanghai-china" in destinationsDatabase);

// Ajout des destinations plus détaillées 2
Object.assign(destinationsDatabase, moreDetailedDestinations2);
console.log("✅ Fusion des destinations plus détaillées 2 - Total:", Object.keys(destinationsDatabase).length);
console.log("✅ Shanghai présent ?", "shanghai-china" in destinationsDatabase);

// Ajout des destinations plus détaillées 3
Object.assign(destinationsDatabase, moreDetailedDestinations3);
console.log("✅ Fusion des destinations plus détaillées 3 - Total:", Object.keys(destinationsDatabase).length);
console.log("✅ Shanghai présent ?", "shanghai-china" in destinationsDatabase);

// Ajout des destinations plus détaillées 4
Object.assign(destinationsDatabase, moreDetailedDestinations4);
console.log("✅ Fusion des destinations plus détaillées 4 - Total:", Object.keys(destinationsDatabase).length);
console.log("✅ Shanghai présent ?", "shanghai-china" in destinationsDatabase);

// Fonction helper pour récupérer une destination
export function getDestinationData(destinationId: string): DestinationDetails | null {
  console.log("🔍 getDestinationData - Recherche de:", destinationId);
  
  // Chercher d'abord dans destinationsDatabase (qui inclut maintenant additionalDestinations et newDestinations)
  const destination = destinationsDatabase[destinationId];
  if (destination) {
    console.log("✅ Trouvé dans destinationsDatabase:", destination.name);
    return destination;
  }
  
  // Chercher directement dans additionalDestinations en cas de problème de fusion
  const additionalDest = additionalDestinations[destinationId];
  if (additionalDest) {
    console.log("✅ Trouvé dans additionalDestinations:", additionalDest.name);
    return additionalDest;
  }
  
  // Chercher directement dans newDestinations en cas de problème de fusion
  const newDest = newDestinations[destinationId];
  if (newDest) {
    console.log("✅ Trouvé dans newDestinations:", newDest.name);
    return newDest;
  }
  
  // Chercher directement dans moreDetailedDestinations en cas de problème de fusion
  const moreDetailedDest = moreDetailedDestinations[destinationId];
  if (moreDetailedDest) {
    console.log("✅ Trouvé dans moreDetailedDestinations:", moreDetailedDest.name);
    return moreDetailedDest;
  }
  
  // Chercher directement dans moreDetailedDestinations2 en cas de problème de fusion
  const moreDetailedDest2 = moreDetailedDestinations2[destinationId];
  if (moreDetailedDest2) {
    console.log("✅ Trouvé dans moreDetailedDestinations2:", moreDetailedDest2.name);
    return moreDetailedDest2;
  }
  
  // Chercher directement dans moreDetailedDestinations3 en cas de problème de fusion
  const moreDetailedDest3 = moreDetailedDestinations3[destinationId];
  if (moreDetailedDest3) {
    console.log("✅ Trouvé dans moreDetailedDestinations3:", moreDetailedDest3.name);
    return moreDetailedDest3;
  }
  
  // Chercher directement dans moreDetailedDestinations4 en cas de problème de fusion
  const moreDetailedDest4 = moreDetailedDestinations4[destinationId];
  if (moreDetailedDest4) {
    console.log("✅ Trouvé dans moreDetailedDestinations4:", moreDetailedDest4.name);
    return moreDetailedDest4;
  }
  
  console.log("❌ Destination non trouvée:", destinationId);
  console.log("🔍 Clés disponibles dans additionalDestinations:", Object.keys(additionalDestinations).filter(k => k.includes("china")).join(", "));
  console.log("🔍 Clés disponibles dans newDestinations:", Object.keys(newDestinations).filter(k => k.includes("china")).join(", "));
  console.log("🔍 Clés disponibles dans moreDetailedDestinations:", Object.keys(moreDetailedDestinations).filter(k => k.includes("china")).join(", "));
  console.log("🔍 Clés disponibles dans moreDetailedDestinations2:", Object.keys(moreDetailedDestinations2).filter(k => k.includes("china")).join(", "));
  console.log("🔍 Clés disponibles dans moreDetailedDestinations3:", Object.keys(moreDetailedDestinations3).filter(k => k.includes("china")).join(", "));
  console.log("🔍 Clés disponibles dans moreDetailedDestinations4:", Object.keys(moreDetailedDestinations4).filter(k => k.includes("china")).join(", "));
  
  return null;
}

// Fonction pour chercher une destination par nom
export function findDestinationByName(name: string): DestinationDetails | null {
  const normalized = name.toLowerCase();
  const found = Object.values(destinationsDatabase).find(
    dest => dest.name.toLowerCase() === normalized || 
            dest.id.includes(normalized)
  );
  return found || null;
}