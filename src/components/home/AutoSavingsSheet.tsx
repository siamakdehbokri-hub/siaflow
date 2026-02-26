import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PiggyBank, AlertTriangle, Sparkles, Check, X, Pencil, Zap } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
import type { AutoSavingsSuggestion, AutoSavingsPreferences } from '@/hooks/useAutoSavings';
import { toEnglishDigits } from '@/utils/numberUtils';

interface AutoSavingsSheetProps {
  open: boolean;
  onClose: () => void;
  suggestion: AutoSavingsSuggestion;
  prefs: AutoSavingsPreferences;
  onAccept: (amount: number) => void;
  onDecline: () => void;
  onEnableAuto: () => void;
}

export function AutoSavingsSheet({
  open,
  onClose,
  suggestion,
  prefs,
  onAccept,
  onDecline,
  onEnableAuto,
}: AutoSavingsSheetProps) {
  const { formatAmount } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [customAmount, setCustomAmount] = useState(String(suggestion.suggestedAmount));

  const handleAccept = () => {
    const amount = isEditing
      ? Math.max(0, Number(toEnglishDigits(customAmount)) || 0)
      : suggestion.suggestedAmount;
    if (amount > 0) {
      onAccept(amount);
      onClose();
    }
  };

  const handleDecline = () => {
    onDecline();
    onClose();
  };

  const handleEnableAuto = () => {
    onEnableAuto();
    handleAccept();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="rounded-t-3xl">
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/20 mt-3 mb-2" />
        
        <DrawerHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <PiggyBank className="w-8 h-8 text-primary" strokeWidth={2} />
          </div>
          <DrawerTitle className="text-lg font-bold">
            {suggestion.isNewMonth ? 'پس‌انداز از مانده ماه قبل' : 'پیشنهاد پس‌انداز هوشمند'}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            {suggestion.isNewMonth 
              ? 'ماه جدید شروع شده! از مانده ماه قبل پس‌انداز کن برای آینده‌ای بهتر'
              : 'بر اساس مانده حساب شما در این ماه'
            }
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-5 pb-6 space-y-4">
          {/* Remaining Balance Display */}
          <div className="bg-success/5 border border-success/15 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {suggestion.isNewMonth ? 'مانده ماه گذشته' : 'مانده قابل پس‌انداز'}
            </p>
            <p className="text-2xl font-bold text-success" dir="ltr">
              {formatAmount(suggestion.remainingBalance)}
            </p>
            {suggestion.isNewMonth ? (
              <p className="text-xs text-muted-foreground mt-1">
                برای آینده‌ای بهتر، همین الان پس‌انداز کن!
              </p>
            ) : suggestion.daysUntilMonthEnd > 0 ? (
              <p className="text-xs text-muted-foreground mt-1">
                {suggestion.daysUntilMonthEnd} روز تا پایان ماه
              </p>
            ) : null}
          </div>

          {/* Recurring Unpaid Warning */}
          {suggestion.hasRecurringUnpaid && (
            <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-xl p-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" strokeWidth={2} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">هزینه‌های تکرارشونده پرداخت‌نشده</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  حدود {formatAmount(suggestion.recurringUnpaidTotal)} از هزینه‌های تکرارشونده هنوز پرداخت نشده. مبلغ پیشنهادی با احتساب آن‌ها محاسبه شده.
                </p>
              </div>
            </div>
          )}

          {/* Suggested Amount */}
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">مبلغ پیشنهادی</p>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
                {suggestion.suggestedPercentage}% از مانده
              </span>
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="text-lg font-bold text-center h-12"
                  dir="ltr"
                  autoFocus
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-foreground text-center" dir="ltr">
                {formatAmount(suggestion.suggestedAmount)}
              </p>
            )}

            <button
              onClick={() => {
                setIsEditing(!isEditing);
                if (!isEditing) setCustomAmount(String(suggestion.suggestedAmount));
              }}
              className="flex items-center gap-1.5 mx-auto mt-3 text-xs font-medium text-primary active:opacity-70 py-1"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
              {isEditing ? 'تأیید مبلغ' : 'ویرایش مبلغ'}
            </button>
          </div>

          {/* Auto-transfer suggestion after repeated acceptance */}
          {suggestion.canAutomate && !prefs.autoTransferEnabled && (
            <button
              onClick={handleEnableAuto}
              className="w-full flex items-center gap-3 bg-accent/50 border border-accent rounded-xl p-3 active:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">فعال‌سازی انتقال خودکار</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  هر ماه {suggestion.suggestedPercentage}% از مانده خودکار پس‌انداز شود
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-primary shrink-0" strokeWidth={2} />
            </button>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="h-12 text-sm font-semibold gap-2"
            >
              <X className="w-4 h-4" strokeWidth={2} />
              فعلاً نه
            </Button>
            <Button
              onClick={handleAccept}
              className="h-12 text-sm font-semibold gap-2"
            >
              <Check className="w-4 h-4" strokeWidth={2} />
              تأیید انتقال
            </Button>
          </div>

          {/* Trust note */}
          <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
            هیچ انتقالی بدون تأیید شما انجام نمی‌شود
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
