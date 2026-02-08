import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CurrencyCode = 'IRR' | 'IRT' | 'USD';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
}

export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  IRT: {
    code: 'IRT',
    name: 'تومان',
    symbol: 'تومان',
    locale: 'fa-IR',
  },
  IRR: {
    code: 'IRR',
    name: 'ریال',
    symbol: 'ریال',
    locale: 'fa-IR',
  },
  USD: {
    code: 'USD',
    name: 'دلار',
    symbol: '$',
    locale: 'en-US',
  },
};

export interface ExchangeRates {
  usd_to_irr: number;
  usd_to_irt: number;
  source: string;
  updated_at: string;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  currencyInfo: CurrencyInfo;
  formatAmount: (amount: number) => string;
  formatAmountCompact: (amount: number) => string;
  /** Convert an amount stored in IRT to the currently selected currency */
  convertAmount: (amountInIRT: number) => number;
  exchangeRates: ExchangeRates | null;
  ratesLoading: boolean;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'siaflow-currency';
const RATES_CACHE_KEY = 'siaflow-exchange-rates';
const RATES_CACHE_DURATION = 30 * 60 * 1000; // 30 min

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored && (stored === 'IRT' || stored === 'IRR' || stored === 'USD')) {
        return stored as CurrencyCode;
      }
    }
    return 'IRT';
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(RATES_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - new Date(parsed.updated_at).getTime() < RATES_CACHE_DURATION) {
            return parsed;
          }
        } catch {}
      }
    }
    return null;
  });
  const [ratesLoading, setRatesLoading] = useState(false);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-exchange-rates');
      if (error) throw error;
      if (data && data.usd_to_irt) {
        const rates: ExchangeRates = {
          usd_to_irr: data.usd_to_irr,
          usd_to_irt: data.usd_to_irt,
          source: data.source,
          updated_at: data.updated_at,
        };
        setExchangeRates(rates);
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(rates));
      }
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  // Fetch rates on mount and when needed
  useEffect(() => {
    if (!exchangeRates) {
      fetchRates();
    }
  }, [exchangeRates, fetchRates]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    // Refresh rates when switching to ensure accuracy
    if (newCurrency !== 'IRT') {
      fetchRates();
    }
  };

  const currencyInfo = currencies[currency];

  // Convert from IRT (base currency in DB) to selected currency
  const convertAmount = useCallback((amountInIRT: number): number => {
    if (currency === 'IRT') return amountInIRT;
    if (currency === 'IRR') return amountInIRT * 10;
    if (currency === 'USD' && exchangeRates) {
      return amountInIRT / exchangeRates.usd_to_irt;
    }
    return amountInIRT;
  }, [currency, exchangeRates]);

  const formatAmount = useCallback((amount: number): string => {
    const converted = convertAmount(amount);
    
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(converted) + ' $';
    }
    
    return new Intl.NumberFormat('fa-IR').format(Math.round(converted)) + ' ' + currencyInfo.symbol;
  }, [currency, currencyInfo.symbol, convertAmount]);

  const formatAmountCompact = useCallback((amount: number): string => {
    const converted = convertAmount(amount);

    if (currency === 'USD') {
      if (converted >= 1000000) {
        return (converted / 1000000).toFixed(1).replace(/\.0$/, '') + 'M $';
      }
      if (converted >= 1000) {
        return (converted / 1000).toFixed(1).replace(/\.0$/, '') + 'K $';
      }
      return converted.toFixed(0) + ' $';
    }
    
    const rounded = Math.round(converted);
    
    // Persian compact formatting
    if (rounded >= 1000000000) {
      const value = rounded / 1000000000;
      return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value) + ' میلیارد ' + currencyInfo.symbol;
    }
    if (rounded >= 1000000) {
      const value = rounded / 1000000;
      return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value) + ' میلیون ' + currencyInfo.symbol;
    }
    if (rounded >= 1000) {
      const value = rounded / 1000;
      return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(value) + ' هزار ' + currencyInfo.symbol;
    }
    
    return new Intl.NumberFormat('fa-IR').format(rounded) + ' ' + currencyInfo.symbol;
  }, [currency, currencyInfo.symbol, convertAmount]);

  return (
    <CurrencyContext.Provider value={{ 
      currency, setCurrency, currencyInfo, 
      formatAmount, formatAmountCompact,
      convertAmount, exchangeRates, ratesLoading, refreshRates: fetchRates
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
