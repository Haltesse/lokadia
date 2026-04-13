import { useEffect, useRef } from 'react';
import { useLanguageSafe } from '../context/LanguageContext';

/**
 * Composant qui traduit automatiquement TOUT le contenu texte de l'application
 * Scanne le DOM et traduit tous les textes visibles via l'API MyMemory
 */
export function AutoTranslate() {
  const context = useLanguageSafe();
  
  // Si le contexte n'est pas disponible (hot-reload), ne rien faire
  if (!context) return null;
  
  const { language, translate, cacheVersion } = context;
  
  const translatedNodes = useRef(new Set<Node>());
  const originalTexts = useRef(new Map<Node, string>());
  const observerRef = useRef<MutationObserver | null>(null);
  const translateCountRef = useRef(0);

  useEffect(() => {
    console.log('🌍 AutoTranslate: Langue changée →', language);
    
    if (language === 'fr') {
      // Si français, restaurer les textes originaux
      console.log('🇫🇷 Restauration des textes originaux français');
      originalTexts.current.forEach((originalText, node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent !== originalText) {
          node.textContent = originalText;
        }
      });
      translatedNodes.current.clear();
      translateCountRef.current = 0;
      return;
    }

    translateCountRef.current = 0;

    // Fonction pour traduire un nœud de texte
    const translateTextNode = (node: Node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      
      const text = node.textContent?.trim();
      if (!text || text.length < 2) return;
      
      // Ignorer UNIQUEMENT les textes qui sont juste des chiffres/symboles purs
      if (/^[\d\s.,!?;:()\-'"%€$£¥@#&*+=/<>[\]{}|\\^~`]+$/.test(text)) return;
      
      // Sauvegarder le texte original si pas déjà fait
      if (!originalTexts.current.has(node)) {
        originalTexts.current.set(node, text);
      }
      
      // Marquer comme détecté
      translateCountRef.current++;
      
      // Traduire immédiatement (la fonction translate gère le cache)
      const translated = translate(text);
      
      // Mettre à jour le DOM si la traduction est différente
      if (translated !== text && node.textContent !== translated) {
        node.textContent = translated;
        translatedNodes.current.add(node);
        console.log('📝 Texte traduit:', text.substring(0, 30), '→', translated.substring(0, 30));
      }
    };

    // Fonction pour parcourir récursivement tous les nœuds de texte
    const walkAndTranslate = (node: Node) => {
      // Ignorer certains éléments
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName?.toLowerCase();
        
        // Ignorer les scripts, styles, et éléments de code
        if (['script', 'style', 'code', 'pre', 'svg', 'path'].includes(tagName)) {
          return;
        }
        
        // Ignorer les input/textarea values (géré différemment)
        if (['input', 'textarea'].includes(tagName)) {
          const input = element as HTMLInputElement;
          if (input.placeholder) {
            const translated = translate(input.placeholder);
            if (translated !== input.placeholder) {
              input.placeholder = translated;
            }
          }
          return;
        }
      }

      // Traduire les nœuds de texte directs
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node);
      } else if (node.childNodes.length > 0) {
        // Parcourir les enfants
        Array.from(node.childNodes).forEach(walkAndTranslate);
      }
    };

    // Traduire tout le document
    const translateAll = () => {
      const root = document.getElementById('root');
      if (root) {
        walkAndTranslate(root);
        console.log(`📝 ${translateCountRef.current} textes détectés pour traduction`);
      }
    };

    // Traduction initiale
    translateAll();

    // Observer les changements DOM pour traduire le nouveau contenu
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Traduire les nouveaux nœuds ajoutés
        mutation.addedNodes.forEach((node) => {
          walkAndTranslate(node);
        });
        
        // Traduire les nœuds modifiés
        if (mutation.type === 'characterData') {
          translateTextNode(mutation.target);
        }
      });
    });

    const root = document.getElementById('root');
    if (root) {
      observerRef.current.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [language, translate]);

  // Re-traduire quand le cache change (nouvelles traductions disponibles)
  useEffect(() => {
    if (language === 'fr') return;
    
    // Nettoyer le set pour retraduire avec les nouvelles traductions du cache
    translatedNodes.current.clear();
    
    const root = document.getElementById('root');
    if (root) {
      const walkAndTranslate = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName?.toLowerCase();
          
          if (['script', 'style', 'code', 'pre', 'svg', 'path'].includes(tagName)) {
            return;
          }
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const text = originalTexts.current.get(node);
          if (text) {
            const translated = translate(text);
            if (translated !== text && node.textContent !== translated) {
              node.textContent = translated;
            }
          }
        } else if (node.childNodes.length > 0) {
          Array.from(node.childNodes).forEach(walkAndTranslate);
        }
      };
      
      walkAndTranslate(root);
    }
  }, [cacheVersion, language, translate]);

  return null; // Ce composant ne rend rien
}