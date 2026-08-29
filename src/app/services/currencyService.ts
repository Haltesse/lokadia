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
  // Ces quatre devises apparaissaient dans les prix repères du catalogue
  // (Hong Kong, Le Cap, Tel-Aviv, Bali) sans figurer ici : `parsePrice` ne
  // les reconnaissait pas et retombait sur l'euro, si bien que 13 prix
  // s'affichaient avec le bon nombre mais la mauvaise devise. L'API de taux
  // les fournit toutes les quatre.
  { code: 'HKD', name: 'Dollar de Hong Kong', symbol: 'HK$', flag: 'HK' },
  { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R', flag: 'ZA' },
  { code: 'ILS', name: 'Shekel israélien', symbol: '₪', flag: 'IL' },
  { code: 'IDR', name: 'Roupie indonésienne', symbol: 'Rp', flag: 'ID' },
];


/**
 * Taux de change du jour, ou `null` si l'API est injoignable.
 *
 * Une table figée servait auparavant de repli, horodatée à `Date.now()` :
 * l'interface affichait donc « Taux en temps réel · Mis à jour aujourd'hui »
 * au-dessus de valeurs écrites à la main des mois plus tôt. Sur un montant
 * que le voyageur va réellement dépenser, mieux vaut ne rien afficher.
 */
