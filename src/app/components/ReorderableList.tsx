import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { GripVertical } from 'lucide-react';

/**
 * ReorderableList — réorganisation par glisser-déposer, sans dépendance.
 *
 * Choix techniques :
 *  · **Pointer Events** plutôt que l'API HTML5 Drag & Drop, qui ne
 *    fonctionne pas au doigt sur mobile — or le produit est mobile-first.
 *  · **Accessible au clavier** : la poignée est un bouton ; flèches haut
 *    et bas déplacent l'élément. Un glisser-déposer non utilisable au
 *    clavier exclut une partie des utilisateurs (WCAG 2.2 AA).
 *  · Les positions des voisins sont mesurées au début du geste, pas à
 *    chaque frame : cela évite de relire le layout en continu et garde le
 *    déplacement fluide sur mobile milieu de gamme.
 *  · `prefers-reduced-motion` est respecté (transitions désactivées).
 */

export interface ReorderableItem {
  id: string;
}

interface Props<T extends ReorderableItem> {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  /** Libellé accessible d'un élément, annoncé lors des déplacements */
  itemLabel: (item: T) => string;
  disabled?: boolean;
  className?: string;
}

interface Rect { top: number; height: number; }

export function ReorderableList<T extends ReorderableItem>({
  items,
  onReorder,
  renderItem,
  itemLabel,
  disabled = false,
  className = '',
}: Props<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const containerRef = useRef<HTMLUListElement>(null);
  const rectsRef = useRef<Rect[]>([]);
  const startYRef = useRef(0);
  const sourceIndexRef = useRef(-1);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  /** Mesure une fois les positions de tous les éléments. */
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    rectsRef.current = [...container.children].map((child) => {
      const r = (child as HTMLElement).getBoundingClientRect();
      return { top: r.top, height: r.height };
    });
  }, []);

  const commit = useCallback(
    (from: number, to: number) => {
      if (from === to || to < 0 || to >= items.length) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next.map((i) => i.id));
    },
    [items, onReorder],
  );

  // ─── Glisser au pointeur (souris et tactile) ───
  useEffect(() => {
    if (!draggingId) return;

    function onMove(e: PointerEvent) {
      const dy = e.clientY - startYRef.current;
      setOffsetY(dy);

      // Position visée : premier voisin dont le centre est dépassé
      const rects = rectsRef.current;
      const source = sourceIndexRef.current;
      const draggedCenter = rects[source].top + rects[source].height / 2 + dy;

      let index = source;
      for (let i = 0; i < rects.length; i++) {
        if (i === source) continue;
        const center = rects[i].top + rects[i].height / 2;
        if (i < source && draggedCenter < center) { index = Math.min(index, i); }
        if (i > source && draggedCenter > center) { index = Math.max(index, i); }
      }
      setTargetIndex(index);
    }

    function onUp() {
      const source = sourceIndexRef.current;
      const target = targetIndex ?? source;
      if (target !== source) {
        commit(source, target);
        setAnnouncement(`Étape déplacée en position ${target + 1} sur ${items.length}.`);
      }
      setDraggingId(null);
      setOffsetY(0);
      setTargetIndex(null);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [draggingId, targetIndex, commit, items.length]);

  function startDrag(e: React.PointerEvent, id: string, index: number) {
    if (disabled) return;
    e.preventDefault();
    measure();
    startYRef.current = e.clientY;
    sourceIndexRef.current = index;
    setDraggingId(id);
    setTargetIndex(index);
  }

  function onKeyDown(e: React.KeyboardEvent, index: number, item: T) {
    if (disabled) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const to = e.key === 'ArrowUp' ? index - 1 : index + 1;
    if (to < 0 || to >= items.length) return;
    commit(index, to);
    setAnnouncement(`${itemLabel(item)} déplacée en position ${to + 1} sur ${items.length}.`);
  }

  /** Décalage visuel des éléments non saisis, pour montrer la place libérée. */
  function shiftFor(index: number): number {
    if (draggingId === null || targetIndex === null) return 0;
    const source = sourceIndexRef.current;
    const height = rectsRef.current[source]?.height ?? 0;
    if (index === source) return 0;
    if (source < targetIndex && index > source && index <= targetIndex) return -height;
    if (source > targetIndex && index < source && index >= targetIndex) return height;
    return 0;
  }

  return (
    <>
      {/* Retour vocal des déplacements pour les lecteurs d'écran */}
      <p aria-live="polite" className="sr-only">{announcement}</p>

      <ul ref={containerRef} className={className}>
        {items.map((item, index) => {
          const isDragging = draggingId === item.id;
          const shift = shiftFor(index);
          return (
            <li
              key={item.id}
              className="relative flex items-stretch gap-2"
              style={{
                transform: isDragging ? `translateY(${offsetY}px)` : `translateY(${shift}px)`,
                transition: isDragging || reducedMotion ? 'none' : 'transform 180ms var(--lk-ease, ease)',
                zIndex: isDragging ? 20 : 1,
                opacity: isDragging ? 0.92 : 1,
                touchAction: 'none',
              }}
            >
              <button
                type="button"
                aria-label={`Déplacer ${itemLabel(item)}. Utilisez les flèches haut et bas.`}
                disabled={disabled}
                onPointerDown={(e) => startDrag(e, item.id, index)}
                onKeyDown={(e) => onKeyDown(e, index, item)}
                className="flex w-8 flex-shrink-0 cursor-grab items-center justify-center rounded-lg active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
                style={{ color: 'var(--lokadia-gray-400)', touchAction: 'none' }}
              >
                <GripVertical size={16} />
              </button>
              <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
