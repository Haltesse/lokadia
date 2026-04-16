/**
 * Villes disponibles comme étapes de voyage.
 * Inclut toutes les villes des fiches destination (allDestinations) ET des villes
 * supplémentaires qui n'ont pas de fiche complète mais sont pertinentes comme stop.
 * Chaque ville a un nom, un pays et optionnellement des coordonnées.
 */

export interface StopCity {
  id: string;
  name: string;
  country: string;
  lat?: number;
  lon?: number;
}

export const STOP_CITIES: StopCity[] = [
  // ─── France ───
  { id: 'paris-france', name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { id: 'lyon-france', name: 'Lyon', country: 'France', lat: 45.7640, lon: 4.8357 },
  { id: 'marseille-france', name: 'Marseille', country: 'France', lat: 43.2965, lon: 5.3698 },
  { id: 'nice-france', name: 'Nice', country: 'France', lat: 43.7102, lon: 7.2620 },
  { id: 'bordeaux-france', name: 'Bordeaux', country: 'France', lat: 44.8378, lon: -0.5792 },
  { id: 'strasbourg-france', name: 'Strasbourg', country: 'France', lat: 48.5734, lon: 7.7521 },
  { id: 'toulouse-france', name: 'Toulouse', country: 'France', lat: 43.6047, lon: 1.4442 },
  { id: 'nantes-france', name: 'Nantes', country: 'France', lat: 47.2184, lon: -1.5536 },
  { id: 'montpellier-france', name: 'Montpellier', country: 'France', lat: 43.6108, lon: 3.8767 },
  { id: 'lille-france', name: 'Lille', country: 'France', lat: 50.6292, lon: 3.0573 },
  { id: 'rennes-france', name: 'Rennes', country: 'France', lat: 48.1173, lon: -1.6778 },
  { id: 'annecy-france', name: 'Annecy', country: 'France', lat: 45.8992, lon: 6.1294 },
  { id: 'avignon-france', name: 'Avignon', country: 'France', lat: 43.9493, lon: 4.8055 },
  { id: 'colmar-france', name: 'Colmar', country: 'France', lat: 48.0794, lon: 7.3558 },
  { id: 'biarritz-france', name: 'Biarritz', country: 'France', lat: 43.4832, lon: -1.5586 },
  { id: 'versailles-france', name: 'Versailles', country: 'France', lat: 48.8049, lon: 2.1204 },
  { id: 'aix-france', name: 'Aix-en-Provence', country: 'France', lat: 43.5297, lon: 5.4474 },
  { id: 'cannes-france', name: 'Cannes', country: 'France', lat: 43.5528, lon: 7.0174 },

  // ─── Japon ───
  { id: 'tokyo-japan', name: 'Tokyo', country: 'Japon', lat: 35.6762, lon: 139.6503 },
  { id: 'kyoto-japan', name: 'Kyoto', country: 'Japon', lat: 35.0116, lon: 135.7681 },
  { id: 'osaka-japan', name: 'Osaka', country: 'Japon', lat: 34.6937, lon: 135.5023 },
  { id: 'nara-japan', name: 'Nara', country: 'Japon', lat: 34.6851, lon: 135.8050 },
  { id: 'hiroshima-japan', name: 'Hiroshima', country: 'Japon', lat: 34.3853, lon: 132.4553 },
  { id: 'hakone-japan', name: 'Hakone', country: 'Japon', lat: 35.2324, lon: 139.1069 },
  { id: 'nikko-japan', name: 'Nikko', country: 'Japon', lat: 36.7199, lon: 139.6982 },
  { id: 'fukuoka-japan', name: 'Fukuoka', country: 'Japon', lat: 33.5904, lon: 130.4017 },
  { id: 'sapporo-japan', name: 'Sapporo', country: 'Japon', lat: 43.0618, lon: 141.3545 },
  { id: 'kobe-japan', name: 'Kobe', country: 'Japon', lat: 34.6901, lon: 135.1956 },
  { id: 'yokohama-japan', name: 'Yokohama', country: 'Japon', lat: 35.4437, lon: 139.6380 },
  { id: 'kanazawa-japan', name: 'Kanazawa', country: 'Japon', lat: 36.5613, lon: 136.6562 },
  { id: 'nagoya-japan', name: 'Nagoya', country: 'Japon', lat: 35.1815, lon: 136.9066 },
  { id: 'okinawa-japan', name: 'Okinawa', country: 'Japon', lat: 26.3344, lon: 127.8056 },

  // ─── Italie ───
  { id: 'rome-italy', name: 'Rome', country: 'Italie', lat: 41.9028, lon: 12.4964 },
  { id: 'florence-italy', name: 'Florence', country: 'Italie', lat: 43.7696, lon: 11.2558 },
  { id: 'venice-italy', name: 'Venise', country: 'Italie', lat: 45.4408, lon: 12.3155 },
  { id: 'milan-italy', name: 'Milan', country: 'Italie', lat: 45.4642, lon: 9.1900 },
  { id: 'naples-italy', name: 'Naples', country: 'Italie', lat: 40.8518, lon: 14.2681 },
  { id: 'pisa-italy', name: 'Pise', country: 'Italie', lat: 43.7228, lon: 10.4017 },
  { id: 'turin-italy', name: 'Turin', country: 'Italie', lat: 45.0703, lon: 7.6869 },
  { id: 'bologna-italy', name: 'Bologne', country: 'Italie', lat: 44.4949, lon: 11.3426 },
  { id: 'verona-italy', name: 'Vérone', country: 'Italie', lat: 45.4384, lon: 10.9916 },
  { id: 'amalfi-italy', name: 'Côte Amalfitaine', country: 'Italie', lat: 40.6340, lon: 14.6027 },
  { id: 'cinque-terre-italy', name: 'Cinque Terre', country: 'Italie', lat: 44.1061, lon: 9.7265 },
  { id: 'siena-italy', name: 'Sienne', country: 'Italie', lat: 43.3188, lon: 11.3308 },
  { id: 'palermo-italy', name: 'Palerme', country: 'Italie', lat: 38.1157, lon: 13.3615 },
  { id: 'sardinia-italy', name: 'Sardaigne', country: 'Italie', lat: 39.2238, lon: 9.1217 },

  // ─── Espagne ───
  { id: 'barcelona-spain', name: 'Barcelone', country: 'Espagne', lat: 41.3874, lon: 2.1686 },
  { id: 'madrid-spain', name: 'Madrid', country: 'Espagne', lat: 40.4168, lon: -3.7038 },
  { id: 'seville-spain', name: 'Séville', country: 'Espagne', lat: 37.3891, lon: -5.9845 },
  { id: 'valencia-spain', name: 'Valence', country: 'Espagne', lat: 39.4699, lon: -0.3763 },
  { id: 'granada-spain', name: 'Grenade', country: 'Espagne', lat: 37.1773, lon: -3.5986 },
  { id: 'malaga-spain', name: 'Malaga', country: 'Espagne', lat: 36.7213, lon: -4.4214 },
  { id: 'bilbao-spain', name: 'Bilbao', country: 'Espagne', lat: 43.2630, lon: -2.9350 },
  { id: 'ibiza-spain', name: 'Ibiza', country: 'Espagne', lat: 38.9067, lon: 1.4206 },
  { id: 'mallorca-spain', name: 'Majorque', country: 'Espagne', lat: 39.5696, lon: 2.6502 },
  { id: 'tenerife-spain', name: 'Tenerife', country: 'Espagne', lat: 28.2916, lon: -16.6291 },
  { id: 'san-sebastian-spain', name: 'Saint-Sébastien', country: 'Espagne', lat: 43.3183, lon: -1.9812 },

  // ─── Allemagne ───
  { id: 'berlin-germany', name: 'Berlin', country: 'Allemagne', lat: 52.5200, lon: 13.4050 },
  { id: 'munich-germany', name: 'Munich', country: 'Allemagne', lat: 48.1351, lon: 11.5820 },
  { id: 'hamburg-germany', name: 'Hambourg', country: 'Allemagne', lat: 53.5511, lon: 9.9937 },
  { id: 'cologne-germany', name: 'Cologne', country: 'Allemagne', lat: 50.9375, lon: 6.9603 },
  { id: 'frankfurt-germany', name: 'Francfort', country: 'Allemagne', lat: 50.1109, lon: 8.6821 },
  { id: 'dusseldorf-germany', name: 'Düsseldorf', country: 'Allemagne', lat: 51.2277, lon: 6.7735 },
  { id: 'dresden-germany', name: 'Dresde', country: 'Allemagne', lat: 51.0504, lon: 13.7373 },
  { id: 'heidelberg-germany', name: 'Heidelberg', country: 'Allemagne', lat: 49.3988, lon: 8.6724 },

  // ─── Royaume-Uni ───
  { id: 'london-uk', name: 'Londres', country: 'Royaume-Uni', lat: 51.5074, lon: -0.1278 },
  { id: 'edinburgh-uk', name: 'Édimbourg', country: 'Royaume-Uni', lat: 55.9533, lon: -3.1883 },
  { id: 'manchester-uk', name: 'Manchester', country: 'Royaume-Uni', lat: 53.4808, lon: -2.2426 },
  { id: 'liverpool-uk', name: 'Liverpool', country: 'Royaume-Uni', lat: 53.4084, lon: -2.9916 },
  { id: 'oxford-uk', name: 'Oxford', country: 'Royaume-Uni', lat: 51.7520, lon: -1.2577 },
  { id: 'cambridge-uk', name: 'Cambridge', country: 'Royaume-Uni', lat: 52.2053, lon: 0.1218 },
  { id: 'bath-uk', name: 'Bath', country: 'Royaume-Uni', lat: 51.3811, lon: -2.3590 },
  { id: 'york-uk', name: 'York', country: 'Royaume-Uni', lat: 53.9591, lon: -1.0815 },
  { id: 'brighton-uk', name: 'Brighton', country: 'Royaume-Uni', lat: 50.8225, lon: -0.1372 },

  // ─── Portugal ───
  { id: 'lisbon-portugal', name: 'Lisbonne', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { id: 'porto-portugal', name: 'Porto', country: 'Portugal', lat: 41.1579, lon: -8.6291 },
  { id: 'faro-portugal', name: 'Faro (Algarve)', country: 'Portugal', lat: 37.0194, lon: -7.9322 },
  { id: 'sintra-portugal', name: 'Sintra', country: 'Portugal', lat: 38.7980, lon: -9.3880 },
  { id: 'madeira-portugal', name: 'Madère', country: 'Portugal', lat: 32.6669, lon: -16.9241 },
  { id: 'azores-portugal', name: 'Açores', country: 'Portugal', lat: 37.7412, lon: -25.6756 },

  // ─── Pays-Bas ───
  { id: 'amsterdam-netherlands', name: 'Amsterdam', country: 'Pays-Bas', lat: 52.3676, lon: 4.9041 },
  { id: 'rotterdam-netherlands', name: 'Rotterdam', country: 'Pays-Bas', lat: 51.9225, lon: 4.4792 },
  { id: 'utrecht-netherlands', name: 'Utrecht', country: 'Pays-Bas', lat: 52.0907, lon: 5.1214 },
  { id: 'den-haag-netherlands', name: 'La Haye', country: 'Pays-Bas', lat: 52.0705, lon: 4.3007 },

  // ─── Belgique ───
  { id: 'brussels-belgium', name: 'Bruxelles', country: 'Belgique', lat: 50.8503, lon: 4.3517 },
  { id: 'bruges-belgium', name: 'Bruges', country: 'Belgique', lat: 51.2093, lon: 3.2247 },
  { id: 'ghent-belgium', name: 'Gand', country: 'Belgique', lat: 51.0543, lon: 3.7174 },
  { id: 'antwerp-belgium', name: 'Anvers', country: 'Belgique', lat: 51.2194, lon: 4.4025 },

  // ─── Suisse ───
  { id: 'zurich-switzerland', name: 'Zurich', country: 'Suisse', lat: 47.3769, lon: 8.5417 },
  { id: 'geneva-switzerland', name: 'Genève', country: 'Suisse', lat: 46.2044, lon: 6.1432 },
  { id: 'interlaken-switzerland', name: 'Interlaken', country: 'Suisse', lat: 46.6863, lon: 7.8632 },
  { id: 'lucerne-switzerland', name: 'Lucerne', country: 'Suisse', lat: 47.0502, lon: 8.3093 },
  { id: 'bern-switzerland', name: 'Berne', country: 'Suisse', lat: 46.9480, lon: 7.4474 },
  { id: 'zermatt-switzerland', name: 'Zermatt', country: 'Suisse', lat: 46.0207, lon: 7.7491 },

  // ─── Autriche ───
  { id: 'vienna-austria', name: 'Vienne', country: 'Autriche', lat: 48.2082, lon: 16.3738 },
  { id: 'salzburg-austria', name: 'Salzbourg', country: 'Autriche', lat: 47.8095, lon: 13.0550 },
  { id: 'innsbruck-austria', name: 'Innsbruck', country: 'Autriche', lat: 47.2692, lon: 11.4041 },
  { id: 'hallstatt-austria', name: 'Hallstatt', country: 'Autriche', lat: 47.5622, lon: 13.6493 },

  // ─── Grèce ───
  { id: 'athens-greece', name: 'Athènes', country: 'Grèce', lat: 37.9838, lon: 23.7275 },
  { id: 'santorini-greece', name: 'Santorin', country: 'Grèce', lat: 36.3932, lon: 25.4615 },
  { id: 'mykonos-greece', name: 'Mykonos', country: 'Grèce', lat: 37.4467, lon: 25.3289 },
  { id: 'crete-greece', name: 'Crète', country: 'Grèce', lat: 35.2401, lon: 24.8093 },
  { id: 'rhodes-greece', name: 'Rhodes', country: 'Grèce', lat: 36.4340, lon: 28.2176 },
  { id: 'corfu-greece', name: 'Corfou', country: 'Grèce', lat: 39.6243, lon: 19.9217 },
  { id: 'thessaloniki-greece', name: 'Thessalonique', country: 'Grèce', lat: 40.6401, lon: 22.9444 },

  // ─── Pologne ───
  { id: 'warsaw-poland', name: 'Varsovie', country: 'Pologne', lat: 52.2297, lon: 21.0122 },
  { id: 'krakow-poland', name: 'Cracovie', country: 'Pologne', lat: 50.0647, lon: 19.9450 },
  { id: 'gdansk-poland', name: 'Gdansk', country: 'Pologne', lat: 54.3520, lon: 18.6466 },
  { id: 'wroclaw-poland', name: 'Wroclaw', country: 'Pologne', lat: 51.1079, lon: 17.0385 },

  // ─── République tchèque ───
  { id: 'prague-czechrepublic', name: 'Prague', country: 'République tchèque', lat: 50.0755, lon: 14.4378 },
  { id: 'cesky-krumlov-czechrepublic', name: 'Český Krumlov', country: 'République tchèque', lat: 48.8127, lon: 14.3175 },
  { id: 'brno-czechrepublic', name: 'Brno', country: 'République tchèque', lat: 49.1951, lon: 16.6068 },

  // ─── Hongrie ───
  { id: 'budapest-hungary', name: 'Budapest', country: 'Hongrie', lat: 47.4979, lon: 19.0402 },

  // ─── Croatie ───
  { id: 'dubrovnik-croatia', name: 'Dubrovnik', country: 'Croatie', lat: 42.6507, lon: 18.0944 },
  { id: 'split-croatia', name: 'Split', country: 'Croatie', lat: 43.5081, lon: 16.4402 },
  { id: 'zagreb-croatia', name: 'Zagreb', country: 'Croatie', lat: 45.8150, lon: 15.9819 },
  { id: 'plitvice-croatia', name: 'Lacs de Plitvice', country: 'Croatie', lat: 44.8654, lon: 15.5820 },

  // ─── Scandinavie ───
  { id: 'copenhagen-denmark', name: 'Copenhague', country: 'Danemark', lat: 55.6761, lon: 12.5683 },
  { id: 'aarhus-denmark', name: 'Aarhus', country: 'Danemark', lat: 56.1629, lon: 10.2039 },
  { id: 'stockholm-sweden', name: 'Stockholm', country: 'Suède', lat: 59.3293, lon: 18.0686 },
  { id: 'gothenburg-sweden', name: 'Göteborg', country: 'Suède', lat: 57.7089, lon: 11.9746 },
  { id: 'oslo-norway', name: 'Oslo', country: 'Norvège', lat: 59.9139, lon: 10.7522 },
  { id: 'bergen-norway', name: 'Bergen', country: 'Norvège', lat: 60.3913, lon: 5.3221 },
  { id: 'tromso-norway', name: 'Tromsø', country: 'Norvège', lat: 69.6496, lon: 18.9560 },
  { id: 'helsinki-finland', name: 'Helsinki', country: 'Finlande', lat: 60.1699, lon: 24.9384 },
  { id: 'rovaniemi-finland', name: 'Rovaniemi', country: 'Finlande', lat: 66.5039, lon: 25.7294 },
  { id: 'reykjavik-iceland', name: 'Reykjavik', country: 'Islande', lat: 64.1466, lon: -21.9426 },

  // ─── Irlande ───
  { id: 'dublin-ireland', name: 'Dublin', country: 'Irlande', lat: 53.3498, lon: -6.2603 },
  { id: 'galway-ireland', name: 'Galway', country: 'Irlande', lat: 53.2707, lon: -9.0568 },
  { id: 'cork-ireland', name: 'Cork', country: 'Irlande', lat: 51.8985, lon: -8.4756 },

  // ─── Turquie ───
  { id: 'istanbul-turkey', name: 'Istanbul', country: 'Turquie', lat: 41.0082, lon: 28.9784 },
  { id: 'cappadocia-turkey', name: 'Cappadoce', country: 'Turquie', lat: 38.6431, lon: 34.8289 },
  { id: 'antalya-turkey', name: 'Antalya', country: 'Turquie', lat: 36.8969, lon: 30.7133 },
  { id: 'izmir-turkey', name: 'Izmir', country: 'Turquie', lat: 38.4237, lon: 27.1428 },
  { id: 'bodrum-turkey', name: 'Bodrum', country: 'Turquie', lat: 37.0344, lon: 27.4305 },

  // ─── Maroc ───
  { id: 'marrakech-morocco', name: 'Marrakech', country: 'Maroc', lat: 31.6295, lon: -7.9811 },
  { id: 'casablanca-morocco', name: 'Casablanca', country: 'Maroc', lat: 33.5731, lon: -7.5898 },
  { id: 'fes-morocco', name: 'Fès', country: 'Maroc', lat: 34.0181, lon: -5.0078 },
  { id: 'chefchaouen-morocco', name: 'Chefchaouen', country: 'Maroc', lat: 35.1714, lon: -5.2697 },
  { id: 'essaouira-morocco', name: 'Essaouira', country: 'Maroc', lat: 31.5085, lon: -9.7595 },

  // ─── Égypte ───
  { id: 'cairo-egypt', name: 'Le Caire', country: 'Égypte', lat: 30.0444, lon: 31.2357 },
  { id: 'luxor-egypt', name: 'Louxor', country: 'Égypte', lat: 25.6872, lon: 32.6396 },
  { id: 'aswan-egypt', name: 'Assouan', country: 'Égypte', lat: 24.0889, lon: 32.8998 },
  { id: 'sharm-egypt', name: 'Sharm el-Sheikh', country: 'Égypte', lat: 27.9158, lon: 34.3300 },

  // ─── Émirats Arabes Unis ───
  { id: 'dubai-uae', name: 'Dubaï', country: 'Émirats Arabes Unis', lat: 25.2048, lon: 55.2708 },
  { id: 'abudhabi-uae', name: 'Abu Dhabi', country: 'Émirats Arabes Unis', lat: 24.4539, lon: 54.3773 },

  // ─── Israël ───
  { id: 'tel-aviv-israel', name: 'Tel Aviv', country: 'Israël', lat: 32.0853, lon: 34.7818 },
  { id: 'jerusalem-israel', name: 'Jérusalem', country: 'Israël', lat: 31.7683, lon: 35.2137 },

  // ─── Inde ───
  { id: 'delhi-india', name: 'Delhi', country: 'Inde', lat: 28.7041, lon: 77.1025 },
  { id: 'mumbai-india', name: 'Mumbai', country: 'Inde', lat: 19.0760, lon: 72.8777 },
  { id: 'jaipur-india', name: 'Jaipur', country: 'Inde', lat: 26.9124, lon: 75.7873 },
  { id: 'agra-india', name: 'Agra', country: 'Inde', lat: 27.1767, lon: 78.0081 },
  { id: 'goa-india', name: 'Goa', country: 'Inde', lat: 15.2993, lon: 74.1240 },
  { id: 'varanasi-india', name: 'Varanasi', country: 'Inde', lat: 25.3176, lon: 82.9739 },

  // ─── Thaïlande ───
  { id: 'bangkok-thailand', name: 'Bangkok', country: 'Thaïlande', lat: 13.7563, lon: 100.5018 },
  { id: 'chiangmai-thailand', name: 'Chiang Mai', country: 'Thaïlande', lat: 18.7883, lon: 98.9853 },
  { id: 'phuket-thailand', name: 'Phuket', country: 'Thaïlande', lat: 7.8804, lon: 98.3923 },
  { id: 'krabi-thailand', name: 'Krabi', country: 'Thaïlande', lat: 8.0863, lon: 98.9063 },
  { id: 'koh-samui-thailand', name: 'Koh Samui', country: 'Thaïlande', lat: 9.5120, lon: 100.0136 },
  { id: 'ayutthaya-thailand', name: 'Ayutthaya', country: 'Thaïlande', lat: 14.3692, lon: 100.5877 },
  { id: 'chiang-rai-thailand', name: 'Chiang Rai', country: 'Thaïlande', lat: 19.9105, lon: 99.8406 },

  // ─── Vietnam ───
  { id: 'hanoi-vietnam', name: 'Hanoï', country: 'Vietnam', lat: 21.0285, lon: 105.8542 },
  { id: 'hochiminh-vietnam', name: 'Hô-Chi-Minh', country: 'Vietnam', lat: 10.8231, lon: 106.6297 },
  { id: 'halong-vietnam', name: 'Baie d\'Ha Long', country: 'Vietnam', lat: 20.9601, lon: 107.0422 },
  { id: 'hoi-an-vietnam', name: 'Hoi An', country: 'Vietnam', lat: 15.8801, lon: 108.3380 },
  { id: 'danang-vietnam', name: 'Da Nang', country: 'Vietnam', lat: 16.0544, lon: 108.2022 },

  // ─── Indonésie ───
  { id: 'bali-indonesia', name: 'Bali', country: 'Indonésie', lat: -8.3405, lon: 115.0920 },
  { id: 'jakarta-indonesia', name: 'Jakarta', country: 'Indonésie', lat: -6.2088, lon: 106.8456 },
  { id: 'yogyakarta-indonesia', name: 'Yogyakarta', country: 'Indonésie', lat: -7.7956, lon: 110.3695 },
  { id: 'lombok-indonesia', name: 'Lombok', country: 'Indonésie', lat: -8.6500, lon: 116.3249 },

  // ─── Singapour ───
  { id: 'singapore', name: 'Singapour', country: 'Singapour', lat: 1.3521, lon: 103.8198 },

  // ─── Malaisie ───
  { id: 'kuala-lumpur-malaysia', name: 'Kuala Lumpur', country: 'Malaisie', lat: 3.1390, lon: 101.6869 },
  { id: 'langkawi-malaysia', name: 'Langkawi', country: 'Malaisie', lat: 6.3500, lon: 99.8000 },
  { id: 'penang-malaysia', name: 'Penang', country: 'Malaisie', lat: 5.4164, lon: 100.3327 },

  // ─── Corée du Sud ───
  { id: 'seoul-southkorea', name: 'Séoul', country: 'Corée du Sud', lat: 37.5665, lon: 126.9780 },
  { id: 'busan-southkorea', name: 'Busan', country: 'Corée du Sud', lat: 35.1796, lon: 129.0756 },
  { id: 'jeju-southkorea', name: 'Jeju', country: 'Corée du Sud', lat: 33.4996, lon: 126.5312 },
  { id: 'gyeongju-southkorea', name: 'Gyeongju', country: 'Corée du Sud', lat: 35.8562, lon: 129.2250 },

  // ─── Chine ───
  { id: 'beijing-china', name: 'Pékin', country: 'Chine', lat: 39.9042, lon: 116.4074 },
  { id: 'shanghai-china', name: 'Shanghai', country: 'Chine', lat: 31.2304, lon: 121.4737 },
  { id: 'xian-china', name: 'Xi\'an', country: 'Chine', lat: 34.3416, lon: 108.9398 },
  { id: 'guilin-china', name: 'Guilin', country: 'Chine', lat: 25.2744, lon: 110.2900 },

  // ─── Chine (RAS) ───
  { id: 'hongkong', name: 'Hong Kong', country: 'Chine (RAS)', lat: 22.3193, lon: 114.1694 },
  { id: 'macau', name: 'Macao', country: 'Chine (RAS)', lat: 22.1987, lon: 113.5439 },

  // ─── États-Unis ───
  { id: 'newyork-usa', name: 'New York', country: 'États-Unis', lat: 40.7128, lon: -74.0060 },
  { id: 'losangeles-usa', name: 'Los Angeles', country: 'États-Unis', lat: 34.0522, lon: -118.2437 },
  { id: 'sanfrancisco-usa', name: 'San Francisco', country: 'États-Unis', lat: 37.7749, lon: -122.4194 },
  { id: 'chicago-usa', name: 'Chicago', country: 'États-Unis', lat: 41.8781, lon: -87.6298 },
  { id: 'miami-usa', name: 'Miami', country: 'États-Unis', lat: 25.7617, lon: -80.1918 },
  { id: 'lasvegas-usa', name: 'Las Vegas', country: 'États-Unis', lat: 36.1699, lon: -115.1398 },
  { id: 'boston-usa', name: 'Boston', country: 'États-Unis', lat: 42.3601, lon: -71.0589 },
  { id: 'washington-usa', name: 'Washington D.C.', country: 'États-Unis', lat: 38.9072, lon: -77.0369 },
  { id: 'seattle-usa', name: 'Seattle', country: 'États-Unis', lat: 47.6062, lon: -122.3321 },
  { id: 'neworleans-usa', name: 'La Nouvelle-Orléans', country: 'États-Unis', lat: 29.9511, lon: -90.0715 },
  { id: 'hawaii-usa', name: 'Hawaï', country: 'États-Unis', lat: 19.8968, lon: -155.5828 },

  // ─── Canada ───
  { id: 'toronto-canada', name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { id: 'vancouver-canada', name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
  { id: 'montreal-canada', name: 'Montréal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
  { id: 'quebec-canada', name: 'Québec', country: 'Canada', lat: 46.8139, lon: -71.2080 },
  { id: 'calgary-canada', name: 'Calgary', country: 'Canada', lat: 51.0447, lon: -114.0719 },
  { id: 'banff-canada', name: 'Banff', country: 'Canada', lat: 51.1784, lon: -115.5708 },
  { id: 'ottawa-canada', name: 'Ottawa', country: 'Canada', lat: 45.4215, lon: -75.6972 },

  // ─── Mexique ───
  { id: 'mexicocity-mexico', name: 'Mexico', country: 'Mexique', lat: 19.4326, lon: -99.1332 },
  { id: 'cancun-mexico', name: 'Cancún', country: 'Mexique', lat: 21.1619, lon: -86.8515 },
  { id: 'playa-del-carmen-mexico', name: 'Playa del Carmen', country: 'Mexique', lat: 20.6296, lon: -87.0739 },
  { id: 'oaxaca-mexico', name: 'Oaxaca', country: 'Mexique', lat: 17.0732, lon: -96.7266 },
  { id: 'tulum-mexico', name: 'Tulum', country: 'Mexique', lat: 20.2116, lon: -87.4654 },

  // ─── Argentine ───
  { id: 'buenosaires-argentina', name: 'Buenos Aires', country: 'Argentine', lat: -34.6037, lon: -58.3816 },
  { id: 'mendoza-argentina', name: 'Mendoza', country: 'Argentine', lat: -32.8895, lon: -68.8458 },
  { id: 'patagonia-argentina', name: 'Patagonie', country: 'Argentine', lat: -41.8101, lon: -68.9063 },
  { id: 'iguazu-argentina', name: 'Iguazú', country: 'Argentine', lat: -25.6953, lon: -54.4367 },

  // ─── Brésil ───
  { id: 'riodejaneiro-brazil', name: 'Rio de Janeiro', country: 'Brésil', lat: -22.9068, lon: -43.1729 },
  { id: 'saopaulo-brazil', name: 'São Paulo', country: 'Brésil', lat: -23.5505, lon: -46.6333 },
  { id: 'salvador-brazil', name: 'Salvador de Bahia', country: 'Brésil', lat: -12.9714, lon: -38.5124 },
  { id: 'florianopolis-brazil', name: 'Florianópolis', country: 'Brésil', lat: -27.5949, lon: -48.5482 },

  // ─── Australie ───
  { id: 'sydney-australia', name: 'Sydney', country: 'Australie', lat: -33.8688, lon: 151.2093 },
  { id: 'melbourne-australia', name: 'Melbourne', country: 'Australie', lat: -37.8136, lon: 144.9631 },
  { id: 'cairns-australia', name: 'Cairns', country: 'Australie', lat: -16.9186, lon: 145.7781 },
  { id: 'brisbane-australia', name: 'Brisbane', country: 'Australie', lat: -27.4705, lon: 153.0260 },
  { id: 'perth-australia', name: 'Perth', country: 'Australie', lat: -31.9505, lon: 115.8605 },
  { id: 'adelaide-australia', name: 'Adélaïde', country: 'Australie', lat: -34.9285, lon: 138.6007 },

  // ─── Afrique du Sud ───
  { id: 'capetown-southafrica', name: 'Le Cap', country: 'Afrique du Sud', lat: -33.9249, lon: 18.4241 },
  { id: 'johannesburg-southafrica', name: 'Johannesburg', country: 'Afrique du Sud', lat: -26.2041, lon: 28.0473 },
  { id: 'durban-southafrica', name: 'Durban', country: 'Afrique du Sud', lat: -29.8587, lon: 31.0218 },
  { id: 'kruger-southafrica', name: 'Parc Kruger', country: 'Afrique du Sud', lat: -23.9884, lon: 31.5547 },

  // ─── Russie ───
  { id: 'moscow-russia', name: 'Moscou', country: 'Russie', lat: 55.7558, lon: 37.6173 },
  { id: 'stpetersburg-russia', name: 'Saint-Pétersbourg', country: 'Russie', lat: 59.9311, lon: 30.3609 },
];

/** Index par pays pour un accès rapide */
export const STOP_CITIES_BY_COUNTRY: Record<string, StopCity[]> = {};
for (const city of STOP_CITIES) {
  if (!STOP_CITIES_BY_COUNTRY[city.country]) {
    STOP_CITIES_BY_COUNTRY[city.country] = [];
  }
  STOP_CITIES_BY_COUNTRY[city.country].push(city);
}