export async function fetchExchangeRates(baseCurrency: string = 'EUR'): Promise<ExchangeRates | null> {
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
    // Aucun repli : un taux périmé présenté comme actuel est pire que pas de
    // taux du tout, puisqu'il porte sur une dépense réelle.
    console.warn('Taux de change indisponibles :', error);
    return null;
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
 * Symboles partagés par plusieurs devises. Le code ISO du pays visité
 * (`localCurrency`) tranche ; sans lui, on prend la valeur la plus courante.
 */
const AMBIGUOUS_SYMBOLS: Record<string, { candidates: string[]; fallback: string }> = {
  '¥':  { candidates: ['JPY', 'CNY'], fallback: 'JPY' },
  'kr': { candidates: ['DKK', 'SEK', 'NOK', 'ISK'], fallback: 'DKK' },
};

/**
 * Extrait le premier nombre d'une chaîne, séparateurs de milliers compris.
 *
 * L'ancienne version faisait `match(/[\d.,]+/)[0].replace(',', '.')` :
 *   « 1,000 EGP »  → "1.000"    → 1        (mille fois trop petit)
 *   « 120,000 IDR »→ "120.000"  → 120
 *   « €1,234.56 »  → "1.234.56" → 1.234
 * Sur des montants que le voyageur va réellement dépenser, c'est intenable.
 *
 * Règles appliquées ici :
 *   - l'espace (y compris insécable) est toujours un séparateur de milliers ;
 *   - si « . » et « , » coexistent, le dernier des deux est le séparateur
 *     décimal (« 1.234,56 » comme « 1,234.56 ») ;
 *   - seul, un séparateur suivi d'exactement trois chiffres et non suivi
 *     d'un autre séparateur est un séparateur de milliers (« 1,000 ») ;
 *     sinon c'est une décimale (« 19,50 », « 12.35 »).
 */
function parseAmount(raw: string): number | null {
  const match = raw.match(/\d[\d\s\u00a0\u202f.,]*\d|\d/);
  if (!match) return null;

  let token = match[0].replace(/[\s\u00a0\u202f]/g, '');

  const lastDot = token.lastIndexOf('.');
  const lastComma = token.lastIndexOf(',');

  if (lastDot >= 0 && lastComma >= 0) {
    // Les deux présents : le dernier est la décimale, l'autre les milliers.
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const thousandSep = decimalSep === '.' ? ',' : '.';
    token = token.split(thousandSep).join('');
    token = token.replace(decimalSep, '.');
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? '.' : ',';
    const idx = lastDot >= 0 ? lastDot : lastComma;
    const after = token.length - idx - 1;
    const occurrences = token.split(sep).length - 1;
    // « 1,000 » ou « 1.234.567 » → milliers ; « 19,50 » ou « 12.35 » → décimale
    if (after === 3 && (occurrences > 1 || idx > 0)) {
      token = token.split(sep).join('');
    } else {
      token = token.replace(sep, '.');
    }
  }

  const amount = Number.parseFloat(token);
  return Number.isFinite(amount) ? amount : null;
}

/**
 * Devise d'une chaîne de prix, ou `null` si aucune n'est reconnue.
 *
 * L'ordre compte : un code ISO explicite (« 145 DKK ») l'emporte sur un
 * symbole, et les symboles sont testés du plus long au plus court pour que
 * « R$ », « CA$ », « MX$ » ou « E£ » ne soient pas avalés par « $ » et « £ ».
 * L'ancienne boucle parcourait les devises dans l'ordre de la liste : « R$ 100 »
 * ressortait en dollars américains, et « CA$ » aussi.
 */
function detectCurrency(text: string, localCurrency?: string): string | null {
  // 1. Code ISO isolé (limites de mot pour ne pas confondre avec un nom propre)
  for (const currency of SUPPORTED_CURRENCIES) {
    if (new RegExp(`\\b${currency.code}\\b`).test(text)) return currency.code;
  }

  // 2. Symboles, du plus long au plus court, et uniquement s'ils touchent le
  //    nombre. L'adjacence est indispensable pour les symboles courts et
  //    alphabétiques — « R » (rand) apparaîtrait sinon dans n'importe quel
  //    mot contenant un R majuscule, et « kr » dans n'importe quelle phrase.
  const bySymbolLength = [...SUPPORTED_CURRENCIES].sort(
    (a, b) => b.symbol.length - a.symbol.length
  );
  for (const currency of bySymbolLength) {
    const symbol = currency.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Symbole collé au nombre, avant ou après, avec au plus une espace.
    const adjacent = new RegExp(`(?:${symbol}\\s?\\d)|(?:\\d\\s?${symbol})`);
    if (!adjacent.test(text)) continue;

    const ambiguous = AMBIGUOUS_SYMBOLS[currency.symbol];
    if (ambiguous) {
      if (localCurrency && ambiguous.candidates.includes(localCurrency)) return localCurrency;
      return ambiguous.fallback;
    }
    return currency.code;
  }

  return null;
}

/**
 * Parse un prix (« 145 DKK (~19.50€) », « €5.00 », « $10-15 », « ¥50 ») et
 * renvoie le montant et sa devise.
 *
 * Le contenu entre parenthèses est retiré avant analyse : dans le catalogue,
 * il porte une conversion indicative (« (~19.50€) ») et non le prix lui-même.
 * L'ancienne version le laissait en place, si bien que le « € » du repère
 * faisait passer *tout* prix étranger pour un prix en euros — « 145 DKK »
 * s'affichait « 145,00 € » au lieu de « 19,50 € », et « Café latte 45 DKK »
 * annonçait 45 € au voyageur.
 *
 * Pour une fourchette (« 10-20 MAD »), la borne basse est retenue.
 *
 * @param localCurrency Code ISO du pays visité, pour trancher entre les
 *   devises qui partagent un symbole (¥ → JPY ou CNY, kr → DKK, SEK, NOK, ISK).
 */
export function parsePrice(
  priceString: string,
  localCurrency?: string,
): { amount: number; currency: string } | null {
  const original = priceString.trim();
  if (!original) return null;

  // Retirer les parenthèses (conversion indicative) avant toute analyse.
  const cleaned = original.replace(/\([^)]*\)/g, ' ').trim();
  const searchable = cleaned || original;

  const amount = parseAmount(searchable);
  if (amount === null) return null;

  const currency = detectCurrency(searchable, localCurrency);
  if (currency) return { amount, currency };

  // Aucune devise reconnue : on suppose la devise locale si elle est connue,
  // l'euro sinon. Supposer l'euro sur un prix libellé en monnaie locale était
  // la seconde moitié du bug ci-dessus.
  return { amount, currency: localCurrency ?? 'EUR' };
}