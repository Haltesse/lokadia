/**
 * HeroSlideshow — diaporama plein-écran avec :
 *   - Crossfade auto-rotation (intervalMs)
 *   - Swipe gauche/droite au doigt (motion onPanEnd, sans déplacement visuel)
 *   - Indicateurs élégants type "story" : pilule glassy + barre de progression
 *     qui se remplit en linéaire pendant la durée d'auto-rotation
 *   - Pause auto pendant le tap (l'animation de progress se fige)
 *
 * Les indicateurs sont des `<button>` avec `py-3 -my-3 px-1` : la cible
 * tactile fait 44 px de haut (Apple HIG) sans changer la taille visuelle
 * de la pilule. Aucune flèche ←/→ : le swipe + les pastilles suffisent.
 */
import { ReactNode, useEffect, useState, type CSSProperties } from "react";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroSlideshowProps {
  images: string[];
  intervalMs?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Couleur du gradient d'overlay (défaut : noir/gradient lisibilité). */
  overlayClassName?: string;
}

const SWIPE_OFFSET = 50;
const SWIPE_VELOCITY = 350;

export function HeroSlideshow({
  images,
  intervalMs = 5000,
  className = "",
  style,
  children,
  overlayClassName = "absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70 pointer-events-none",
}: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance — `current` dans la dep list pour reset du timer après un changement manuel
  useEffect(() => {
    if (paused || images.length < 2) return;
    const id = window.setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [paused, images.length, intervalMs, current]);

  const goTo = (i: number) => {
    const len = images.length;
    setCurrent(((i % len) + len) % len);
  };
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY) next();
    else if (info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY) prev();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Slideshow background — swipeable (onPanEnd, sans déplacement visuel) */}
      <motion.div
        className="absolute inset-0"
        onPanEnd={handlePanEnd}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
        style={{ touchAction: "pan-y" }}
      >
        <AnimatePresence>
          {images.map((src, i) =>
            i === current ? (
              <motion.div
                key={current}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <ImageWithFallback
                  src={src}
                  alt=""
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
        <div className={overlayClassName} />
      </motion.div>

      {/* Indicateurs glass — story style avec progress fill */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.28)" }}
        >
          {images.map((_, i) => {
            const isActive = i === current;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Aller à la slide ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                data-touch="compact"
                className="relative py-3 -my-3 px-0.5 flex items-center justify-center group"
                style={{ touchAction: "manipulation" }}
              >
                <span
                  className="block h-1 rounded-full overflow-hidden transition-[width] duration-300 ease-out"
                  style={{
                    width: isActive ? 26 : 7,
                    background: "rgba(255,255,255,0.45)",
                  }}
                >
                  {isActive && !paused && (
                    <motion.span
                      key={`fill-${current}`}
                      className="block h-full w-full bg-white origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: intervalMs / 1000, ease: "linear" }}
                    />
                  )}
                  {isActive && paused && (
                    <span className="block h-full w-full bg-white" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Contenu (logo, titre, etc.) au-dessus */}
      {children}
    </div>
  );
}
