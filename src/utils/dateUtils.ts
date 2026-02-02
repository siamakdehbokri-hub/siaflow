/**
 * Date utilities with proper timezone handling
 * Fixes the off-by-one date bug caused by toISOString() UTC conversion
 */

/**
 * Format a Date object to ISO date string (YYYY-MM-DD) in LOCAL timezone
 * This prevents the off-by-one bug caused by toISOString() UTC conversion
 */
export function toLocalISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string and return a Date at local midnight
 * Avoids timezone issues when parsing YYYY-MM-DD strings
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Check if two dates are the same day in local timezone
 */
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get today's date as ISO string in local timezone
 */
export function getTodayLocalISO(): string {
  return toLocalISODateString(new Date());
}
