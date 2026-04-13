import { useEffect, useState } from 'react';
import { useLanguageSafe } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

/**
 * Indicateur visuel de traduction en cours
 * Affiche un badge discret quand les traductions sont en cours de chargement
 */
export function TranslationIndicator() {
  const context = useLanguageSafe();
  
  // Si le contexte n'est pas disponible (hot-reload), ne rien afficher
  if (!context) return null;
  
  const { language, cacheVersion } = context;
  
  const [isVisible, setIsVisible] = useState(false);
  const [translationCount, setTranslationCount] = useState(0);

  useEffect(() => {
    if (language === 'fr') {
      setIsVisible(false);
      return;
    }

    // Afficher l'indicateur quand le cache change (nouvelles traductions)
    setIsVisible(true);
    setTranslationCount(prev => prev + 1);

    // Masquer après 2 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [cacheVersion, language]);

  if (!isVisible || language === 'fr') return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
      }}
    >
      <Globe className="h-4 w-4 animate-spin" style={{ animationDuration: '2s' }} />
      <span>Traduction en cours...</span>
    </div>
  );
}