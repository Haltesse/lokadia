import { useEffect } from 'react';
import { useLanguageSafe } from '../context/LanguageContext';
import { translateBatch, translateText } from '../lib/translationService';

/**
 * AutoTranslate — traduit TOUT le texte visible de la page.
 *
 * Approche : un TreeWalker parcourt l'intégralité des nœuds texte du DOM
 * (exhaustif, indépendant des balises) + les placeholders d'input. C'est ce
 * qui garantit que rien n'est oublié, contrairement à un sélecteur de tags.
 *
 * Protections anti-freeze (le bug précédent) :
 *   1. WeakSet : chaque nœud n'est traité qu'une fois.
 *   2. Observer débranché pendant l'écriture DOM → pas de boucle infinie.
 *   3. Pool de concurrence (service) → pas 200 requêtes en parallèle.
 *   4. Debounce des re-scans.
 *   5. Restauration de l'original quand on repasse en français.
 */

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'SVG', 'PATH', 'NOSCRIPT', 'TEXTAREA', 'INPUT']);
// Texte purement numérique / symbolique → on ne traduit pas
const SKIP_TEXT = /^[\d\s.,!?;:()\-'"%€$£¥@#&*+=/<>[\]{}|\\^~`²°…–—·•✓✔️🔴🟠🟡🟢⚫️🌍]+$/u;

export function AutoTranslate() {
  const { language } = useLanguageSafe();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Mémorise le texte FR original de chaque nœud (pour restauration + re-traduction)
    const originals = new WeakMap<Node, string>();
    const originalPlaceholders = new WeakMap<Element, string>();
    // Nœuds dont la traduction est déjà posée pour la langue courante
    const doneForLang = new WeakSet<Node>();

    let cancelled = false;
    let debounceTimer: number | null = null;
    let running = false;
    let observer: MutationObserver | null = null;

    function isSkippable(el: Element | null): boolean {
      let cur: Element | null = el;
      while (cur) {
        if (SKIP_TAGS.has(cur.tagName)) return true;
        if (cur.hasAttribute('data-no-translate')) return true;
        cur = cur.parentElement;
      }
      return false;
    }

    /** Collecte tous les nœuds texte pertinents non encore traités. */
    function collectTextNodes(): Node[] {
      const root = document.getElementById('root') ?? document.body;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const text = node.textContent?.trim() ?? '';
          if (text.length < 2 || SKIP_TEXT.test(text)) return NodeFilter.FILTER_REJECT;
          if (isSkippable(node.parentElement)) return NodeFilter.FILTER_REJECT;
          if (doneForLang.has(node)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes: Node[] = [];
      let n = walker.nextNode();
      while (n) { nodes.push(n); n = walker.nextNode(); }
      return nodes;
    }

    /** Collecte les placeholders d'input/textarea non encore traités. */
    function collectPlaceholders(): Element[] {
      const els = Array.from(document.querySelectorAll('input[placeholder],textarea[placeholder]'));
      return els.filter((el) => {
        if (isSkippable(el.parentElement)) return false;
        const ph = (el as HTMLInputElement).placeholder?.trim();
        return ph && ph.length >= 2 && !SKIP_TEXT.test(ph);
      });
    }

    function reconnect() {
      observer?.observe(document.getElementById('root') ?? document.body, {
        childList: true, subtree: true, characterData: true,
      });
    }

    // ─── Restauration FR ───
    function restoreFrench() {
      observer?.disconnect();
      // On ne peut pas itérer un WeakMap ; on re-walk et on remet l'original si connu.
      const root = document.getElementById('root') ?? document.body;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n = walker.nextNode();
      while (n) {
        const orig = originals.get(n);
        if (orig !== undefined && n.textContent !== orig) n.textContent = orig;
        n = walker.nextNode();
      }
      document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach((el) => {
        const orig = originalPlaceholders.get(el);
        if (orig !== undefined) (el as HTMLInputElement).placeholder = orig;
      });
    }

    if (language === 'fr') {
      restoreFrench();
      return () => { cancelled = true; };
    }

    // ─── Traduction ───
    async function run() {
      if (cancelled || running) return;
      running = true;
      try {
        // 1. Nœuds texte
        const nodes = collectTextNodes();
        const texts = nodes.map((n) => {
          const t = n.textContent ?? '';
          if (!originals.has(n)) originals.set(n, t); // mémorise le FR original
          return originals.get(n)!.trim();
        });

        const LOT = 50;
        for (let i = 0; i < nodes.length; i += LOT) {
          if (cancelled) return;
          const sliceNodes = nodes.slice(i, i + LOT);
          const sliceTexts = texts.slice(i, i + LOT);
          const translations = await translateBatch(sliceTexts, language);
          if (cancelled) return;
          observer?.disconnect();
          sliceNodes.forEach((node, idx) => {
            const tr = translations[idx];
            if (tr && tr !== sliceTexts[idx]) node.textContent = tr;
            doneForLang.add(node);
          });
          reconnect();
        }

        // 2. Placeholders
        const phEls = collectPlaceholders();
        for (const el of phEls) {
          if (cancelled) return;
          const input = el as HTMLInputElement;
          const orig = input.placeholder.trim();
          if (!originalPlaceholders.has(el)) originalPlaceholders.set(el, input.placeholder);
          const tr = await translateText(orig, language);
          if (cancelled) return;
          observer?.disconnect();
          if (tr && tr !== orig) input.placeholder = tr;
          reconnect();
        }
      } finally {
        running = false;
      }
    }

    function schedule(delay: number) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(run, delay);
    }

    observer = new MutationObserver((mutations) => {
      // On ne réagit qu'à l'ajout de nœuds (navigation, contenu async).
      // Les mutations characterData de notre propre écriture sont ignorées
      // car l'observer est débranché pendant qu'on écrit.
      if (mutations.some((m) => m.addedNodes.length > 0)) schedule(700);
    });

    schedule(350);
    reconnect();

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      observer?.disconnect();
    };
  }, [language]);

  return null;
}
