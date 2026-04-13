import { useNavigate } from "react-router";
import { ChevronRight, LogOut, Globe, DollarSign, Bell, Shield, Star, BookOpen, Heart, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MENU = [
  { icon: <BookOpen className="w-4 h-4" />, label: "Mes publications", path: "/my-posts", color: "#8b5cf6" },
  { icon: <Heart className="w-4 h-4" />, label: "Favoris", path: "/favorites", color: "#ef4444" },
  { icon: <Users className="w-4 h-4" />, label: "Abonnements", path: "/followed", color: "#0F4C81" },
  { icon: <Globe className="w-4 h-4" />, label: "Langue", path: "/profile", color: "#06B6D4" },
  { icon: <DollarSign className="w-4 h-4" />, label: "Devise", path: "/profile", color: "#10b981" },
  { icon: <Bell className="w-4 h-4" />, label: "Notifications", path: "/profile", color: "#f59e0b" },
  { icon: <Shield className="w-4 h-4" />, label: "Confidentialité", path: "/profile", color: "#64748b" },
  { icon: <Star className="w-4 h-4" />, label: "Premium", path: "/premium", color: "#f59e0b" },
];

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-6">Profil</h1>
        <div className="flex items-center gap-4">
          <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`} alt="Avatar" className="w-20 h-20 rounded-3xl shadow-md" />
          <div>
            <h2 className="text-xl font-black text-slate-900">{user?.name || "Voyageur"}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <button onClick={() => navigate("/premium")} className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}>
              <Star className="w-3 h-3" /> Passer Premium
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-5 mb-6">
        {[["12", "Voyages"], ["48", "Favoris"], ["231", "Abonnés"]].map(([val, label]) => (
          <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-xl font-black text-slate-900">{val}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="px-4 flex flex-col gap-1 pb-32">
        {MENU.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white shadow-sm mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: item.color }}>
              {item.icon}
            </div>
            <span className="flex-1 text-sm font-semibold text-slate-700 text-left">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        ))}
        <button
          onClick={async () => { await signOut(); navigate("/login"); }}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 mt-2"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-100">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="flex-1 text-sm font-semibold text-red-500 text-left">Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
