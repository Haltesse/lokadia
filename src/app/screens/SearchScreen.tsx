import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, ArrowLeft, MapPin, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface Country {
  id: string;
  name: string;
  capital: string;
  region: string;
  flag: string;
  popularCities: string[];
}

export function SearchScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // 50 pays les plus touristiques au monde
  const topCountries: Country[] = [
    { id: "france", name: "France", capital: "Paris", region: "Europe", flag: "FR", popularCities: ["Paris", "Nice", "Lyon", "Marseille"] },
    { id: "spain", name: "Espagne", capital: "Madrid", region: "Europe", flag: "ES", popularCities: ["Barcelone", "Madrid", "Séville", "Valence"] },
    { id: "usa", name: "États-Unis", capital: "Washington", region: "Amérique du Nord", flag: "US", popularCities: ["New York", "Los Angeles", "Miami", "Las Vegas"] },
    { id: "china", name: "Chine", capital: "Pékin", region: "Asie", flag: "CN", popularCities: ["Pékin", "Shanghai", "Hong Kong", "Xi'an"] },
    { id: "italy", name: "Italie", capital: "Rome", region: "Europe", flag: "IT", popularCities: ["Rome", "Venise", "Florence", "Milan"] },
    { id: "turkey", name: "Turquie", capital: "Ankara", region: "Asie/Europe", flag: "TR", popularCities: ["Istanbul", "Antalya", "Cappadoce", "Bodrum"] },
    { id: "mexico", name: "Mexique", capital: "Mexico", region: "Amérique du Nord", flag: "MX", popularCities: ["Cancún", "Mexico", "Playa del Carmen", "Tulum"] },
    { id: "thailand", name: "Thaïlande", capital: "Bangkok", region: "Asie", flag: "TH", popularCities: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"] },
    { id: "germany", name: "Allemagne", capital: "Berlin", region: "Europe", flag: "DE", popularCities: ["Berlin", "Munich", "Francfort", "Hambourg"] },
    { id: "uk", name: "Royaume-Uni", capital: "Londres", region: "Europe", flag: "GB", popularCities: ["Londres", "Édimbourg", "Manchester", "Liverpool"] },
    { id: "austria", name: "Autriche", capital: "Vienne", region: "Europe", flag: "AT", popularCities: ["Vienne", "Salzbourg", "Innsbruck", "Graz"] },
    { id: "japan", name: "Japon", capital: "Tokyo", region: "Asie", flag: "JP", popularCities: ["Tokyo", "Kyoto", "Osaka", "Hiroshima"] },
    { id: "greece", name: "Grèce", capital: "Athènes", region: "Europe", flag: "GR", popularCities: ["Athènes", "Santorin", "Mykonos", "Rhodes"] },
    { id: "malaysia", name: "Malaisie", capital: "Kuala Lumpur", region: "Asie", flag: "MY", popularCities: ["Kuala Lumpur", "Penang", "Langkawi", "Malacca"] },
    { id: "portugal", name: "Portugal", capital: "Lisbonne", region: "Europe", flag: "PT", popularCities: ["Lisbonne", "Porto", "Algarve", "Madère"] },
    { id: "russia", name: "Russie", capital: "Moscou", region: "Europe/Asie", flag: "RU", popularCities: ["Moscou", "Saint-Pétersbourg", "Kazan", "Sotchi"] },
    { id: "canada", name: "Canada", capital: "Ottawa", region: "Amérique du Nord", flag: "CA", popularCities: ["Toronto", "Vancouver", "Montréal", "Québec"] },
    { id: "poland", name: "Pologne", capital: "Varsovie", region: "Europe", flag: "PL", popularCities: ["Varsovie", "Cracovie", "Gdansk", "Wrocław"] },
    { id: "netherlands", name: "Pays-Bas", capital: "Amsterdam", region: "Europe", flag: "NL", popularCities: ["Amsterdam", "Rotterdam", "La Haye", "Utrecht"] },
    { id: "uae", name: "Émirats Arabes Unis", capital: "Abou Dhabi", region: "Moyen-Orient", flag: "AE", popularCities: ["Dubaï", "Abou Dhabi", "Sharjah", "Ras Al Khaimah"] },
    { id: "singapore", name: "Singapour", capital: "Singapour", region: "Asie", flag: "SG", popularCities: ["Singapour"] },
    { id: "south-korea", name: "Corée du Sud", capital: "Séoul", region: "Asie", flag: "KR", popularCities: ["Séoul", "Busan", "Jeju", "Incheon"] },
    { id: "indonesia", name: "Indonésie", capital: "Jakarta", region: "Asie", flag: "ID", popularCities: ["Bali", "Jakarta", "Yogyakarta", "Lombok"] },
    { id: "croatia", name: "Croatie", capital: "Zagreb", region: "Europe", flag: "HR", popularCities: ["Dubrovnik", "Split", "Zagreb", "Hvar"] },
    { id: "vietnam", name: "Vietnam", capital: "Hanoï", region: "Asie", flag: "VN", popularCities: ["Hanoï", "Hô Chi Minh-Ville", "Hoi An", "Nha Trang"] },
    { id: "morocco", name: "Maroc", capital: "Rabat", region: "Afrique", flag: "MA", popularCities: ["Marrakech", "Casablanca", "Fès", "Rabat"] },
    { id: "czech", name: "République Tchèque", capital: "Prague", region: "Europe", flag: "CZ", popularCities: ["Prague", "Brno", "Český Krumlov", "Karlovy Vary"] },
    { id: "switzerland", name: "Suisse", capital: "Berne", region: "Europe", flag: "CH", popularCities: ["Zurich", "Genève", "Berne", "Lucerne"] },
    { id: "sweden", name: "Suède", capital: "Stockholm", region: "Europe", flag: "SE", popularCities: ["Stockholm", "Göteborg", "Malmö", "Uppsala"] },
    { id: "denmark", name: "Danemark", capital: "Copenhague", region: "Europe", flag: "DK", popularCities: ["Copenhague", "Aarhus", "Odense", "Aalborg"] },
    { id: "australia", name: "Australie", capital: "Canberra", region: "Océanie", flag: "AU", popularCities: ["Sydney", "Melbourne", "Brisbane", "Perth"] },
    { id: "egypt", name: "Égypte", capital: "Le Caire", region: "Afrique", flag: "EG", popularCities: ["Le Caire", "Louxor", "Alexandrie", "Hurghada"] },
    { id: "ireland", name: "Irlande", capital: "Dublin", region: "Europe", flag: "IE", popularCities: ["Dublin", "Cork", "Galway", "Limerick"] },
    { id: "hungary", name: "Hongrie", capital: "Budapest", region: "Europe", flag: "HU", popularCities: ["Budapest", "Debrecen", "Szeged", "Pécs"] },
    { id: "belgium", name: "Belgique", capital: "Bruxelles", region: "Europe", flag: "BE", popularCities: ["Bruxelles", "Bruges", "Anvers", "Gand"] },
    { id: "brazil", name: "Brésil", capital: "Brasília", region: "Amérique du Sud", flag: "BR", popularCities: ["Rio de Janeiro", "São Paulo", "Salvador", "Brasília"] },
    { id: "argentina", name: "Argentine", capital: "Buenos Aires", region: "Amérique du Sud", flag: "AR", popularCities: ["Buenos Aires", "Mendoza", "Córdoba", "Bariloche"] },
    { id: "iceland", name: "Islande", capital: "Reykjavik", region: "Europe", flag: "IS", popularCities: ["Reykjavik", "Akureyri", "Vik", "Höfn"] },
    { id: "norway", name: "Norvège", capital: "Oslo", region: "Europe", flag: "NO", popularCities: ["Oslo", "Bergen", "Tromsø", "Stavanger"] },
    { id: "finland", name: "Finlande", capital: "Helsinki", region: "Europe", flag: "FI", popularCities: ["Helsinki", "Rovaniemi", "Tampere", "Turku"] },
    { id: "new-zealand", name: "Nouvelle-Zélande", capital: "Wellington", region: "Océanie", flag: "NZ", popularCities: ["Auckland", "Wellington", "Queenstown", "Christchurch"] },
    { id: "south-africa", name: "Afrique du Sud", capital: "Pretoria", region: "Afrique", flag: "ZA", popularCities: ["Le Cap", "Johannesburg", "Durban", "Pretoria"] },
    { id: "india", name: "Inde", capital: "New Delhi", region: "Asie", flag: "IN", popularCities: ["New Delhi", "Mumbai", "Jaipur", "Agra"] },
    { id: "peru", name: "Pérou", capital: "Lima", region: "Amérique du Sud", flag: "PE", popularCities: ["Lima", "Cusco", "Machu Picchu", "Arequipa"] },
    { id: "chile", name: "Chili", capital: "Santiago", region: "Amérique du Sud", flag: "CL", popularCities: ["Santiago", "Valparaíso", "Atacama", "Patagonie"] },
    { id: "colombia", name: "Colombie", capital: "Bogotá", region: "Amérique du Sud", flag: "CO", popularCities: ["Bogotá", "Carthagène", "Medellín", "Cali"] },
    { id: "philippines", name: "Philippines", capital: "Manille", region: "Asie", flag: "PH", popularCities: ["Manille", "Cebu", "Boracay", "Palawan"] },
    { id: "sri-lanka", name: "Sri Lanka", capital: "Colombo", region: "Asie", flag: "LK", popularCities: ["Colombo", "Kandy", "Galle", "Ella"] },
    { id: "maldives", name: "Maldives", capital: "Malé", region: "Asie", flag: "MV", popularCities: ["Malé", "Atoll de Baa", "Atoll d'Ari", "Maafushi"] },
    { id: "jordan", name: "Jordanie", capital: "Amman", region: "Moyen-Orient", flag: "JO", popularCities: ["Amman", "Petra", "Wadi Rum", "Aqaba"] },
  ];

  const filteredCountries = topCountries.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(query) ||
      country.capital.toLowerCase().includes(query) ||
      country.popularCities.some((city) => city.toLowerCase().includes(query))
    );
  });

  // Mapper country ID vers destination ID (basé sur la capitale)
  const mapCountryToDestinationId = (country: Country): string => {
    const mapping: Record<string, string> = {
      "france": "paris-france",
      "japan": "tokyo-japan",
      "usa": "new-york-usa",
      "uk": "london-uk",
      "uae": "dubai-uae",
      "spain": "barcelona-spain",
      "netherlands": "amsterdam-netherlands",
      "singapore": "singapore-singapore",
      "portugal": "lisbon-portugal",
      "czech": "prague-czech",
      "austria": "vienna-austria",
      "greece": "athens-greece",
      "turkey": "istanbul-turkey",
      "thailand": "bangkok-thailand",
      "germany": "berlin-germany",
      "australia": "sydney-australia",
      "italy": "rome-italy",
      "morocco": "marrakech-morocco",
      "south-korea": "seoul-south-korea",
      "denmark": "copenhagen-denmark",
      "mexico": "mexico-city-mexico",
      "malaysia": "kuala-lumpur-malaysia",
      "russia": "moscow-russia",
      "canada": "toronto-canada",
      "poland": "warsaw-poland",
      "egypt": "cairo-egypt",
      "ireland": "dublin-ireland",
      "hungary": "budapest-hungary",
      "belgium": "brussels-belgium",
      "brazil": "rio-de-janeiro-brazil",
      "argentina": "buenos-aires-argentina",
      "iceland": "reykjavik-iceland",
      "norway": "oslo-norway",
      "finland": "helsinki-finland",
      "new-zealand": "auckland-new-zealand",
      "south-africa": "cape-town-south-africa",
      "india": "new-delhi-india",
      "peru": "lima-peru",
      "chile": "santiago-chile",
      "colombia": "bogota-colombia",
      "philippines": "manila-philippines",
      "sri-lanka": "colombo-sri-lanka",
      "maldives": "male-maldives",
      "jordan": "amman-jordan",
      "china": "shanghai-china",
      "indonesia": "bali-indonesia",
      "croatia": "dubrovnik-croatia",
      "vietnam": "hanoi-vietnam",
      "switzerland": "zurich-switzerland",
      "sweden": "stockholm-sweden",
    };
    
    return mapping[country.id] || "paris-france"; // Fallback to Paris
  };

  const handleCountryClick = (country: Country) => {
    // Navigue vers la page destination avec l'ID dans l'URL
    const destinationId = mapCountryToDestinationId(country);
    console.log("🔍 SearchScreen - Pays cliqué:", country.name, "ID:", country.id);
    console.log("🔍 SearchScreen - Destination ID mappé:", destinationId);
    console.log("📍 Historique avant navigation:", window.history.length);
    navigate(`/destination/${destinationId}`);
    console.log("📍 Historique après navigate():", window.history.length);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Header with Search */}
      <div className="sticky top-0 z-10 px-6 pt-12 pb-6 bg-white">
        <button
          onClick={() => {
            console.log("🔙 Retour cliqué - Navigation vers la page précédente");
            navigate(-1);
          }}
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform active:scale-95 mb-4"
          style={{ borderColor: "var(--lokadia-deep-blue)" }}
        >
          <ArrowLeft className="h-5 w-5" style={{ color: "var(--lokadia-deep-blue)" }} />
        </button>

        <div className="bg-white border-2 rounded-2xl p-4 flex items-center gap-3 shadow-md" style={{ borderColor: "#000000" }}>
          <Search className="h-5 w-5 flex-shrink-0" style={{ color: "#000000" }} />
          <input
            type="text"
            placeholder="Rechercher un pays ou une ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-base text-black"
            autoFocus
          />
        </div>

        <p className="font-semibold text-base mt-3 text-black">
          {filteredCountries.length} {filteredCountries.length > 1 ? "destinations" : "destination"}
        </p>
      </div>

      {/* Countries List */}
      <div className="px-6 py-4 space-y-3">
        {filteredCountries.map((country) => (
          <button
            key={country.id}
            onClick={() => handleCountryClick(country)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm transition-transform active:scale-98 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{country.flag}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--lokadia-text-dark)" }}>
                  {country.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: "var(--lokadia-text-light)" }} />
                  <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                    {country.region} • {country.capital}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <TrendingUp className="h-4 w-4 flex-shrink-0" style={{ color: "var(--lokadia-blue)" }} />
                  <div className="flex flex-wrap gap-2">
                    {country.popularCities.slice(0, 3).map((city, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: "var(--lokadia-soft-white)",
                          color: "var(--lokadia-blue)",
                        }}
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}

        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4" style={{ color: "var(--lokadia-text-light)" }} />
            <p className="text-lg font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Aucune destination trouvée
            </p>
            <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
              Essayez avec un autre nom de pays ou ville
            </p>
          </div>
        )}
      </div>
    </div>
  );
}