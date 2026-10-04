import { addMonths, setDate, getDaysInMonth } from 'date-fns-jalali';
import { toLocalISODateString, parseLocalDate } from '@/utils/dateUtils';

/** Date on the given Jalali day-of-month, `monthsAhead` months after `baseIso`'s month. */
export function jalaliDueOn(baseIso: string, day: number, monthsAhead = 0): string {
  const base = addMonths(parseLocalDate(baseIso), monthsAhead);
  const d = Math.max(1, Math.min(day, getDaysInMonth(base)));
  return toLocalISODateString(setDate(base, d));
}

/** First installment due on/after the month following the loan start. */
export function firstLoanDue(startIso: string, day: number): string {
  const sameMonth = jalaliDueOn(startIso, day, 0);
  return sameMonth > startIso ? sameMonth : jalaliDueOn(startIso, day, 1);
}

/** Standard amortized monthly installment. rate = yearly percent. */
export function loanInstallment(principal: number, yearlyRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = yearlyRate / 1200;
  if (r <= 0) return Math.ceil(principal / months);
  return Math.ceil((principal * r) / (1 - Math.pow(1 + r, -months)));
}
