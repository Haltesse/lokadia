import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface CurrencySelectorProps {
  compact?: boolean;
  showLabel?: boolean;
}

export function CurrencySelector({ compact = false, showLabel = true }: CurrencySelectorProps) {
  const { selectedCurrency, setSelectedCurrency, supportedCurrencies, getCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currentCurrency = getCurrency(selectedCurrency);

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg">{currentCurrency?.flag}</span>
          <span className="font-semibold text-sm">{currentCurrency?.code}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
              {supportedCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    currency.code === selectedCurrency ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-2xl">{currency.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{currency.code}</div>
                    <div className="text-xs text-gray-500">{currency.name}</div>
                  </div>
                  {currency.code === selectedCurrency && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {showLabel && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--lokadia-text-dark)' }}>
          Devise préférée
        </label>
      )}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 transition-colors"
        >
          <span className="text-2xl">{currentCurrency?.flag}</span>
          <div className="flex-1 text-left">
            <div className="font-semibold">{currentCurrency?.name}</div>
            <div className="text-sm text-gray-500">{currentCurrency?.code}</div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
              {supportedCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    currency.code === selectedCurrency ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-2xl">{currency.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{currency.name}</div>
                    <div className="text-xs text-gray-500">{currency.code} - {currency.symbol}</div>
                  </div>
                  {currency.code === selectedCurrency && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
