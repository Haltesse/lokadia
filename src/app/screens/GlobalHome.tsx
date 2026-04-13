import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Star, Heart, TrendingUp, ChevronRight, Bell, Compass, Sparkles, Clock, Users, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguageSafe } from "../context/LanguageContext";

/* ─── Data ────────────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    id: 1,
    city: "Santorini",
    country: "Grèce",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=90",
    tagline: "Couchers de soleil légendaires sur la caldeira",
    rating: 4.9,
    price: "650€",
    badge: "Top destination",
    badgeColor: "#f59e0b",
  },
  {
    id: 2,
    city: "Kyoto",
    country: "Japon",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=90",
    tagline: "Temples séculaires et jardins de sérénité",
    rating: 4.8,
    price: "890€",
    badge: "Culture",
    badgeColor: "#8b5cf6",
  },
  {
    id: 3,
    city: "Marrakech",
    country: "Maroc",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&q=90",
    tagline: "Souks envoûtants et riads de charme",
    rating: 4.7,
    price: "320€",
    badge: "Meilleur prix",
    badgeColor: "#10b981",
  },
  {
    id: 4,
    city: "Bali",
    country: "Indonésie",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=90",
    tagline: "Rizières, temples et plages de rêve",
    rating: 4.9,
    price: "780€",
    badge: "Paradis",
    badgeColor: "#06b6d4",
  },
  {
    id: 5,
    city: "Amalfi",
    country: "Italie",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1200&q=90",
    tagline: "Villages colorés sur la côte méditerranéenne",
    rating: 4.8,
    price: "550€",
    badge: "Romantique",
    badgeColor: "#ec4899",
  },
];

const TRENDING = [
  { id: 1, city: "Lisbonne", country: "Portugal", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=500&q=85", rating: 4.7, tag: "Coup de coeur", tagColor: "#ec4899" },
  { id: 2, city: "Dubai", country: "EAU", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=85", rating: 4.8, tag: "Luxe", tagColor: "#f59e0b" },
  { id: 3, city: "Cappadoce", country: "Turquie", image: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=500&q=85", rating: 4.9, tag: "Unique", tagColor: "#8b5cf6" },
  { id: 4, city: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&q=85", rating: 5.0, tag: "Paradis", tagColor: "#06b6d4" },
  { id: 5, city: "Patagonie", country: "Argentine", image: "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=500&q=85", rating: 4.8, tag: "Aventure", tagColor: "#22c55e" },
];

const CATEGORIES = [
  { icon: "🏖️", label: "Plages", color: "#0ea5e9" },
  { icon: "🏔️", label: "Montagnes", color: "#22c55e" },
  { icon: "🏙️", label: "Villes", color: "#8b5cf6" },
  { icon: "🏛️", label: "Culture", color: "#f59e0b" },
  { icon: "🌿", label: "Nature", color: "#10b981" },
  { icon: "🍜", label: "Gastronomie", color: "#ef4444" },
  { icon: "💎", label: "Luxe", color: "#7c3aed" },
  { icon: "🎒", label: "Backpack", color: "#0891b2" },
];

const INSPIRATION = [
  { title: "Week-end romantique", subtitle: "Paris, Venise, Prague", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500&q=85", gradient: "from-rose-500/80 to-purple-600/80" },
  { title: "Aventure extrême", subtitle: "Islande, Norvège, NZ", image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=500&q=85", gradient: "from-emerald-500/80 to-cyan-600/80" },
  { title: "Plages paradisiaques", subtitle: "Seychelles, Bora Bora", image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=500&q=85", gradient: "from-sky-400/80 to-blue-600/80" },
];

/* ─── Hero Slideshow ────────────────────────────────────────── */
function HeroSlideshow() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const next = useCallback(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), []);

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "78vw", maxHeight: 380 }}>
      {/* Slides */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.city}
            className="w-full h-full object-cover animate-ken-burns"
            draggable={false}
          />
          {/* Multi-layer gradient */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.8) 100%)` }} />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at bottom left, rgba(15,76,129,0.3) 0%, transparent 60%)` }} />
        </motion.div>
      </AnimatePresence>

      {/* Badge top left */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-bold shadow-lg" style={{ background: slide.badgeColor }}>
          <Sparkles className="w-3 h-3" />
          {slide.badge}
        </div>
      </div>

      {/* Bell top right */}
      <div className="absolute top-4 right-4 z-10">
        <button className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Bell className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-cyan-300 text-[11px] font-bold tracking-[0.15em] uppercase">{slide.country}</span>
            </div>
            <h2 className="text-white text-3xl font-black tracking-tight mb-1.5 drop-shadow-lg">{slide.city}</h2>
            <p className="text-white/70 text-[13px] mb-4 leading-relaxed max-w-[260px]">{slide.tagline}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold text-xs">{slide.rating}</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-white" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                  {slide.price}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFavorites((f) => f.includes(slide.id) ? f.filter((x) => x !== slide.id) : [...f, slide.id])}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: favorites.includes(slide.id) ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <Heart className={`w-4 h-4 transition-all ${favorites.includes(slide.id) ? "fill-red-400 text-red-400" : "text-white"}`} />
                </button>
                <button
                  onClick={() => navigate("/destination")}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)", boxShadow: "0 4px 20px rgba(6,182,212,0.45)" }}
                >
                  Explorer <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar indicators */}
      <div className="absolute top-[52px] left-4 right-4 flex gap-1.5 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { clearInterval(intervalRef.current); setCurrent(i); intervalRef.current = setInterval(next, 5000); }}
            className="flex-1 h-[3px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "white" }}
              initial={false}
              animate={{
                width: i < current ? "100%" : i === current ? "100%" : "0%",
                opacity: i <= current ? 1 : 0,
              }}
              transition={i === current ? { duration: 5, ease: "linear" } : { duration: 0.3 }}
            />
          </button>
        ))}
      </div>

      {/* Swipe touch handlers */}
      <div
        className="absolute inset-0 z-20"
        style={{ touchAction: "pan-y" }}
        onMouseDown={(e) => {
          const startX = e.clientX;
          const up = () => { document.removeEventListener("mouseup", up); document.removeEventListener("mousemove", move); };
          const move = (ev: MouseEvent) => {
            if (Math.abs(ev.clientX - startX) > 40) {
              ev.clientX > startX ? prev() : next();
              up();
            }
          };
          document.addEventListener("mousemove", move);
          document.addEventListener("mouseup", up);
        }}
        onTouchStart={(e) => {
          const startX = e.touches[0].clientX;
          const end = (ev: TouchEvent) => {
            const dx = ev.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) dx > 0 ? prev() : next();
            document.removeEventListener("touchend", end);
          };
          document.addEventListener("touchend", end);
        }}
      />
    </div>
  );
}

