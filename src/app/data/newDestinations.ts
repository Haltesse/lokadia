import type { DestinationDetails } from "./types";

// 15 nouvelles destinations pour compléter la base
export const newDestinations: Record<string, DestinationDetails> = {
  "rome-italy": {
    id: "rome-italy",
    name: "Rome",
    country: "Italie",
    image: "https://images.unsplash.com/photo-1662898290891-a6c7f022e851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSb21lJTIwSXRhbHklMjBDb2xvc3NldW0lMjBhbmNpZW50fGVufDF8fHx8MTc3MTk0NDM5OXww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 83,
    safetyLevel: "safe",
    lastUpdate: "Il y a 3 heures",
    timezone: "GMT+1 (CET)",
    language: "Italien (Anglais dans zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Rome est sûre mais attention aux pickpockets TRÈS actifs dans métro, bus, et sites touristiques (Colisée, Fontaine de Trevi, Vatican). Arnaques taxis fréquentes. Évitez Termini et Esquilino la nuit.",
    alerts: [
      { id: 1, type: "warning", title: "Pickpockets ultra-actifs", summary: "Attention métro ligne A, bus 64, tous sites touristiques. Sac devant vous toujours.", date: "Permanent" }
    ],
    dangerousAreas: ["Gare Termini la nuit", "Quartier Esquilino après 22h", "Parcs isolés la nuit"],
    safetyTips: ["Pickpockets: Sac devant vous dans métro/bus", "Taxis: Utilisez compteur ou apps (Uber, FreeNow, iTaxi)", "Restaurants: Évitez ceux avec rabatteurs", "Eau gratuite des fontaines publiques potable"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Excellent système de santé. Carte européenne d'assurance maladie recommandée pour européens. Pharmacies bien équipées.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français/européens (espace Schengen).",
    entryDocuments: "Carte d'identité ou passeport valide.",
    commonScams: [
      { title: "Pickpockets métro/bus", desc: "Groupes organisés créent diversion. SOLUTION: Sac devant, vigilance constante, évitez bus 64." },
      { title: "Gladiateurs Colisée", desc: "Photo 'gratuite' puis 50€ réclamés. SOLUTION: Refusez ou négociez prix AVANT." },
      { title: "Taxis tarifs gonflés", desc: "Pas de compteur, 100€ aéroport-centre. SOLUTION: Tarif fixe 48€, exigez compteur ou apps." }
    ],
    priceGuide: [
      { item: "Métro/bus ticket", price: "€1.50" },
      { item: "Pizza part", price: "€2-3" },
      { item: "Restaurant local", price: "€12-20" },
      { item: "Cappuccino", price: "€1.20 comptoir / €4-5 assis" },
      { item: "Colisée + Forum", price: "€18" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "113", icon: "Shield" },
      { name: "Ambulance", number: "118", icon: "Ambulance" }
    ],
    consulateInfo: "Ambassade de France: Piazza Farnese 67. Tél: +39 06 686011.",
    localCustoms: ["Cappuccino seulement le matin", "Couvert (coperto) 1-3€ normal", "Service non inclus, pourboire 10% apprécié"],
    behaviorsToAvoid: ["Commander cappuccino après 11h (très touristique)", "S'asseoir sur monuments", "Manger dans rue près églises"]
  },

  "berlin-germany": {
    id: "berlin-germany",
    name: "Berlin",
    country: "Allemagne",
    image: "https://images.unsplash.com/photo-1704471504038-5443d863e3a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZXJsaW4lMjBHZXJtYW55JTIwQnJhbmRlbmJ1cmclMjBHYXRlfGVufDF8fHx8MTc3MjAyNDMyOXww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 88,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Allemand (Anglais très répandu)",
    currency: "Euro (€)",
    securitySummary: "Berlin est très sûre. Criminalité faible. Attention pickpockets zones touristiques et métro. Quartiers animés de nuit (Kreuzberg, Friedrichshain) sûrs mais restez vigilant.",
    alerts: [],
    dangerousAreas: ["Görlitzer Park la nuit (dealers)", "Kottbusser Tor tard (évitez si seul)"],
    safetyTips: ["Vélo: Berlin = ville cycliste, respectez pistes cyclables", "Transports: Achetez TOUJOURS ticket, contrôles fréquents, amende 60€", "Clubs: Portiers sélectifs, code vestimentaire noir"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Excellent système de santé allemand. Carte européenne d'assurance maladie pour européens.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français/européens.",
    entryDocuments: "Carte d'identité ou passeport valide.",
    commonScams: [
      { title: "Faux contrôleurs", desc: "Rares mais existent. SOLUTION: Demandez badge officiel BVG." }
    ],
    priceGuide: [
      { item: "Ticket transport AB", price: "€3.20" },
      { item: "Döner kebab", price: "€5-7" },
      { item: "Bière bar", price: "€3.50-5" },
      { item: "Restaurant moyen", price: "€12-18" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "110", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Pariser Platz 5. Tél: +49 30 590039000.",
    localCustoms: ["Ponctualité sacrée", "Recyclage très strict", "Traverser au rouge = amende"],
    behaviorsToAvoid: ["Traverser au rouge", "Parler fort transports", "Ne pas recycler"]
  },

  "sydney-australia": {
    id: "sydney-australia",
    name: "Sydney",
    country: "Australie",
    image: "https://images.unsplash.com/photo-1718185795639-c442aff612cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTeWRuZXklMjBBdXN0cmFsaWElMjBPcGVyYSUyMEhvdXNlfGVufDF8fHx8MTc3MjAyNDMyOXww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 90,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+11 (AEDT)",
    language: "Anglais",
    currency: "Dollar australien (AUD) - 1€ ≈ 1.65 AUD",
    securitySummary: "Sydney est l'une des villes les plus sûres au monde. Criminalité très faible. Attention aux plages: courants dangereux, nagez SEULEMENT entre drapeaux rouge-jaune surveillés.",
    alerts: [
      { id: 1, type: "danger", title: "Dangers plages", summary: "Courants violents tuent chaque année. Nagez UNIQUEMENT zones surveillées drapeaux rouge-jaune.", date: "Permanent" }
    ],
    dangerousAreas: ["Kings Cross tard la nuit"],
    safetyTips: ["Plages: Entre drapeaux TOUJOURS", "Soleil: Protection SPF50+ essentielle", "Animaux: Araignées/serpents - secouez chaussures", "Transports: Opal Card obligatoire"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Excellent système de santé. Assurance voyage recommandée (soins très chers pour étrangers).",
    visaRequired: true,
    visaDetails: "ETA/eVisitor obligatoire (gratuit en ligne). Séjours max 90 jours.",
    entryDocuments: "Passeport + ETA approuvé.",
    commonScams: [
      { title: "Peu d'arnaques", desc: "Sydney très sûre, arnaques rares." }
    ],
    priceGuide: [
      { item: "Transport journée", price: "$25 AUD (~15€)" },
      { item: "Café", price: "$5-6 AUD (~3-3.60€)" },
      { item: "Restaurant moyen", price: "$25-40 AUD (~15-24€)" },
      { item: "Bière bar", price: "$10-12 AUD (~6-7.20€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "000", icon: "AlertCircle" }
    ],
    consulateInfo: "Consulat général de France: Level 26, St Martins Tower, 31 Market St. Tél: +61 2 9268 2400.",
    localCustoms: ["Australiens décontractés et amicaux", "BBQ culture importante", "Café culture forte"],
    behaviorsToAvoid: ["Nager hors zones surveillées", "Sous-estimer le soleil", "Toucher animaux sauvages"]
  },

  "lisbon-portugal": {
    id: "lisbon-portugal",
    name: "Lisbonne",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1550173068-5681fe59460c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMaXNib24lMjBQb3J0dWdhbCUyMHllbGxvdyUyMHRyYW18ZW58MXx8fHwxNzcyMDI0MzM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 86,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0 (WET)",
    language: "Portugais (Anglais très répandu)",
    currency: "Euro (€)",
    securitySummary: "Lisbonne est sûre et accueillante. Pickpockets actifs tramway 28 et Baixa. Certains quartiers (Cais do Sodré, Bairro Alto) très animés la nuit mais sûrs.",
    alerts: [],
    dangerousAreas: ["Martim Moniz la nuit", "Quartier Intendente (évitez si seul)"],
    safetyTips: ["Tramway 28: Pickpockets très actifs, sac devant", "Collines: Chaussures confortables essentielles", "Taxis: Apps Uber/Bolt ou taxis blancs avec compteur"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Bon système de santé. Carte européenne d'assurance maladie pour européens.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français/européens.",
    entryDocuments: "Carte d'identité ou passeport valide.",
    commonScams: [
      { title: "Pickpockets tramway 28", desc: "Pickpockets professionnels sur tramway touristique. SOLUTION: Sac devant, vigilance." },
      { title: "Faux mendiants Baixa", desc: "Approches insistantes. SOLUTION: Déclinez poliment." }
    ],
    priceGuide: [
      { item: "Tramway/métro ticket", price: "€1.50" },
      { item: "Pastel de nata", price: "€1.20" },
      { item: "Restaurant local", price: "€10-15" },
      { item: "Café", price: "€0.80" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" }
    ],
    consulateInfo: "Ambassade de France: Rua Santos-O-Velho 5. Tél: +351 21 393 91 00.",
    localCustoms: ["Portugais très accueillants", "Fado = musique traditionnelle sacrée", "Pourboire 10% apprécié"],
    behaviorsToAvoid: ["Comparer au brésilien (agaçant)", "Ignorer pasteis de nata", "Parler espagnol sans demander"]
  },

  "prague-czech": {
    id: "prague-czech",
    name: "Prague",
    country: "République Tchèque",
    image: "https://images.unsplash.com/photo-1732841021082-507eca55d070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQcmFndWUlMjBDemVjaCUyMENoYXJsZXMlMjBCcmlkZ2V8ZW58MXx8fHwxNzcyMDI0MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 87,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+1 (CET)",
    language: "Tchèque (Anglais zones touristiques)",
    currency: "Couronne tchèque (CZK) - 1€ ≈ 25 CZK",
    securitySummary: "Prague est sûre mais ARNAQUES omniprésentes: bureaux de change malhonnêtes, taxis, restaurants pièges. Criminalité violente rare.",
    alerts: [
      { id: 1, type: "warning", title: "Arnaques change", summary: "Bureaux de change avec commissions énormes. Utilisez distributeurs (ATM) UNIQUEMENT.", date: "Permanent" }
    ],
    dangerousAreas: ["Gare principale la nuit", "Wenceslas Square très tard"],
    safetyTips: ["Change: ATM seulement, JAMAIS bureaux de change", "Taxis: Apps Bolt/Uber uniquement", "Restaurants: Vérifiez addition, surfacturation fréquente", "Bière moins chère que l'eau!"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Bon système de santé. Carte européenne d'assurance maladie pour européens.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français/européens.",
    entryDocuments: "Carte d'identité ou passeport valide.",
    commonScams: [
      { title: "Bureaux de change", desc: "Commission 40% cachée. SOLUTION: ATM uniquement." },
      { title: "Taxis arnaques", desc: "Prix x10. SOLUTION: Apps seulement." },
      { title: "Restaurants pièges", desc: "Surfacturation touristes. SOLUTION: Vérifiez addition." }
    ],
    priceGuide: [
      { item: "Métro/tramway ticket", price: "32 CZK (~1.30€)" },
      { item: "Bière 0.5L", price: "40-60 CZK (~1.60-2.40€)" },
      { item: "Restaurant local", price: "200-300 CZK (~8-12€)" },
      { item: "Château Prague", price: "250 CZK (~10€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "158", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Velkoprevorské námestí 2. Tél: +420 251 171 711.",
    localCustoms: ["Tchèques réservés mais gentils", "Enlever chaussures en intérieur", "Bière culture nationale"],
    behaviorsToAvoid: ["Utiliser bureaux de change", "Prendre taxis rue", "Comparer à Russie (très mal vu)"]
  },

  "vienna-austria": {
    id: "vienna-austria",
    name: "Vienne",
    country: "Autriche",
    image: "https://images.unsplash.com/photo-1710617056050-339ff8bbc978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxWaWVubmElMjBBdXN0cmlhJTIwcGFsYWNlJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3MjAyNDMzMHww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 91,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Allemand (Anglais bien parlé)",
    currency: "Euro (€)",
    securitySummary: "Vienne est l'une des villes les plus sûres d'Europe. Criminalité très faible. Excellente qualité de vie. Attention pickpockets légère dans zones touristiques bondées.",
    alerts: [],
    dangerousAreas: ["Praterstern la nuit (gare, dealers)"],
    safetyTips: ["Transports: Achetez ticket AVANT, contrôles fréquents", "Traverser au rouge = amende", "Vélos: Respectez pistes cyclables"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Excellent système de santé autrichien. Carte européenne d'assurance maladie pour européens.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français/européens.",
    entryDocuments: "Carte d'identité ou passeport valide.",
    commonScams: [
      { title: "Très peu d'arnaques", desc: "Vienne très sûre." }
    ],
    priceGuide: [
      { item: "Ticket transport", price: "€2.60" },
      { item: "Schnitzel restaurant", price: "€14-18" },
      { item: "Café viennois", price: "€4-6" },
      { item: "Bière", price: "€4-5" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "133", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Technikerstrasse 2. Tél: +43 1 502 75 0.",
    localCustoms: ["Culture café très importante", "Opéra et musique classique sacrés", "Ponctualité essentielle"],
    behaviorsToAvoid: ["Être en retard", "Parler fort en public", "Traverser au rouge"]
  },

  "athens-greece": {
    id: "athens-greece",
    name: "Athènes",
    country: "Grèce",
    image: "https://images.unsplash.com/photo-1505883973882-490ee8cd39da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBdGhlbnMlMjBHcmVlY2UlMjBBY3JvcG9saXMlMjBQYXJ0aGVub258ZW58MXx8fHwxNzcyMDI0MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 81,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+2 (EET)",
    language: "Grec (Anglais bien parlé zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Athènes est globalement sûre. Pickpockets très actifs métro et sites touristiques. Évitez Omonia et Exarcheia la nuit. Grèves et manifestations fréquentes.",
    alerts: [
      { id: 1, type: "info", title: "Grèves fréquentes", summary: "Grèves des transports régulières. Vérifiez avant de planifier déplacements.", date: "Permanent" }
    ],
    dangerousAreas: ["Place Omonia la nuit", "Exarcheia tard", "Métro ligne 1 Pirée"],
    safetyTips: ["Pickpockets métro: Sac devant toujours", "Taxis: Compteur obligatoire, tarif double après minuit", "Eau du robinet potable", "Manifestations: Évitez Syntagma"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système de santé correct mais hôpitaux publics surchargés. Hôpitaux privés recommandés pour touristes.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français/européens.",
    entryDocuments: "Carte d'identité ou passeport valide.",
    commonScams: [
      { title: "Pickpockets métro", desc: "Très actifs ligne 1 et sites. SOLUTION: Vigilance constante." },
      { title: "Taxis tarif gonflé", desc: "Refus compteur. SOLUTION: Exigez compteur, apps Uber/Beat." }
    ],
    priceGuide: [
      { item: "Ticket métro", price: "€1.40" },
      { item: "Gyros", price: "€3-4" },
      { item: "Restaurant local", price: "€10-15" },
      { item: "Acropole", price: "€20 (gratuit certains jours)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police touristique", number: "1571", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Leof. Vasilissis Sofias 7. Tél: +30 210 339 1000.",
    localCustoms: ["Grecs chaleureux et accueillants", "Sieste l'après-midi", "Dîner tard (21h-23h)"],
    behaviorsToAvoid: ["Comparer à Turquie (tensions historiques)", "Refuser l'hospitalité", "S'impatienter"]
  },

  "marrakech-morocco": {
    id: "marrakech-morocco",
    name: "Marrakech",
    country: "Maroc",
    image: "https://images.unsplash.com/photo-1596750320291-a082a23dcc19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNYXJyYWtlY2glMjBNb3JvY2NvJTIwbWVkaW5hJTIwbWFya2V0fGVufDF8fHx8MTc3MjAyNDMzMXww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 78,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (WEST)",
    language: "Arabe, Français très répandu",
    currency: "Dirham marocain (MAD) - 1€ ≈ 11 MAD",
    securitySummary: "Marrakech est relativement sûre mais attention harcèlement constant dans médina (faux guides, vendeurs insistants). Arnaques sophistiquées courantes. Femmes seules: habillez-vous modestement, harcèlement verbal fréquent.",
    alerts: [
      { id: 1, type: "warning", title: "Faux guides médina", summary: "Ne suivez JAMAIS quelqu'un qui propose de vous 'aider' ou 'guider' gratuitement. Arnaque systématique.", date: "Permanent" }
    ],
    dangerousAreas: ["Ruelles isolées médina la nuit", "Gare routière Bab Doukkala"],
    safetyTips: ["Faux guides: Refusez TOUS les 'aideaux', commission sur tout", "Négociation: Prix initial ÷3 minimum", "Taxis: Petit taxi compteur obligatoire (15-30 MAD centre)", "Eau: Bouteille capsulée seulement"],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A", status: "recommended" },
      { name: "Typhoïde", status: "recommended" }
    ],
    healthSystem: "Cliniques privées correctes (Polyclinique du Sud recommandée). Assurance voyage indispensable.",
    visaRequired: false,
    visaDetails: "Pas de visa pour séjours -90 jours.",
    entryDocuments: "Passeport valide 6 mois minimum.",
    commonScams: [
      { title: "Faux guides 'étudiants'", desc: "Proposent aide gratuite, vous emmènent boutiques commission. SOLUTION: Refusez fermement, GPS." },
      { title: "Taxis pas de compteur", desc: "10x le prix. SOLUTION: Insistez compteur AVANT ou Careem/Heetch." },
      { title: "Tannerie 'fermée'", desc: "Faux guide dit tannerie fermée, vous emmène ailleurs. SOLUTION: Vérifiez vous-même." }
    ],
    priceGuide: [
      { item: "Petit taxi course", price: "15-30 MAD (~1.40-2.70€)" },
      { item: "Tajine restaurant local", price: "50-80 MAD (~4.50-7.20€)" },
      { item: "Thé à la menthe", price: "10-15 MAD (~0.90-1.40€)" },
      { item: "Palais Bahia", price: "70 MAD (~6.30€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "19", icon: "Shield" },
      { name: "Urgences", number: "15", icon: "AlertCircle" },
      { name: "Police touristique", number: "0524 38 46 01", icon: "Info" }
    ],
    consulateInfo: "Consulat général de France: Route de Casablanca. Tél: +212 524 38 82 00.",
    localCustoms: ["Habillez-vous modestement", "Enlevez chaussures en intérieur", "Main droite pour manger", "Thé = hospitalité"],
    behaviorsToAvoid: ["Tenue provocante", "Affection publique", "Photographier sans permission", "Manger/boire en public pendant Ramadan"]
  },

  "seoul-south-korea": {
    id: "seoul-south-korea",
    name: "Séoul",
    country: "Corée du Sud",
    image: "https://images.unsplash.com/photo-1768006274464-3f936d65e626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZW91bCUyMFNvdXRoJTIwS29yZWElMjBtb2Rlcm4lMjBza3lsaW5lfGVufDF8fHx8MTc3MjAyNDMzMXww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 93,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+9 (KST)",
    language: "Coréen (Anglais limité)",
    currency: "Won sud-coréen (₩) - 1€ ≈ 1,450₩",
    securitySummary: "Séoul est extrêmement sûre, l'une des capitales les plus sécurisées au monde. Criminalité très faible. Vous pouvez vous promener partout à toute heure. Arnaques quasi inexistantes.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Langue: Anglais peu parlé hors zones touristiques, appli traduction essentielle", "Papago (appli Naver) meilleure que Google Translate pour coréen", "Métro: Système excellent mais tout en coréen", "T-money card: Carte transport essentielle"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Excellent système de santé, très moderne et efficace. Assurance voyage recommandée.",
    visaRequired: false,
    visaDetails: "Pas de visa -90 jours pour français/européens.",
    entryDocuments: "Passeport valide + K-ETA (10$ en ligne, obligatoire depuis 2023).",
    commonScams: [
      { title: "Pratiquement aucune arnaque", desc: "Séoul extrêmement sûre." }
    ],
    priceGuide: [
      { item: "Métro", price: "₩1,250-2,000 (~0.90-1.40€)" },
      { item: "Kimchi jjigae (ragoût)", price: "₩8,000-12,000 (~5.50-8.30€)" },
      { item: "Street food", price: "₩3,000-5,000 (~2-3.50€)" },
      { item: "Café", price: "₩5,000-7,000 (~3.50-4.80€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "112", icon: "Shield" },
      { name: "Pompiers", number: "119", icon: "Flame" }
    ],
    consulateInfo: "Ambassade de France: 30, Hap-dong, Seodaemun-gu. Tél: +82 2 3149 4300.",
    localCustoms: ["Enlevez chaussures en intérieur", "Inclinez-vous pour saluer", "Deux mains pour donner/recevoir", "Culture respect âge très importante"],
    behaviorsToAvoid: ["Moucher nez en public", "Pourboire (considéré insultant)", "Planter baguettes dans riz (rituel funéraire)"]
  },

  "copenhagen-denmark": {
    id: "copenhagen-denmark",
    name: "Copenhague",
    country: "Danemark",
    image: "https://images.unsplash.com/photo-1613412304332-4225ac342ca5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDb3BlbmhhZ2VuJTIwRGVubWFyayUyMGNvbG9yZnVsJTIwaG91c2VzfGVufDF8fHx8MTc3MTkxNTU0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 94,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Danois (Anglais excellent)",
    currency: "Couronne danoise (DKK) - 1€ ≈ 7.45 DKK",
    securitySummary: "Copenhague est l'une des villes les plus sûres au monde. Criminalité extrêmement faible. Ville très chère. Culture vélo dominante.",
    alerts: [],
    dangerousAreas: ["Christiania (quartier alternatif - pas de photos!)"],
    safetyTips: ["Vélo: Ville cycliste, respectez ABSOLUMENT pistes (amende si vous marchez dessus)", "Christiania: INTERDICTION FORMELLE de photographier (dealers)", "Prix: Très cher, prévoyez budget élevé"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Excellent système de santé scandinave. Carte européenne d'assurance maladie pour européens.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français/européens.",
    entryDocuments: "Carte d'identité ou passeport valide.",
    commonScams: [
      { title: "Aucune arnaque", desc: "Copenhague extrêmement sûre." }
    ],
    priceGuide: [
      { item: "Métro ticket", price: "24 DKK (~3.20€)" },
      { item: "Bière bar", price: "60-80 DKK (~8-10.70€)" },
      { item: "Restaurant moyen", price: "200-350 DKK (~27-47€)" },
      { item: "Hot dog rue", price: "40 DKK (~5.40€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" }
    ],
    consulateInfo: "Ambassade de France: Øster Allé 49. Tél: +45 33 67 01 00.",
    localCustoms: ["Culture vélo sacrée", "Hygge (convivialité/confort)", "Danois directs et honnêtes", "Ponctualité importante"],
    behaviorsToAvoid: ["Marcher sur pistes cyclables", "Photographier Christiania", "Être en retard"]
  },

  "mexico-city-mexico": {
    id: "mexico-city-mexico",
    name: "Mexico",
    country: "Mexique",
    image: "https://images.unsplash.com/photo-1759255259985-6f8c71ebe64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNZXhpY28lMjBDaXR5JTIwc2t5bGluZSUyMGxhbmRtYXJrfGVufDF8fHx8MTc3MjExNjQwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 72,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT-6 (CST)",
    language: "Espagnol (Anglais limité)",
    currency: "Peso mexicain (MXN) - 1€ ≈ 20 MXN",
    securitySummary: "Mexico City: quartiers touristiques (Roma, Condesa, Polanco, Centro) relativement sûrs MAIS attention pickpockets, vols à l'arraché, arnaques taxis. Évitez ABSOLUMENT Tepito, Iztapalapa. Ne prenez JAMAIS taxi rue (enlèvements express). Apps Uber/Didi uniquement.",
    alerts: [
      { id: 1, type: "danger", title: "Taxis rue DANGEREUX", summary: "JAMAIS de taxi rue. Enlèvements express fréquents. Uber/Didi/Cabify UNIQUEMENT.", date: "Permanent" },
      { id: 2, type: "warning", title: "Altitude 2,240m", summary: "Ville en altitude. Fatigue, essoufflement normaux premiers jours. Hydratez-vous.", date: "Permanent" }
    ],
    dangerousAreas: ["Tepito (ÉVITEZ)", "Iztapalapa (ÉVITEZ)", "Doctores la nuit", "Taxis rue (enlèvements)"],
    safetyTips: ["Taxis: Apps UNIQUEMENT, jamais rue", "Quartiers: Restez Roma/Condesa/Polanco", "Distributeurs: En journée, lieux sécurisés", "Eau: Bouteille capsulée seulement"],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A", status: "recommended" },
      { name: "Typhoïde", status: "recommended" }
    ],
    healthSystem: "Cliniques privées excellentes (American British Cowdray Hospital). Assurance voyage indispensable.",
    visaRequired: false,
    visaDetails: "Pas de visa -180 jours pour français/européens.",
    entryDocuments: "Passeport valide 6 mois minimum.",
    commonScams: [
      { title: "Taxis rue/aéroport", desc: "Enlèvements express, vols. SOLUTION: Apps uniquement." },
      { title: "Faux policiers", desc: "Demandent papiers/fouille, volent. SOLUTION: Refusez, allez au poste." }
    ],
    priceGuide: [
      { item: "Métro", price: "$5 MXN (~0.25€)" },
      { item: "Tacos rue (3)", price: "$40-60 MXN (~2-3€)" },
      { item: "Restaurant moyen", price: "$200-400 MXN (~10-20€)" },
      { item: "Uber centre", price: "$60-100 MXN (~3-5€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "911", icon: "AlertCircle" },
      { name: "Police touristique", number: "078", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Havre 15, Colonia Juárez. Tél: +52 55 9171 9700.",
    localCustoms: ["Mexicains très chaleureux", "Pourboire 10-15%", "Sieste l'après-midi", "Ponctualité flexible"],
    behaviorsToAvoid: ["Prendre taxi rue", "Boire eau robinet", "Montrer objets valeur", "Aller Tepito/Iztapalapa"]
  },

  "toronto-canada": {
    id: "toronto-canada",
    name: "Toronto",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1558611286-d6b0d98af4cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb3JvbnRvJTIwQ2FuYWRhJTIwQ04lMjBUb3dlcnxlbnwxfHx8fDE3NzIwMTAxNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 89,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-5 (EST)",
    language: "Anglais (Français minoritaire)",
    currency: "Dollar canadien (CAD) - 1€ ≈ 1.50 CAD",
    securitySummary: "Toronto est très sûre, l'une des villes les plus sûres d'Amérique du Nord. Criminalité faible. Hiver TRÈS froid (-20°C). Ville chère mais moins que NYC.",
    alerts: [],
    dangerousAreas: ["Certaines zones de Jane/Finch la nuit", "Moss Park tard"],
    safetyTips: ["Hiver: Vêtements chauds ESSENTIELS (-20°C commun)", "Pourboire: 15-20% OBLIGATOIRE", "PATH: Réseau souterrain pratique en hiver", "Taxes: +13% ajoutés au prix affiché"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Excellent système de santé canadien MAIS très cher pour étrangers. Assurance voyage indispensable.",
    visaRequired: true,
    visaDetails: "AVE (Autorisation de Voyage Électronique) obligatoire (7$ CAD en ligne). Valable 5 ans.",
    entryDocuments: "Passeport + AVE approuvé.",
    commonScams: [
      { title: "Peu d'arnaques", desc: "Toronto très sûre." }
    ],
    priceGuide: [
      { item: "Métro/TTC ticket", price: "$3.35 CAD (~2.25€)" },
      { item: "Restaurant moyen", price: "$20-35 CAD + pourboire (~13-23€)" },
      { item: "Bière bar", price: "$7-10 CAD (~4.70-6.70€)" },
      { item: "CN Tower", price: "$40 CAD (~27€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "911", icon: "AlertCircle" }
    ],
    consulateInfo: "Consulat général de France: 2 Bloor St East, Suite 2200. Tél: +1 416-847-1900.",
    localCustoms: ["Canadiens polis et courtois", "Pourboire obligatoire", "Multiculturalisme valorisé"],
    behaviorsToAvoid: ["Oublier pourboire", "Sous-estimer froid hivernal", "Comparer aux USA (peuvent être sensibles)"]
  },

  "buenos-aires-argentina": {
    id: "buenos-aires-argentina",
    name: "Buenos Aires",
    country: "Argentine",
    image: "https://images.unsplash.com/photo-1679417302656-9b5170584526?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdWVub3MlMjBBaXJlcyUyMEFyZ2VudGluYSUyMGNvbG9yZnVsJTIwYnVpbGRpbmdzfGVufDF8fHx8MTc3MjAyNDMzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 76,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT-3 (ART)",
    language: "Espagnol argentin (accent particulier)",
    currency: "Peso argentin (ARS) - 1€ ≈ 1,000 ARS (inflation élevée)",
    securitySummary: "Buenos Aires relativement sûre dans quartiers touristiques (Palermo, Recoleta, San Telmo) MAIS attention pickpockets omniprésents, vols à l'arraché fréquents. La Boca: SEULEMENT Caminito en journée, dangereux ailleurs. Économie cash (pesos), distributeurs limités.",
    alerts: [
      { id: 1, type: "warning", title: "Inflation extrême", summary: "Économie instable. Euros/dollars valent beaucoup plus au change parallèle (blue) qu'officiel. Renseignez-vous.", date: "Permanent" }
    ],
    dangerousAreas: ["La Boca (hors Caminito)", "Constitución", "Once la nuit", "Retiro gare la nuit"],
    safetyTips: ["La Boca: Caminito JOUR uniquement, 2 rues max", "Pickpockets: Sac devant, attention métro/bus", "Change: Préférez euros/dollars cash (meilleur taux)", "Tard: Uber après 23h"],
    vaccines: [
      { name: "Fièvre jaune (si zone nord Argentine)", status: "recommended" },
      { name: "Hépatite A", status: "recommended" }
    ],
    healthSystem: "Système de santé correct. Hôpitaux privés recommandés (Hospital Alemán, Swiss Medical). Assurance voyage conseillée.",
    visaRequired: false,
    visaDetails: "Pas de visa -90 jours pour français/européens.",
    entryDocuments: "Passeport valide 6 mois minimum.",
    commonScams: [
      { title: "Pickpockets pros", desc: "Très actifs partout. SOLUTION: Vigilance constante, sac devant." },
      { title: "Faux billets", desc: "Billets 100/500 pesos faux. SOLUTION: Vérifiez au toucher." },
      { title: "Taxis compteur truqué", desc: "SOLUTION: Apps (Uber, Cabify, BA Taxi oficial)." }
    ],
    priceGuide: [
      { item: "Métro SUBE", price: "$125 ARS (~0.12€)" },
      { item: "Empanada", price: "$500-800 ARS (~0.50-0.80€)" },
      { item: "Restaurant asado", price: "$8,000-15,000 ARS (~8-15€)" },
      { item: "Bière bar", price: "$1,500-2,500 ARS (~1.50-2.50€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "911", icon: "AlertCircle" },
      { name: "Police", number: "911", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Cerrito 1399. Tél: +54 11 4515-2030.",
    localCustoms: ["Argentins passionnés et chaleureux", "Dîner très tard (22h-minuit)", "Maté = culture nationale", "Pourboire 10%"],
    behaviorsToAvoid: ["Aller La Boca seul/nuit", "Montrer objets valeur", "Comparer à Brésil (rivalité)", "Parler des Malouines"]
  },

  "moscow-russia": {
    id: "moscow-russia",
    name: "Moscou",
    country: "Russie",
    image: "https://images.unsplash.com/photo-1648383249647-528ecf4fdacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNb3Njb3clMjBSdXNzaWElMjBSZWQlMjBTcXVhcmUlMjBjYXRoZWRyYWx8ZW58MXx8fHwxNzcyMDI0MzMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 79,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 3 heures",
    timezone: "GMT+3 (MSK)",
    language: "Russe (Anglais TRÈS limité)",
    currency: "Rouble russe (RUB) - Taux variable selon sanctions",
    securitySummary: "ATTENTION: Contexte géopolitique tendu. Moscou physiquement sûre (criminalité faible) MAIS risques politiques pour étrangers. Police peut contrôler documents. Sanctions économiques: cartes bancaires occidentales ne fonctionnent PAS. Cash euros/dollars obligatoire. Visa difficile à obtenir.",
    alerts: [
      { id: 1, type: "danger", title: "Sanctions économiques", summary: "Cartes Visa/Mastercard occidentales NE FONCTIONNENT PAS. Apportez CASH euros/dollars.", date: "Permanent" },
      { id: 2, type: "warning", title: "Contrôles police", summary: "Gardez TOUJOURS passeport + visa + migration card sur vous. Contrôles fréquents.", date: "Permanent" }
    ],
    dangerousAreas: ["Banlieues périphériques", "Gares la nuit"],
    safetyTips: ["Documents: Passeport + visa + migration card TOUJOURS", "Cash: Euros/dollars obligatoire (cartes ne marchent pas)", "Langue: Apprenez alphabet cyrillique minimum", "Évitez discussions politiques"],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A et B", status: "recommended" }
    ],
    healthSystem: "Système de santé correct pour soins de base. Cliniques privées pour touristes (European Medical Center).",
    visaRequired: true,
    visaDetails: "Visa obligatoire + invitation officielle. Procédure longue et complexe.",
    entryDocuments: "Passeport + visa + invitation + assurance médicale obligatoire.",
    commonScams: [
      { title: "Faux policiers", desc: "Demandent de voir argent. SOLUTION: Exigez aller au poste." },
      { title: "Taxis sauvages", desc: "Prix x10. SOLUTION: Yandex Taxi app." }
    ],
    priceGuide: [
      { item: "Métro", price: "₽60" },
      { item: "Restaurant local", price: "₽800-1,500" },
      { item: "Kremlin", price: "₽1,000" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "102", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Bolshaya Yakimanka 45. Tél: +7 495 937-15-00. Urgences consulaires 24/7: +7 495 937-15-75.",
    localCustoms: ["Russes directs et sérieux", "Sourire = insincérité", "Enlever chaussures en intérieur", "Ne jamais serrer main sur seuil"],
    behaviorsToAvoid: ["Discussions politiques", "Critiquer Russie/gouvernement", "Oublier documents", "Gestes LGBT publics (illégal)"]
  },

  "kuala-lumpur-malaysia": {
    id: "kuala-lumpur-malaysia",
    name: "Kuala Lumpur",
    country: "Malaisie",
    image: "https://images.unsplash.com/photo-1592446559204-70a0362cf451?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLdWFsYSUyMEx1bXB1ciUyME1hbGF5c2lhJTIwUGV0cm9uYXMlMjBUb3dlcnN8ZW58MXx8fHwxNzcyMDI0MzMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 84,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+8 (MYT)",
    language: "Malais, Anglais bien parlé",
    currency: "Ringgit (RM/MYR) - 1€ ≈ 5 RM",
    securitySummary: "Kuala Lumpur est relativement sûre. Criminalité modérée. Attention pickpockets, vols à l'arraché sur scooters (sacs). Pays musulman modéré: habillez-vous respectueusement. Drogue = PEINE DE MORT. Très bon rapport qualité-prix.",
    alerts: [
      { id: 1, type: "danger", title: "Drogue = PEINE DE MORT", summary: "Malaisie applique peine de mort pour trafic drogue. NE TRANSPORTEZ RIEN pour quelqu'un.", date: "Permanent" }
    ],
    dangerousAreas: ["Chow Kit la nuit", "Pudu tard"],
    safetyTips: ["Sacs: Portez côté opposé route (vols scooters)", "Tenue: Modeste mosquées/temples", "Drogue: ABSOLUMENT INTERDITE", "Taxis: Grab app uniquement", "Eau: Potable mais bouteille préférable"],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A", status: "recommended" },
      { name: "Typhoïde", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé. Hôpitaux privés modernes et abordables (Gleneagles, Prince Court).",
    visaRequired: false,
    visaDetails: "Pas de visa -90 jours pour français/européens.",
    entryDocuments: "Passeport valide 6 mois minimum.",
    commonScams: [
      { title: "Vols sac scooters", desc: "Arrachent sacs depuis scooters. SOLUTION: Sac côté opposé route." },
      { title: "Taxis pas de compteur", desc: "Prix gonflés. SOLUTION: Grab app uniquement." }
    ],
    priceGuide: [
      { item: "LRT/MRT", price: "RM2-5 (~0.40-1€)" },
      { item: "Nasi lemak", price: "RM5-10 (~1-2€)" },
      { item: "Restaurant local", price: "RM15-30 (~3-6€)" },
      { item: "Petronas Towers", price: "RM85 (~17€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "999", icon: "AlertCircle" },
      { name: "Police", number: "999", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: 196 Jalan Ampang. Tél: +60 3-2053-5500.",
    localCustoms: ["Malaisie multiethnique (malais, chinois, indiens)", "Pays musulman modéré", "Tenue respectueuse", "Main droite pour manger"],
    behaviorsToAvoid: ["Drogue (peine de mort)", "Tenue provocante", "Affection publique excessive", "Pointer avec index (utilisez pouce)"]
  }
};