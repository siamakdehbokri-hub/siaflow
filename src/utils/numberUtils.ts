/**
 * Persian/Arabic number utilities
 * Converts between Persian digits (۰-۹) and English digits (0-9)
 */

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert Persian/Arabic digits to English
 */
export const toEnglishDigits = (str: string): string => {
  if (!str) return str;

  let result = str;

  // Convert Persian digits
  persianDigits.forEach((pd, i) => {
    result = result.replace(new RegExp(pd, 'g'), englishDigits[i]);
  });

  // Convert Arabic digits
  arabicDigits.forEach((ad, i) => {
    result = result.replace(new RegExp(ad, 'g'), englishDigits[i]);
  });

  return result;
};

/**
 * Convert English digits to Persian
 */
export const toPersianDigits = (str: string | number): string => {
  if (str === null || str === undefined) return '';

  return String(str).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
};

/**
 * Format a number input - accepts Persian/Arabic digits and formats with commas
 */
export const formatAmountInput = (value: string): string => {
  // Convert to English digits first
  const englishValue = toEnglishDigits(value);

  // Remove all non-numeric characters except commas
  const numericOnly = englishValue.replace(/[^\d]/g, '');

  // Add thousand separators
  return numericOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Parse an amount string to a number — SAFE against empty/NaN.
 * Always returns a finite, non-negative integer (clamped to 0 on bad input).
 */
export const parseAmount = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;

  const trimmed = String(value).trim();
  if (!trimmed) return 0;

  // Convert to English and remove commas / spaces
  const cleaned = toEnglishDigits(trimmed).replace(/[,\s]/g, '');
  if (!cleaned || !/^\d+$/.test(cleaned)) return 0;

  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Format currency with Persian digits
 */
export const formatCurrencyPersian = (amount: number): string => {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} تومان`;
};
