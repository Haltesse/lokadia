import { useNavigate } from "react-router";
import { ArrowLeft, Heart, Share2, MapPin, Star, Shield, Thermometer, DollarSign, ChevronRight, Camera, Utensils, Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const GALLERY = [
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=90",
  "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=90",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=90",
  "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800&q=90",
];

const INFO = [
  { icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500" />, label: "Note", value: "4.9" },
  { icon: <Shield className="w-4 h-4 text-emerald-500" />, label: "GoSafe", value: "87" },
  { icon: <Thermometer className="w-4 h-4 text-orange-500" />, label: "Climat", value: "24°C" },
  { icon: <DollarSign className="w-4 h-4 text-blue-500" />, label: "Budget", value: "Moyen" },
];

const HIGHLIGHTS = [
  { icon: <Camera className="w-4 h-4" />, title: "Coucher de soleil a Oia", desc: "Le plus celebre du monde" },
  { icon: <Utensils className="w-4 h-4" />, title: "Gastronomie locale", desc: "Fruits de mer, feta, vin" },
  { icon: <Clock className="w-4 h-4" />, title: "Meilleure periode", desc: "Juin a Septembre" },
];

export function DestinationScreen() {
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);
  const [tab, setTab] = useState<"overview" | "tips" | "safety">("overview");
  const [galleryIdx, setGalleryIdx] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero gallery */}
      <div className="relative h-80">
        <AnimatePresence mode="wait">
          <motion.img
            key={galleryIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            src={GALLERY[galleryIdx]}
            alt="Santorini"
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, rgba(0,0,0,0.5) 100%)" }} />

        {/* Nav */}
        <div className="absolute top-14 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => setFav(!fav)} className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all" style={{ background: fav ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Heart className={`w-4 h-4 ${fav ? "fill-red-400 text-red-400" : "text-white"}`} />
            </button>
          </div>
        </div>

        {/* Gallery dots */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {GALLERY.map((_, i) => (
            <button key={i} onClick={() => setGalleryIdx(i)} className="rounded-full transition-all" style={{ width: i === galleryIdx ? 20 : 6, height: 6, background: i === galleryIdx ? "white" : "rgba(255,255,255,0.5)" }} />
          ))}
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-cyan-300 text-[11px] font-bold tracking-[0.15em] uppercase">Grece</span>
          </div>
          <h1 className="text-white text-3xl font-black tracking-tight drop-shadow-lg">Santorini</h1>
        </div>
      </div>

      {/* Pull-up card */}
      <div className="relative -mt-4 bg-white rounded-t-[28px] z-10">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Info chips */}
        <div className="flex gap-2.5 px-5 pb-4 overflow-x-auto hide-scrollbar">
          {INFO.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
              style={{ background: "#f8fafc", border: "1.5px solid rgba(15,76,129,0.06)" }}
            >
              {item.icon}
              <div>
                <p className="text-slate-900 font-bold text-xs">{item.value}</p>
                <p className="text-slate-400 text-[9px] font-semibold">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-5 p-1 rounded-2xl mb-4" style={{ background: "rgba(15,76,129,0.04)" }}>
          {(["overview", "tips", "safety"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: tab === t ? "white" : "transparent",
                color: tab === t ? "#0F4C81" : "#94a3b8",
                boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {t === "overview" ? "Apercu" : t === "tips" ? "Conseils" : "Securite"}
            </button>
          ))}
        </div>

        <div className="px-5 pb-36">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">
                  Santorini est une ile volcanique des Cyclades, dans la mer Egee. Reputee pour ses maisons blanches aux toits bleus, ses couchers de soleil legendaires sur la caldeira et sa cuisine mediterraneenne exceptionnelle.
                </p>

                <h3 className="text-slate-900 font-bold text-sm mb-3">Points forts</h3>
                <div className="flex flex-col gap-2.5">
                  {HIGHLIGHTS.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8fafc]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)" }}>
                        {h.icon}
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold text-xs">{h.title}</p>
                        <p className="text-slate-400 text-[11px]">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {tab === "tips" && (
              <motion.div key="tips" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                {["Reservez a l'avance en haute saison (juil-aout)", "Le coucher de soleil a Oia est un incontournable", "Explorez les vignobles locaux pour le vin volcanique", "Louez un quad pour explorer l'ile librement", "Goutez le tomatokeftedes (beignets de tomate)"].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-[#f8fafc]">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)" }}>{i + 1}</div>
                    <p className="text-slate-700 text-sm pt-0.5">{tip}</p>
                  </div>
                ))}
              </motion.div>
            )}
            {tab === "safety" && (
              <motion.div key="safety" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 p-4 rounded-2xl mb-4" style={{ background: "rgba(16,185,129,0.06)", border: "1.5px solid rgba(16,185,129,0.15)" }}>
                  <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}>
                    <span className="text-white font-black text-lg">87</span>
                    <span className="text-white/80 text-[8px] font-bold">/100</span>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-700 text-sm">GoSafe Index</p>
                    <p className="text-emerald-600 text-xs mt-0.5">Destination tres sure pour les voyageurs</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">Santorini est consideree comme l'une des destinations les plus sures d'Europe. Faible criminalite, infrastructure touristique mature et population accueillante.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-8 pt-5" style={{ background: "linear-gradient(to top, white 60%, transparent)" }}>
        <button
          onClick={() => navigate("/trips/create")}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)", boxShadow: "0 8px 28px rgba(15,76,129,0.4)" }}
        >
          Planifier ce voyage <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
