/**
 * Panier d'achat Lokadia — achat in-app de tous les éléments d'un voyage
 * (vol, hôtel, train, e-SIM, assurance, activités) sans redirection externe.
 *
 * Architecture volontairement découplée : le panier ne connaît que des
 * "items" génériques. Les catalogues (bookingCatalog.ts) produisent ces items,
 * et le paiement (paymentService.ts) est branchable sur un vrai PSP (Stripe)
 * le jour où les contrats partenaires + le statut d'agence sont en place.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode, createElement } from 'react';
import { Plane, Hotel, Train, Wifi, ShieldCheck, Ticket, type LucideIcon } from 'lucide-react';

export type CartCategory = 'flight' | 'hotel' | 'train' | 'esim' | 'insurance' | 'activity';

export interface CartItem {
  id: string;
  category: CartCategory;
  title: string;
  subtitle: string;
  /** Prix unitaire en euros */
  price: number;
  qty: number;
  /** Métadonnée libre affichée (ex: "3 nuits", "5 GB / 30j") */
  meta?: string;
  /** Destination liée (pour regroupement) */
  destinationId?: string;
}

const STORAGE_KEY = 'lokadia_cart_v1';

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  has: (id: string) => boolean;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue>({
  items: [], add: () => {}, remove: () => {}, setQty: () => {}, clear: () => {},
  has: () => false, count: 0, total: 0,
});

function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => (typeof window !== 'undefined' ? load() : []));

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add = useCallback((item: Omit<CartItem, 'qty'> & { qty?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + (item.qty ?? 1) } : i));
      return [...prev, { ...item, qty: item.qty ?? 1 }];
    });
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const setQty = useCallback((id: string, qty: number) =>
    setItems((prev) => prev.flatMap((i) => (i.id === id ? (qty <= 0 ? [] : [{ ...i, qty }]) : [i]))), []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return createElement(CartContext.Provider, { value: { items, add, remove, setQty, clear, has, count, total } }, children);
}

export function useCart(): CartContextValue {
  return useContext(CartContext);
}

export const CATEGORY_META: Record<CartCategory, { label: string; Icon: LucideIcon; color: string }> = {
  flight: { label: 'Vol', Icon: Plane, color: '#0F4C81' },
  hotel: { label: 'Hôtel', Icon: Hotel, color: '#7C3AED' },
  train: { label: 'Train', Icon: Train, color: '#0E7490' },
  esim: { label: 'e-SIM', Icon: Wifi, color: '#059669' },
  insurance: { label: 'Assurance', Icon: ShieldCheck, color: '#D97706' },
  activity: { label: 'Activité', Icon: Ticket, color: '#DB2777' },
};
