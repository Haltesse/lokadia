/**
 * paymentService — abstraction de paiement.
 *
 * Implémentation actuelle : simulation (démo). L'interface est conçue pour
 * être remplacée par Stripe / Adyen sans toucher à l'UI de checkout :
 * il suffira de remplacer le corps de `processPayment` par un appel à une
 * Edge Function créant un PaymentIntent Stripe, puis de confirmer côté client.
 *
 * ⚠️ Vendre des vols/hôtels en direct (merchant of record) nécessite aussi le
 * statut d'agence de voyage (immatriculation Atout France, garantie financière
 * APST, RCP) — décision business/juridique, indépendante de ce code.
 */
import type { CartItem } from './cart';

export interface PaymentDetails {
  fullName: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export interface PaymentResult {
  ok: boolean;
  reference?: string;
  error?: string;
}

function genRef(): string {
  const s = 'LOKADIA-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 9000 + 1000);
  return s;
}

/** Validation basique côté client (Luhn light + champs requis) */
export function validatePayment(d: PaymentDetails): string | null {
  if (!d.fullName.trim()) return 'Nom requis';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return 'Email invalide';
  const digits = d.cardNumber.replace(/\s/g, '');
  if (digits.length < 13 || !/^\d+$/.test(digits)) return 'Numéro de carte invalide';
  if (!/^\d{2}\s*\/\s*\d{2}$/.test(d.expiry)) return 'Date d\'expiration invalide (MM/AA)';
  if (!/^\d{3,4}$/.test(d.cvc)) return 'CVC invalide';
  return null;
}

/**
 * Traite le paiement. Démo : simule un délai réseau + succès.
 * Pour brancher Stripe : remplacer par un fetch vers l'Edge Function
 * `create-payment-intent` puis stripe.confirmCardPayment().
 */
export async function processPayment(
  amount: number,
  items: CartItem[],
  details: PaymentDetails
): Promise<PaymentResult> {
  const err = validatePayment(details);
  if (err) return { ok: false, error: err };
  if (amount <= 0 || items.length === 0) return { ok: false, error: 'Panier vide' };

  // Simulation d'appel PSP
  await new Promise((r) => setTimeout(r, 1400));

  // Carte de test refusée (pour démontrer la gestion d'erreur)
  if (details.cardNumber.replace(/\s/g, '').endsWith('0000')) {
    return { ok: false, error: 'Paiement refusé par la banque (carte test 0000).' };
  }
  return { ok: true, reference: genRef() };
}
