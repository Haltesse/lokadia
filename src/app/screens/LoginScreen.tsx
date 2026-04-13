import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginScreen() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      navigate("/global-home");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    await signIn("demo@lokadia.app", "demo");
    navigate("/global-home");
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a0f1e 0%, #0F4C81 60%, #06B6D4 100%)" }}
    >
      {/* Hero image overlay */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,15,30,0.3) 0%, rgba(10,15,30,0.85) 60%, rgba(10,15,30,0.98) 100%)" }} />

      {/* Top section */}
      <div className="relative flex flex-col items-center pt-20 pb-8 px-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <svg width="34" height="34" viewBox="0 0 52 52" fill="none">
              <path d="M26 4C17.163 4 10 11.163 10 20c0 13.5 16 28 16 28s16-14.5 16-28c0-8.837-7.163-16-16-16z" fill="white" fillOpacity="0.9" />
              <circle cx="26" cy="20" r="6" fill="#06B6D4" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Lokadia</h1>
          <p className="text-white/60 text-sm text-center">Explorez le monde en toute sérénité</p>
        </motion.div>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 24 }}
        className="relative flex-1 mx-4 rounded-t-[32px] overflow-hidden"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="p-6 pb-10">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "rgba(15,76,129,0.06)" }}>
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: mode === tab ? "linear-gradient(135deg,#0F4C81,#134074)" : "transparent",
                  color: mode === tab ? "white" : "#64748b",
                  boxShadow: mode === tab ? "0 4px 12px rgba(15,76,129,0.3)" : "none",
                }}
              >
                {tab === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Votre prénom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-sm mt-2 transition-all active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#0F4C81,#134074)", boxShadow: "0 8px 24px rgba(15,76,129,0.35)" }}
            >
              {loading ? "Chargement…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-slate-700 font-semibold text-sm border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-60"
          >
            Continuer en démo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
