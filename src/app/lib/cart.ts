/**
 * Plan de budget — ex-« panier ».
 *
 * Le panier supposait des offres à prix ferme. Comme Lokadia n'en a jamais eu
 * — les prix affichés étaient fabriqués et aucun paiement n'a jamais été
 * encaissé — il devient ce qu'il était réellement : une liste de postes
 * budgétaires que le voyageur retient pour préparer son départ, chacun avec sa
 * fourchette et la méthode qui la produit.
 *
 * Pas de quantité : les fourchettes intègrent déjà le nombre de voyageurs et
 * la durée du séjour. Multiplier une estimation par une quantité rajouterait
 * une précision qu'elle n'a pas.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode, createElement } from 'react';
import { Plane, Hotel, Train, Wifi, ShieldCheck, Ticket, type LucideIcon } from 'lucide-react';

export type CartCategory = 'flight' | 'hotel' | 'train' | 'esim' | 'insurance' | 'activity';

export interface BudgetLine {
  id: string;
  category: CartCategory;
  /** Intitulé du poste, ex. « Hébergement ». */
  label: string;
  /** Bornes de la fourchette, en euros, pour l'ensemble du séjour. */
  low: number;
  high: number;
  /** Méthode de calcul, conservée pour rester lisible dans le récapitulatif. */
  method: string;
  /** Destination liée (pour regroupement). */
  destinationId?: string;
}

const STORAGE_KEY = 'lokadia_budget_v1';

interface CartContextValue {
  items: BudgetLine[];
  add: (line: BudgetLine) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  count: number;
  /** Somme des fourchettes de tous les postes retenus. */
  total: { low: number; high: number };
}

const CartContext = createContext<CartContextValue>({
  items: [], add: () => {}, remove: () => {}, clear: () => {},
  has: () => false, count: 0, total: { low: 0, high: 0 },
});

function load(): BudgetLine[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as BudgetLine[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BudgetLine[]>(() => (typeof window !== 'undefined' ? load() : []));

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add = useCallback((line: BudgetLine) => {
    setItems((prev) => (prev.some((i) => i.id === line.id) ? prev : [...prev, line]));
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const count = items.length;
  const total = items.reduce(
    (sum, i) => ({ low: sum.low + i.low, high: sum.high + i.high }),
    { low: 0, high: 0 }
  );

  return createElement(
    CartContext.Provider,
    { value: { items, add, remove, clear, has, count, total } },
    children
  );
}

export function useCart(): CartContextValue {
  return useContext(CartContext);
}

export const CATEGORY_META: Record<CartCategory, { label: string; Icon: LucideIcon; color: string }> = {
  flight: { label: 'Vol', Icon: Plane, color: '#0F4C81' },
  hotel: { label: 'Hébergement', Icon: Hotel, color: '#7C3AED' },
  train: { label: 'Train', Icon: Train, color: '#0E7490' },
  esim: { label: 'e-SIM', Icon: Wifi, color: '#059669' },
  insurance: { label: 'Assurance', Icon: ShieldCheck, color: '#D97706' },
  activity: { label: 'Activités', Icon: Ticket, color: '#DB2777' },
};
