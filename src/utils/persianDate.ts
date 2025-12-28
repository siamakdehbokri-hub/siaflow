import { format, formatDistance } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';

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

export const getPersianWeekdays = (): string[] => {
  return ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

export const toPersianNum = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};
