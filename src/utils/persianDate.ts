import { format, formatDistance, getMonth, getYear, startOfMonth, endOfMonth, subMonths } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { toLocalISODateString } from '@/utils/dateUtils';

export const formatPersianDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'd MMMM yyyy', { locale: faIR });
};

export const formatPersianDateFull = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'EEEE d MMMM yyyy', { locale: faIR });
};

export const formatPersianDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'yyyy/MM/dd', { locale: faIR });
};

export const formatPersianMonth = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMMM yyyy', { locale: faIR });
};

export const formatPersianMonthOnly = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMMM', { locale: faIR });
};

export const formatPersianWeekday = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'EEEE', { locale: faIR });
};

export const formatPersianRelative = (dateString: string): string => {
  const date = new Date(dateString);
  return formatDistance(date, new Date(), { addSuffix: true, locale: faIR });
};

export const getPersianMonthName = (monthIndex: number): string => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[monthIndex] || '';
};

// Get Jalali month index from a date string (0-11)
export const getJalaliMonth = (dateString: string): number => {
  const date = new Date(dateString);
  return getMonth(date);
};

// Get Jalali year from a date string
export const getJalaliYear = (dateString: string): number => {
  const date = new Date(dateString);
  return getYear(date);
};

// Get Jalali month name from a date string or Date object
export const getJalaliMonthName = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM yyyy', { locale: faIR });
};

// Get current Jalali month boundaries (start and end dates in ISO format)
export const getCurrentJalaliMonthBounds = (): { start: string; end: string } => {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);
  return {
    start: toLocalISODateString(startDate),
    end: toLocalISODateString(endDate),
  };
};

// Get previous Jalali month boundaries
export const getPreviousJalaliMonthBounds = (): { start: string; end: string } => {
  const now = new Date();
  const prevMonth = subMonths(now, 1);
  const startDate = startOfMonth(prevMonth);
  const endDate = endOfMonth(prevMonth);
  return {
    start: toLocalISODateString(startDate),
    end: toLocalISODateString(endDate),
  };
};

// Check if a date string falls within the current Jalali month
export const isInCurrentJalaliMonth = (dateString: string): boolean => {
  const { start, end } = getCurrentJalaliMonthBounds();
  return dateString >= start && dateString <= end;
};

// Check if a date string falls within the previous Jalali month
export const isInPreviousJalaliMonth = (dateString: string): boolean => {
  const { start, end } = getPreviousJalaliMonthBounds();
  return dateString >= start && dateString <= end;
};

// Get Jalali month key for grouping (e.g., "1403-11")
export const getJalaliMonthKey = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM', { locale: faIR });
};

export const getPersianWeekdays = (): string[] => {
  return ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
};

/**
 * Format an amount stored in IRT (base) using the currency the user selected.
 * Reads `siaflow-currency` (and cached exchange rates) from localStorage so
 * non-React utility callers stay in sync with the CurrencyProvider.
 *
 * Prefer `useCurrency().formatAmount` inside React components.
 */
export const formatCurrency = (amountInIRT: number): string => {
  if (typeof window === 'undefined') {
    return new Intl.NumberFormat('fa-IR').format(Math.round(amountInIRT)) + ' تومان';
  }

  const currency = (localStorage.getItem('siaflow-currency') || 'IRT') as 'IRT' | 'IRR' | 'USD';

  if (currency === 'IRR') {
    return new Intl.NumberFormat('fa-IR').format(Math.round(amountInIRT * 10)) + ' ریال';
  }

  if (currency === 'USD') {
    try {
      const cached = localStorage.getItem('siaflow-exchange-rates');
      if (cached) {
        const rates = JSON.parse(cached);
        if (rates?.usd_to_irt) {
          const usd = amountInIRT / rates.usd_to_irt;
          return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(usd) + ' $';
        }
      }
    } catch {
      // fall through to IRT
    }
  }

  return new Intl.NumberFormat('fa-IR').format(Math.round(amountInIRT)) + ' تومان';
};

export const toPersianNum = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

// Check if a date string is today in Jalali calendar
export const isTodayJalali = (dateString: string): boolean => {
  const todayStr = toLocalISODateString(new Date());
  return dateString === todayStr;
};
