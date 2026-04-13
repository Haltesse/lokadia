import { useNavigate } from "react-router";
import { ArrowLeft, Heart, Share2, MapPin, Star, Shield, Thermometer, DollarSign, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

const INFO = [
  { icon: <Star className="w-4 h-4 text-amber-500" />, label: "Note", value: "4.9 / 5" },
  { icon: <Shield className="w-4 h-4 text-emerald-500" />, label: "Sécurité", value: "Très sûr" },
  { icon: <Thermometer className="w-4 h-4 text-orange-500" />, label: "Climat", value: "22°C moy." },
  { icon: <DollarSign className="w-4 h-4 text-blue-500" />, label: "Budget", value: "Moyen" },
];

export function DestinationScreen() {
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);
  const [tab, setTab] = useState<"overview" | "tips" | "safety">("overview");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero image */}
      <div className="relative h-72">
        <img
          src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&q=85"
          alt="Santorini"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />

        <div className="absolute top-14 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => setFav(!fav)} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
              <Heart className={`w-4 h-4 ${fav ? "fill-red-400 text-red-400" : "text-white"}`} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-5">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-cyan-300 text-xs font-semibold uppercase tracking-wider">Grèce</span>
          </div>
          <h1 className="text-white text-3xl font-black">Santorini</h1>
        </div>
      </div>

      {/* Info chips */}
      <div className="flex gap-3 px-4 py-4 overflow-x-auto hide-scrollbar">
        {INFO.map((item, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-slate-50 min-w-[72px]">
            {item.icon}
            <p className="text-slate-900 font-bold text-xs text-center">{item.value}</p>
            <p className="text-slate-400 text-[10px]">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 p-1 rounded-2xl bg-slate-100 mb-4">
        {(["overview", "tips", "safety"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: tab === t ? "white" : "transparent", color: tab === t ? "#0F4C81" : "#94a3b8", boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}
          >
            {t === "overview" ? "Aperçu" : t === "tips" ? "Conseils" : "Sécurité"}
          </button>
        ))}
      </div>

      <div className="px-5 pb-32">
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-slate-600 text-sm leading-relaxed">
              Santorini est une île volcanique des Cyclades, dans la mer Égée. Réputée pour ses maisons blanches aux toits bleus, ses couchers de soleil légendaires sur la caldeira, ses plages de sable noir et sa cuisine méditerranéenne exceptionnelle.
            </p>
          </motion.div>
        )}
        {tab === "tips" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
            {["Réservez à l'avance en haute saison (juil-août)", "Le coucher de soleil à Oia est un incontournable", "Explorez les vignobles locaux pour le vin volcanique", "Louez un quad pour explorer l'île librement"].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)" }}>{i + 1}</div>
                <p className="text-slate-700 text-sm">{tip}</p>
              </div>
            ))}
          </motion.div>
        )}
        {tab === "safety" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 p-4 rounded-2xl mb-4" style={{ background: "rgba(16,185,129,0.08)", border: "1.5px solid rgba(16,185,129,0.2)" }}>
              <Shield className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-emerald-700 text-sm">Score GoSafe™ : 87/100</p>
                <p className="text-emerald-600 text-xs mt-0.5">Destination très sûre pour les voyageurs</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">Santorini est considérée comme l'une des destinations les plus sûres d'Europe. Faible criminalité, infrastructure touristique mature et population accueillante.</p>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={() => navigate("/trips/create")}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)", boxShadow: "0 8px 24px rgba(15,76,129,0.35)" }}
        >
          Planifier ce voyage <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
