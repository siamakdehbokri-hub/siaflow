 import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
 
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
 
 interface CurrencyContextType {
   currency: CurrencyCode;
   setCurrency: (currency: CurrencyCode) => void;
   currencyInfo: CurrencyInfo;
   formatAmount: (amount: number) => string;
   formatAmountCompact: (amount: number) => string;
 }
 
 const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
 
 const CURRENCY_STORAGE_KEY = 'siaflow-currency';
 
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
 
   const setCurrency = (newCurrency: CurrencyCode) => {
     setCurrencyState(newCurrency);
     localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
   };
 
   const currencyInfo = currencies[currency];
 
   const formatAmount = (amount: number): string => {
     if (currency === 'USD') {
       return new Intl.NumberFormat('en-US', {
         style: 'decimal',
         minimumFractionDigits: 0,
         maximumFractionDigits: 2,
       }).format(amount) + ' $';
     }
     
     return new Intl.NumberFormat('fa-IR').format(amount) + ' ' + currencyInfo.symbol;
   };
 
   const formatAmountCompact = (amount: number): string => {
     if (currency === 'USD') {
       if (amount >= 1000000) {
         return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M $';
       }
       if (amount >= 1000) {
         return (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'K $';
       }
       return amount.toFixed(0) + ' $';
     }
     
     // Persian compact formatting
     if (amount >= 1000000000) {
       const value = amount / 1000000000;
       return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value) + ' میلیارد ' + currencyInfo.symbol;
     }
     if (amount >= 1000000) {
       const value = amount / 1000000;
       return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value) + ' میلیون ' + currencyInfo.symbol;
     }
     if (amount >= 1000) {
       const value = amount / 1000;
       return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(value) + ' هزار ' + currencyInfo.symbol;
     }
     
     return new Intl.NumberFormat('fa-IR').format(amount) + ' ' + currencyInfo.symbol;
   };
 
   return (
     <CurrencyContext.Provider value={{ currency, setCurrency, currencyInfo, formatAmount, formatAmountCompact }}>
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