import { useNavigate } from "react-router";
import { ArrowLeft, Check, Zap, Shield, Globe, Star } from "lucide-react";

const FEATURES = [
  { icon: <Globe className="w-5 h-5" />, text: "Traduction en temps réel (9 langues)" },
  { icon: <Shield className="w-5 h-5" />, text: "Score GoSafe™ en détail pour 200+ destinations" },
  { icon: <Star className="w-5 h-5" />, text: "Alertes de voyage prioritaires" },
  { icon: <Zap className="w-5 h-5" />, text: "Planification illimitée de voyages" },
  { icon: <Check className="w-5 h-5" />, text: "Checklists personnalisées par IA" },
];

export function Premium() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="px-5 text-center pb-8">
        <div className="text-5xl mb-4">👑</div>
        <h1 className="text-3xl font-black mb-2">Lokadia Premium</h1>
        <p className="text-white/60 text-sm">Voyagez sans limites</p>
      </div>
      <div className="px-5 mb-8">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5">
            <div className="text-cyan-400">{f.icon}</div>
            <p className="text-white/80 text-sm">{f.text}</p>
          </div>
        ))}
      </div>
      <div className="px-5 flex flex-col gap-3 pb-32">
        <button className="w-full py-4 rounded-2xl font-bold text-sm" style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)", boxShadow: "0 8px 24px rgba(245,158,11,0.4)" }}>
          Annuel — 39,99€/an <span className="opacity-70 font-normal ml-1">(-33%)</span>
        </button>
        <button className="w-full py-4 rounded-2xl font-bold text-sm border border-white/20 text-white/80">
          Mensuel — 4,99€/mois
        </button>
      </div>
    </div>
  );
}
