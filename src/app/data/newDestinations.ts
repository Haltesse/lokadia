import type { DestinationDetails } from "./types";

// 15 nouvelles destinations pour compléter la base
export const newDestinations: Record<string, DestinationDetails> = {
  "seoul-south-korea": {
    id: "seoul-south-korea",
    name: "Séoul",
    country: "Corée du Sud",
    image: "https://images.unsplash.com/photo-1768006274464-3f936d65e626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZW91bCUyMFNvdXRoJTIwS29yZWElMjBtb2Rlcm4lMjBza3lsaW5lfGVufDF8fHx8MTc3MjAyNDMzMXww&ixlib=rb-4.1.0&q=80&w=1080",
    lokascoreSeed: 93,
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

  "buenos-aires-argentina": {
    id: "buenos-aires-argentina",
    name: "Buenos Aires",
    country: "Argentine",
    image: "https://images.unsplash.com/photo-1679417302656-9b5170584526?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdWVub3MlMjBBaXJlcyUyMEFyZ2VudGluYSUyMGNvbG9yZnVsJTIwYnVpbGRpbmdzfGVufDF8fHx8MTc3MjAyNDMzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    lokascoreSeed: 76,
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
    lokascoreSeed: 79,
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
    lokascoreSeed: 84,
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