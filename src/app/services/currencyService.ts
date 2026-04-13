// Service de conversion de devises utilisant l'API publique ExchangeRate-API
// API publique gratuite : https://api.exchangerate-api.com/v4/latest/
// Pas besoin de clé API pour les taux de base

const EXCHANGE_API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

// Cache pour éviter trop d'appels API
let cachedRates: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ExchangeRates {
  base: string;
  rates: { [key: string]: number };
  lastUpdate: number;
}

// Liste des devises supportées
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: 'EU' },
  { code: 'USD', name: 'Dollar américain', symbol: '$', flag: 'US' },
  { code: 'GBP', name: 'Livre sterling', symbol: '£', flag: 'GB' },
  { code: 'CHF', name: 'Franc suisse', symbol: 'CHF', flag: 'CH' },
  { code: 'JPY', name: 'Yen japonais', symbol: '¥', flag: 'JP' },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'CA$', flag: 'CA' },
  { code: 'AUD', name: 'Dollar australien', symbol: 'A$', flag: 'AU' },
  { code: 'CNY', name: 'Yuan chinois', symbol: '¥', flag: 'CN' },
  { code: 'INR', name: 'Roupie indienne', symbol: '₹', flag: 'IN' },
  { code: 'BRL', name: 'Real brésilien', symbol: 'R$', flag: 'BR' },
  { code: 'MXN', name: 'Peso mexicain', symbol: 'MX$', flag: 'MX' },
  { code: 'AED', name: 'Dirham des EAU', symbol: 'AED', flag: 'AE' },
  { code: 'THB', name: 'Baht thaïlandais', symbol: '฿', flag: 'TH' },
  { code: 'MYR', name: 'Ringgit malaisien', symbol: 'RM', flag: 'MY' },
  { code: 'SGD', name: 'Dollar de Singapour', symbol: 'S$', flag: 'SG' },
  { code: 'KRW', name: 'Won sud-coréen', symbol: '₩', flag: 'KR' },
  { code: 'TRY', name: 'Livre turque', symbol: '₺', flag: 'TR' },
  { code: 'MAD', name: 'Dirham marocain', symbol: 'MAD', flag: 'MA' },
  { code: 'EGP', name: 'Livre égyptienne', symbol: 'E£', flag: 'EG' },
  { code: 'ARS', name: 'Peso argentin', symbol: 'AR$', flag: 'AR' },
  { code: 'DKK', name: 'Couronne danoise', symbol: 'kr', flag: 'DK' },
  { code: 'SEK', name: 'Couronne suédoise', symbol: 'kr', flag: 'SE' },
  { code: 'NOK', name: 'Couronne norvégienne', symbol: 'kr', flag: 'NO' },
  { code: 'PLN', name: 'Złoty polonais', symbol: 'zł', flag: 'PL' },
  { code: 'CZK', name: 'Couronne tchèque', symbol: 'Kč', flag: 'CZ' },
  { code: 'ISK', name: 'Couronne islandaise', symbol: 'kr', flag: 'IS' },
  { code: 'RUB', name: 'Rouble russe', symbol: '₽', flag: 'RU' },
];

// Taux de change mock (mis à jour manuellement - base EUR)
const mockExchangeRates: ExchangeRates = {
  base: 'EUR',
  rates: {
    EUR: 1.0,
    USD: 1.09,
    GBP: 0.86,
    CHF: 0.94,
    JPY: 163.5,
    CAD: 1.51,
    AUD: 1.68,
    CNY: 7.85,
    INR: 91.2,
    BRL: 6.25,
    MXN: 19.8,
    AED: 4.0,
    THB: 37.5,
    MYR: 5.0,
    SGD: 1.45,
    KRW: 1450,
    TRY: 35.2,
    MAD: 10.8,
    EGP: 53.5,
    ARS: 1075,
    DKK: 7.46,
    SEK: 11.35,
    NOK: 11.75,
    PLN: 4.31,
    CZK: 24.7,
    ISK: 150.5,
    RUB: 105.0,
  },
  lastUpdate: Date.now(),
};

/**
 * Récupère les taux de change depuis l'API ou retourne les données mock
 */
