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

function apply(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  // `color-scheme` fait suivre les éléments natifs (ascenseurs, champs,
  // sélecteurs de date) sans une ligne de CSS de plus.
  root.style.colorScheme = resolved;

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
