import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Translations, type Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translateText: (text: string, targetLang?: Language) => Promise<string>;
  isTranslating: boolean;
  t: Translations;
  // Nouvelle fonction pour traduction instantanée avec cache
  translate: (text: string) => string;
  // Version du cache pour forcer les re-renders
  cacheVersion: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cache de traduction pour éviter les appels API répétés
const translationCache = new Map<string, string>();

// File d'attente pour les traductions en batch
const translationQueue = new Set<string>();
let translationTimer: NodeJS.Timeout | null = null;

// Cache persistant dans localStorage
const CACHE_KEY = 'lokadia_translation_cache_v2';

const loadCacheFromStorage = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      Object.entries(data).forEach(([key, value]) => {
        translationCache.set(key, value as string);
      });
    }
  } catch (error) {
    console.error('Erreur chargement cache:', error);
  }
};

const saveCacheToStorage = () => {
  try {
    const data = Object.fromEntries(translationCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur sauvegarde cache:', error);
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Version du cache pour forcer les re-renders
  const [cacheVersion, setCacheVersion] = useState(0);
  
  const [language, setLanguageState] = useState<Language>('fr');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Initialiser la langue et charger le cache au montage
  useEffect(() => {
    try {
      // Charger le cache
      loadCacheFromStorage();
      
      // Récupérer la langue sauvegardée ou détecter la langue du navigateur
      const saved = localStorage.getItem('lokadia_language');
      if (saved && saved in translations) {
        setLanguageState(saved as Language);
        return;
      }
      
      const browserLang = navigator.language.split('-')[0];
      const supportedLangs: Language[] = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ja', 'zh', 'ar'];
      if (supportedLangs.includes(browserLang as Language)) {
        setLanguageState(browserLang as Language);
      }
    } catch (error) {
      console.error('Erreur initialisation langue:', error);
      setLanguageState('fr');
    }
  }, []);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lokadia_language', lang);
    
    // NE PAS vider le cache, juste sauvegarder
    saveCacheToStorage();
  };

  // Obtenir les traductions pour la langue actuelle
  const t = translations[language];

  // Fonction de traduction SYNCHRONE avec cache (pour utilisation directe dans le JSX)
  const translate = (text: string): string => {
    if (!text || text.trim() === '') return text;
    
    // Si français, retourner tel quel
    if (language === 'fr') return text;
    
    // Vérifier le cache
    const cacheKey = `${text}_${language}`;
    if (translationCache.has(cacheKey)) {
      const cached = translationCache.get(cacheKey)!;
      // Ne retourner que si c'est une vraie traduction, pas le placeholder
      if (cached !== text) return cached;
    }
    
    // Si pas en cache, lancer traduction en arrière-plan et retourner texte original
    translateInBackground(text, language);
    return text;
  };

  // Traduction en arrière-plan avec délai pour éviter de surcharger l'API
  const translateInBackground = async (text: string, targetLang: Language) => {
    const cacheKey = `${text}_${targetLang}`;
    
    // Si déjà traduit (pas juste un placeholder), ne pas relancer
    const existing = translationCache.get(cacheKey);
    if (existing && existing !== text) return;
    
    // Si déjà en cours de traduction (le placeholder est le texte original)
    if (existing === text) return;
    
    // Marquer comme en cours avec le placeholder
    translationCache.set(cacheKey, text);
    
    // Ajouter un petit délai aléatoire pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    try {
      const textToTranslate = text.length > 500 ? text.substring(0, 500) : text;
      const encodedText = encodeURIComponent(textToTranslate);
      
      console.log('🔄 Traduction en cours:', text.substring(0, 50) + '...', '→', targetLang);
      
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=fr|${targetLang}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          const translated = data.responseData.translatedText;
          console.log('✅ Traduit:', text.substring(0, 30), '→', translated.substring(0, 30));
          translationCache.set(cacheKey, translated);
          saveCacheToStorage();
          // Incrémenter la version du cache pour forcer les re-renders
          setCacheVersion(prev => prev + 1);
        } else if (data.responseStatus === 403) {
          console.warn('⚠️ Limite API atteinte, réessayera plus tard');
          translationCache.delete(cacheKey);
        }
      }
    } catch (error) {
      console.warn('❌ Erreur traduction arrière-plan:', error);
      // Retirer le placeholder en cas d'erreur pour réessayer plus tard
      translationCache.delete(cacheKey);
    }
  };

  // Fonction de traduction ASYNCHRONE (pour les cas spéciaux)
  const translateText = async (text: string, targetLang?: Language): Promise<string> => {
    if (!text || text.trim() === '') return text;
    
    const target = targetLang || language;
    
    // Si le texte est déjà en langue cible, le retourner directement
    if (target === 'en' && /^[a-zA-Z0-9\s.,!?;:()\-'"]+$/.test(text)) {
      return text;
    }
    
    // Limiter la taille du texte
    const textToTranslate = text.length > 500 ? text.substring(0, 500) : text;
    
    // Vérifier le cache
    const cacheKey = `${textToTranslate}_${target}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }
    
    try {
      setIsTranslating(true);
      
      // API MyMemory (gratuite et fiable)
      const encodedText = encodeURIComponent(textToTranslate);
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${target}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        console.warn('Traduction API échouée, retour du texte original');
        return text;
      }
      
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        
        // Sauvegarder dans le cache
        translationCache.set(cacheKey, translated);
        saveCacheToStorage();
        
        return translated;
      } else {
        return text;
      }
    } catch (error) {
      console.warn('Erreur de traduction:', error);
      return text; // Retourner le texte original en cas d'erreur
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translateText, isTranslating, t, translate, cacheVersion }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Hook sécurisé qui retourne null si le provider n'est pas disponible (pour hot-reload)
export function useLanguageSafe() {
  const context = useContext(LanguageContext);
  return context || null;
}

// Hook pour traduire automatiquement un texte
export function useTranslate(text: string): string {
  const context = useLanguageSafe();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!context) {
      setTranslated(text);
      return;
    }
    
    let isMounted = true;
    const { translateText, language } = context;

    const translate = async () => {
      const result = await translateText(text);
      if (isMounted) {
        setTranslated(result);
      }
    };

    translate();

    return () => {
      isMounted = false;
    };
  }, [text, context]);

  return translated;
}

// Langues supportées avec leurs noms natifs
export const SUPPORTED_LANGUAGES: Record<Language, { name: string; flag: string }> = {
  fr: { name: 'Français', flag: 'FR' },
  en: { name: 'English', flag: 'GB' },
  es: { name: 'Español', flag: 'ES' },
  de: { name: 'Deutsch', flag: 'DE' },
  it: { name: 'Italiano', flag: 'IT' },
  pt: { name: 'Português', flag: 'PT' },
  ja: { name: '日本語', flag: 'JP' },
  zh: { name: '中文', flag: 'CN' },
  ar: { name: 'العربية', flag: 'SA' },
};