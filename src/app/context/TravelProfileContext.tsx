/**
 * TravelProfileContext — état global du profil de voyage utilisateur
 *
 * Persisté dans localStorage (clé `lokadia_travel_profile`).
 * Aucune donnée personnelle stockée — uniquement un identifiant de profil
 * (cf. méthodologie Lokascore : Privacy by Design, article 25 RGPD).
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { TravelProfile } from '../lib/lokascore';
import { PROFILE_META } from '../lib/lokascore';

const STORAGE_KEY = 'lokadia_travel_profile';
const PROFILE_EVENT = 'lokadia_travel_profile_change';

type ProfileEventDetail = { profile: TravelProfile };

function readStoredProfile(): TravelProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in PROFILE_META) {
      return saved as TravelProfile;
    }
  } catch {
    // localStorage indisponible (mode privé strict)
  }
  return 'default';
}

interface TravelProfileContextValue {
  profile: TravelProfile;
  setProfile: (next: TravelProfile) => void;
  /** True si l'utilisateur a explicitement choisi un profil (≠ 'default') */
  hasExplicitProfile: boolean;
}

const TravelProfileContext = createContext<TravelProfileContextValue>({
  profile: 'default',
  setProfile: () => {},
  hasExplicitProfile: false,
});

export function TravelProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<TravelProfile>(() => readStoredProfile());

  // Synchronise via un évènement custom : permet à plusieurs onglets/composants
  // de réagir au changement sans re-rendre tout l'arbre.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ProfileEventDetail>).detail;
      if (detail?.profile && detail.profile in PROFILE_META) {
        setProfileState(detail.profile);
      }
    };
    window.addEventListener(PROFILE_EVENT, handler);
    // Cross-tab sync via storage event
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in PROFILE_META) {
        setProfileState(e.newValue as TravelProfile);
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(PROFILE_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const setProfile = useCallback((next: TravelProfile) => {
    if (!(next in PROFILE_META)) {
      console.warn(`[TravelProfile] Profil inconnu ignoré: ${next}`);
      return;
    }
    setProfileState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage indisponible — on garde quand même en mémoire
    }
    // Notifie les autres composants
    try {
      window.dispatchEvent(
        new CustomEvent<ProfileEventDetail>(PROFILE_EVENT, { detail: { profile: next } })
      );
    } catch {
      // CustomEvent indisponible
    }
  }, []);

  return (
    <TravelProfileContext.Provider
      value={{
        profile,
        setProfile,
        hasExplicitProfile: profile !== 'default',
      }}
    >
      {children}
    </TravelProfileContext.Provider>
  );
}

export function useTravelProfile(): TravelProfileContextValue {
  return useContext(TravelProfileContext);
}
