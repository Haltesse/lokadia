import { useLanguageSafe } from '../context/LanguageContext';

interface TranslatedTextProps {
  children: string;
  className?: string;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Composant qui traduit automatiquement son contenu texte
 */
export function TranslatedText({ children, className, as: Component = 'span' }: TranslatedTextProps) {
  const context = useLanguageSafe();
  
  // Si pas de contexte, retourner le texte original
  const translate = context?.translate || ((text: string) => text);
  
  const translated = translate(children);
  
  return <Component className={className}>{translated}</Component>;
}