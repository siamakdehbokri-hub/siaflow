import { useMemo, useState } from 'react';
import { PieChart as PieIcon, TrendingUp, CalendarRange } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns-jalali';
import { Transaction, Category } from '@/types/expense';
import { toLocalISODateString, parseLocalDate } from '@/utils/dateUtils';
import { SpendingChart } from '@/components/SpendingChart';
import { TrendChart } from '@/components/TrendChart';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { formatPersianDateShort } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

type PresetKey = 'month' | '3m' | '6m' | 'year' | 'custom';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'month', label: 'این ماه' },
  { key: '3m', label: '۳ ماه' },
  { key: '6m', label: '۶ ماه' },
  { key: 'year', label: 'امسال' },
  { key: 'custom', label: 'سفارشی' },
];

function presetRange(key: PresetKey): { start: string; end: string } {
  const now = new Date();
  const end = toLocalISODateString(endOfMonth(now));
  switch (key) {
    case 'month':
      return { start: toLocalISODateString(startOfMonth(now)), end };
    case '3m':
      return { start: toLocalISODateString(startOfMonth(subMonths(now, 2))), end };
    case '6m':
      return { start: toLocalISODateString(startOfMonth(subMonths(now, 5))), end };
    case 'year':
      return { start: toLocalISODateString(startOfYear(now)), end };
    default:
      return { start: toLocalISODateString(startOfMonth(now)), end };
  }
}

interface DashboardInsightsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function DashboardInsights({ transactions, categories }: DashboardInsightsProps) {
  const [preset, setPreset] = useState<PresetKey>('month');
  const [customStart, setCustomStart] = useState<string | null>(null);
  const [customEnd, setCustomEnd] = useState<string | null>(null);

  const range = useMemo(() => {
    if (preset === 'custom') {
      return {
        start: customStart || '0000-01-01',
        end: customEnd || '9999-12-31',
      };
    }
    return presetRange(preset);
  }, [preset, customStart, customEnd]);

  const filtered = useMemo(
    () =>
      transactions.filter(t => {
        if (!t.date) return false;
        return t.date >= range.start && t.date <= range.end;
      }),
    [transactions, range.start, range.end]
  );

  // Real spending per category, computed from the filtered transactions
  const categoriesWithSpent = useMemo(() => {
    const spentMap = new Map<string, number>();
    for (const t of filtered) {
      if (t.type !== 'expense') continue;
      spentMap.set(t.category, (spentMap.get(t.category) || 0) + t.amount);
    }
    const known = categories
      .filter(c => c.type !== 'income' && c.type !== 'saving')
      .map(c => ({ ...c, spent: spentMap.get(c.name) || 0 }));

    // Include categories that exist only on transactions (deleted/renamed ones)
    const knownNames = new Set(known.map(c => c.name));
    const orphans = [...spentMap.entries()]
      .filter(([name]) => !knownNames.has(name))
      .map(([name, spent], i) => ({
        id: `orphan-${i}-${name}`,
        name,
        icon: 'Receipt',
        color: 'hsl(220, 14%, 50%)',
        spent,
      })) as Category[];

    return [...known, ...orphans]
      .filter(c => (c.spent || 0) > 0)
      .sort((a, b) => (b.spent || 0) - (a.spent || 0));
  }, [filtered, categories]);

  const totals = useMemo(() => {
    let income = 0, expense = 0, saving = 0;
    for (const t of filtered) {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'saving') saving += t.amount;
      else expense += t.amount;
    }
    return { income, expense, saving, count: filtered.length };
  }, [filtered]);

  const rangeLabel =
    preset === 'custom' && !customStart && !customEnd
      ? 'همه تاریخ‌ها'
      : `${formatPersianDateShort(range.start)} تا ${formatPersianDateShort(range.end)}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary" strokeWidth={2} />
          تحلیل داشبورد
        </h3>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <CalendarRange className="w-3.5 h-3.5" strokeWidth={2} />
          {rangeLabel}
        </span>
      </div>

      {/* Smart range presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {PRESETS.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPreset(p.key)}
            className={cn(
              'shrink-0 h-9 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95',
              preset === p.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/30 text-muted-foreground active:bg-muted/50'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="glass-card rounded-2xl p-3">
          <DateRangeFilter
            startDate={customStart}
            endDate={customEnd}
            onStartDateChange={setCustomStart}
            onEndDateChange={setCustomEnd}
            onClear={() => {
              setCustomStart(null);
              setCustomEnd(null);
            }}
          />
        </div>
      )}

      {totals.count === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-primary/10">
            <PieIcon className="w-7 h-7 text-primary/50" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-bold text-foreground mb-1">داده‌ای در این بازه نیست</p>
          <p className="text-xs text-muted-foreground">بازهٔ دیگری را انتخاب کنید</p>
        </div>
      ) : (
        <div className="space-y-3">
          <SpendingChart categories={categoriesWithSpent} />
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm font-bold text-foreground mb-2">روند مالی</p>
            <TrendChart transactions={filtered} />
          </div>
        </div>
      )}
    </div>
  );
}
