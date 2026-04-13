import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Star, Heart, TrendingUp, ChevronRight, Bell, Compass } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguageSafe } from "../context/LanguageContext";

/* ─── Data ────────────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    id: 1,
    city: "Santorini",
    country: "Grèce",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&q=85",
    tagline: "Les couchers de soleil les plus célèbres du monde",
    rating: 4.9,
    price: "À partir de 650€",
    color: "#1a4a8a",
  },
  {
    id: 2,
    city: "Kyoto",
    country: "Japon",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&q=85",
    tagline: "L'harmonie entre tradition et modernité",
    rating: 4.8,
    price: "À partir de 890€",
    color: "#7c3aed",
  },
  {
    id: 3,
    city: "Marrakech",
    country: "Maroc",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=900&q=85",
    tagline: "Un voyage dans le temps et les couleurs",
    rating: 4.7,
    price: "À partir de 320€",
    color: "#c2410c",
  },
  {
    id: 4,
    city: "Bali",
    country: "Indonésie",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85",
    tagline: "L'île des dieux vous attend",
    rating: 4.9,
    price: "À partir de 780€",
    color: "#065f46",
  },
  {
    id: 5,
    city: "New York",
    country: "États-Unis",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=900&q=85",
    tagline: "La ville qui ne dort jamais",
    rating: 4.8,
    price: "À partir de 750€",
    color: "#1e3a5f",
  },
];

const TRENDING = [
  { id: 1, city: "Lisbonne", country: "Portugal", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&q=80", rating: 4.7, tag: "Coup de cœur", tagColor: "#ec4899" },
  { id: 2, city: "Dubai", country: "ÉAU", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", rating: 4.8, tag: "Luxe", tagColor: "#f59e0b" },
  { id: 3, city: "Cappadoce", country: "Turquie", image: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&q=80", rating: 4.9, tag: "Unique", tagColor: "#8b5cf6" },
  { id: 4, city: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80", rating: 5.0, tag: "Paradis", tagColor: "#06b6d4" },
];

const CATEGORIES = [
  { icon: "🏖️", label: "Plages", color: "#0ea5e9" },
  { icon: "🏔️", label: "Montagnes", color: "#22c55e" },
  { icon: "🏙️", label: "Villes", color: "#8b5cf6" },
  { icon: "🏛️", label: "Culture", color: "#f59e0b" },
  { icon: "🌿", label: "Nature", color: "#10b981" },
  { icon: "🍜", label: "Gastronomie", color: "#ef4444" },
];

/* ─── Hero Slideshow ────────────────────────────────────────── */
function HeroSlideshow() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const next = useCallback(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), []);

  useEffect(() => {
    if (!dragging) {
      intervalRef.current = setInterval(next, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [dragging, next]);

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "72vw", maxHeight: 340 }}>
      {/* Slides */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.city}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 100%)`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-10">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white text-[10px] font-semibold tracking-wide">LIVE</span>
        </div>
        <div className="flex gap-2">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
          >
            <Bell className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Location */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-cyan-300 text-xs font-semibold tracking-wider uppercase">{slide.country}</span>
            </div>
            <h2 className="text-white text-2xl font-black tracking-tight mb-1">{slide.city}</h2>
            <p className="text-white/75 text-xs mb-3 leading-relaxed">{slide.tagline}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold text-sm">{slide.rating}</span>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(8px)" }}
                >
                  {slide.price}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFavorites((f) => f.includes(slide.id) ? f.filter((x) => x !== slide.id) : [...f, slide.id])}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(slide.id) ? "fill-red-400 text-red-400" : "text-white"}`} />
                </button>
                <button
                  onClick={() => navigate("/destination")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)", boxShadow: "0 4px 16px rgba(6,182,212,0.4)" }}
                >
                  Découvrir <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-[70px] right-5 flex flex-col gap-1.5 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { clearInterval(intervalRef.current); setCurrent(i); }}
            className="transition-all rounded-full"
            style={{
              width: i === current ? 4 : 4,
              height: i === current ? 16 : 6,
              background: i === current ? "white" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* Swipe touch handlers */}
      <div
        className="absolute inset-0 z-20"
        style={{ touchAction: "pan-y" }}
        onMouseDown={(e) => {
          setDragging(true);
          const startX = e.clientX;
          const up = () => {
            document.removeEventListener("mouseup", up);
          };
          const move = (ev: MouseEvent) => {
            if (Math.abs(ev.clientX - startX) > 40) {
              ev.clientX > startX ? prev() : next();
              setDragging(false);
              document.removeEventListener("mousemove", move);
              document.removeEventListener("mouseup", up);
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
    <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 py-1">
      {CATEGORIES.map((cat, i) => (
        <button
          key={i}
          onClick={() => setActive(i)}
          className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition-all text-sm font-semibold"
          style={{
            background: active === i ? cat.color : "rgba(15,76,129,0.05)",
            color: active === i ? "white" : "#475569",
            boxShadow: active === i ? `0 4px 14px ${cat.color}50` : "none",
            border: `1.5px solid ${active === i ? cat.color : "rgba(15,76,129,0.08)"}`,
          }}
        >
          <span className="text-base">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Trending Card ─────────────────────────────────────────── */
function TrendingCard({ dest }: { dest: (typeof TRENDING)[0] }) {
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate("/destination")}
      className="relative flex-shrink-0 rounded-3xl overflow-hidden shadow-lg"
      style={{ width: 160, height: 200 }}
    >
      <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />

      {/* Tag */}
      <div
        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
        style={{ background: dest.tagColor }}
      >
        {dest.tag}
      </div>

      {/* Fav */}
      <button
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
        onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
      >
        <Heart className={`w-3.5 h-3.5 ${fav ? "fill-red-400 text-red-400" : "text-white"}`} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
        <p className="text-white font-bold text-sm leading-tight">{dest.city}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-white/70 text-[11px]">{dest.country}</p>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-white text-[11px] font-semibold">{dest.rating}</span>
          </div>
        </div>
      </div>
    </motion.button>
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
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">{greeting},</p>
            <h1 className="text-slate-900 text-xl font-black">
              {user?.name || "Voyageur"} <span className="text-2xl">✈️</span>
            </h1>
          </div>
          <div className="relative">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
              alt="Avatar"
              className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-5 pb-4">
        <button
          onClick={() => navigate("/search")}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-sm"
          style={{ background: "white", border: "1.5px solid rgba(15,76,129,0.08)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)" }}
          >
            <Search className="w-4 h-4 text-white" />
          </div>
          <span className="text-slate-400 text-sm flex-1 text-left">
            {t?.home?.search || "Rechercher une destination…"}
          </span>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(15,76,129,0.06)", color: "#0F4C81" }}
          >
            <Compass className="w-3 h-3" />
            Explorer
          </div>
        </button>
      </div>

      {/* Hero Slideshow */}
      <div className="px-4 pb-5">
        <div className="rounded-3xl overflow-hidden shadow-premium">
          <HeroSlideshow />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-5">
        <CategoryPills />
      </div>

      {/* Trending section */}
      <div className="px-5 mb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-slate-900 font-bold text-base">Tendances</h2>
          </div>
          <button
            onClick={() => navigate("/all-destinations")}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600"
          >
            {t?.home?.seeAll || "Voir tout"} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {TRENDING.map((dest) => (
            <TrendingCard key={dest.id} dest={dest} />
          ))}
        </div>
      </div>

      {/* GoSafe banner */}
      <div className="px-5 pb-6 mt-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/destination")}
          className="w-full rounded-3xl overflow-hidden relative"
          style={{ height: 120 }}
        >
          <img
            src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&q=80"
            alt="GoSafe"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 flex flex-col justify-center px-5"
            style={{ background: "linear-gradient(90deg, rgba(15,76,129,0.92) 50%, transparent 100%)" }}
          >
            <div
              className="self-start px-2.5 py-1 rounded-full text-[10px] font-bold text-white mb-2"
              style={{ background: "#06B6D4" }}
            >
              GoSafe™
            </div>
            <p className="text-white font-black text-base leading-tight">Score de sécurité</p>
            <p className="text-white/70 text-xs mt-1">Voyagez informé, voyagez serein</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
