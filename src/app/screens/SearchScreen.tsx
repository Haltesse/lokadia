import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, X, MapPin, Clock } from "lucide-react";

const POPULAR = [
  { city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&q=70" },
  { city: "Tokyo", country: "Japon", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=70" },
  { city: "New York", country: "États-Unis", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=200&q=70" },
  { city: "Barcelone", country: "Espagne", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=200&q=70" },
  { city: "Sydney", country: "Australie", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=200&q=70" },
  { city: "Amsterdam", country: "Pays-Bas", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=200&q=70" },
];

export function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const recent = ["Bali", "Santorini", "Lisbonne"];

  const filtered = POPULAR.filter((d) =>
    d.city.toLowerCase().includes(query.toLowerCase()) || d.country.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 px-4 pt-14 pb-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
              placeholder="Destination, pays, ville…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && <button onClick={() => setQuery("")}><X className="w-4 h-4 text-slate-400" /></button>}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {!query && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Récents</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button key={r} onClick={() => setQuery(r)} className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-bold text-slate-900">{query ? `Résultats pour "${query}"` : "Destinations populaires"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((dest) => (
            <button
              key={dest.city}
              onClick={() => navigate("/destination")}
              className="relative rounded-2xl overflow-hidden h-32 text-left"
            >
              <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-bold text-sm">{dest.city}</p>
                <p className="text-white/70 text-xs">{dest.country}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
