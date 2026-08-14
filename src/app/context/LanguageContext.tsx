import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import {
  translations, LANGUAGE_META, resolveCatalog, completeLanguages,
  type Translations, type Language,
} from '../translations';

/**
 * LanguageContext — internationalisation par catalogue clé-valeur.
 *
 * Aucune traduction automatique : tout le texte affiché vient d'un
 * catalogue relu par des humains. La version précédente parcourait le DOM
 * et envoyait chaque phrase visible — y compris du contenu saisi par
 * l'utilisateur — à une API tierce gratuite, sans consentement ni contrat.
 * C'était un risque RGPD, une qualité subie et une dépendance sans SLA.
 *
 * Le français est la langue source. Une clé absente d'une traduction
 * retombe sur le français plutôt que d'afficher du vide.
 */

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Catalogue résolu pour la langue courante (repli français inclus) */
  t: Translations;
  /** Langues dont le catalogue est complet — les seules proposées */
  available: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'lokadia_language';
/** Ancien cache de traduction machine — purgé au démarrage. */
const LEGACY_CACHE_KEYS = ['lokadia_translation_cache_v2', 'lokadia_translation_cache'];

/** Langue initiale : choix mémorisé, sinon langue du navigateur, sinon français. */
function initialLanguage(available: Language[]): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && available.includes(saved)) return saved;
  } catch {
    // Stockage indisponible : on poursuit sur la détection navigateur
  }
  try {
    const nav = navigator.language.slice(0, 2).toLowerCase() as Language;
    if (available.includes(nav)) return nav;
  } catch {
    // Pas de navigator : français
  }
  return 'fr';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const available = useMemo(() => completeLanguages(), []);
  const [language, setLanguageState] = useState<Language>(() => initialLanguage(available));

  // Purge unique de l'ancien cache de traduction machine
  useEffect(() => {
    for (const key of LEGACY_CACHE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Rien à faire : le cache disparaîtra avec le stockage
      }
    }
  }, []);

  // L'attribut lang conditionne la césure, la synthèse vocale et le SEO ;
  // dir gère l'écriture de droite à gauche.
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = LANGUAGE_META[language]?.rtl ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Choix non mémorisé, mais appliqué pour la session
    }
  }, []);

  const value = useMemo<LanguageContextType>(
    () => ({ language, setLanguage, t: resolveCatalog(language), available }),
    [language, setLanguage, available],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Accès au catalogue. Lève si le provider est absent — c'est un bug de montage. */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage doit être utilisé sous <LanguageProvider>');
  return context;
}

/**
 * Variante tolérante pour les composants susceptibles d'être rendus hors
 * du provider (pages publiques tokenisées, écrans d'erreur). Renvoie
 * toujours un catalogue exploitable — jamais null, contrairement à la
 * version précédente qui obligeait chaque appelant à gérer le cas.
 */
export function useLanguageSafe(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context) return context;
  return {
    language: 'fr',
    setLanguage: () => { /* hors provider : le choix n'est pas persistable */ },
    t: translations.fr,
    available: ['fr'],
  };
}

export { LANGUAGE_META };
export type { Language };
