import { createContext, useContext, useState, ReactNode } from "react";

type Currency = "EUR" | "USD" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  format: (amount: number) => string;
  availableCurrencies: { code: Currency; symbol: string; name: string }[];
}

const currencies = {
  EUR: { symbol: "€", name: "Euro" },
  USD: { symbol: "$", name: "US Dollar" },
  GBP: { symbol: "£", name: "British Pound" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  CAD: { symbol: "CA$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  CHF: { symbol: "CHF", name: "Swiss Franc" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
};

// Approximate rates vs EUR
const rates: Record<Currency, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.86,
  JPY: 162,
  CAD: 1.48,
  AUD: 1.67,
  CHF: 0.96,
  CNY: 7.88,
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem("lokadia_currency") as Currency) || "EUR";
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("lokadia_currency", c);
  };

  const symbol = currencies[currency].symbol;

  const format = (amountEur: number) => {
    const converted = amountEur * rates[currency];
    if (currency === "JPY" || currency === "CNY") {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toFixed(0)}`;
  };

  const availableCurrencies = Object.entries(currencies).map(([code, val]) => ({
    code: code as Currency,
    symbol: val.symbol,
    name: val.name,
  }));

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, format, availableCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
