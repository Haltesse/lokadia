import { useNavigate } from "react-router";
import { Plus, Plane, Calendar, MapPin } from "lucide-react";
import { motion } from "motion/react";

const DEMO_TRIPS = [
  { id: "1", name: "Grèce & Cyclades", dates: "15 juil – 29 juil 2025", destination: "Santorini", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80", status: "upcoming" as const },
  { id: "2", name: "Japon Express", dates: "3 oct – 17 oct 2025", destination: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80", status: "planned" as const },
];

export default function TripsScreen() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 pt-14 pb-3 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Mes</p>
          <h1 className="text-2xl font-black text-slate-900">Voyages</h1>
        </div>
        <button
          onClick={() => navigate("/trips/create")}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)", boxShadow: "0 4px 16px rgba(15,76,129,0.35)" }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 flex flex-col gap-4 pb-32">
        {DEMO_TRIPS.map((trip, i) => (
          <motion.button
            key={trip.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/trips/${trip.id}`)}
            className="w-full rounded-3xl overflow-hidden bg-white shadow-sm text-left"
          >
            <div className="relative h-44">
              <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold" style={{ background: trip.status === "upcoming" ? "#10b981" : "#8b5cf6", color: "white" }}>
                {trip.status === "upcoming" ? "À venir" : "Planifié"}
              </span>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-black text-lg">{trip.name}</h3>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {trip.dates}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                {trip.destination}
              </div>
            </div>
          </motion.button>
        ))}

        {DEMO_TRIPS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Plane className="w-16 h-16 text-slate-200" />
            <p className="text-slate-500 text-sm text-center">Aucun voyage pour l'instant.<br />Commencez à planifier !</p>
            <button onClick={() => navigate("/trips/create")} className="px-6 py-3 rounded-2xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)" }}>
              Créer un voyage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
