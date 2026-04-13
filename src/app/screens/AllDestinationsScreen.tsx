import { useNavigate } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";

const ALL = [
  { city: "Paris", country: "France", continent: "Europe", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&q=70", safety: 82 },
  { city: "Tokyo", country: "Japon", continent: "Asie", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&q=70", safety: 95 },
  { city: "Bali", country: "Indonésie", continent: "Asie", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&q=70", safety: 78 },
  { city: "Marrakech", country: "Maroc", continent: "Afrique", image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=300&q=70", safety: 71 },
  { city: "New York", country: "États-Unis", continent: "Amériques", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&q=70", safety: 74 },
  { city: "Lisbonne", country: "Portugal", continent: "Europe", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=300&q=70", safety: 86 },
  { city: "Dubai", country: "ÉAU", continent: "Moyen-Orient", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&q=70", safety: 90 },
  { city: "Sydney", country: "Australie", continent: "Océanie", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300&q=70", safety: 88 },
];

export function AllDestinationsScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = ALL.filter((d) =>
    d.city.toLowerCase().includes(query.toLowerCase()) ||
    d.country.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="sticky top-0 bg-[#f8fafc] z-10 px-4 pt-14 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-xl font-black text-slate-900">Toutes les destinations</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-32">
        {filtered.map((dest) => (
          <button key={dest.city} onClick={() => navigate("/destination")} className="relative rounded-2xl overflow-hidden h-44 text-left">
            <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.72) 100%)" }} />
            <div
              className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: dest.safety >= 85 ? "#10b981" : dest.safety >= 70 ? "#f59e0b" : "#ef4444" }}
            >
              {dest.safety}
            </div>
            <div className="absolute bottom-3 left-3">
              <p className="text-white font-bold text-sm">{dest.city}</p>
              <p className="text-white/60 text-[11px]">{dest.country}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
