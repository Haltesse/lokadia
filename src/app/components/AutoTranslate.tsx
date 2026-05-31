import { useEffect } from 'react';
import { useLanguageSafe } from '../context/LanguageContext';
import { translateBatch } from '../lib/translationService';

/**
 * AutoTranslate — traduit le texte visible de la page dans la langue choisie.
 *
 * Corrections clés vs version précédente (qui faisait planter la page) :
 *   1. ANTI-BOUCLE : on déconnecte le MutationObserver pendant qu'on écrit
 *      dans le DOM, et chaque nœud traduit est marqué (WeakSet) pour ne
 *      jamais être re-traité → plus de boucle infinie.
 *   2. CONCURRENCE LIMITÉE : translateBatch utilise un pool (max 4 req/s) au
 *      lieu de 200 requêtes parallèles.
 *   3. DEBOUNCE robuste : un seul timer partagé, ré-armé proprement.
 *   4. Cache persistant (localStorage) côté service.
 */
export function AutoTranslate() {
  const { language } = useLanguageSafe();

  useEffect(() => {
    if (language === 'fr') return; // langue source, rien à traduire

    let cancelled = false;
    let debounceTimer: number | null = null;
    let running = false;
    // Nœuds déjà traduits (ou en cours) → jamais re-traités
    const handled = new WeakSet<Node>();
    const SELECTOR = 'h1,h2,h3,h4,h5,h6,p,a,button,label,li';

    let observer: MutationObserver | null = null;

    async function translateNewText() {
      if (cancelled || running) return;
      running = true;
      try {
        // 1. Collecte des nœuds texte non encore traités
        const elements = Array.from(document.querySelectorAll(SELECTOR));
        const pending: { node: Node; text: string }[] = [];
        for (const el of elements) {
          // Ignore les zones à ne pas traduire (code, champs de saisie, etc.)
          if ((el as HTMLElement).closest('[data-no-translate],input,textarea,code,pre')) continue;
          for (const node of Array.from(el.childNodes)) {
            if (node.nodeType !== Node.TEXT_NODE || handled.has(node)) continue;
            const text = node.textContent?.trim();
            if (text && text.length > 1 && !/^[\d\s€$£%.,:/-]+$/.test(text)) {
              handled.add(node); // marqué AVANT l'appel réseau → pas de doublon
              pending.push({ node, text });
            }
          }
        }
        if (pending.length === 0) return;

        // 2. Traduction par lots de 60 (le service gère la concurrence interne)
        const LOT = 60;
        for (let i = 0; i < pending.length; i += LOT) {
          if (cancelled) return;
          const slice = pending.slice(i, i + LOT);
          const translations = await translateBatch(slice.map((s) => s.text), language);
          if (cancelled) return;

          // 3. Écriture DOM avec observer débranché (sinon boucle infinie)
          observer?.disconnect();
          slice.forEach((item, idx) => {
            const tr = translations[idx];
            if (tr && tr !== item.text) item.node.textContent = tr;
          });
          if (!cancelled) reconnectObserver();
        }
      } finally {
        running = false;
      }
    }

    function scheduleTranslate(delay: number) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(translateNewText, delay);
    }

    function reconnectObserver() {
      observer?.observe(document.body, { childList: true, subtree: true });
    }

    // Observer : ne déclenche qu'un re-scan debouncé des NOUVEAUX nœuds
    observer = new MutationObserver((mutations) => {
      // On ignore les mutations purement textuelles (characterData) provoquées
      // par notre propre écriture — on ne réagit qu'à l'ajout d'éléments.
      const hasNewNodes = mutations.some((m) => m.addedNodes.length > 0);
      if (hasNewNodes) scheduleTranslate(800);
    });

    scheduleTranslate(400);
    reconnectObserver();

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      observer?.disconnect();
    };
  }, [language]);

  return null;
}