/* ─── Category Pills ───────────────────────────────────────── */
function CategoryPills() {
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar px-5 py-1">
      {CATEGORIES.map((cat, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.93 }}
          onClick={() => setActive(i)}
          className="flex flex-col items-center gap-1.5 min-w-[64px] py-2 rounded-2xl flex-shrink-0 transition-all"
          style={{
            background: active === i ? cat.color : "white",
            color: active === i ? "white" : "#475569",
            boxShadow: active === i ? `0 4px 14px ${cat.color}40` : "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <span className="text-xl">{cat.icon}</span>
          <span className="text-[10px] font-bold">{cat.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Trending Card ─────────────────────────────────────────── */
function TrendingCard({ dest, index }: { dest: (typeof TRENDING)[0]; index: number }) {
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 22 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate("/destination")}
      className="relative flex-shrink-0 rounded-3xl overflow-hidden"
      style={{ width: 155, height: 210, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.8) 100%)" }} />

      {/* Tag */}
      <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg text-[9px] font-bold text-white shadow-sm" style={{ background: dest.tagColor }}>
        {dest.tag}
      </div>

      {/* Fav */}
      <button
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-90"
        style={{ background: fav ? "rgba(239,68,68,0.25)" : "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}
        onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
      >
        <Heart className={`w-3.5 h-3.5 transition-all ${fav ? "fill-red-400 text-red-400" : "text-white"}`} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
        <p className="text-white font-bold text-[13px] leading-tight">{dest.city}</p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-white/60 text-[10px]">{dest.country}</p>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span className="text-white text-[10px] font-bold">{dest.rating}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Inspiration Card ──────────────────────────────────────── */
function InspirationCard({ item, index }: { item: (typeof INSPIRATION)[0]; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate("/all-destinations")}
      className="relative w-full rounded-3xl overflow-hidden"
      style={{ height: 130, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
    >
      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient}`} />
      <div className="absolute inset-0 flex flex-col justify-center px-5">
        <h3 className="text-white font-black text-lg tracking-tight">{item.title}</h3>
        <p className="text-white/80 text-xs mt-1">{item.subtitle}</p>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <ChevronRight className="w-5 h-5 text-white/60" />
      </div>
    </motion.button>
  );
}

/* ─── Stats Section ─────────────────────────────────────────── */
function QuickStats() {
  const stats = [
    { icon: <MapPin className="w-4 h-4" />, value: "200+", label: "Destinations", color: "#0F4C81" },
    { icon: <Shield className="w-4 h-4" />, value: "87", label: "Score moy.", color: "#10b981" },
    { icon: <Users className="w-4 h-4" />, value: "15K+", label: "Voyageurs", color: "#8b5cf6" },
    { icon: <Clock className="w-4 h-4" />, value: "24/7", label: "Alertes", color: "#f59e0b" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 px-5">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.05 }}
          className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-white"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: s.color }}>
            {s.icon}
          </div>
          <span className="text-slate-900 font-black text-sm">{s.value}</span>
          <span className="text-slate-400 text-[9px] font-semibold">{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export function GlobalHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const langCtx = useLanguageSafe();
  const t = langCtx?.t;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon apres-midi";
    return "Bonsoir";
  })();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">{greeting}</p>
            <h1 className="text-slate-900 text-xl font-black mt-0.5">
              {user?.name || "Voyageur"}
            </h1>
          </div>
          <button onClick={() => navigate("/profile")} className="relative">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
              alt="Avatar"
              className="w-12 h-12 rounded-2xl object-cover shadow-md"
              style={{ border: "2.5px solid white" }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-[2.5px] border-[#f8fafc]" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-5 pb-4">
        <button
          onClick={() => navigate("/search")}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.99]"
          style={{ background: "white", border: "1.5px solid rgba(15,76,129,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)" }}>
            <Search className="w-4 h-4 text-white" />
          </div>
          <span className="text-slate-400 text-sm flex-1 text-left">{t?.home?.search || "Ou voulez-vous aller ?"}</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold" style={{ background: "rgba(15,76,129,0.06)", color: "#0F4C81" }}>
            <Compass className="w-3 h-3" />
            Explorer
          </div>
        </button>
      </div>

      {/* Hero Slideshow */}
      <div className="px-4 pb-5">
        <div className="rounded-3xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(15,76,129,0.15), 0 4px 12px rgba(6,182,212,0.1)" }}>
          <HeroSlideshow />
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-5">
        <QuickStats />
      </div>

      {/* Categories */}
      <div className="mb-5">
        <div className="px-5 mb-3">
          <h2 className="text-slate-900 font-bold text-[15px]">Explorer par theme</h2>
        </div>
        <CategoryPills />
      </div>

      {/* Trending section */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(15,76,129,0.08)" }}>
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h2 className="text-slate-900 font-bold text-[15px]">Tendances</h2>
          </div>
          <button
            onClick={() => navigate("/all-destinations")}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(15,76,129,0.06)" }}
          >
            {t?.home?.seeAll || "Voir tout"} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-3.5 overflow-x-auto hide-scrollbar pb-2">
          {TRENDING.map((dest, i) => (
            <TrendingCard key={dest.id} dest={dest} index={i} />
          ))}
        </div>
      </div>

      {/* Inspiration section */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.08)" }}>
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <h2 className="text-slate-900 font-bold text-[15px]">Inspiration</h2>
        </div>
        <div className="flex flex-col gap-3">
          {INSPIRATION.map((item, i) => (
            <InspirationCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* GoSafe banner */}
      <div className="px-5 pb-8">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/destination")}
          className="w-full rounded-3xl overflow-hidden relative"
          style={{ height: 130, boxShadow: "0 8px 24px rgba(15,76,129,0.12)" }}
        >
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=85"
            alt="GoSafe"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(15,76,129,0.95) 40%, rgba(6,182,212,0.7) 100%)" }} />
          <div className="absolute inset-0 flex items-center px-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-cyan-300" />
                <span className="text-cyan-300 text-xs font-bold tracking-wider">GoSafe Index</span>
              </div>
              <p className="text-white font-black text-lg leading-tight">Voyagez en toute serenite</p>
              <p className="text-white/60 text-[11px] mt-1">Score de securite pour 200+ destinations</p>
            </div>
            <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="text-white font-black text-xl">87</span>
              <span className="text-cyan-300 text-[8px] font-bold">/100</span>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
