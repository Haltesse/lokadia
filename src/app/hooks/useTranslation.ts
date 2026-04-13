import { useLanguage } from '../context/LanguageContext';
import { useCallback } from 'react';

/**
 * Hook simplifié pour traduire du texte
 * Retourne une fonction `tr` qui traduit instantanément avec cache
 * Le composant se re-rend automatiquement quand les traductions arrivent
 * 
 * @example
 * const tr = useTranslation();
 * return <h1>{tr("Bienvenue sur Lokadia")}</h1>
 */
export function useTranslation() {
  const { translate, language, cacheVersion } = useLanguage();
  
  // Utiliser useCallback pour que la fonction reste stable entre les renders
  // mais dépend de cacheVersion pour forcer les re-renders quand le cache change
  const tr = useCallback((text: string) => {
    return translate(text);
  }, [translate, language, cacheVersion]);
  
  return tr;
}