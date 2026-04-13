import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("lokadia_user");
    const timer = setTimeout(() => {
      navigate(user ? "/global-home" : "/login");
    }, 2400);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0a0f1e 0%, #0F4C81 50%, #06B6D4 100%)",
      }}
    >
      {/* Background decoration circles */}
      <div
        className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #06B6D4, transparent)" }}
      />
      <div
        className="absolute bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
        className="flex flex-col items-center gap-5"
      >
        {/* Icon */}
        <div
          className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path
              d="M26 4C17.163 4 10 11.163 10 20c0 13.5 16 28 16 28s16-14.5 16-28c0-8.837-7.163-16-16-16z"
              fill="white"
              fillOpacity="0.9"
            />
            <circle cx="26" cy="20" r="6" fill="#06B6D4" />
          </svg>
        </div>

        {/* Name */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Lokadia
          </h1>
          <p className="text-white/60 text-sm font-medium tracking-[0.2em] uppercase">
            Your travel companion
          </p>
        </div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-16 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/50"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
