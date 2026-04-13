import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { parsePrice } from '../services/currencyService';

interface PriceDisplayProps {
  price: string; // Format: "€5.00" ou "5€" ou "$10" ou "¥50"
  originalCurrency?: string; // Devise d'origine si non incluse dans price
  localCurrency?: string; // Devise locale du pays (ex: "CNY" pour Chine) pour désambiguïser ¥
  className?: string;
  showOriginal?: boolean; // Afficher le prix original en petit
  period?: string; // Période pour les abonnements (ex: "/mois")
}

export function PriceDisplay({ 
  price, 
  originalCurrency,
  localCurrency,
  className = '', 
  showOriginal = false,
  period 
}: PriceDisplayProps) {
  const { formatAmount, selectedCurrency, loading } = useCurrency();

  // Parser le prix
  const parsed = parsePrice(price, localCurrency);
  if (!parsed) {
    return <span className={className}>{price}</span>;
  }

  const fromCurrency = originalCurrency || parsed.currency;
  
  // Si on charge encore les taux, afficher tel quel
  if (loading) {
    return <span className={className}>{price}</span>;
  }

  const convertedPrice = formatAmount(parsed.amount, fromCurrency);
  const isDifferentCurrency = fromCurrency !== selectedCurrency;

  // Si on a une période (pour les abonnements)
  if (period) {
    return (
      <div className={className}>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold" style={{ color: "#0A2545" }}>
            {convertedPrice}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
            {period}
          </span>
          {isDifferentCurrency && (
            <span className="text-xs opacity-60">({price})</span>
          )}
        </div>
      </div>
    );
  }

  // Si on veut afficher l'original ET que c'est une devise différente
  if (showOriginal && isDifferentCurrency) {
    return (
      <span className={className}>
        <span className="font-semibold">{convertedPrice}</span>
        <span className="text-xs opacity-60 ml-1">({price})</span>
      </span>
    );
  }

  return <span className={className}>{convertedPrice}</span>;
}

interface PriceRangeDisplayProps {
  minPrice: string;
  maxPrice: string;
  originalCurrency?: string;
  className?: string;
}

export function PriceRangeDisplay({ 
  minPrice, 
  maxPrice, 
  originalCurrency, 
  className = '' 
}: PriceRangeDisplayProps) {
  return (
    <span className={className}>
      <PriceDisplay price={minPrice} originalCurrency={originalCurrency} />
      {' - '}
      <PriceDisplay price={maxPrice} originalCurrency={originalCurrency} />
    </span>
  );
}