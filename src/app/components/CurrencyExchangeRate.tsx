import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { ArrowRight, Plus, Minus } from 'lucide-react';

interface CurrencyExchangeRateProps {
  localCurrency: string; // Ex: "EUR" ou "Euro (EUR)"
}

export function CurrencyExchangeRate({ localCurrency }: CurrencyExchangeRateProps) {
  const { selectedCurrency, exchangeRates, getCurrency } = useCurrency();
  const [amount, setAmount] = useState(1);

  // Extraire le code de devise (ex: "Euro (EUR)" -> "EUR")
  const extractCurrencyCode = (currency: string): string => {
    // Chercher un code de 3 lettres majuscules entre parenthèses, avec ou sans slash/symboles après
    const match = currency.match(/\(([A-Z]{3})[\/)]/);
    if (match) return match[1];
    
    // Si c'est déjà un code de 3 lettres
    if (/^[A-Z]{3}$/.test(currency.trim())) return currency.trim();
    
    // Mapping des noms complets vers les codes
    const currencyMap: { [key: string]: string } = {
      'Euro': 'EUR',
      'Dollar américain': 'USD',
      'US Dollar': 'USD',
      'Livre sterling': 'GBP',
      'British Pound': 'GBP',
      'Franc suisse': 'CHF',
      'Swiss Franc': 'CHF',
      'Yen': 'JPY',
      'Yen japonais': 'JPY',
      'Dirham': 'AED',
      'Dirham des EAU': 'AED',
      'Dollar canadien': 'CAD',
      'Canadian Dollar': 'CAD',
      'Dollar australien': 'AUD',
      'Australian Dollar': 'AUD',
      'Yuan': 'CNY',
      'Yuan chinois': 'CNY',
      'Roupie': 'INR',
      'Roupie indienne': 'INR',
      'Real': 'BRL',
      'Real brésilien': 'BRL',
      'Peso': 'MXN',
      'Peso mexicain': 'MXN',
      'Baht': 'THB',
      'Baht thaïlandais': 'THB',
      'Ringgit': 'MYR',
      'Ringgit malaisien': 'MYR',
      'Won': 'KRW',
      'Won sud-coréen': 'KRW',
      'Livre turque': 'TRY',
      'Dirham marocain': 'MAD',
      'Livre égyptienne': 'EGP',
      'Peso argentin': 'ARS',
      'Couronne danoise': 'DKK',
      'Couronne suédoise': 'SEK',
      'Couronne norvégienne': 'NOK',
      'Złoty': 'PLN',
      'Złoty polonais': 'PLN',
      'Couronne tchèque': 'CZK',
      'Couronne islandaise': 'ISK',
      'Rouble': 'RUB',
      'Rouble russe': 'RUB',
    };
    
    // Enlever tout ce qui est entre parenthèses et trim
    const normalizedName = currency.replace(/\s*\([^)]*\).*/, '').trim();
    return currencyMap[normalizedName] || 'EUR';
  };

  const localCode = extractCurrencyCode(localCurrency);
  
  // Si c'est la même devise, ne rien afficher
  if (localCode === selectedCurrency || !exchangeRates) {
    return null;
  }

  const localCurrencyInfo = getCurrency(localCode);
  const selectedCurrencyInfo = getCurrency(selectedCurrency);

  if (!localCurrencyInfo || !selectedCurrencyInfo) {
    return null;
  }

  // Calculer le taux de change (1 devise sélectionnée = X devise locale)
  let rate = 1;
  
  if (exchangeRates.base === selectedCurrency) {
    rate = exchangeRates.rates[localCode] || 1;
  } else if (exchangeRates.base === localCode) {
    rate = 1 / (exchangeRates.rates[selectedCurrency] || 1);
  } else {
    const selectedRate = exchangeRates.rates[selectedCurrency];
    const localRate = exchangeRates.rates[localCode];
    if (selectedRate && localRate) {
      rate = localRate / selectedRate;
    }
  }

  // Formater le taux selon la devise locale
  const formatRate = (value: number) => {
    if (['JPY', 'KRW', 'ISK'].includes(localCode)) {
      return Math.round(value).toLocaleString('fr-FR');
    }
    return value.toFixed(2);
  };

  const handleIncrease = () => {
    setAmount((prev) => {
      if (prev < 10) return prev + 1;
      if (prev < 100) return prev + 10;
      if (prev < 1000) return prev + 100;
      return prev + 1000;
    });
  };

  const handleDecrease = () => {
    setAmount((prev) => {
      const newAmount = prev > 1000 ? prev - 1000 : 
                       prev > 100 ? prev - 100 : 
                       prev > 10 ? prev - 10 : 
                       prev - 1;
      return Math.max(1, newAmount);
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="mb-2">
        <label className="text-xs font-medium" style={{ color: "var(--lokadia-text-light)" }}>
          Convertisseur de devise
        </label>
      </div>
      
      {/* Contrôles pour modifier le montant */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={handleDecrease}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-95"
          style={{ 
            backgroundColor: "var(--lokadia-soft-white)",
            border: "1px solid var(--lokadia-blue)"
          }}
        >
          <Minus className="w-4 h-4" style={{ color: "var(--lokadia-blue)" }} />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            min="1"
            placeholder="Entrez un montant"
            className="w-full px-4 py-2 text-center text-base font-semibold rounded-lg border-2 outline-none"
            style={{ 
              borderColor: "var(--lokadia-blue)",
              color: "#0A2545"
            }}
          />
          <span 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
            style={{ color: "var(--lokadia-blue)" }}
          >
            {selectedCurrencyInfo.symbol}
          </span>
        </div>
        
        <button
          onClick={handleIncrease}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-95"
          style={{ 
            backgroundColor: "var(--lokadia-blue)"
          }}
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Résultat de la conversion */}
      <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="font-semibold" style={{ color: "var(--lokadia-blue)" }}>
            {amount} {selectedCurrencyInfo.symbol}
          </span>
          <ArrowRight className="w-4 h-4" style={{ color: "var(--lokadia-text-light)" }} />
          <span className="font-bold text-lg" style={{ color: "#0A2545" }}>
            {formatRate(rate * amount)} {localCurrencyInfo.symbol}
          </span>
        </div>
        <div className="text-xs text-center mt-1" style={{ color: "var(--lokadia-text-light)" }}>
          Taux de change actuel : 1 {selectedCurrencyInfo.symbol} = {formatRate(rate)} {localCurrencyInfo.symbol}
        </div>
        {exchangeRates?.lastUpdate && (
          <div className="text-xs text-center mt-1 flex items-center justify-center gap-1" style={{ color: "var(--lokadia-text-light)" }}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Taux en temps réel • Mis à jour {new Date(exchangeRates.lastUpdate).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
}