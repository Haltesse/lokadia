// Coordonnées géographiques des destinations
export const destinationCoordinates: Record<string, { lat: number; lon: number }> = {
  // Japon
  'japan': { lat: 36.2048, lon: 138.2529 },
  'tokyo-japan': { lat: 35.6762, lon: 139.6503 },
  'kyoto-japan': { lat: 35.0116, lon: 135.7681 },
  'osaka-japan': { lat: 34.6937, lon: 135.5023 },
  'nara-japan': { lat: 34.6851, lon: 135.8050 },
  'hiroshima-japan': { lat: 34.3853, lon: 132.4553 },
  'hakone-japan': { lat: 35.2324, lon: 139.1069 },
  'nikko-japan': { lat: 36.7199, lon: 139.6982 },
  
  // France
  'france': { lat: 46.2276, lon: 2.2137 },
  'paris-france': { lat: 48.8566, lon: 2.3522 },
  'lyon-france': { lat: 45.7640, lon: 4.8357 },
  'marseille-france': { lat: 43.2965, lon: 5.3698 },
  'nice-france': { lat: 43.7102, lon: 7.2620 },
  'bordeaux-france': { lat: 44.8378, lon: -0.5792 },
  'strasbourg-france': { lat: 48.5734, lon: 7.7521 },
  'versailles-france': { lat: 48.8049, lon: 2.1204 },
  
  // Italie
  'italy': { lat: 41.8719, lon: 12.5674 },
  'rome-italy': { lat: 41.9028, lon: 12.4964 },
  'florence-italy': { lat: 43.7696, lon: 11.2558 },
  'venice-italy': { lat: 45.4408, lon: 12.3155 },
  'milan-italy': { lat: 45.4642, lon: 9.1900 },
  'naples-italy': { lat: 40.8518, lon: 14.2681 },
  'pisa-italy': { lat: 43.7228, lon: 10.4017 },
  
  // Espagne
  'spain': { lat: 40.4637, lon: -3.7492 },
  'barcelona-spain': { lat: 41.3874, lon: 2.1686 },
  'madrid-spain': { lat: 40.4168, lon: -3.7038 },
  'seville-spain': { lat: 37.3891, lon: -5.9845 },
  'valencia-spain': { lat: 39.4699, lon: -0.3763 },
  'granada-spain': { lat: 37.1773, lon: -3.5986 },
  
  // Royaume-Uni
  'uk': { lat: 55.3781, lon: -3.4360 },
  'london-uk': { lat: 51.5074, lon: -0.1278 },
  'edinburgh-uk': { lat: 55.9533, lon: -3.1883 },
  'manchester-uk': { lat: 53.4808, lon: -2.2426 },
  'liverpool-uk': { lat: 53.4084, lon: -2.9916 },
  'oxford-uk': { lat: 51.7520, lon: -1.2577 },
  
  // Allemagne
  'germany': { lat: 51.1657, lon: 10.4515 },
  'berlin-germany': { lat: 52.5200, lon: 13.4050 },
  'munich-germany': { lat: 48.1351, lon: 11.5820 },
  'hamburg-germany': { lat: 53.5511, lon: 9.9937 },
  'cologne-germany': { lat: 50.9375, lon: 6.9603 },
  'frankfurt-germany': { lat: 50.1109, lon: 8.6821 },
  
  // Grèce
  'greece': { lat: 39.0742, lon: 21.8243 },
  'athens-greece': { lat: 37.9838, lon: 23.7275 },
  'santorini-greece': { lat: 36.3932, lon: 25.4615 },
  'mykonos-greece': { lat: 37.4467, lon: 25.3289 },
  'crete-greece': { lat: 35.2401, lon: 24.8093 },
  
  // Portugal
  'portugal': { lat: 39.3999, lon: -8.2245 },
  'lisbon-portugal': { lat: 38.7223, lon: -9.1393 },
  'porto-portugal': { lat: 41.1579, lon: -8.6291 },
  
  // Pays-Bas
  'netherlands': { lat: 52.1326, lon: 5.2913 },
  'amsterdam-netherlands': { lat: 52.3676, lon: 4.9041 },
  'rotterdam-netherlands': { lat: 51.9225, lon: 4.47917 },
  
  // Belgique
  'belgium': { lat: 50.5039, lon: 4.4699 },
  'brussels-belgium': { lat: 50.8503, lon: 4.3517 },
  'bruges-belgium': { lat: 51.2093, lon: 3.2247 },
  
  // Suisse
  'switzerland': { lat: 46.8182, lon: 8.2275 },
  'zurich-switzerland': { lat: 47.3769, lon: 8.5417 },
  'geneva-switzerland': { lat: 46.2044, lon: 6.1432 },
  'interlaken-switzerland': { lat: 46.6863, lon: 7.8632 },
  
  // Autriche
  'austria': { lat: 47.5162, lon: 14.5501 },
  'vienna-austria': { lat: 48.2082, lon: 16.3738 },
  'salzburg-austria': { lat: 47.8095, lon: 13.0550 },
  
  // République Tchèque
  'czechrepublic': { lat: 49.8175, lon: 15.4730 },
  'prague-czechrepublic': { lat: 50.0755, lon: 14.4378 },
  
  // États-Unis
  'usa': { lat: 37.0902, lon: -95.7129 },
  'newyork-usa': { lat: 40.7128, lon: -74.0060 },
  'losangeles-usa': { lat: 34.0522, lon: -118.2437 },
  'sanfrancisco-usa': { lat: 37.7749, lon: -122.4194 },
  'chicago-usa': { lat: 41.8781, lon: -87.6298 },
  'miami-usa': { lat: 25.7617, lon: -80.1918 },
  'lasvegas-usa': { lat: 36.1699, lon: -115.1398 },
  
  // Canada
  'canada': { lat: 56.1304, lon: -106.3468 },
  'toronto-canada': { lat: 43.6532, lon: -79.3832 },
  'vancouver-canada': { lat: 49.2827, lon: -123.1207 },
  'montreal-canada': { lat: 45.5017, lon: -73.5673 },
  
  // Mexique
  'mexico': { lat: 23.6345, lon: -102.5528 },
  'mexicocity-mexico': { lat: 19.4326, lon: -99.1332 },
  'cancun-mexico': { lat: 21.1619, lon: -86.8515 },
  
  // Brésil
  'brazil': { lat: -14.2350, lon: -51.9253 },
  'riodejaneiro-brazil': { lat: -22.9068, lon: -43.1729 },
  'saopaulo-brazil': { lat: -23.5505, lon: -46.6333 },
  
  // Australie
  'australia': { lat: -25.2744, lon: 133.7751 },
  'sydney-australia': { lat: -33.8688, lon: 151.2093 },
  'melbourne-australia': { lat: -37.8136, lon: 144.9631 },
  
  // Thaïlande
  'thailand': { lat: 15.8700, lon: 100.9925 },
  'bangkok-thailand': { lat: 13.7563, lon: 100.5018 },
  'chiangmai-thailand': { lat: 18.7883, lon: 98.9853 },
  'phuket-thailand': { lat: 7.8804, lon: 98.3923 },
  
  // Indonésie
  'indonesia': { lat: -0.7893, lon: 113.9213 },
  'bali-indonesia': { lat: -8.3405, lon: 115.0920 },
  'jakarta-indonesia': { lat: -6.2088, lon: 106.8456 },
  
  // Singapour
  'singapore': { lat: 1.3521, lon: 103.8198 },
  
  // Vietnam
  'vietnam': { lat: 14.0583, lon: 108.2772 },
  'hanoi-vietnam': { lat: 21.0285, lon: 105.8542 },
  'hochiminh-vietnam': { lat: 10.8231, lon: 106.6297 },
  
  // Corée du Sud
  'southkorea': { lat: 35.9078, lon: 127.7669 },
  'seoul-southkorea': { lat: 37.5665, lon: 126.9780 },
  'busan-southkorea': { lat: 35.1796, lon: 129.0756 },
  
  // Chine
  'china': { lat: 35.8617, lon: 104.1954 },
  'beijing-china': { lat: 39.9042, lon: 116.4074 },
  'shanghai-china': { lat: 31.2304, lon: 121.4737 },
  
  // Inde
  'india': { lat: 20.5937, lon: 78.9629 },
  'delhi-india': { lat: 28.7041, lon: 77.1025 },
  'mumbai-india': { lat: 19.0760, lon: 72.8777 },
  
  // Émirats Arabes Unis
  'uae': { lat: 23.4241, lon: 53.8478 },
  'dubai-uae': { lat: 25.2048, lon: 55.2708 },
  'abudhabi-uae': { lat: 24.4539, lon: 54.3773 },
  
  // Maroc
  'morocco': { lat: 31.7917, lon: -7.0926 },
  'marrakech-morocco': { lat: 31.6295, lon: -7.9811 },
  'casablanca-morocco': { lat: 33.5731, lon: -7.5898 },
  
  // Égypte
  'egypt': { lat: 26.8206, lon: 30.8025 },
  'cairo-egypt': { lat: 30.0444, lon: 31.2357 },
  'luxor-egypt': { lat: 25.6872, lon: 32.6396 },
  
  // Turquie
  'turkey': { lat: 38.9637, lon: 35.2433 },
  'istanbul-turkey': { lat: 41.0082, lon: 28.9784 },
  'ankara-turkey': { lat: 39.9334, lon: 32.8597 },
  
  // Islande
  'iceland': { lat: 64.9631, lon: -19.0208 },
  'reykjavik-iceland': { lat: 64.1466, lon: -21.9426 },
  
  // Norvège
  'norway': { lat: 60.4720, lon: 8.4689 },
  'oslo-norway': { lat: 59.9139, lon: 10.7522 },
  'bergen-norway': { lat: 60.3913, lon: 5.3221 },
  
  // Suède
  'sweden': { lat: 60.1282, lon: 18.6435 },
  'stockholm-sweden': { lat: 59.3293, lon: 18.0686 },
  'gothenburg-sweden': { lat: 57.7089, lon: 11.9746 },
  
  // Danemark
  'denmark': { lat: 56.2639, lon: 9.5018 },
  'copenhagen-denmark': { lat: 55.6761, lon: 12.5683 },
  
  // Finlande
  'finland': { lat: 61.9241, lon: 25.7482 },
  'helsinki-finland': { lat: 60.1699, lon: 24.9384 },
  
  // Pologne
  'poland': { lat: 51.9194, lon: 19.1451 },
  'warsaw-poland': { lat: 52.2297, lon: 21.0122 },
  'krakow-poland': { lat: 50.0647, lon: 19.9450 },
  
  // Hongrie
  'hungary': { lat: 47.1625, lon: 19.5033 },
  'budapest-hungary': { lat: 47.4979, lon: 19.0402 },
  
  // Croatie
  'croatia': { lat: 45.1, lon: 15.2 },
  'zagreb-croatia': { lat: 45.8150, lon: 15.9819 },
  'dubrovnik-croatia': { lat: 42.6507, lon: 18.0944 },
  
  // Irlande
  'ireland': { lat: 53.4129, lon: -8.2439 },
  'dublin-ireland': { lat: 53.3498, lon: -6.2603 },
  
  // Écosse
  'scotland': { lat: 56.4907, lon: -4.2026 },
};
