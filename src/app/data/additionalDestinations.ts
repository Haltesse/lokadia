import type { DestinationDetails } from "./types";

export const additionalDestinations: Record<string, DestinationDetails> = {
  "istanbul-turkey": {
    id: "istanbul-turkey",
    name: "Istanbul",
    country: "Turquie",
    image: "https://images.unsplash.com/photo-1609518624785-dd9d1d436d1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJc3RhbmJ1bCUyMFR1cmtleSUyMG1vc3F1ZXxlbnwxfHx8fDE3NzE5MzM3NTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 76,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+3 (TRT)",
    language: "Turc (Anglais limité hors zones touristiques)",
    currency: "Livre turque (₺) - 1€ ≈ 33₺",
    securitySummary: "Istanbul est globalement sûre pour les touristes, mais nécessite une vigilance constante. Les pickpockets sont très actifs dans les zones ultra-touristiques comme Sultanahmet, le Grand Bazar et les tramways bondés. Les arnaques aux taxis sans compteur et aux restaurants touristiques sont extrêmement courantes - certains établissements n'hésitent pas à multiplier l'addition par 10. Évitez les manifestations politiques qui peuvent dégénérer. La situation politique peut être tendue, évitez les discussions sensibles. Les quartiers périphériques comme Tarlabaşı sont à éviter la nuit. Restez dans les zones touristiques principales après la tombée de la nuit.",
    alerts: [
      { id: 1, type: "warning", title: "Arnaques restaurants", summary: "Vérifiez TOUJOURS les prix avant de commander, surtout à Sultanahmet. Certains restaurants affichent des prix x10 sur l'addition finale.", date: "Permanent" },
      { id: 2, type: "info", title: "Tension politique", summary: "Évitez toute discussion politique, notamment concernant Atatürk, le gouvernement ou les Kurdes. Peut avoir des conséquences légales graves.", date: "Permanent" }
    ],
    dangerousAreas: [
      "Tarlabaşı (quartier rouge, évitez complètement la nuit)",
      "Certaines parties de Fatih tard le soir",
      "Zones frontalières sud-est de la Turquie (conflit kurde)",
      "Manifestations politiques (peuvent dégénérer rapidement)"
    ],
    safetyTips: [
      "Taxis: Négociez le prix AVANT ou utilisez BiTaksi/Uber (beaucoup plus sûr)",
      "Restaurants: Vérifiez l'addition item par item avant de payer, surfacturation systématique zones touristiques",
      "Pickpockets ultra-actifs: Sultanahmet, Taksim, Grand Bazar, tramway T1 - sac devant vous",
      "Mosquées: Habillez-vous modestement (épaules et genoux couverts), enlevez vos chaussures",
      "Ne photographiez JAMAIS d'installations militaires ou de personnel en uniforme",
      "Apprenez quelques mots de turc (bonjour: merhaba, merci: teşekkür ederim)",
      "Eau du robinet non potable - achetez de l'eau en bouteille"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A et B", status: "recommended" },
      { name: "Typhoïde", status: "recommended" },
      { name: "Rage (si zone rurale)", status: "recommended" }
    ],
    healthSystem: "Système de santé public correct mais hôpitaux privés internationaux fortement recommandés pour les touristes (American Hospital, Acıbadem, Memorial). Souscrivez une assurance voyage couvrant le rapatriement. Pharmacies (eczane) bien approvisionnées et compétentes. Eau du robinet non potable.",
    visaRequired: true,
    visaDetails: "E-visa obligatoire pour les français et européens. Demande en ligne sur www.evisa.gov.tr (60$ USD, paiement par CB). Valable 180 jours pour séjours de 90 jours maximum. Traitement instantané dans la plupart des cas.",
    entryDocuments: "Passeport valide minimum 6 mois après la date de retour + e-visa imprimé (vérification à l'embarquement et à l'arrivée).",
    commonScams: [
      { title: "Taxis sans compteur", desc: "Le taxi refuse de mettre le compteur et réclame 10x le prix normal à l'arrivée. SOLUTION: Insistez sur le compteur AVANT de monter ou utilisez BiTaksi/Uber. Tarif aéroport-Sultanahmet: ~250-350₺ max." },
      { title: "Restaurants pièges Sultanahmet", desc: "Le serveur très sympathique vous apporte des 'offerts' (mezze, pain, eau) puis l'addition est multipliée par 10. Plats à 500-800₺ au lieu de 80₺. SOLUTION: Vérifiez les prix du menu AVANT, refusez tout ce qui n'est pas commandé, vérifiez l'addition ligne par ligne." },
      { title: "Cireurs de chaussures", desc: "Un cireur 'fait tomber' sa brosse devant vous, vous l'aidez gentiment, il insiste pour cirer vos chaussures 'gratuitement' puis réclame 200₺. SOLUTION: Ignorez et continuez votre chemin." },
      { title: "Fausses invitations bar/discothèque", desc: "Des femmes sympathiques vous abordent et proposent d'aller boire un verre dans 'leur bar préféré'. Addition astronomique de 2000-5000₺ avec menaces si vous refusez de payer. SOLUTION: Déclinez poliment toute invitation, restez dans les zones touristiques connues." },
      { title: "Faux guides", desc: "Personnes se présentant comme 'guides officiels' ou 'étudiants qui veulent pratiquer leur français' vous emmènent dans des boutiques de tapis/bijoux où ils touchent d'énormes commissions. SOLUTION: Réservez guides via hôtel ou sites officiels uniquement." }
    ],
    priceGuide: [
      { item: "Taxi aéroport → Sultanahmet", price: "₺250-350 (~7.50-10.50€)" },
      { item: "Tramway ticket", price: "₺15 (~0.45€)" },
      { item: "İstanbulkart (carte transport rechargeable)", price: "₺50 + crédit (~1.50€)" },
      { item: "Döner kebab local", price: "₺80-150 (~2.40-4.50€)" },
      { item: "Restaurant local (köfte, pide)", price: "₺200-350 (~6-10.50€)" },
      { item: "Restaurant touristique Sultanahmet", price: "₺400-800 (~12-24€)" },
      { item: "Thé turc (çay)", price: "₺10-20 (~0.30-0.60€)" },
      { item: "Café turc", price: "₺40-60 (~1.20-1.80€)" },
      { item: "Entrée Sainte-Sophie", price: "€25 (~825₺)" },
      { item: "Entrée Palais Topkapı", price: "₺700 (~21€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "155", icon: "Shield" },
      { name: "Ambulance", number: "112", icon: "Ambulance" },
      { name: "Police touristique", number: "0212-527-4503", icon: "Info" },
      { name: "Pompiers", number: "110", icon: "Flame" }
    ],
    consulateInfo: "Consulat général de France: İstiklal Caddesi 8, Taksim, Beyoğlu. Tél: +90 212 334 87 30. Service consulaire disponible sur RDV. En cas d'urgence 24h/7j: +90 532 451 46 92",
    localCustoms: [
      "Enlevez TOUJOURS vos chaussures avant d'entrer dans les mosquées et les maisons turques",
      "Tenue modeste dans les mosquées: épaules et genoux couverts, foulard pour les femmes (prêtés à l'entrée)",
      "Le thé turc (çay) est un symbole d'hospitalité - ne refusez pas si on vous en offre",
      "Pourboire 10% apprécié dans les restaurants (mais vérifiez qu'il n'est pas déjà inclus)",
      "Négociation attendue et normale au Grand Bazar - divisez le premier prix par 2 ou 3",
      "Les turcs sont très accueillants et hospitaliers avec les visiteurs",
      "Horaires de prière 5x/jour - respectez le silence pendant l'appel du muezzin"
    ],
    behaviorsToAvoid: [
      "Ne JAMAIS critiquer Atatürk (père de la Turquie moderne) - c'est illégal et passible de prison",
      "Évitez toute discussion sur la politique turque, le gouvernement, ou la question kurde",
      "Ne photographiez JAMAIS d'installations militaires, de personnel militaire ou de police",
      "Ne montrez pas d'affection publique excessive (surtout dans les quartiers conservateurs)",
      "Ne refusez pas le thé offert (çay) - c'est considéré comme impoli",
      "Ne vous moquez pas de la religion ou des pratiques religieuses",
      "Ne pointez pas la semelle de vos chaussures vers quelqu'un (très irrespectueux)"
    ]
  },

  "bangkok-thailand": {
    id: "bangkok-thailand",
    name: "Bangkok",
    country: "Thaïlande",
    image: "https://images.unsplash.com/photo-1691488822390-0fd80c389953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYW5na29rJTIwVGhhaWxhbmQlMjB0ZW1wbGV8ZW58MXx8fHwxNzcyMDA4Nzk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 80,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+7 (ICT - Indochina Time)",
    language: "Thaï (Anglais parlé dans zones touristiques)",
    currency: "Baht (฿) - 1€ ≈ 38฿",
    securitySummary: "Bangkok est relativement sûre pour les touristes avec des thaïlandais généralement accueillants et souriants. MAIS attention: les arnaques touristiques sont extrêmement sophistiquées et omniprésentes (tuk-tuks, faux tailleurs, temples soi-disant 'fermés', tours 'gratuits'). La criminalité violente est rare mais les vols à l'arraché sur scooters existent. Soyez TRÈS méfiant si quelqu'un vous aborde spontanément pour vous 'aider' - c'est presque toujours une arnaque. La drogue est extrêmement mal vue avec des peines très sévères. Respectez absolument la famille royale - le crime de lèse-majesté peut vous valoir 15 ans de prison.",
    alerts: [
      { id: 1, type: "danger", title: "Lèse-majesté", summary: "Ne JAMAIS critiquer, insulter ou manquer de respect à la famille royale thaïlandaise. Crime passible de 3 à 15 ans de prison. Levez-vous pendant l'hymne national.", date: "Permanent" },
      { id: 2, type: "warning", title: "Arnaques sophistiquées", summary: "Ne suivez JAMAIS quelqu'un qui vous aborde spontanément pour vous proposer un tailleur, bijouterie ou 'bon plan'. 99% du temps c'est une arnaque élaborée.", date: "Permanent" }
    ],
    dangerousAreas: [
      "Khlong Toei la nuit (quartier portuaire)",
      "Certaines zones de Patpong très tard dans la nuit",
      "Rues isolées après minuit - préférez Grab/taxi"
    ],
    safetyTips: [
      "RÈGLE D'OR: Si quelqu'un vous aborde pour vous 'aider' ou proposer quelque chose → REFUSEZ poliment",
      "Tuk-tuk: Ne prenez JAMAIS un tuk-tuk qui propose un tour 'gratuit' ou très bon marché",
      "Temple 'fermé': Si quelqu'un dit qu'un temple est fermé, allez vérifier vous-même",
      "Taxis: Exigez le compteur (meter) AVANT de monter ou utilisez Grab/Bolt",
      "Famille royale: Ne JAMAIS critiquer le roi ou la famille royale",
      "Temples: Habillez-vous correctement (épaules et genoux couverts), enlevez vos chaussures"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire pour l'entrée", status: "none" },
      { name: "Hépatite A", status: "recommended" },
      { name: "Typhoïde", status: "recommended" }
    ],
    healthSystem: "Hôpitaux privés internationaux excellents à Bangkok (Bumrungrad, Bangkok Hospital, Samitivej) mais TRÈS chers pour les étrangers. Assurance voyage indispensable.",
    visaRequired: false,
    visaDetails: "Exemption de visa 60 jours pour français et européens (depuis 2024).",
    entryDocuments: "Passeport valide minimum 6 mois après la date de retour.",
    commonScams: [
      { title: "Tuk-tuk 'tour gratuit'", desc: "Tour gratuit ou 20฿ qui vous emmène dans des boutiques. SOLUTION: Refusez, utilisez Grab." },
      { title: "Temple 'fermé'", desc: "Personnes disant que le temple est fermé. C'est TOUJOURS FAUX. SOLUTION: Vérifiez vous-même." }
    ],
    priceGuide: [
      { item: "Airport Rail Link", price: "฿45 (~1.20€)" },
      { item: "Pad Thai rue", price: "฿50-80 (~1.30-2.10€)" },
      { item: "Restaurant local", price: "฿80-150 (~2.10-4€)" },
      { item: "Massage thaï (1h)", price: "฿200-300 (~5.30-8€)" }
    ],
    emergencyNumbers: [
      { name: "Police touristique", number: "1155", icon: "Shield" },
      { name: "Urgences générales", number: "191", icon: "AlertCircle" },
      { name: "Ambulance", number: "1669", icon: "Ambulance" }
    ],
    consulateInfo: "Ambassade de France: 35 Charoen Krung Road, Bang Rak. Tél: +66 2 657 51 00.",
    localCustoms: [
      "Le 'wai' (mains jointes) est le salut traditionnel",
      "La famille royale est SACRÉE - levez-vous pendant l'hymne national",
      "Les pieds = partie impure - ne pointez jamais vos pieds vers quelqu'un",
      "La tête = partie sacrée - ne touchez JAMAIS la tête de quelqu'un",
      "Le sourire résout presque tous les problèmes en Thaïlande"
    ],
    behaviorsToAvoid: [
      "Critiquer le roi ou la famille royale (15 ans de prison possible)",
      "Toucher la tête de quelqu'un",
      "Pointer les pieds vers une personne ou une image de Bouddha",
      "S'emporter ou crier en public",
      "Consommer de la drogue (peines très sévères)"
    ]
  },

  "new-york-usa": {
    id: "new-york-usa",
    name: "New York",
    country: "États-Unis",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1080",
    goSafeScore: 82,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-5 (EST)",
    language: "Anglais",
    currency: "Dollar américain ($) - 1€ ≈ 1.10$",
    securitySummary: "New York est devenue très sûre depuis les années 90. Manhattan est très sûr. Attention au métro tard la nuit, pickpockets à Times Square. Évitez certains quartiers du Bronx/Brooklyn la nuit. Ville CHÈRE.",
    alerts: [],
    dangerousAreas: ["Certaines parties du Bronx la nuit", "East New York (Brooklyn)", "Métro lignes isolées très tard"],
    safetyTips: ["Métro: Restez dans wagons bondés la nuit", "Times Square: Pickpockets actifs", "Taxis: Utilisez apps Uber/Lyft ou yellow cabs officiels", "Pourboire OBLIGATOIRE 15-20% restaurants"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système de santé américain excellent MAIS extrêmement cher. Assurance voyage INDISPENSABLE (une nuit d'hôpital peut coûter $10,000+).",
    visaRequired: true,
    visaDetails: "ESTA obligatoire (14$ en ligne) pour français/européens. Valable 2 ans, séjours max 90 jours.",
    entryDocuments: "Passeport biométrique + ESTA approuvé.",
    commonScams: [
      { title: "Faux moines/dons forcés", desc: "Personnes déguisées en moines donnent bracelets puis réclament don. SOLUTION: Refusez fermement." },
      { title: "CD rap gratuits Times Square", desc: "Rappeurs offrent CD 'gratuit', signent, puis réclament $20. Peuvent être agressifs. SOLUTION: Refusez, ne prenez rien." }
    ],
    priceGuide: [
      { item: "Métro illimité 7 jours", price: "$34" },
      { item: "Slice pizza", price: "$3-4" },
      { item: "Dîner restaurant moyen", price: "$25-40 + pourboire" },
      { item: "Bière bar", price: "$7-10" },
      { item: "Statue Liberté + Ellis Island", price: "$24" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "911", icon: "AlertCircle" },
      { name: "Police non-urgente", number: "311", icon: "Shield" }
    ],
    consulateInfo: "Consulat général de France: 934 5th Avenue. Tél: +1 212-606-3600.",
    localCustoms: ["Pourboire 15-20% OBLIGATOIRE restaurants/taxis", "New Yorkais pressés et directs", "Marche rapide sur trottoirs", "Ne bloquez pas passage dans métro"],
    behaviorsToAvoid: ["Oublier le pourboire (très mal vu)", "Marcher lentement/s'arrêter milieu trottoir", "Parler fort dans métro"]
  },

  "london-uk": {
    id: "london-uk",
    name: "Londres",
    country: "Royaume-Uni",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1080",
    goSafeScore: 85,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0 (BST en été)",
    language: "Anglais britannique",
    currency: "Livre sterling (£) - 1€ ≈ 0.85£",
    securitySummary: "Londres très sûre globalement. Pickpockets actifs dans métro (Tube), Oxford Street, marchés. Attaques acide rares mais existent. Évitez certaines zones tard (Brixton, Peckham). TRÈS CHER.",
    alerts: [],
    dangerousAreas: ["Certaines parties de Brixton/Peckham la nuit", "Zones isolées parcs la nuit"],
    safetyTips: ["Tube: Pickpockets actifs - sac devant", "Oxford Street bondée = pickpockets", "Traversez passages piétons - amendes", "Tenez droite dans escalators (gauche pour ceux qui montent)", "Oyster Card indispensable transports"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "NHS (système public) gratuit pour urgences. Carte Européenne Assurance Maladie acceptée pour UE.",
    visaRequired: false,
    visaDetails: "Pas de visa pour français (6 mois max). Passeport obligatoire (carte d'identité non acceptée post-Brexit).",
    entryDocuments: "Passeport en cours de validité.",
    commonScams: [
      { title: "Faux billets spectacles", desc: "Revendeurs rue billets contrefaits West End. SOLUTION: Achetez guichets officiels ou sites autorisés." },
      { title: "Taxis illégaux", desc: "Minicabs sans licence. SOLUTION: Black cabs officiels uniquement ou Uber." }
    ],
    priceGuide: [
      { item: "Oyster Card jour (zones 1-2)", price: "£8.10 plafond" },
      { item: "Pinte bière pub", price: "£5-7" },
      { item: "Fish & chips", price: "£8-12" },
      { item: "Restaurant moyen", price: "£15-25" },
      { item: "Tower of London", price: "£34.80" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "999", icon: "AlertCircle" },
      { name: "Police non-urgente", number: "101", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: 58 Knightsbridge. Tél: +44 20 7073 1000.",
    localCustoms: ["Queue (file d'attente) SACRÉE - ne doublez JAMAIS", "Politesse extrême: sorry, please, thank you", "Tenez droite escalators", "Pub culture - commandez au bar", "Pourboire 10-12.5% si pas inclus"],
    behaviorsToAvoid: ["Doubler dans queue", "Bloquer gauche escalators", "Parler fort transports", "Critiquer la monarchie (mal vu)"]
  },

  "dubai-uae": {
    id: "dubai-uae",
    name: "Dubaï",
    country: "Émirats Arabes Unis",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1080",
    goSafeScore: 90,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+4 (GST)",
    language: "Arabe (Anglais très bien parlé)",
    currency: "Dirham (AED) - 1€ ≈ 4 AED",
    securitySummary: "Dubaï = ville la plus sûre au monde. Criminalité quasi-nulle. Police partout. MAIS lois TRÈS strictes: alcool réglementé, drogue = prison, affection publique illégale, homosexualité illégale. Respectez ABSOLUMENT codes vestimentaires et lois islamiques.",
    alerts: [
      { id: 1, type: "danger", title: "Lois strictes drogues", summary: "Drogue (même traces THC dans sang) = prison automatique 4 ans minimum. Tests aléatoires aéroport.", date: "Permanent" },
      { id: 2, type: "warning", title: "Affection publique illégale", summary: "Bisous/câlins en public = amende ou prison. Même couples mariés. Tenue décente obligatoire.", date: "Permanent" }
    ],
    dangerousAreas: [],
    safetyTips: ["ZÉRO tolérance drogue - même médicaments avec codéine = prison", "Affection publique INTERDITE", "Tenue décente: épaules/genoux couverts lieux publics", "Alcool UNIQUEMENT hôtels/bars licenciés", "Ramadan: ne mangez/buvez pas en public de jour", "Ne photographiez JAMAIS femmes voilées, bâtiments gouvernementaux"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système santé excellent, moderne MAIS très cher. Assurance obligatoire.",
    visaRequired: false,
    visaDetails: "Exemption visa 90 jours pour français/européens (tampon gratuit à l'arrivée).",
    entryDocuments: "Passeport valide 6 mois minimum.",
    commonScams: [
      { title: "Taxis compteur", desc: "Peu d'arnaques car ville très réglementée. Utilisez Uber/Careem ou taxis officiels." }
    ],
    priceGuide: [
      { item: "Métro ticket", price: "AED 4-8.50 (~1-2€)" },
      { item: "Taxi départ", price: "AED 12 (~3€)" },
      { item: "Shawarma", price: "AED 10-15 (~2.50-4€)" },
      { item: "Restaurant local", price: "AED 40-80 (~10-20€)" },
      { item: "Bière bar (hôtel)", price: "AED 40-60 (~10-15€)" },
      { item: "Burj Khalifa (sommet)", price: "AED 244+ (~60€+)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "999", icon: "AlertCircle" },
      { name: "Police", number: "999", icon: "Shield" },
      { name: "Ambulance", number: "998", icon: "Ambulance" }
    ],
    consulateInfo: "Consulat général de France: Zomorodah Building, Trade Centre. Tél: +971 4 408 49 00.",
    localCustoms: ["Extrême respect Islam et culture émiratie", "Tenue décente obligatoire", "Main droite pour manger/serrer main", "Ramadan: respect jeûne", "Vendredi = jour saint (tout fermé matin)", "Pourboire 10-15% apprécié"],
    behaviorsToAvoid: ["Drogue (prison automatique)", "Affection publique", "Critiquer Islam/gouvernement/famille royale", "Tenue indécente", "Alcool en public hors zones autorisées", "Photographier femmes", "Homosexualité (illégale)"]
  },

  "singapore-singapore": {
    id: "singapore-singapore",
    name: "Singapour",
    country: "Singapour",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1080",
    goSafeScore: 92,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+8 (SGT)",
    language: "Anglais, Mandarin, Malais, Tamil",
    currency: "Dollar singapourien (S$) - 1€ ≈ 1.45 S$",
    securitySummary: "Singapour = ville LA PLUS SÛRE au monde. Criminalité quasi-inexistante. Police efficace. MAIS lois EXTRÊMEMENT strictes et amendes massives: chewing-gum interdit, crachats = amende, traverser hors passages = amende, fumer zones interdites = amende. Propreté obsessionnelle.",
    alerts: [
      { id: 1, type: "danger", title: "Drogue = peine de mort", summary: "Possession drogue = PEINE DE MORT automatique. Pas d'exception. Même transit aéroport.", date: "Permanent" },
      { id: 2, type: "warning", title: "Amendes partout", summary: "Chewing-gum, fumer, cracher, traverser n'importe où = amendes S$200-1000. Lois très strictes.", date: "Permanent" }
    ],
    dangerousAreas: [],
    safetyTips: ["ZÉRO drogue - peine de MORT automatique", "Chewing-gum INTERDIT", "Traversez UNIQUEMENT passages piétons - amende S$500", "Ne fumez QUE zones autorisées - amende S$1000", "Ne jetez RIEN par terre - amende S$300", "Ne mangez/buvez PAS dans MRT - amende S$500", "TRÈS cher - budget conséquent"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système santé parmi meilleurs au monde MAIS très cher. Assurance indispensable.",
    visaRequired: false,
    visaDetails: "Exemption visa 90 jours pour français/européens.",
    entryDocuments: "Passeport valide 6 mois minimum.",
    commonScams: [
      { title: "Quasi aucune arnaque", desc: "Singapour trop réglementée pour arnaques. Tout est sûr et officiel." }
    ],
    priceGuide: [
      { item: "MRT ticket", price: "S$1.50-2.50 (~1-1.70€)" },
      { item: "Hawker center (nourriture)", price: "S$4-7 (~2.75-4.80€)" },
      { item: "Restaurant moyen", price: "S$15-30 (~10-20€)" },
      { item: "Bière bar", price: "S$12-18 (~8-12€)" },
      { item: "Gardens by the Bay", price: "S$28 (~19€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "999", icon: "AlertCircle" },
      { name: "Police non-urgente", number: "1800-255-0000", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: 101-103 Cluny Park Road. Tél: +65 6880 7800.",
    localCustoms: ["Propreté absolue", "Ponctualité stricte", "Société multiculturelle (chinois, malais, indien)", "Hawker centers = cantine nationale bon marché", "Pourboire non nécessaire (service inclus)", "Respect absolu règles"],
    behaviorsToAvoid: ["Drogue (peine de mort)", "Chewing-gum", "Fumer hors zones", "Traverser n'importe où", "Jeter déchets", "Manger/boire dans MRT", "Critiquer gouvernement"]
  },

  "barcelona-spain": {
    id: "barcelona-spain",
    name: "Barcelone",
    country: "Espagne",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1080",
    goSafeScore: 78,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Catalan et Espagnol (Castillan)",
    currency: "Euro (€)",
    securitySummary: "Barcelone est la CAPITALE EUROPÉENNE du vol à la tire. Pickpockets extrêmement actifs et sophistiqués partout: Ramblas, Sagrada Familia, métro, plage Barceloneta. Groupes organisés utilisent techniques de distraction élaborées. Criminalité violente rare. Évitez El Raval très tard. Indépendantisme catalan peut créer tensions/manifestations.",
    alerts: [
      { id: 1, type: "danger", title: "Pickpockets omniprésents", summary: "Barcelone = pire ville d'Europe pour pickpockets. La Rambla, Sagrada Familia, métro, plage = zones critiques. Techniques sophistiquées (fausse glace sur vêtement, fausses pétitions, etc).", date: "Permanent" }
    ],
    dangerousAreas: ["El Raval très tard la nuit", "Certaines zones Barceloneta la nuit", "Rues isolées quartier Gótico la nuit"],
    safetyTips: ["Pickpockets PARTOUT - sac devant vous, fermetures éclair fermées", "La Rambla = ZONE ROUGE pickpockets - vigilance maximale", "Métro bondé = main dans votre sac - restez vigilant", "Plage: Ne laissez RIEN sans surveillance, même 10 secondes", "Technique 'glace sur vêtement': Quelqu'un vous signale tache, complice vole pendant distraction", "Fausses pétitions: Pendant signature, on vide vos poches", "Ne laissez jamais téléphone/sac sur table terrasse"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système de santé public espagnol excellent. Carte Européenne Assurance Maladie acceptée pour UE.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen. Carte identité ou passeport.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité.",
    commonScams: [
      { title: "Glace/moutarde sur vêtements", desc: "Quelqu'un 'remarque' tache sur vos vêtements, propose d'aider nettoyer, pendant ce temps complice vole sac/portefeuille. SOLUTION: Refusez aide, éloignez-vous immédiatement." },
      { title: "Fausses pétitions", desc: "Personnes avec clipboard demandent signature pétition humanitaire. Pendant que vous signez, on vole dans vos poches/sac ouvert. SOLUTION: Refusez fermement, ne vous arrêtez pas." },
      { title: "Technique de la bousculade", desc: "Dans métro/rue bondée, une personne vous bouscule devant, une autre vole derrière. SOLUTION: Sac devant, main sur portefeuille/téléphone." }
    ],
    priceGuide: [
      { item: "Métro ticket simple", price: "€2.55" },
      { item: "T-10 (10 trajets)", price: "€12.15" },
      { item: "Menu del día (déjeuner)", price: "€12-18" },
      { item: "Tapas bar", price: "€3-6 par tapa" },
      { item: "Bière bar", price: "€2.50-4" },
      { item: "Sagrada Familia", price: "€26" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police nationale", number: "091", icon: "Shield" },
      { name: "Police locale (Guardia Urbana)", number: "092", icon: "ShieldCheck" }
    ],
    consulateInfo: "Consulat général de France: Ronda Universitat 22 bis. Tél: +34 93 270 30 00.",
    localCustoms: ["Horaires décalés: déjeuner 14h-16h, dîner 21h-23h", "Sieste après-midi (magasins fermés 14h-17h)", "Catalan = langue officielle (respectez identité catalane)", "Pourboire non obligatoire mais apprécié (5-10%)", "Culture des tapas le soir"],
    behaviorsToAvoid: ["Appeler Barcelone 'Espagne' devant catalans indépendantistes", "Parler uniquement castillan (essayez quelques mots catalans)", "Manger/dîner avant 21h (vous serez seul au restaurant)"]
  },

  "rome-italy": {
    id: "rome-italy",
    name: "Rome",
    country: "Italie",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1080",
    goSafeScore: 79,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Italien",
    currency: "Euro (€)",
    securitySummary: "Rome très sûre pour criminalité violente. MAIS pickpockets très actifs zones touristiques (Colisée, Fontaine Trevi, Termini, bus/métro bondés). Arnaques restaurants touristiques courantes. Évitez Termini et certaines zones Esquilino très tard. Circulation chaotique, traverser = sport extrême.",
    alerts: [
      { id: 1, type: "warning", title: "Pickpockets actifs", summary: "Colisée, Fontaine de Trevi, Vatican, métro/bus bondés = zones à risque. Groupes organisés de pickpockets, souvent enfants.", date: "Permanent" }
    ],
    dangerousAreas: ["Gare Termini et alentours la nuit", "Certaines zones Esquilino tard", "Parcs isolés la nuit"],
    safetyTips: ["Pickpockets actifs métro ligne A, bus 64 (surnommé 'Pickpocket Express')", "Colisée/Forums/Fontaine Trevi: Sac devant, vigilance maximale", "Restaurants: Vérifiez addition (coperto = couvert 2-3€ par personne normal)", "Traverser rue = regardez PARTOUT (scooters arrivent de tous côtés)", "Eau potable gratuite fontaines publiques (nasoni)", "Vatican: Épaules et genoux couverts obligatoire"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système de santé public italien correct. Carte Européenne Assurance Maladie acceptée pour UE.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen. Carte identité ou passeport.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité.",
    commonScams: [
      { title: "Gladiateurs Colisée", desc: "Faux gladiateurs proposent photo 'gratuite' puis réclament 20-50€ agressivement. SOLUTION: Refusez ou négociez prix AVANT photo." },
      { title: "Restaurants pièges touristes", desc: "Menus sans prix, 'eau offerte', puis addition x10. Coperto (couvert) excessif 5-10€. SOLUTION: Vérifiez prix AVANT, évitez restaurants avec rabatteurs." },
      { title: "Taxi compteur", desc: "Taxi refuse compteur ou fait détours inutiles. SOLUTION: Exigez compteur, ou tarifs fixes aéroport-centre (48€ FCO, 31€ Ciampino)." }
    ],
    priceGuide: [
      { item: "Métro/bus ticket 100min", price: "€1.50" },
      { item: "Pizza al taglio (part)", price: "€3-5" },
      { item: "Supplì (spécialité romaine)", price: "€1.50-2" },
      { item: "Restaurant local", price: "€15-25" },
      { item: "Caffè/Espresso au bar", price: "€1-1.20" },
      { item: "Colisée + Forums", price: "€18" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Carabinieri", number: "112", icon: "Shield" },
      { name: "Police", number: "113", icon: "ShieldCheck" }
    ],
    consulateInfo: "Ambassade de France: Piazza Farnese 67. Tél: +39 06 68 60 11.",
    localCustoms: ["Cappuccino uniquement matin (après 11h = tourist)", "Café au bar debout moins cher qu'assis", "Coperto (couvert 2-3€/pers) normal", "Apéritivo 18h-21h (boisson + buffet gratuit)", "Pourboire non obligatoire", "Déjeuner 13h-15h, dîner après 20h"],
    behaviorsToAvoid: ["Commander cappuccino après repas", "Demander parmesan sur plat de poisson/fruits de mer (sacrilège)", "Couper pâtes avec couteau"]
  },

  "berlin-germany": {
    id: "berlin-germany",
    name: "Berlin",
    country: "Allemagne",
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1080",
    goSafeScore: 83,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Allemand (Anglais très bien parlé)",
    currency: "Euro (€)",
    securitySummary: "Berlin très sûre globalement. Pickpockets dans transports et zones touristiques (Alexanderplatz, Checkpoint Charlie). Certains quartiers alternatifs (Kreuzberg, Friedrichshain) peuvent être bruyants la nuit mais peu dangereux. Système de transports sur base de confiance - amendes 60€ si sans ticket.",
    alerts: [],
    dangerousAreas: ["Görlitzer Park la nuit (dealers)", "Certaines zones près Ostbahnhof très tard"],
    safetyTips: ["Transports: Achetez TOUJOURS ticket - contrôles fréquents, amende 60€", "Pickpockets Alexanderplatz, U-Bahn lignes touristiques", "Vélos partout - regardez pistes cyclables avant traverser", "Allemands très respectueux règles - suivez-les", "Bouteilles verre = Pfand (consigne 8-25c) - rapportez ou laissez à côté poubelle"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système de santé allemand excellent. Carte Européenne Assurance Maladie acceptée pour UE.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen. Carte identité ou passeport.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité.",
    commonScams: [
      { title: "Faux taxis", desc: "Peu d'arnaques à Berlin. Ville très réglementée et sûre." }
    ],
    priceGuide: [
      { item: "Ticket AB (2h)", price: "€3.20" },
      { item: "Tageskarte (jour AB)", price: "€9.90" },
      { item: "Currywurst", price: "€3-5" },
      { item: "Döner kebab", price: "€5-7" },
      { item: "Bière bar (0.5L)", price: "€3.50-5" },
      { item: "Restaurant moyen", price: "€12-20" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "110", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Pariser Platz 5. Tél: +49 30 590 03 90 00.",
    localCustoms: ["Ponctualité ABSOLUE (être à l'heure = arriver 5min avant)", "Respect strict règles et lois", "Tri des déchets très important", "Traverser au rouge à pied = amende", "Dimanche = jour de repos (tout fermé)", "Pfand (consigne bouteilles)", "Culture club/techno très présente"],
    behaviorsToAvoid: ["Traverser au rouge piéton", "Marcher sur piste cyclable", "Ne pas trier déchets", "Être en retard", "Parler fort transports"]
  },

  "amsterdam-netherlands": {
    id: "amsterdam-netherlands",
    name: "Amsterdam",
    country: "Pays-Bas",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1080",
    goSafeScore: 84,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Néerlandais (Anglais parfaitement parlé par 90%+)",
    currency: "Euro (€)",
    securitySummary: "Amsterdam très sûre. Pickpockets actifs zones très touristiques (Dam, Quartier Rouge, gare Centraal). DANGER PRINCIPAL = VÉLOS PARTOUT très rapides. Cannabis légal coffeeshops mais pas dans rue. Quartier Rouge sûr mais ne photographiez JAMAIS les femmes (confiscation téléphone, amendes, agressions possibles).",
    alerts: [
      { id: 1, type: "warning", title: "Vélos dangereux", summary: "DANGER #1 à Amsterdam = vélos. Très rapides, priorité absolue. Ne marchez JAMAIS sur pistes rouges. Accidents fréquents avec touristes.", date: "Permanent" }
    ],
    dangerousAreas: [],
    safetyTips: ["VÉLOS = DANGER: Pistes cyclables rouges, JAMAIS marcher dessus", "Regardez PARTOUT avant traverser (vélos arrivent vite et silencieux)", "Quartier Rouge: ZÉRO PHOTO des femmes = confiscation téléphone ou pire", "Coffeeshops: Cannabis légal dedans uniquement, PAS dans rue", "Trams: Prioritaires, font pas de quartier", "Pickpockets: Gare Centraal, Dam Square, trams bondés"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système de santé néerlandais excellent. Carte Européenne Assurance Maladie acceptée pour UE.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen. Carte identité ou passeport.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité.",
    commonScams: [
      { title: "Peu d'arnaques", desc: "Amsterdam très réglementée. Attention pickpockets zones touristiques et faux 'guides' coffeeshops." }
    ],
    priceGuide: [
      { item: "Tram/métro ticket 1h", price: "€3.40" },
      { item: "GVB jour illimité", price: "€9" },
      { item: "Stroopwafel marché", price: "€1.50-2" },
      { item: "Restaurant moyen", price: "€15-25" },
      { item: "Bière bar", price: "€5-7" },
      { item: "Rijksmuseum", price: "€22.50" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police non-urgente", number: "0900-8844", icon: "Shield" }
    ],
    consulateInfo: "Consulat général de France: Vijzelgracht 2. Tél: +31 20 530 69 69.",
    localCustoms: ["Néerlandais extrêmement directs (pas impoli, juste culture)", "Vélo = roi de la route", "Tout le monde parle anglais parfaitement", "Pourboire 5-10% apprécié", "Splitting the bill (payer séparément) très normal"],
    behaviorsToAvoid: ["Marcher sur piste cyclable rouge", "Photographier femmes Quartier Rouge", "Fumer cannabis dans rue", "Être impoli avec vélos (ils ont priorité)"]
  },

  "lisbon-portugal": {
    id: "lisbon-portugal",
    name: "Lisbonne",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1080",
    goSafeScore: 85,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0 (WET)",
    language: "Portugais (Anglais bien parlé zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Lisbonne très sûre et accueillante. Pickpockets présents tram 28, Baixa, Alfama. Criminalité violente quasi-nulle. Attention aux trottoirs glissants quand mouillés (calçada portuguesa). Certaines montées très raides. Quartiers de nuit animés mais sûrs.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Tram 28: TRÈS touristique = pickpockets actifs, sac devant", "Calçada (pavés portugais) glissants quand mouillés - chaussures adaptées", "Montées raides: Alfama, Bairro Alto, Graça - bon cardio nécessaire", "Taxis/Uber honnêtes généralement", "Pastel de nata = obligation culinaire"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système de santé portugais bon. Carte Européenne Assurance Maladie acceptée pour UE.",
    visaRequired: false,
    visaDetails: "Pas de visa pour UE/Schengen. Carte identité ou passeport.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité.",
    commonScams: [
      { title: "Peu d'arnaques", desc: "Lisbonne très sûre. Attention pickpockets tram 28 uniquement." }
    ],
    priceGuide: [
      { item: "Métro/bus ticket", price: "€1.80" },
      { item: "Viva Viagem (carte rechargeable)", price: "€0.50" },
      { item: "Pastel de nata Belém", price: "€1.30" },
      { item: "Menu déjeuner", price: "€8-12" },
      { item: "Bière bar", price: "€2-3" },
      { item: "Restaurant moyen", price: "€12-18" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "112", icon: "Shield" }
    ],
    consulateInfo: "Ambassade de France: Rua Santos-O-Velho 5. Tél: +351 21 393 92 00.",
    localCustoms: ["Portugais très accueillants et chaleureux", "Fado = musique traditionnelle (écoutez respectueusement)", "Pourboire 5-10% apprécié", "Déjeuner 13h-15h, dîner 20h-22h", "Saudade = concept culturel important"],
    behaviorsToAvoid: ["Confondre portugais avec espagnol (offense)", "Parler fort pendant fado"]
  },

  "sydney-australia": {
    id: "sydney-australia",
    name: "Sydney",
    country: "Australie",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1080",
    goSafeScore: 88,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+10/+11 (AEST/AEDT)",
    language: "Anglais australien",
    currency: "Dollar australien (A$) - 1€ ≈ 1.65 A$",
    securitySummary: "Sydney très sûre, une des villes les plus sûres au monde. Criminalité violente rare. Dangers: soleil extrême, animaux venimeux, courants océaniques. Ville très chère.",
    alerts: [],
    dangerousAreas: ["Kings Cross tard la nuit"],
    safetyTips: ["Soleil: Crème SPF50+ obligatoire", "Plages: Nagez entre drapeaux surveillés", "Animaux: Ne touchez rien dans nature"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Système excellent mais très cher pour touristes. Assurance indispensable.",
    visaRequired: true,
    visaDetails: "ETA obligatoire (20 A$). Valable 1 an.",
    entryDocuments: "Passeport + ETA.",
    commonScams: [{ title: "Peu d'arnaques", desc: "Très sûre." }],
    priceGuide: [
      { item: "Transport jour", price: "A$17.80" },
      { item: "Café", price: "A$4.50-5.50" },
      { item: "Restaurant", price: "A$25-40" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "000", icon: "AlertCircle" }],
    consulateInfo: "Consulat de France: +61 2 9268 2400.",
    localCustoms: ["Australiens détendus", "BBQ culture", "Swim between flags"],
    behaviorsToAvoid: ["Sous-estimer soleil", "Nager hors zones surveillées"]
  },

  "prague-czechia": {
    id: "prague-czechia",
    name: "Prague",
    country: "République tchèque",
    image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1080",
    goSafeScore: 82,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Tchèque (Anglais zones touristiques)",
    currency: "Couronne (Kč) - 1€ ≈ 25 Kč",
    securitySummary: "Prague très sûre. Arnaques courantes: taxis, bureaux de change, restaurants. Pickpockets actifs tram 22 et Pont Charles.",
    alerts: [],
    dangerousAreas: ["Place Venceslas très tard"],
    safetyTips: ["Taxis: Uber/Bolt uniquement", "Change: DAB seulement", "Bière moins chère que l'eau"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Correct. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas de visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Taxis arnaque", desc: "Facturent 10-20x. Uber/Bolt uniquement." }],
    priceGuide: [
      { item: "Tram 30min", price: "30 Kč (~1.20€)" },
      { item: "Bière 0.5L", price: "40-60 Kč (~1.60-2.40€)" },
      { item: "Restaurant local", price: "150-250 Kč (~6-10€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +420 251 171 711.",
    localCustoms: ["Tchèques réservés", "Bière culture", "Pourboire 10%"],
    behaviorsToAvoid: ["Taxis rue", "Bureaux change touristiques"]
  },

  "vienna-austria": {
    id: "vienna-austria",
    name: "Vienne",
    country: "Autriche",
    image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1080",
    goSafeScore: 89,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Allemand (Anglais bien parlé)",
    currency: "Euro (€)",
    securitySummary: "Vienne une des villes LES PLUS SÛRES. Criminalité très faible. Autrichiens respectueux règles.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Achetez tickets transports", "Ponctualité importante", "Dimanche tout fermé"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas de visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Quasi aucune", desc: "Très sûre." }],
    priceGuide: [
      { item: "Transport 24h", price: "€8" },
      { item: "Sachertorte", price: "€7-8" },
      { item: "Schnitzel", price: "€15-25" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +43 1 502 75 0.",
    localCustoms: ["Très polis", "Ponctualité absolue", "Culture café"],
    behaviorsToAvoid: ["Être en retard", "Confondre avec Allemagne"]
  },

  "athens-greece": {
    id: "athens-greece",
    name: "Athènes",
    country: "Grèce",
    image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1080",
    goSafeScore: 77,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+2 (EET)",
    language: "Grec (Anglais zones touristiques)",
    currency: "Euro (€)",
    securitySummary: "Athènes relativement sûre. Pickpockets TRÈS actifs métro, Acropole, Plaka. Manifestations fréquentes. Évitez Omonia la nuit.",
    alerts: [],
    dangerousAreas: ["Place Omonia nuit", "Metaxourgio", "Exarcheia"],
    safetyTips: ["Métro: Pickpockets très actifs", "Taxis: Apps uniquement", "Chaleur 40°C+ été", "Papier WC poubelle pas toilettes"],
    vaccines: [{ name: "Aucun vaccin obligatoire", status: "none" }],
    healthSystem: "Public en difficulté. Privé recommandé. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas de visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Taxis", desc: "Refusent compteur. Apps Beat/Uber." }],
    priceGuide: [
      { item: "Métro", price: "€1.20" },
      { item: "Gyros", price: "€2.50-4" },
      { item: "Taverne", price: "€10-15" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +30 210 339 1000.",
    localCustoms: ["Très hospitaliers", "Horaires décalés", "Geste moutza = insulte"],
    behaviorsToAvoid: ["Geste moutza", "Jeter papier WC toilettes"]
  },

  "marrakech-morocco": {
    id: "marrakech-morocco",
    name: "Marrakech",
    country: "Maroc",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1080",
    goSafeScore: 75,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0",
    language: "Arabe et Français",
    currency: "Dirham (MAD) - 1€ ≈ 11 MAD",
    securitySummary: "Marrakech relativement sûre MAIS harcèlement constant médina (vendeurs, faux guides). Négociation obligatoire (divisez par 3-5). Respectez culture musulmane.",
    alerts: [],
    dangerousAreas: ["Ruelles isolées médina nuit"],
    safetyTips: ["Refusez faux guides", "Négociez tout prix ÷ 3", "Tenue modeste", "Eau bouteille uniquement"],
    vaccines: [
      { name: "Aucun obligatoire", status: "none" },
      { name: "Hépatite A", status: "recommended" }
    ],
    healthSystem: "Cliniques privées correctes. Assurance recommandée.",
    visaRequired: false,
    visaDetails: "Pas visa 90 jours.",
    entryDocuments: "Passeport 6 mois validité.",
    commonScams: [{ title: "Faux guides", desc: "Proposent aide puis réclament argent. Refusez." }],
    priceGuide: [
      { item: "Taxi aéroport", price: "70-100 MAD (~6-9€)" },
      { item: "Tajine local", price: "40-70 MAD (~3.60-6.30€)" },
      { item: "Thé menthe", price: "10-15 MAD (~0.90€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "19", icon: "Shield" },
      { name: "SAMU", number: "15", icon: "Ambulance" }
    ],
    consulateInfo: "Consulat: +212 5243-88200.",
    localCustoms: ["Culture musulmane", "Tenue modeste", "Main droite manger", "Marchandage normal"],
    behaviorsToAvoid: ["Tenue indécente", "Main gauche manger", "Photographier sans demander"]
  },

  "seoul-south-korea": {
    id: "seoul-south-korea",
    name: "Séoul",
    country: "Corée du Sud",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1080",
    goSafeScore: 91,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+9 (KST)",
    language: "Coréen (Anglais limité)",
    currency: "Won (₩) - 1€ ≈ 1450 ₩",
    securitySummary: "Séoul EXTRÊMEMENT sûre. Criminalité quasi-nulle. Arnaques très rares. WiFi gratuit partout. Barrière langue importante.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["WiFi gratuit partout", "T-money card indispensable", "Anglais peu parlé", "Enlevez chaussures", "Pourboire = insulte"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent mais cher touristes. Assurance recommandée.",
    visaRequired: false,
    visaDetails: "Exemption 90 jours (K-ETA vérifier).",
    entryDocuments: "Passeport 6 mois.",
    commonScams: [{ title: "Quasi aucune", desc: "Extrêmement sûre." }],
    priceGuide: [
      { item: "T-money card", price: "₩2,500 (~1.70€)" },
      { item: "Métro", price: "₩1,250-2,050 (~0.85-1.40€)" },
      { item: "Bibimbap", price: "₩7,000-10,000 (~4.80-6.90€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences", number: "112", icon: "AlertCircle" },
      { name: "Tourisme", number: "1330", icon: "Info" }
    ],
    consulateInfo: "Ambassade: +82 2 3149 4300.",
    localCustoms: ["Enlevez chaussures", "Courbettes salutation", "2 mains verser/recevoir", "Pourboire insulte", "K-pop omniprésente"],
    behaviorsToAvoid: ["Pourboire", "Baguettes verticales riz", "Embrasser public"]
  },

  "copenhagen-denmark": {
    id: "copenhagen-denmark",
    name: "Copenhague",
    country: "Danemark",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1080",
    goSafeScore: 90,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Danois (Anglais parfait 90%+)",
    currency: "Couronne (DKK) - 1€ ≈ 7.45 DKK",
    securitySummary: "Copenhague TRÈS sûre. Criminalité quasi-nulle. DANGER = VÉLOS partout très rapides. Ville EXTRÊMEMENT chère. Hygge concept clé.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["VÉLOS: Ne marchez JAMAIS pistes cyclables", "Anglais parfaitement parlé", "TRÈS cher", "Vélo meilleur transport"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Aucune", desc: "Extrêmement sûre." }],
    priceGuide: [
      { item: "Métro", price: "24 DKK (~3.20€)" },
      { item: "Smørrebrød", price: "80-120 DKK (~10.75-16€)" },
      { item: "Restaurant", price: "250-400 DKK (~33.50-53.50€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +45 33 67 01 00.",
    localCustoms: ["Très directs", "Égalité absolue", "Hygge concept", "Vélo religion", "Pourboire inclus"],
    behaviorsToAvoid: ["Marcher piste cyclable", "Se vanter", "Être retard"]
  },

  "stockholm-sweden": {
    id: "stockholm-sweden",
    name: "Stockholm",
    country: "Suède",
    image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1080",
    goSafeScore: 89,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Suédois (Anglais parfaitement parlé)",
    currency: "Couronne suédoise (SEK) - 1€ ≈ 11.50 SEK",
    securitySummary: "Stockholm très sûre. Criminalité faible. Suédois polis et réservés. Ville chère. Système cashless (cartes partout). Hiver sombre et froid.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Quasi cashless - cartes acceptées partout", "TRÈS cher", "Anglais parfait", "Hiver très sombre (16h nuit)"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Aucune", desc: "Très sûre." }],
    priceGuide: [
      { item: "Métro ticket", price: "39 SEK (~3.40€)" },
      { item: "Restaurant", price: "150-250 SEK (~13-21.50€)" },
      { item: "Bière", price: "80-100 SEK (~6.90-8.70€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +46 8 459 53 00.",
    localCustoms: ["Suédois réservés polis", "Ponctualité absolue", "Lagom (juste assez)", "Fika (pause café)", "Pourboire inclus"],
    behaviorsToAvoid: ["Se vanter", "Être trop familier", "Parler fort"]
  },

  "mexico-city-mexico": {
    id: "mexico-city-mexico",
    name: "Mexico City",
    country: "Mexique",
    image: "https://images.unsplash.com/photo-1759255259985-6f8c71ebe64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNZXhpY28lMjBDaXR5JTIwc2t5bGluZSUyMGxhbmRtYXJrfGVufDF8fHx8MTc3MjExNjQwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 68,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-6 (CST)",
    language: "Espagnol (Anglais limité)",
    currency: "Peso mexicain (MXN) - 1€ ≈ 19 MXN",
    securitySummary: "Mexico City nécessite vigilance. Vols fréquents (pickpockets, taxis pirates, faux policiers). Évitez certains quartiers (Tepito, Iztapalapa). Restez zones touristiques (Roma, Condesa, Polanco, Centro). Altitude 2250m peut causer malaises. Pollution importante.",
    alerts: [
      { id: 1, type: "warning", title: "Taxis pirates dangereux", summary: "Ne prenez JAMAIS taxis rue. Uber/Didi ou taxis sitios (stands) UNIQUEMENT. Enlèvements express existent.", date: "Permanent" }
    ],
    dangerousAreas: ["Tepito", "Iztapalapa", "Certaines zones Nezahualcóyotl", "Métro très bondé (pickpockets)"],
    safetyTips: ["Taxis: UBER/Didi UNIQUEMENT - jamais rue", "Ne montrez pas objets valeur", "Faux policiers: Demandez badge, appelez 911", "Altitude: Hydratez-vous, allez doucement 1er jour", "Eau: Bouteille uniquement"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }, { name: "Hépatite A", status: "recommended" }],
    healthSystem: "Hôpitaux privés corrects. Publics saturés. Assurance recommandée.",
    visaRequired: false,
    visaDetails: "Pas visa 180 jours français/européens.",
    entryDocuments: "Passeport 6 mois validité.",
    commonScams: [{ title: "Faux policiers", desc: "Demandent papiers/fouillent portefeuille. Demandez badge, appelez 911." }],
    priceGuide: [
      { item: "Métro", price: "MXN 5 (~0.26€)" },
      { item: "Tacos rue", price: "MXN 15-25 (~0.80-1.30€)" },
      { item: "Restaurant", price: "MXN 150-300 (~7.90-15.80€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "911", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +52 55 9171 9800.",
    localCustoms: ["Mexicains très chaleureux", "Horaires décalés", "Tacos partout", "Pourboire 10-15%"],
    behaviorsToAvoid: ["Taxis rue", "Montrer objets valeur", "Boire eau robinet"]
  },

  "toronto-canada": {
    id: "toronto-canada",
    name: "Toronto",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1080",
    goSafeScore: 87,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-5 (EST)",
    language: "Anglais et Français",
    currency: "Dollar canadien (CAD) - 1€ ≈ 1.50 CAD",
    securitySummary: "Toronto très sûre et multiculturelle. Criminalité faible. Canadiens extrêmement polis. Hiver TRÈS froid (-20°C). Ville chère.",
    alerts: [],
    dangerousAreas: ["Certaines zones Jane/Finch"],
    safetyTips: ["Hiver glacial - équipement nécessaire", "Pourboire 15-20% obligatoire", "Canadiens très polis", "TTC (métro) sûr"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent mais cher touristes. Assurance indispensable.",
    visaRequired: false,
    visaDetails: "eTA obligatoire (7 CAD) avion.",
    entryDocuments: "Passeport + eTA.",
    commonScams: [{ title: "Peu", desc: "Très sûre." }],
    priceGuide: [
      { item: "TTC ticket", price: "CAD 3.25" },
      { item: "Restaurant", price: "CAD 20-35 + pourboire" },
      { item: "Bière", price: "CAD 7-10" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "911", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +1 416-847-1900.",
    localCustoms: ["Canadiens extrêmement polis", "Sorry tout le temps", "Multiculturel", "Pourboire 15-20%", "Hiver brutal"],
    behaviorsToAvoid: ["Oublier pourboire", "Sous-estimer froid hiver"]
  },

  "buenos-aires-argentina": {
    id: "buenos-aires-argentina",
    name: "Buenos Aires",
    country: "Argentine",
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1080",
    goSafeScore: 72,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-3 (ART)",
    language: "Espagnol",
    currency: "Peso argentin (ARS) - 1€ ≈ 1050 ARS (inflation élevée)",
    securitySummary: "Buenos Aires nécessite vigilance. Pickpockets actifs. Vols arrachage (motochorros). Évitez certains quartiers sud (La Boca nuit, Villa 31). Zones sûres: Palermo, Recoleta, San Telmo jour. Change noir (blue dollar) courant. Horaires très tardifs.",
    alerts: [],
    dangerousAreas: ["La Boca la nuit", "Villa 31", "Retiro gare la nuit", "Constitución"],
    safetyTips: ["Pickpockets actifs - sac devant", "Motochorros (vols scooter) - téléphone poche", "La Boca: Jour uniquement zone touristique", "Change: Blue dollar courant mais risqué", "Horaires tardifs: dîner après 22h"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }, { name: "Hépatite A", status: "recommended" }],
    healthSystem: "Public gratuit mais saturé. Privé correct. Assurance recommandée.",
    visaRequired: false,
    visaDetails: "Pas visa 90 jours français/européens.",
    entryDocuments: "Passeport 6 mois validité.",
    commonScams: [{ title: "Change", desc: "Taux officiel vs blue dollar. Attention arnaques rue." }],
    priceGuide: [
      { item: "Métro", price: "ARS 125 (~0.12€)" },
      { item: "Empanada", price: "ARS 500-800 (~0.50-0.75€)" },
      { item: "Asado (BBQ)", price: "ARS 5000-8000 (~4.75-7.60€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "911", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +54 11 4515-7030.",
    localCustoms: ["Argentins passionnés chaleureux", "Horaires très tardifs", "Tango culture", "Mate (thé)", "Asado (BBQ) religion", "Pourboire 10%"],
    behaviorsToAvoid: ["Montrer objets valeur", "La Boca nuit", "Comparer avec Europe (mal vu)"]
  },

  "cape-town-south-africa": {
    id: "cape-town-south-africa",
    name: "Le Cap",
    country: "Afrique du Sud",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1080",
    goSafeScore: 65,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+2 (SAST)",
    language: "Anglais, Afrikaans, Xhosa",
    currency: "Rand (ZAR) - 1€ ≈ 20 ZAR",
    securitySummary: "Le Cap magnifique MAIS criminalité élevée. Townships dangereux. Zones sûres: Waterfront, City Bowl jour, Camps Bay. Ne marchez JAMAIS la nuit. Uber obligatoire. Carjackings existent. Paysages spectaculaires mais vigilance constante nécessaire.",
    alerts: [
      { id: 1, type: "danger", title: "Ne marchez JAMAIS la nuit", summary: "Criminalité élevée. Uber/taxi UNIQUEMENT même courtes distances nuit. Agressions courantes.", date: "Permanent" }
    ],
    dangerousAreas: ["Townships (sauf tours guidés)", "City Bowl la nuit", "Gare ferroviaire", "N2 highway certaines zones"],
    safetyTips: ["JAMAIS marcher nuit - Uber obligatoire", "Townships: Tours guidés UNIQUEMENT", "Voiture: Portes verrouillées, fenêtres fermées", "Plages: Ne laissez RIEN sans surveillance", "Table Mountain superbe - prenez câble"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }, { name: "Hépatite A", status: "recommended" }],
    healthSystem: "Privé excellent mais cher. Public saturé. Assurance indispensable.",
    visaRequired: false,
    visaDetails: "Pas visa 90 jours français/européens.",
    entryDocuments: "Passeport 2 pages vierges, valide 30 jours après retour.",
    commonScams: [{ title: "Faux guides", desc: "Proposent tours townships non sécurisés. Réservez agences réputées." }],
    priceGuide: [
      { item: "Uber course", price: "ZAR 50-150 (~2.50-7.50€)" },
      { item: "Restaurant", price: "ZAR 150-300 (~7.50-15€)" },
      { item: "Table Mountain câble", price: "ZAR 395 (~19.75€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "10111", icon: "Shield" }, { name: "Ambulance", number: "10177", icon: "Ambulance" }],
    consulateInfo: "Consulat: +27 21 423 1575.",
    localCustoms: ["Sud-Africains très accueillants", "Braai (BBQ) culture", "11 langues officielles", "Pourboire 10-15%", "Histoire apartheid présente"],
    behaviorsToAvoid: ["Marcher nuit", "Townships seul", "Montrer richesse", "Laisser affaires sans surveillance"]
  },

  "mumbai-india": {
    id: "mumbai-india",
    name: "Mumbai",
    country: "Inde",
    image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1080",
    goSafeScore: 70,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+5:30 (IST)",
    language: "Hindi, Marathi, Anglais",
    currency: "Roupie indienne (₹) - 1€ ≈ 91 ₹",
    securitySummary: "Mumbai intense et chaotique. Arnaques touristiques omniprésentes (taxis, change, faux guides). Circulation anarchique. Femmes: harcèlement fréquent. Pauvreté extrême visible. Pollution. Estomacs sensibles attention nourriture. Expérience culturelle intense.",
    alerts: [
      { id: 1, type: "warning", title: "Arnaques omniprésentes", summary: "Taxis refusent compteur, faux guides, boutiques commissions. Vigilance constante nécessaire.", date: "Permanent" }
    ],
    dangerousAreas: ["Certaines zones Dharavi", "Rues isolées nuit"],
    safetyTips: ["Taxis: Uber/Ola uniquement", "Eau: Bouteille UNIQUEMENT scellée", "Nourriture: Attention estomacs sensibles", "Femmes: Tenue modeste, évitez trains bondés", "Mendicité: Ne donnez pas (risque harcèlement)", "Circulation: Traverser = chaos"],
    vaccines: [
      { name: "Aucun obligatoire", status: "none" },
      { name: "Hépatite A et B", status: "recommended" },
      { name: "Typhoïde", status: "recommended" },
      { name: "Rage", status: "recommended" }
    ],
    healthSystem: "Hôpitaux privés corrects mais chers. Assurance indispensable.",
    visaRequired: true,
    visaDetails: "E-visa obligatoire (25-100 USD selon durée). Demande en ligne avant départ.",
    entryDocuments: "Passeport 6 mois validité + e-visa.",
    commonScams: [
      { title: "Taxis compteur", desc: "Refusent compteur, font détours. SOLUTION: Uber/Ola uniquement." },
      { title: "Faux guides/boutiques", desc: "Proposent aide puis emmènent boutiques à commissions. SOLUTION: Refusez." }
    ],
    priceGuide: [
      { item: "Uber course", price: "₹100-300 (~1.10-3.30€)" },
      { item: "Street food", price: "₹50-100 (~0.55-1.10€)" },
      { item: "Restaurant", price: "₹300-600 (~3.30-6.60€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "100", icon: "Shield" },
      { name: "Ambulance", number: "102", icon: "Ambulance" }
    ],
    consulateInfo: "Consulat: +91 22 6669 4000.",
    localCustoms: ["Namaste salutation", "Main droite manger", "Enlevez chaussures", "Vache sacrée", "Tête = sacré", "Pourboire apprécié"],
    behaviorsToAvoid: ["Main gauche manger", "Toucher tête quelqu'un", "Affection publique", "Pointer pieds"]
  },

  "hong-kong-china": {
    id: "hong-kong-china",
    name: "Hong Kong",
    country: "Chine (RAS)",
    image: "https://images.unsplash.com/photo-1536599424071-4c11afd9224c?w=1080",
    goSafeScore: 86,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+8 (HKT)",
    language: "Cantonais, Anglais, Mandarin",
    currency: "Dollar HK (HKD) - 1€ ≈ 8.60 HKD",
    securitySummary: "Hong Kong très sûre et efficace. Criminalité faible. Arnaques rares. Transports excellents. Situation politique peut créer manifestations (évitez). Densité extrême. Chaleur/humidité été intense. Anglais bien parlé.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Très sûre - marchez partout", "Octopus Card indispensable (transports)", "Manifestations possibles - évitez", "Été: Chaleur humidité extrêmes", "Ne critiquez JAMAIS gouvernement chinois"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent mais cher. Assurance recommandée.",
    visaRequired: false,
    visaDetails: "Exemption visa 90 jours français/européens.",
    entryDocuments: "Passeport 6 mois validité.",
    commonScams: [{ title: "Très peu", desc: "Ville très sûre et honnête." }],
    priceGuide: [
      { item: "Octopus Card", price: "HKD 50 dépôt" },
      { item: "MTR métro", price: "HKD 5-15 (~0.60-1.75€)" },
      { item: "Dim sum", price: "HKD 30-80 (~3.50-9.30€)" },
      { item: "Restaurant", price: "HKD 100-200 (~11.60-23.25€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "999", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +852 3752 9900.",
    localCustoms: ["Hongkongais efficaces rapides", "Cantonais apprécié", "Dim sum culture", "Pourboire 10% généralement inclus", "MTR excellent"],
    behaviorsToAvoid: ["Critiquer gouvernement chinois", "Bloquer passage (densité)", "Manger/boire MTR (amende)"]
  },

  "miami-usa": {
    id: "miami-usa",
    name: "Miami",
    country: "États-Unis",
    image: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=1080",
    goSafeScore: 74,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-5 (EST)",
    language: "Anglais, Espagnol",
    currency: "Dollar ($) - 1€ ≈ 1.10$",
    securitySummary: "Miami nécessite vigilance. Vols voitures fréquents. South Beach sûr mais pickpockets. Ouragans juin-novembre. TRÈS cher.",
    alerts: [],
    dangerousAreas: ["Liberty City", "Overtown"],
    safetyTips: ["Voiture: RIEN visible", "Pickpockets South Beach", "Pourboire 15-20% obligatoire"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent MAIS extrêmement cher. Assurance INDISPENSABLE.",
    visaRequired: true,
    visaDetails: "ESTA obligatoire (14$).",
    entryDocuments: "Passeport + ESTA.",
    commonScams: [{ title: "Vols voitures", desc: "RIEN visible voiture." }],
    priceGuide: [
      { item: "Parking", price: "$25-40" },
      { item: "Cuban sandwich", price: "$10-15" },
      { item: "Restaurant", price: "$30-50 + tip" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "911", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +1 305-403-4150.",
    localCustoms: ["Culture latino", "Espagnol partout", "Pourboire 15-20%"],
    behaviorsToAvoid: ["Objets voiture", "Oublier pourboire"]
  },

  "los-angeles-usa": {
    id: "los-angeles-usa",
    name: "Los Angeles",
    country: "États-Unis",
    image: "https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=1080",
    goSafeScore: 71,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-8 (PST)",
    language: "Anglais",
    currency: "Dollar ($) - 1€ ≈ 1.10$",
    securitySummary: "LA nécessite vigilance. Skid Row DANGEREUX. Voiture OBLIGATOIRE. Trafic légendaire. TRÈS cher.",
    alerts: [{ id: 1, type: "danger", title: "Skid Row", summary: "Évitez ABSOLUMENT Skid Row Downtown.", date: "Permanent" }],
    dangerousAreas: ["Skid Row", "Compton", "South Central"],
    safetyTips: ["ÉVITEZ Skid Row", "Voiture obligatoire", "Trafic x2", "Pourboire 15-20%"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent MAIS cher. Assurance INDISPENSABLE.",
    visaRequired: true,
    visaDetails: "ESTA obligatoire (14$).",
    entryDocuments: "Passeport + ESTA.",
    commonScams: [{ title: "Hollywood déguisés", desc: "Photos $20-50." }],
    priceGuide: [
      { item: "Location voiture", price: "$40-80/j" },
      { item: "Parking", price: "$15-30" },
      { item: "Restaurant", price: "$30-60" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "911", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +1 310-235-3200.",
    localCustoms: ["Culture voiture", "Industrie cinéma", "Pourboire 15-20%"],
    behaviorsToAvoid: ["Aller Skid Row", "Sans voiture"]
  },

  "bali-indonesia": {
    id: "bali-indonesia",
    name: "Bali",
    country: "Indonésie",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1080",
    goSafeScore: 76,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+8 (WITA)",
    language: "Indonésien, Balinais",
    currency: "Roupie (IDR) - 1€ ≈ 17,000 IDR",
    securitySummary: "Bali relativement sûre. Arnaques courantes. Scooters DANGEREUX. Drogue = peine MORT.",
    alerts: [{ id: 1, type: "danger", title: "Drogue = MORT", summary: "Peine de mort drogue. ZÉRO tolérance.", date: "Permanent" }],
    dangerousAreas: [],
    safetyTips: ["DROGUE = MORT", "Scooter dangereux", "Blue Bird/Grab taxis", "Eau bouteille"],
    vaccines: [{ name: "Hépatite A", status: "recommended" }, { name: "Rage", status: "recommended" }],
    healthSystem: "Cliniques zones touristiques. Assurance évacuation recommandée.",
    visaRequired: false,
    visaDetails: "Visa gratuit 30 jours.",
    entryDocuments: "Passeport 6 mois.",
    commonScams: [{ title: "Taxis", desc: "Blue Bird/apps uniquement." }],
    priceGuide: [
      { item: "Scooter jour", price: "50,000 IDR (~2.90€)" },
      { item: "Nasi Goreng", price: "30,000 IDR (~1.75€)" },
      { item: "Massage 1h", price: "120,000 IDR (~7€)" }
    ],
    emergencyNumbers: [{ name: "Police", number: "110", icon: "Shield" }],
    consulateInfo: "Consulat Jakarta: +62 21 2355 7600.",
    localCustoms: ["Hindouisme balinais", "Sarong temples", "Main droite", "Pourboire 10%"],
    behaviorsToAvoid: ["Drogue", "Toucher tête", "Main gauche"]
  },

  "rio-de-janeiro-brazil": {
    id: "rio-de-janeiro-brazil",
    name: "Rio de Janeiro",
    country: "Brésil",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1080",
    goSafeScore: 62,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-3 (BRT)",
    language: "Portugais",
    currency: "Real (R$) - 1€ ≈ 5.50 R$",
    securitySummary: "Rio MAGNIFIQUE mais DANGEREUSE. Favelas INTERDITES sans guide. Vols plages. Ne portez RIEN valeur.",
    alerts: [
      { id: 1, type: "danger", title: "Favelas", summary: "JAMAIS sans guide officiel.", date: "Permanent" },
      { id: 2, type: "danger", title: "Vols plages", summary: "RIEN valeur plage.", date: "Permanent" }
    ],
    dangerousAreas: ["Favelas", "Centro nuit", "Lapa tard"],
    safetyTips: ["PLAGE: RIEN (clé + argent)", "Favelas: Guide UNIQUEMENT", "Uber soir"],
    vaccines: [{ name: "Fièvre jaune", status: "recommended" }],
    healthSystem: "Privé correct. Assurance indispensable.",
    visaRequired: false,
    visaDetails: "Pas visa 90 jours.",
    entryDocuments: "Passeport 6 mois.",
    commonScams: [{ title: "Taxis", desc: "Uber/99 uniquement." }],
    priceGuide: [
      { item: "Métro", price: "R$ 4.60 (~0.85€)" },
      { item: "Açaí", price: "R$ 20 (~3.65€)" },
      { item: "Caipirinha", price: "R$ 20 (~3.65€)" }
    ],
    emergencyNumbers: [{ name: "Police touristique", number: "1746", icon: "Shield" }],
    consulateInfo: "Consulat: +55 21 3974-6699.",
    localCustoms: ["Brésiliens chaleureux", "Plage culture", "Football"],
    behaviorsToAvoid: ["Valeur rue/plage", "Favela seul"]
  },

  "shanghai-china": {
    id: "shanghai-china",
    name: "Shanghai",
    country: "Chine",
    image: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=1080",
    goSafeScore: 85,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+8 (CST - China Standard Time)",
    language: "Mandarin chinois (Anglais limité hors zones touristiques)",
    currency: "Yuan chinois (CNY/¥) - 1€ ≈ 7.85 ¥",
    securitySummary: "Shanghai est très sûre avec une criminalité très faible. MAIS: Chine = surveillance totale (caméras faciales partout), censure internet (Google/Facebook/WhatsApp BLOQUÉS - VPN OBLIGATOIRE avant arrivée), et contrôle politique strict. Ne critiquez JAMAIS le gouvernement ou la politique - risque réel d'arrestation. Société sans cash: WeChat Pay/Alipay omniprésents (difficile pour touristes). Air pollué: masque FFP2 recommandé. Attention arnaques sophistiquées (thé/massage). Visa obligatoire + strict.",
    alerts: [
      { id: 1, type: "danger", title: "Censure internet totale", summary: "Google, WhatsApp, Facebook, Instagram, Gmail BLOQUÉS. Installez VPN AVANT arrivée (ExpressVPN, Astrill). VPN illégaux en Chine mais tolérés pour touristes.", date: "Permanent" },
      { id: 2, type: "warning", title: "Surveillance totale", summary: "Caméras reconnaissance faciale partout. Évitez ABSOLUMENT toute discussion politique. Autocensure essentielle.", date: "Permanent" },
      { id: 3, type: "info", title: "Paiements mobiles", summary: "Société quasi sans cash. WeChat Pay/Alipay omniprésents. Difficile pour touristes. Apportez yuan cash + carte internationale.", date: "Permanent" }
    ],
    dangerousAreas: [],
    safetyTips: [
      "VPN: Installez AVANT départ (ExpressVPN/Astrill) - Google/WhatsApp bloqués",
      "WeChat: Indispensable - téléchargez avant. Carte bancaire étrangère limitée",
      "Politique: NE JAMAIS critiquer gouvernement, Xi Jinping, Tibet, Taiwan, Xinjiang",
      "Pollution: AQI souvent >150. Masque FFP2 recommandé jours pollués",
      "Langue: Très peu d'anglais. Google Translate marche sans VPN pour chinois",
      "Cash: Apportez yuans cash - paiement mobile difficile pour touristes"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Hépatite A et B", status: "recommended" },
      { name: "Typhoïde", status: "recommended" },
      { name: "Encéphalite japonaise (si zones rurales)", status: "recommended" }
    ],
    healthSystem: "Excellents hôpitaux internationaux (Shanghai United, Parkway Health) MAIS très chers. Assurance voyage avec forte couverture indispensable. Évitez hôpitaux publics (barrière langue). Pharmacies nombreuses mais médicaments différents.",
    visaRequired: true,
    visaDetails: "Visa tourisme (L) obligatoire. Procédure stricte: invitation hôtel, réservations vol/hôtel, assurance obligatoire. Délai 4-7 jours. Transit 144h sans visa possible si vol international (Shanghai-Pékin-International).",
    entryDocuments: "Passeport valide 6 mois + visa chinois + réservations hôtel/vol + assurance voyage.",
    commonScams: [
      { title: "Arnaque du thé/massage", desc: "Jeunes chinois 'étudiants' abordent, invitent cérémonie thé. Addition 500-3000¥ (60-380€). SOLUTION: Refusez TOUTES invitations spontanées." },
      { title: "Faux taxis aéroport", desc: "Prix x10. SOLUTION: Apps DiDi/taxis officiels verts avec compteur." },
      { title: "Faux moines bouddhistes", desc: "Donnent 'cadeau' puis exigent don. SOLUTION: Refusez et partez." },
      { title: "Marchés touristiques prix gonflés", desc: "Yuyuan, Nanjing Road Est. SOLUTION: Négociez dur (÷5 minimum) ou ignorez." }
    ],
    priceGuide: [
      { item: "Métro (trajet unique)", price: "¥6-8" },
      { item: "Xiaolongbao (8pcs)", price: "¥35-60" },
      { item: "Restaurant local", price: "¥80-150" },
      { item: "Restaurant international", price: "¥200-450" },
      { item: "Starbucks café", price: "¥35-45" },
      { item: "Taxi (10km)", price: "¥40-60" },
      { item: "Bund/Promenade", price: "Gratuit" },
      { item: "Shanghai Tower (observatoire)", price: "¥220" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "110", icon: "Shield" },
      { name: "Urgences", number: "120", icon: "AlertCircle" },
      { name: "Pompiers", number: "119", icon: "Flame" }
    ],
    consulateInfo: "Consulat général de France: 1431 Huaihai Zhong Lu. Tél: +86 21 6103 2200. Urgences consulaires: +86 139 1654 8428.",
    localCustoms: [
      "WeChat = super-app universelle (paiement, taxi, réseaux social)",
      "Paiement mobile omniprésent - cash de moins en moins accepté",
      "Ne jamais planter baguettes dans riz (rituel funéraire)",
      "Crachat/rot en public toléré culturellement",
      "Queue = concept inexistant (bousculades normales)",
      "Carte de visite à 2 mains",
      "Chiffre 4 = malchance (mort), 8 = chance"
    ],
    behaviorsToAvoid: [
      "Critiquer gouvernement/Parti Communiste/Xi Jinping (ARRESTATION possible)",
      "Parler Tibet, Taiwan, Xinjiang, Tiananmen, Dalai Lama",
      "Utiliser VPN pour activités illégales",
      "Pointer baguettes vers quelqu'un",
      "Finir tout le plat (signe que l'hôte n'a pas assez donné)",
      "Donner horloge en cadeau (symbolise mort)",
      "Pourboire (insultant en Chine)",
      "Toucher tête de quelqu'un"
    ]
  },

  "brussels-belgium": {
    id: "brussels-belgium",
    name: "Bruxelles",
    country: "Belgique",
    image: "https://images.unsplash.com/photo-1559564484-e48bf552270e?w=1080",
    goSafeScore: 78,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Français, Néerlandais",
    currency: "Euro (€)",
    securitySummary: "Bruxelles globalement sûre. Pickpockets Grand-Place. Chocolat/bière culture.",
    alerts: [],
    dangerousAreas: ["Molenbeek nuit", "Gare Midi nuit"],
    safetyTips: ["Pickpockets Grand-Place", "Bilingue FR/NL", "Frites ≠ French fries"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Peu", desc: "Pickpockets zones touristiques." }],
    priceGuide: [
      { item: "Métro", price: "€2.10" },
      { item: "Frites", price: "€4" },
      { item: "Bière", price: "€5" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +32 2 548 87 11.",
    localCustoms: ["Bilingue FR/NL", "Bière culture", "Chocolat renommé"],
    behaviorsToAvoid: ["'French' fries", "Uniquement FR Flandre"]
  },

  "reykjavik-iceland": {
    id: "reykjavik-iceland",
    name: "Reykjavik",
    country: "Islande",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1080",
    goSafeScore: 95,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0",
    language: "Islandais (Anglais parfait)",
    currency: "Couronne (ISK) - 1€ ≈ 150 ISK",
    securitySummary: "Reykjavik = LA PLUS SÛRE. DANGERS = NATURE: Météo extrême, geysers brûlants. EXTRÊMEMENT cher.",
    alerts: [{ id: 1, type: "warning", title: "Nature", summary: "Météo changeante. Geysers 100°C. Respectez règles.", date: "Permanent" }],
    dangerousAreas: [],
    safetyTips: ["Nature = DANGER météo", "Geysers: NE TOUCHEZ PAS", "TRÈS cher x2"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Aucune", desc: "Pays le plus sûr." }],
    priceGuide: [
      { item: "Bus", price: "ISK 490 (~3.25€)" },
      { item: "Soupe", price: "ISK 1,700 (~11.35€)" },
      { item: "Restaurant", price: "ISK 4,500 (~30€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade Oslo: +47 23 28 46 00.",
    localCustoms: ["Islandais réservés", "Enlevez chaussures", "Nature sacrée"],
    behaviorsToAvoid: ["Sous-estimer nature", "Sortir chemins"]
  },

  "kuala-lumpur-malaysia": {
    id: "kuala-lumpur-malaysia",
    name: "Kuala Lumpur",
    country: "Malaisie",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1080",
    goSafeScore: 79,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+8 (MYT)",
    language: "Malais (Anglais bien parlé)",
    currency: "Ringgit (MYR) - 1€ ≈ 5 MYR",
    securitySummary: "KL globalement sûre. Pickpockets zones touristiques. Arnaques taxis. Pays musulman modéré. Bon marché.",
    alerts: [],
    dangerousAreas: ["Chow Kit tard"],
    safetyTips: ["Grab app taxis", "Pickpockets Bukit Bintang", "Tenue modeste", "Street food sûre"],
    vaccines: [{ name: "Hépatite A", status: "recommended" }],
    healthSystem: "Excellent et abordable. Tourisme médical réputé.",
    visaRequired: false,
    visaDetails: "Pas visa 90 jours.",
    entryDocuments: "Passeport 6 mois.",
    commonScams: [{ title: "Taxis", desc: "Grab uniquement." }],
    priceGuide: [
      { item: "LRT", price: "MYR 3 (~0.60€)" },
      { item: "Nasi Lemak", price: "MYR 7 (~1.40€)" },
      { item: "Restaurant", price: "MYR 30 (~6€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "999", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +60 3-2053 5500.",
    localCustoms: ["Pays musulman modéré", "Tenue modeste", "Main droite", "Multiculturel"],
    behaviorsToAvoid: ["Affection publique", "Main gauche"]
  },

  "cairo-egypt": {
    id: "cairo-egypt",
    name: "Le Caire",
    country: "Égypte",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1080",
    goSafeScore: 68,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+2 (EET)",
    language: "Arabe",
    currency: "Livre (EGP) - 1€ ≈ 54 EGP",
    securitySummary: "Le Caire nécessite vigilance. Harcèlement INTENSE. Arnaques omniprésentes. Négociation ÷ 5-10.",
    alerts: [],
    dangerousAreas: ["Zones périphériques"],
    safetyTips: ["Harcèlement: 'No' ferme", "Refusez aides", "Négociez ÷ 10", "Uber uniquement", "Eau bouteille"],
    vaccines: [{ name: "Hépatite A", status: "recommended" }],
    healthSystem: "Privé correct. Assurance recommandée.",
    visaRequired: true,
    visaDetails: "Visa arrivée 25$.",
    entryDocuments: "Passeport 6 mois.",
    commonScams: [{ title: "Faux guides", desc: "Refusez aide." }],
    priceGuide: [
      { item: "Métro", price: "EGP 5 (~0.10€)" },
      { item: "Koshary", price: "EGP 30 (~0.55€)" },
      { item: "Pyramides", price: "EGP 540 (~10€)" }
    ],
    emergencyNumbers: [{ name: "Police", number: "126", icon: "Shield" }],
    consulateInfo: "Ambassade: +20 2 3567 3200.",
    localCustoms: ["Musulman conservateur", "Tenue modeste", "Main droite", "Bakchich attendu"],
    behaviorsToAvoid: ["Tenue indécente", "Accepter aide", "Payer prix annoncés"]
  },

  "phuket-thailand": {
    id: "phuket-thailand",
    name: "Phuket",
    country: "Thaïlande",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1080",
    goSafeScore: 77,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+7 (ICT)",
    language: "Thaï",
    currency: "Baht (THB) - 1€ ≈ 38 THB",
    securitySummary: "Phuket relativement sûre. Arnaques jet-skis. Scooters DANGEREUX. Respectez bouddhisme.",
    alerts: [],
    dangerousAreas: ["Routes scooter"],
    safetyTips: ["Scooter: DANGEREUX", "Jet-ski: Photos avant/après", "Tuk-tuk: Prix fixe AVANT", "Respectez Bouddha"],
    vaccines: [{ name: "Hépatite A", status: "recommended" }],
    healthSystem: "Hôpitaux privés excellents zones touristiques.",
    visaRequired: false,
    visaDetails: "Exemption 30 jours.",
    entryDocuments: "Passeport 6 mois.",
    commonScams: [{ title: "Jet-ski", desc: "Dommages imaginaires. Photos." }],
    priceGuide: [
      { item: "Songthaew", price: "THB 40 (~1€)" },
      { item: "Pad Thai", price: "THB 80 (~2€)" },
      { item: "Massage", price: "THB 400 (~10.50€)" }
    ],
    emergencyNumbers: [{ name: "Police", number: "1155", icon: "Shield" }],
    consulateInfo: "Consulat Bangkok: +66 2 657 5100.",
    localCustoms: ["Bouddhisme", "Tête sacrée", "Wai salut", "Roi sacré"],
    behaviorsToAvoid: ["Critiquer roi", "Toucher tête", "Drogue"]
  },

  "san-francisco-usa": {
    id: "san-francisco-usa",
    name: "San Francisco",
    country: "États-Unis",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080",
    goSafeScore: 69,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-8 (PST)",
    language: "Anglais",
    currency: "Dollar ($) - 1€ ≈ 1.10$",
    securitySummary: "SF vigilance. Vols voitures ÉPIDÉMIE. Sans-abris nombreux. Évitez Tenderloin. TRÈS cher.",
    alerts: [{ id: 1, type: "danger", title: "Vols voitures", summary: "RIEN dans voiture JAMAIS.", date: "Permanent" }],
    dangerousAreas: ["Tenderloin", "Civic Center"],
    safetyTips: ["RIEN voiture", "Évitez Tenderloin", "Pourboire 15-20%"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent MAIS cher. Assurance INDISPENSABLE.",
    visaRequired: true,
    visaDetails: "ESTA (14$).",
    entryDocuments: "Passeport + ESTA.",
    commonScams: [{ title: "Vols voitures", desc: "RIEN dans voiture." }],
    priceGuide: [
      { item: "BART", price: "$3-5" },
      { item: "Sandwich", price: "$15" },
      { item: "Restaurant", price: "$40-60" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "911", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +1 415-397-4330.",
    localCustoms: ["Culture tech", "LGBTQ+ friendly", "Pourboire 15-20%"],
    behaviorsToAvoid: ["Objets voiture", "Tenderloin"]
  },

  "edinburgh-uk": {
    id: "edinburgh-uk",
    name: "Édimbourg",
    country: "Royaume-Uni",
    image: "https://images.unsplash.com/photo-1544880379-1c8770d12bf4?w=1080",
    goSafeScore: 85,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0 (BST)",
    language: "Anglais",
    currency: "Livre (£) - 1€ ≈ 0.85 £",
    securitySummary: "Édimbourg très sûre. Criminalité faible. Festival août bondé. Whisky culture.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Très sûre", "Pluie fréquente", "Festival août bondé", "Pourboire 10-15%"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "NHS excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa.",
    entryDocuments: "Passeport.",
    commonScams: [{ title: "Aucune", desc: "Très sûre." }],
    priceGuide: [
      { item: "Bus", price: "£2" },
      { item: "Fish & chips", price: "£10" },
      { item: "Pub meal", price: "£15" },
      { item: "Château", price: "£19.50" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "999", icon: "AlertCircle" }],
    consulateInfo: "Consulat Londres: +44 20 7073 1000.",
    localCustoms: ["Écossais fiers", "Whisky culture", "Festival Fringe", "Pourboire 10-15%"],
    behaviorsToAvoid: ["Confondre anglais", "Critiquer Écosse"]
  },

  "oslo-norway": {
    id: "oslo-norway",
    name: "Oslo",
    country: "Norvège",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1080",
    goSafeScore: 92,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Norvégien (Anglais parfait)",
    currency: "Couronne (NOK) - 1€ ≈ 11.50 NOK",
    securitySummary: "Oslo extrêmement sûre. Norvégiens réservés. TRÈS TRÈS cher. Nature magnifique.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Extrêmement sûre", "TRÈS cher x2", "Anglais parfait", "Nature accessible"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identit�� ou passeport.",
    commonScams: [{ title: "Aucune", desc: "Très sûre." }],
    priceGuide: [
      { item: "Métro", price: "NOK 39 (~3.40€)" },
      { item: "Fast food", price: "NOK 135 (~11.70€)" },
      { item: "Restaurant", price: "NOK 400 (~34.80€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +47 23 28 46 00.",
    localCustoms: ["Norvégiens réservés", "Ponctualité", "Nature religion", "Pourboire inclus"],
    behaviorsToAvoid: ["Se vanter", "Retard"]
  },

  "zurich-switzerland": {
    id: "zurich-switzerland",
    name: "Zurich",
    country: "Suisse",
    image: "https://images.unsplash.com/photo-1710182446717-43b01d1149d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxadXJpY2glMjBTd2l0emVybGFuZCUyMGxha2UlMjBtb3VudGFpbnN8ZW58MXx8fHwxNzcyMDI1MzQyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    goSafeScore: 93,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Allemand, Français, Italien (Anglais très répandu)",
    currency: "Franc suisse (CHF) - 1€ ≈ 0.95 CHF",
    securitySummary: "Zurich est l'une des villes les plus sûres au monde avec un taux de criminalité extrêmement faible. La ponctualité est une religion et la propreté exemplaire. Attention : c'est également l'une des villes les plus chères de la planète.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: [
      "Ville extrêmement sûre, même la nuit",
      "Respectez scrupuleusement les horaires - les Suisses sont d'une ponctualité absolue",
      "Budget élevé indispensable - comptez minimum 100€/jour pour l'hébergement",
      "Les transports publics sont d'une précision horlogère",
      "L'eau du robinet est d'excellente qualité"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" }
    ],
    healthSystem: "Système de santé suisse de classe mondiale, parmi les meilleurs d'Europe. Très performant mais extrêmement cher. Assurance voyage fortement recommandée car une simple consultation peut coûter 150-200 CHF.",
    visaRequired: false,
    visaDetails: "Pas de visa requis pour les citoyens européens (espace Schengen). Séjour jusqu'à 90 jours autorisé.",
    entryDocuments: "Carte d'identité nationale ou passeport en cours de validité suffisant pour les ressortissants UE/Schengen.",
    commonScams: [
      { 
        title: "Quasi-inexistants", 
        desc: "Zurich affiche un taux de criminalité parmi les plus bas au monde. Les arnaques touristiques sont rarissimes." 
      },
      { 
        title: "Attention aux prix", 
        desc: "Le seul 'piège' est le coût de la vie. Vérifiez toujours les prix avant de commander - ils peuvent choquer." 
      }
    ],
    priceGuide: [
      { item: "Ticket tram/bus (zone 110)", price: "CHF 4.40 (~4.65€)" },
      { item: "Pass transport 24h", price: "CHF 13.60 (~14.35€)" },
      { item: "Menu fast-food", price: "CHF 16-18 (~17-19€)" },
      { item: "Restaurant moyen", price: "CHF 25-35 (~26-37€)" },
      { item: "Restaurant gastronomique", price: "CHF 60-100 (~63-105€)" },
      { item: "Café/expresso", price: "CHF 4.50 (~4.75€)" },
      { item: "Bière (50cl bar)", price: "CHF 7-9 (~7.40-9.50€)" },
      { item: "Auberge jeunesse/nuit", price: "CHF 50-80 (~53-84€)" },
      { item: "Hôtel 3* centre/nuit", price: "CHF 150-250 (~158-263€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "117", icon: "Shield" },
      { name: "Urgences médicales", number: "144", icon: "Ambulance" },
      { name: "Pompiers", number: "118", icon: "Flame" },
      { name: "Urgences générales (EU)", number: "112", icon: "AlertCircle" }
    ],
    consulateInfo: "Ambassade de France en Suisse à Berne : +41 31 359 21 11. Consulat général de France à Zurich : +41 43 434 40 00. Schanzengasse 10, 8001 Zürich.",
    localCustoms: [
      "Ponctualité légendaire - arriver à l'heure est la base, 5 min d'avance est la norme",
      "Silence et discrétion appréciés dans les transports et lieux publics",
      "Propreté irréprochable - ne jetez rien par terre",
      "Tri des déchets très strict et contrôlé",
      "Le dimanche est sacré - les commerces sont fermés, évitez le bruit",
      "Pourboire déjà inclus dans l'addition (service compris)",
      "Serrer la main lors des présentations (regards dans les yeux)"
    ],
    behaviorsToAvoid: [
      "Être en retard même de 2 minutes",
      "Parler fort dans les transports publics",
      "Jeter des détritus par terre (amende immédiate)",
      "Faire du bruit après 22h en semaine / 23h le week-end",
      "Traverser au feu rouge même sans voiture",
      "Salir les espaces publics",
      "Se plaindre des prix ouvertement"
    ]
  },

  "dublin-ireland": {
    id: "dublin-ireland",
    name: "Dublin",
    country: "Irlande",
    image: "https://images.unsplash.com/photo-1549918864-485faa5b5ea7?w=1080",
    goSafeScore: 81,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0 (IST)",
    language: "Anglais, Gaélique",
    currency: "Euro (€)",
    securitySummary: "Dublin globalement sûre. Pickpockets Temple Bar. Irlandais très accueillants. Pubs culture.",
    alerts: [],
    dangerousAreas: ["Nord Dublin tard"],
    safetyTips: ["Pickpockets Temple Bar", "Pluie fréquente", "Pubs culture", "Irlandais accueillants"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Bon. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Peu", desc: "Pickpockets zones touristiques." }],
    priceGuide: [
      { item: "Bus", price: "€2.50" },
      { item: "Guinness", price: "€6.50" },
      { item: "Fish & chips", price: "€12" },
      { item: "Restaurant", price: "€25" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "999", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +353 1 277 5000.",
    localCustoms: ["Très accueillants", "Pubs centre social", "Guinness culture", "Pourboire 10-12%"],
    behaviorsToAvoid: ["Confondre UK", "Irish car bomb (offense)"]
  },

  "vancouver-canada": {
    id: "vancouver-canada",
    name: "Vancouver",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=1080",
    goSafeScore: 87,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-8 (PST)",
    language: "Anglais, Français",
    currency: "Dollar canadien (CAD) - 1€ ≈ 1.50 CAD",
    securitySummary: "Vancouver très sûre. Downtown Eastside problème. Nature magnifique. Multiculturel. Cher. Pluie.",
    alerts: [],
    dangerousAreas: ["Downtown Eastside"],
    safetyTips: ["Évitez DTES", "Nature accessible", "Pluie oct-mars", "Pourboire 15-18%"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Gratuit urgences.",
    visaRequired: true,
    visaDetails: "AVE (7 CAD).",
    entryDocuments: "Passeport + AVE.",
    commonScams: [{ title: "Peu", desc: "Très sûre." }],
    priceGuide: [
      { item: "SkyTrain", price: "CAD 4 (~2.65€)" },
      { item: "Sushi", price: "CAD 20 (~13.30€)" },
      { item: "Restaurant", price: "CAD 35 (~23.30€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "911", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +1 604-637-5300.",
    localCustoms: ["Canadiens polis", "Multiculturel", "Nature culture", "Cannabis légal", "Pourboire 15-18%"],
    behaviorsToAvoid: ["Confondre américains", "DTES"]
  },

  "montreal-canada": {
    id: "montreal-canada",
    name: "Montréal",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1519139270028-ab664cf42264?w=1080",
    goSafeScore: 85,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT-5 (EST)",
    language: "Français, Anglais",
    currency: "Dollar canadien (CAD) - 1€ ≈ 1.50 CAD",
    securitySummary: "Montréal très sûre. Francophone. Hiver TRÈS froid. Festivals été. Culture vivante.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Très sûre", "Français officiel", "Hiver -20°C", "Festivals", "Pourboire 15%"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Gratuit urgences.",
    visaRequired: true,
    visaDetails: "AVE (7 CAD).",
    entryDocuments: "Passeport + AVE.",
    commonScams: [{ title: "Aucune", desc: "Très sûre." }],
    priceGuide: [
      { item: "Métro", price: "CAD 3.75 (~2.50€)" },
      { item: "Poutine", price: "CAD 12 (~8€)" },
      { item: "Restaurant", price: "CAD 30 (~20€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "911", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +1 514-878-4385.",
    localCustoms: ["Francophone fier", "Bilingue", "Festivals", "Pourboire 15%"],
    behaviorsToAvoid: ["Uniquement anglais", "Sous-estimer hiver"]
  },

  "tel-aviv-israel": {
    id: "tel-aviv-israel",
    name: "Tel Aviv",
    country: "Israël",
    image: "https://images.unsplash.com/photo-1544783199-d0e1e7a82411?w=1080",
    goSafeScore: 76,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+2 (IST)",
    language: "Hébreu (Anglais bien)",
    currency: "Shekel (ILS) - 1€ ≈ 4 ILS",
    securitySummary: "Tel Aviv moderne sûre. Tensions géopolitiques. Shabbat = ville fermée vendredi soir. Cher.",
    alerts: [{ id: 1, type: "warning", title: "Tensions", summary: "Suivez actualités.", date: "Permanent" }],
    dangerousAreas: [],
    safetyTips: ["Suivez actualités", "Shabbat = fermé vendredi soir", "Plages excellentes", "Cher"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent mais cher.",
    visaRequired: false,
    visaDetails: "Pas visa 90 jours.",
    entryDocuments: "Passeport 6 mois.",
    commonScams: [{ title: "Peu", desc: "Taxis prix fixe avant." }],
    priceGuide: [
      { item: "Bus", price: "ILS 5.90 (~1.50€)" },
      { item: "Falafel", price: "ILS 25 (~6.25€)" },
      { item: "Restaurant", price: "ILS 80 (~20€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "100", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +972 3-796-8500.",
    localCustoms: ["Israéliens directs", "Shabbat sacré", "Start-up nation", "Pourboire 10-12%"],
    behaviorsToAvoid: ["Questions politiques", "Shabbat zones religieuses"]
  },

  "helsinki-finland": {
    id: "helsinki-finland",
    name: "Helsinki",
    country: "Finlande",
    image: "https://images.unsplash.com/photo-1562170223-6d5001372c0f?w=1080",
    goSafeScore: 91,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+2 (EET)",
    language: "Finnois (Anglais parfait)",
    currency: "Euro (€)",
    securitySummary: "Helsinki extrêmement sûre. Finlandais réservés. Hiver sombre. Saunas culture. Cher.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Extrêmement sûre", "Finlandais TRÈS réservés", "Hiver -15°C", "Saunas"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Aucune", desc: "Extrêmement sûre." }],
    priceGuide: [
      { item: "Tram", price: "€3" },
      { item: "Sauna", price: "€17.50" },
      { item: "Restaurant", price: "€32.50" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +358 9 618 780.",
    localCustoms: ["TRÈS réservés", "Saunas culture", "Ponctualité", "Pourboire inclus"],
    behaviorsToAvoid: ["Small talk excessif", "Retard"]
  },

  "warsaw-poland": {
    id: "warsaw-poland",
    name: "Varsovie",
    country: "Pologne",
    image: "https://images.unsplash.com/photo-1512495039889-523764de1c0f?w=1080",
    goSafeScore: 82,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Polonais",
    currency: "Zloty (PLN) - 1€ ≈ 4.30 PLN",
    securitySummary: "Varsovie sûre. Histoire WWII importante. Bon marché. Anglais limité.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Sûre", "Histoire WWII", "Bon marché", "Pourboire 10%"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Correct. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Peu", desc: "Taxis aéroport." }],
    priceGuide: [
      { item: "Métro", price: "PLN 4.40 (~1€)" },
      { item: "Pierogi", price: "PLN 25 (~5.80€)" },
      { item: "Restaurant", price: "PLN 65 (~15€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Ambassade: +48 22 529 30 00.",
    localCustoms: ["Polonais accueillants", "Histoire WWII", "Catholique", "Vodka", "Pourboire 10%"],
    behaviorsToAvoid: ["Blagues WWII", "Camps nazis/polonais"]
  },

  "seville-spain": {
    id: "seville-spain",
    name: "Séville",
    country: "Espagne",
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1080",
    goSafeScore: 83,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Espagnol",
    currency: "Euro (€)",
    securitySummary: "Séville sûre. Pickpockets. Chaleur EXTRÊME été 45°C. Tapas culture. Horaires tardifs.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Pickpockets", "Été 40-45°C", "Sieste 14h-17h", "Dîner 21h+"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Pickpockets", desc: "Zones touristiques." }],
    priceGuide: [
      { item: "Bus", price: "€1.40" },
      { item: "Tapas", price: "€4" },
      { item: "Menu día", price: "€15" },
      { item: "Flamenco", price: "€25" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +34 954 21 88 96.",
    localCustoms: ["Chaleureux", "Horaires tardifs", "Sieste", "Tapas", "Flamenco", "Pourboire 5-10%"],
    behaviorsToAvoid: ["Dîner avant 21h", "Bruit sieste"]
  },

  "krakow-poland": {
    id: "krakow-poland",
    name: "Cracovie",
    country: "Pologne",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1080",
    goSafeScore: 86,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Polonais",
    currency: "Zloty (PLN) - 1€ ≈ 4.30 PLN",
    securitySummary: "Cracovie très sûre. Médiévale magnifique. Auschwitz proche. Bon marché.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Très sûre", "Auschwitz visite", "Bon marché", "Pourboire 10%"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Correct. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Peu", desc: "Très sûre." }],
    priceGuide: [
      { item: "Tram", price: "PLN 4 (~0.95€)" },
      { item: "Pierogi", price: "PLN 21 (~4.90€)" },
      { item: "Restaurant", price: "PLN 55 (~12.80€)" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Consulat Varsovie: +48 22 529 30 00.",
    localCustoms: ["Polonais accueillants", "Histoire WWII", "Catholique", "Vodka", "Pourboire 10%"],
    behaviorsToAvoid: ["Manque respect Auschwitz", "Blagues WWII"]
  },

  "florence-italy": {
    id: "florence-italy",
    name: "Florence",
    country: "Italie",
    image: "https://images.unsplash.com/photo-1541699480209-af2d2e66e5f5?w=1080",
    goSafeScore: 79,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Italien",
    currency: "Euro (€)",
    securitySummary: "Florence sûre. Pickpockets TRÈS actifs. Arnaques restaurants. Renaissance. Bondé été.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Pickpockets TRÈS actifs", "Restaurants: Prix avant", "Bondé été", "Gelato"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Bon. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Pickpockets", desc: "Ponts/musées." }],
    priceGuide: [
      { item: "Bus", price: "€1.50" },
      { item: "Gelato", price: "€3" },
      { item: "Pizza", price: "€11" },
      { item: "Uffizi", price: "€20" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +39 055 230 2556.",
    localCustoms: ["Expressifs chaleureux", "Aperitivo 18h-20h", "Cappuccino matin", "Pourboire inclus"],
    behaviorsToAvoid: ["Cappuccino après-midi", "Toucher art", "Manger marcher"]
  },

  "porto-portugal": {
    id: "porto-portugal",
    name: "Porto",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1080",
    goSafeScore: 84,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+0 (WET)",
    language: "Portugais",
    currency: "Euro (€)",
    securitySummary: "Porto très sûre. Vin Porto célèbre. Vallonnée. Moins touristique Lisbonne. Bon marché.",
    alerts: [],
    dangerousAreas: [],
    safetyTips: ["Très sûre", "Collines raides", "Caves Porto Gaia", "Bon marché", "Pourboire 5-10%"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Bon. Carte Européenne acceptée.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Aucune", desc: "Très sûre." }],
    priceGuide: [
      { item: "Métro", price: "€1.30" },
      { item: "Francesinha", price: "€10" },
      { item: "Restaurant", price: "€16" },
      { item: "Cave Porto", price: "€11" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Consulat: +351 22 607 65 91.",
    localCustoms: ["Accueillants discrets", "Fado", "Porto fierté", "Pourboire 5-10%"],
    behaviorsToAvoid: ["Comparer Lisbonne", "Confondre espagnol"]
  },

  "nice-france": {
    id: "nice-france",
    name: "Nice",
    country: "France",
    image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1080",
    goSafeScore: 77,
    safetyLevel: "vigilance",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Français",
    currency: "Euro (€)",
    securitySummary: "Nice globalement sûre. Pickpockets TRÈS actifs Promenade. Côte d'Azur. Cher.",
    alerts: [],
    dangerousAreas: ["Gare nuit"],
    safetyTips: ["Pickpockets Promenade", "Gare vigilance", "Plage galets", "Cher"],
    vaccines: [{ name: "Aucun obligatoire", status: "none" }],
    healthSystem: "Excellent. Sécurité sociale.",
    visaRequired: false,
    visaDetails: "Pas visa UE/Schengen.",
    entryDocuments: "Carte identité ou passeport.",
    commonScams: [{ title: "Pickpockets", desc: "Zones touristiques." }],
    priceGuide: [
      { item: "Tram", price: "€1.70" },
      { item: "Socca", price: "€5" },
      { item: "Restaurant", price: "€27.50" },
      { item: "Parasol plage", price: "€20" }
    ],
    emergencyNumbers: [{ name: "Urgences", number: "112", icon: "AlertCircle" }],
    consulateInfo: "Préfecture locale.",
    localCustoms: ["Accent méditerranéen", "Socca", "Plages galets", "Carnaval", "Pourboire non obligatoire"],
    behaviorsToAvoid: ["Négliger pickpockets", "Plaindre galets"]
  },

  "prague-czech": {
    id: "prague-czech",
    name: "Prague",
    country: "République Tchèque",
    image: "https://images.unsplash.com/photo-1541849546-216549ae216d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    goSafeScore: 83,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+1 (CET)",
    language: "Tchèque (Anglais parlé zones touristiques)",
    currency: "Couronne tchèque (CZK) - 1€ ≈ 25 CZK",
    securitySummary: "Prague est une destination sûre pour les touristes. La criminalité violente est rare. Attention aux pickpockets dans les zones ultra-touristiques (Pont Charles, Place de la Vieille-Ville, tramway 22). Les arnaques aux taxis et bureaux de change sont fréquentes. Évitez les clubs de striptease du centre (factures astronomiques). Les prix sont nettement plus élevés dans les zones touristiques.",
    alerts: [],
    dangerousAreas: [
      "Žižkov la nuit (quartier alternatif)",
      "Gare principale (Hlavní nádraží) tard le soir",
      "Clubs de striptease du centre (arnaques)",
      "Wenceslas Square très tard la nuit"
    ],
    safetyTips: [
      "Pickpockets très actifs: Pont Charles, Place de la Vieille-Ville, tramway 22 - sac devant vous",
      "Taxis: Utilisez UNIQUEMENT Uber/Bolt ou appelez AAA Taxi. Taxis de rue = arnaque",
      "Change: Évitez bureaux de change touristiques (taux scandaleux). Utilisez DAB ou carte",
      "Clubs striptease du centre: ÉVITEZ. Factures 5000-10000€ avec menaces",
      "Restaurants: Vérifiez addition (couvert facturé parfois non mentionné)",
      "Bière moins chère que l'eau - profitez-en mais avec modération"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" }
    ],
    healthSystem: "Bon système de santé public. Carte Européenne d'Assurance Maladie (CEAM) acceptée pour citoyens UE. Pharmacies (lékárna) bien approvisionnées. Numéro urgence: 112.",
    visaRequired: false,
    visaDetails: "Pas de visa pour citoyens UE/Schengen pour séjours illimités. Exemption visa 90 jours pour USA, Canada, Australie, etc.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité pour UE. Passeport valide pour non-UE.",
    commonScams: [
      {
        title: "Taxis de rue",
        desc: "Prix 10-20x supérieurs au tarif normal. Compteur trafiqué. SOLUTION: Uber/Bolt uniquement ou AAA Taxi appelé par téléphone. Trajet aéroport-centre: 25-30€ max avec Uber."
      },
      {
        title: "Bureaux de change touristiques",
        desc: "Taux de change scandaleux (jusqu'à 50% de commission cachée). Affichent bon taux achat mais taux vente catastrophique. SOLUTION: Retirez au DAB ou payez par carte."
      },
      {
        title: "Clubs de striptease agressifs",
        desc: "Rabatteurs dans rue vous emmènent dans clubs avec additions 5000-10000€. Intimidation si refus de payer. SOLUTION: Ignorez tous rabatteurs. Fuyez si emmené de force."
      },
      {
        title: "Fausse police",
        desc: "Rare mais existe. 'Policiers' demandent voir portefeuille pour 'contrôle drogue/fausse monnaie'. SOLUTION: Vrais policiers en uniforme complet. Demandez aller au commissariat."
      },
      {
        title: "Restaurants attrape-touristes",
        desc: "Addition avec suppléments non mentionnés (couvert, pain, beurre). Surtout Place de la Vieille-Ville. SOLUTION: Lisez menu attentivement. Vérifiez addition ligne par ligne."
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport → centre (Uber)", price: "CZK 600-750 (24-30€)" },
      { item: "Ticket transport public 90min", price: "CZK 40 (1.60€)" },
      { item: "Pass transport 24h", price: "CZK 120 (4.80€)" },
      { item: "Bière 0.5L bar local", price: "CZK 40-60 (1.60-2.40€)" },
      { item: "Bière 0.5L zone touristique", price: "CZK 80-120 (3.20-4.80€)" },
      { item: "Restaurant local", price: "CZK 250-400 (10-16€)" },
      { item: "Restaurant touristique", price: "CZK 500-800 (20-32€)" },
      { item: "Entrée Château de Prague", price: "CZK 250-350 (10-14€)" }
    ],
    emergencyNumbers: [
      { name: "Urgences générales", number: "112", icon: "AlertCircle" },
      { name: "Police", number: "158", icon: "Shield" },
      { name: "Ambulance", number: "155", icon: "Ambulance" },
      { name: "Pompiers", number: "150", icon: "Flame" }
    ],
    consulateInfo: "Ambassade de France à Prague: Velkopřevorské náměstí 2, Praha 1. Tél: +420 251 171 711. Urgences consulaires 24h/7j disponibles.",
    localCustoms: [
      "Tchèques très fiers de leur bière (meilleure au monde selon eux)",
      "Dire 'Na zdraví' (santé) avant de boire - important culturellement",
      "Enlever chaussures en entrant chez quelqu'un",
      "Pourboire 10% au restaurant apprécié (arrondir facture)",
      "Tchèques plutôt réservés mais chaleureux une fois contact établi",
      "Apprendre 'Dobrý den' (bonjour) et 'Děkuji' (merci) très apprécié",
      "Bière moins chère que l'eau - c'est normal !"
    ],
    behaviorsToAvoid: [
      "Comparer Prague à Vienne ou Budapest (rivalité historique)",
      "Appeler République Tchèque 'Tchécoslovaquie' (n'existe plus depuis 1993)",
      "Critiquer la bière tchèque (sacrilège)",
      "Monter dans taxis de rue sans prix négocié/Uber",
      "Suivre rabatteurs vers clubs/bars",
      "Parler fort dans transports - Tchèques discrets"
    ]
  }
};