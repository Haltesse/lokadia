/**
 * ThemeContext — clair, sombre, ou réglage du système.
 *
 * Trois états et pas deux : « système » est le défaut, parce qu'un
 * voyageur qui a mis son téléphone en sombre pour lire une carte le soir
 * ne devrait pas avoir à le redire ici. Un choix explicite est mémorisé
 * sur l'appareil (`lokadia_theme`) et l'emporte ensuite.
 *
 * L'application de la classe `dark` sur `<html>` est faite le plus tôt
 * possible (voir le script d'amorçage dans `index.html`) pour éviter le
 * flash blanc au chargement d'une page sombre.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'lokadia_theme';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** Couleur de la barre système, alignée sur le fond réellement affiché. */
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#0F4C81',
  dark: '#0B1220',
};

function readStored(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // localStorage indisponible (navigation privée stricte)
  }
  return 'system';
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/**
 * Coupe les transitions le temps d'un battement, puis les rend.
 *
 * Sans ça, basculer de thème laissait du texte illisible jusqu'au
 * rechargement. La cause : nos composants posent leurs couleurs en style
 * en ligne (`color: var(--lokadia-text-dark)`) sur des éléments qui
 * portent aussi `transition-colors`. Quand c'est la *custom property* qui
 * change — et non la déclaration — le moteur ne relance pas la transition
 * et la couleur reste épinglée sur celle du thème précédent : du texte
 * quasi blanc restait sur une carte redevenue blanche.
 *
 * Neutraliser les transitions pendant le basculement fait appliquer les
 * nouvelles couleurs d'un coup, sans transition à épingler. Le style est
 * retiré au repaint suivant, donc les animations d'interface normales
 * (survol, sélection) sont intactes.
 */
let freezeEl: HTMLStyleElement | null = null;
let freezeTimer: number | undefined;

function withoutTransitions(mutate: () => void): void {
  if (typeof document === 'undefined') {
    mutate();
    return;
  }

  // Un seul élément réutilisé : en créer un par basculement les laissait
  // s'empiler dans le `<head>`.
  if (!freezeEl) {
    freezeEl = document.createElement('style');
    freezeEl.setAttribute('data-lokadia-theme-swap', '');
    freezeEl.textContent =
      '*,*::before,*::after{transition:none !important;animation-duration:0s !important}';
  }
  if (!freezeEl.isConnected) document.head.appendChild(freezeEl);

  mutate();

  // Lecture forcée : le navigateur recalcule les styles avec les
  // transitions encore coupées, donc les nouvelles couleurs sont acquises
  // avant qu'on ne relâche.
  void document.body.offsetHeight;

  const release = () => {
    window.clearTimeout(freezeTimer);
    freezeEl?.remove();
  };

  // On relâche au rendu suivant. Le minuteur est le filet de sécurité :
  // dans un onglet masqué `requestAnimationFrame` ne se déclenche pas, et
  // les transitions resteraient coupées pour le reste de la session — ce
  // qui arrive vraiment quand le système bascule en sombre au coucher du
  // soleil pendant que l'onglet est en arrière-plan.
  window.clearTimeout(freezeTimer);
  freezeTimer = window.setTimeout(release, 120);
  requestAnimationFrame(() => requestAnimationFrame(release));
}

function apply(resolved: ResolvedTheme): void {
  const root = document.documentElement;

  withoutTransitions(() => {
    root.classList.toggle('dark', resolved === 'dark');
    // `color-scheme` fait suivre les éléments natifs (ascenseurs, champs,
    // sélecteurs de date) sans une ligne de CSS de plus.
    root.style.colorScheme = resolved;
  });

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLOR[resolved]);
}

interface ThemeContextValue {
  /** Choix de l'utilisateur, « system » compris */
  preference: ThemePreference;
  /** Thème réellement appliqué */
  theme: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
  /** Bascule clair ↔ sombre en figeant un choix explicite */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: 'system',
  theme: 'light',
  setPreference: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readStored());
  const [systemDark, setSystemDark] = useState<boolean>(() => systemPrefersDark());

  // Le réglage système peut changer pendant la session (coucher de soleil,
  // bascule automatique du téléphone) : on suit.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const theme: ResolvedTheme = useMemo(() => {
    if (preference === 'system') return systemDark ? 'dark' : 'light';
    return preference;
  }, [preference, systemDark]);

  useEffect(() => {
    apply(theme);
  }, [theme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // On garde le choix en mémoire pour la session en cours
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  }, [setPreference, theme]);

  return (
    <ThemeContext.Provider value={{ preference, theme, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
