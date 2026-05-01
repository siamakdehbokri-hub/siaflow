import { ArrowLeftCircle, AlertTriangle, PiggyBank, Sparkles, X } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
import type { MonthCarryOverData } from '@/utils/monthlyCarryOver';

interface CarryOverCardProps {
  data: MonthCarryOverData;
  /** When true, render an emphasized banner with a dismiss button (used right after month rollover). */
  announce?: boolean;
  onDismiss?: () => void;
}

export function CarryOverCard({ data, announce = false, onDismiss }: CarryOverCardProps) {
  const { formatAmountCompact } = useCurrency();

  const {
    previousMonthLabel,
    carriedAmount,
    previousSavings,
    cumulativeSavings,
    hadDeficit,
    deficitAmount,
  } = data;

  const hasAnything =
    carriedAmount > 0 || previousSavings > 0 || cumulativeSavings > 0 || hadDeficit;

  if (!hasAnything) return null;

  return (
    <div
      className={cn(
        'relative rounded-2xl border p-4 backdrop-blur-xl',
        announce
          ? 'border-primary/40 bg-primary/10'
          : 'border-border/40 bg-card/40',
      )}
    >
      {announce && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="بستن"
          className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-background/60 text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
        <h3 className="text-sm font-semibold text-foreground">
          {announce ? `ماه جدید! انتقال از ${previousMonthLabel}` : `از ${previousMonthLabel}`}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {carriedAmount > 0 && (
          <Row
            icon={<ArrowLeftCircle className="h-4 w-4 text-success" strokeWidth={2} />}
            label="مانده منتقل‌شده"
            value={`+${formatAmountCompact(carriedAmount)}`}
            valueClass="text-success"
          />
        )}

        {previousSavings > 0 && (
          <Row
            icon={<PiggyBank className="h-4 w-4 text-primary" strokeWidth={2} />}
            label="پس‌انداز ماه قبل"
            value={formatAmountCompact(previousSavings)}
          />
        )}

        {cumulativeSavings > 0 && (
          <Row
            icon={<PiggyBank className="h-4 w-4 text-muted-foreground" strokeWidth={2} />}
            label="پس‌انداز انباشته"
            value={formatAmountCompact(cumulativeSavings)}
            valueClass="text-foreground"
          />
        )}

        {hadDeficit && (
          <Row
            icon={<AlertTriangle className="h-4 w-4 text-destructive" strokeWidth={2} />}
            label="کسری ماه قبل (منتقل نشد)"
            value={`−${formatAmountCompact(deficitAmount)}`}
            valueClass="text-destructive"
          />
        )}
      </div>

      {hadDeficit && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          ماه قبل بیشتر از درآمدت خرج کردی. این کسری به ماه جدید منتقل نشد، ولی برای جلوگیری از تکرار، بودجه‌ها رو بازبینی کن.
        </p>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className={cn('text-sm font-semibold tabular-nums', valueClass ?? 'text-foreground')}>
        {value}
      </span>
    </div>
  );
}
