import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  fetchExchangeRates,
  detectUserCurrency,
  convertCurrency,
  formatCurrency as formatCurrencyUtil,
  SUPPORTED_CURRENCIES,
  type ExchangeRates,
  type Currency,
} from '../services/currencyService';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (code: string) => void;
  exchangeRates: ExchangeRates | null;
  loading: boolean;
  convertAmount: (amount: number, fromCurrency: string) => number;
  formatAmount: (amount: number, fromCurrency: string) => string;
  getCurrency: (code: string) => Currency | undefined;
  supportedCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'lokadia_selected_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>(() => {
    // Essayer de récupérer depuis localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    
    // Sinon, détecter automatiquement
    return detectUserCurrency();
  });
  
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les taux de change au démarrage et quand la devise change
  useEffect(() => {
    let isMounted = true;

    async function loadRates() {
      try {
        setLoading(true);
        const rates = await fetchExchangeRates('EUR'); // Base EUR
        if (isMounted) {
          setExchangeRates(rates);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur chargement taux de change:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRates();

    // Rafraîchir les taux toutes les 6 heures
    const interval = setInterval(loadRates, 6 * 60 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const convertAmount = (amount: number, fromCurrency: string): number => {
    if (!exchangeRates) return amount;
    return convertCurrency(amount, fromCurrency, selectedCurrency, exchangeRates);
  };

  const formatAmount = (amount: number, fromCurrency: string): string => {
    const converted = convertAmount(amount, fromCurrency);
    return formatCurrencyUtil(converted, selectedCurrency);
  };

  const getCurrency = (code: string): Currency | undefined => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    loading,
    convertAmount,
    formatAmount,
    getCurrency,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    // En développement avec HMR, parfois le provider n'est pas encore monté
    if (typeof window !== 'undefined' && import.meta.hot) {
      console.log('⚠️  CurrencyProvider temporairement indisponible (HMR), utilisation des valeurs par défaut...');
      // Retourner des valeurs par défaut pour éviter le crash complet
      return {
        selectedCurrency: 'EUR',
        setSelectedCurrency: () => {},
        exchangeRates: null,
        loading: false,
        convertAmount: (amount: number) => amount,
        formatAmount: (amount: number) => `${amount}€`,
        getCurrency: () => undefined,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      } as CurrencyContextType;
    }
    throw new Error('useCurrency doit être utilisé dans un CurrencyProvider');
  }
  return context;
}