export async function fetchExchangeRates(baseCurrency: string = 'EUR'): Promise<ExchangeRates> {
  try {
    // Vérifier si les données sont en cache et encore valides
    if (cachedRates && Date.now() - lastFetchTime < CACHE_DURATION && cachedRates.base === baseCurrency) {
      return cachedRates;
    }

    // Appel réel à l'API publique
    const response = await fetch(`${EXCHANGE_API_BASE_URL}/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des taux de change');
    }

    const data = await response.json();

    const exchangeRates: ExchangeRates = {
      base: data.base,
      rates: data.rates,
      lastUpdate: data.time_last_update_unix ? data.time_last_update_unix * 1000 : Date.now(),
    };

    // Mettre en cache les données
    cachedRates = exchangeRates;
    lastFetchTime = Date.now();

    return exchangeRates;
  } catch (error) {
    console.error('Erreur taux de change, utilisation des données mock:', error);
    
    // En cas d'erreur, utiliser les données mock
    if (baseCurrency !== 'EUR') {
      const baseRate = mockExchangeRates.rates[baseCurrency];
      if (!baseRate) return mockExchangeRates;
      
      const convertedRates: { [key: string]: number } = {};
      Object.entries(mockExchangeRates.rates).forEach(([code, rate]) => {
        convertedRates[code] = rate / baseRate;
      });
      
      return {
        base: baseCurrency,
        rates: convertedRates,
        lastUpdate: Date.now(),
      };
    }
    
    return mockExchangeRates;
  }
}

/**
 * Convertit un montant d'une devise vers une autre
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Si la devise de base est celle de départ
  if (rates.base === fromCurrency) {
    const rate = rates.rates[toCurrency];
    return rate ? amount * rate : amount;
  }
  
  // Si la devise de base est celle d'arrivée
  if (rates.base === toCurrency) {
    const rate = rates.rates[fromCurrency];
    return rate ? amount / rate : amount;
  }
  
  // Sinon, conversion via la devise de base
  const fromRate = rates.rates[fromCurrency];
  const toRate = rates.rates[toCurrency];
  
  if (!fromRate || !toRate) return amount;
  
  // Convertir vers la base puis vers la devise cible
  const amountInBase = amount / fromRate;
  return amountInBase * toRate;
}

/**
 * Formate un montant avec la devise appropriée
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  
  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
  
  // Arrondir selon la devise
  let roundedAmount = amount;
  if (['JPY', 'KRW', 'ISK'].includes(currencyCode)) {
    // Pas de décimales pour ces devises
    roundedAmount = Math.round(amount);
    return `${currency.symbol} ${roundedAmount.toLocaleString('fr-FR')}`;
  } else {
    roundedAmount = Math.round(amount * 100) / 100;
    return `${currency.symbol} ${roundedAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Détecte la devise du pays de l'utilisateur via la locale
 */
export function detectUserCurrency(): string {
  try {
    // Essayer de détecter via la locale du navigateur
    const locale = navigator.language || 'en-US';
    
    // Mapping manuel des locales vers devises
    const localeMap: { [key: string]: string } = {
      'fr': 'EUR',
      'fr-FR': 'EUR',
      'fr-BE': 'EUR',
      'fr-CH': 'CHF',
      'fr-CA': 'CAD',
      'en-US': 'USD',
      'en-GB': 'GBP',
      'en-CA': 'CAD',
      'en-AU': 'AUD',
      'en-IN': 'INR',
      'de': 'EUR',
      'de-DE': 'EUR',
      'de-CH': 'CHF',
      'de-AT': 'EUR',
      'es': 'EUR',
      'es-ES': 'EUR',
      'es-MX': 'MXN',
      'es-AR': 'ARS',
      'it': 'EUR',
      'it-IT': 'EUR',
      'it-CH': 'CHF',
      'pt': 'EUR',
      'pt-PT': 'EUR',
      'pt-BR': 'BRL',
      'ja': 'JPY',
      'ja-JP': 'JPY',
      'zh': 'CNY',
      'zh-CN': 'CNY',
      'ko': 'KRW',
      'ko-KR': 'KRW',
      'th': 'THB',
      'th-TH': 'THB',
      'ar': 'AED',
      'ar-AE': 'AED',
      'ar-SA': 'AED',
      'tr': 'TRY',
      'tr-TR': 'TRY',
      'da': 'DKK',
      'da-DK': 'DKK',
      'sv': 'SEK',
      'sv-SE': 'SEK',
      'no': 'NOK',
      'nb-NO': 'NOK',
      'pl': 'PLN',
      'pl-PL': 'PLN',
      'cs': 'CZK',
      'cs-CZ': 'CZK',
      'is': 'ISK',
      'is-IS': 'ISK',
    };
    
    return localeMap[locale] || localeMap[locale.split('-')[0]] || 'EUR';
  } catch (error) {
    console.error('Erreur détection devise:', error);
    return 'EUR';
  }
}

/**
 * Parse un prix avec devise (ex: "€5.00", "$10", "5€", "¥50") et retourne le montant et la devise
 * @param localCurrency - Devise locale pour désambiguïser les symboles partagés (ex: "CNY" pour ¥ en Chine)
 */
export function parsePrice(priceString: string, localCurrency?: string): { amount: number; currency: string } | null {
  // Nettoyer la chaîne
  const cleaned = priceString.trim();
  
  // Si le symbole ¥ est présent et qu'on a un localCurrency hint
  if (cleaned.includes('¥') && localCurrency) {
    // Extraire le nombre
    const numberMatch = cleaned.match(/[\d.,]+/);
    if (numberMatch) {
      const numberStr = numberMatch[0].replace(',', '.');
      const amount = parseFloat(numberStr);
      if (!isNaN(amount)) {
        // Utiliser le localCurrency pour désambiguïser ¥ (JPY vs CNY)
        return { amount, currency: localCurrency };
      }
    }
  }
  
  // Essayer de trouver la devise
  for (const currency of SUPPORTED_CURRENCIES) {
    const symbolRegex = new RegExp(currency.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (symbolRegex.test(cleaned) || cleaned.includes(currency.code)) {
      // Extraire le nombre
      const numberMatch = cleaned.match(/[\d.,]+/);
      if (numberMatch) {
        const numberStr = numberMatch[0].replace(',', '.');
        const amount = parseFloat(numberStr);
        if (!isNaN(amount)) {
          return { amount, currency: currency.code };
        }
      }
    }
  }
  
  // Si aucune devise trouvée, essayer d'extraire juste le nombre
  const numberMatch = cleaned.match(/[\d.,]+/);
  if (numberMatch) {
    const numberStr = numberMatch[0].replace(',', '.');
    const amount = parseFloat(numberStr);
    if (!isNaN(amount)) {
      return { amount, currency: 'EUR' }; // Par défaut EUR
    }
  }
  
  return null;
}