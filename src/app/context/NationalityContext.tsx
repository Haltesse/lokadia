/**
 * NationalityContext — nationalité déclarée par le voyageur.
 *
 * Pourquoi c'est nécessaire : les formalités d'entrée n'ont aucun sens sans
 * elle (cf. `lib/formalities.ts`). Pourquoi c'est délicat : la nationalité
 * est une donnée sensible au sens commun du terme.
 *
 * Le compromis retenu : la valeur reste **sur l'appareil**
 * (`lokadia_nationality`), n'est jamais envoyée à un serveur, jamais
 * associée au compte, et la valeur par défaut est « non renseignée » — on
 * ne devine pas, et l'application dit qu'elle ne sait pas plutôt que de
 * supposer une nationalité française.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { NATIONALITIES, OTHER_NATIONALITY } from '../data/nationalities';

const STORAGE_KEY = 'lokadia_nationality';
const CHANGE_EVENT = 'lokadia_nationality_change';

/** ISO2 d'une nationalité connue, `OTHER`, ou null si non renseignée. */
export type NationalityValue = string | null;

function isValid(value: string): boolean {
  return value === OTHER_NATIONALITY || NATIONALITIES.some((n) => n.iso2 === value);
}

function readStored(): NationalityValue {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValid(saved)) return saved;
  } catch {
    // localStorage indisponible (navigation privée stricte)
  }
  return null;
}

interface NationalityContextValue {
  nationality: NationalityValue;
  setNationality: (next: NationalityValue) => void;
  /** true dès que le voyageur a fait un choix, « Autre » compris */
  isDeclared: boolean;
}

const NationalityContext = createContext<NationalityContextValue>({
  nationality: null,
  setNationality: () => {},
  isDeclared: false,
});

export function NationalityProvider({ children }: { children: ReactNode }) {
  const [nationality, setState] = useState<NationalityValue>(() => readStored());

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ nationality: NationalityValue }>).detail;
      setState(detail?.nationality ?? null);
    };
    const storageHandler = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setState(event.newValue && isValid(event.newValue) ? event.newValue : null);
    };
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const setNationality = useCallback((next: NationalityValue) => {
    if (next !== null && !isValid(next)) return;
    setState(next);
    try {
      if (next === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // On garde la valeur en mémoire pour la session en cours
    }
    try {
      window.dispatchEvent(
        new CustomEvent<{ nationality: NationalityValue }>(CHANGE_EVENT, {
          detail: { nationality: next },
        }),
      );
    } catch {
      // CustomEvent indisponible
    }
  }, []);

  return (
    <NationalityContext.Provider
      value={{ nationality, setNationality, isDeclared: nationality !== null }}
    >
      {children}
    </NationalityContext.Provider>
  );
}

export function useNationality(): NationalityContextValue {
  return useContext(NationalityContext);
}
