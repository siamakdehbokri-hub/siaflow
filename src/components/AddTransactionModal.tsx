import { useState, useMemo, useCallback } from 'react';
import { X, Plus, Minus, Calendar, RefreshCw, ChevronDown, PiggyBank, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Category } from '@/types/expense';
import { cn } from '@/lib/utils';
import { PersianDatePicker } from './PersianDatePicker';
import { formatAmountInput, parseAmount } from '@/utils/numberUtils';
import { useCurrency } from '@/hooks/useCurrency';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<import('@/types/expense').Transaction, 'id'> & { id?: string }) => Promise<void> | void;
  categories: Category[];
}

const TYPE_CONFIG = {
  expense: {
    label: 'هزینه',
    icon: Minus,
    colorVar: '--destructive',
    submitLabel: 'ثبت هزینه',
  },
  income: {
    label: 'درآمد',
    icon: Plus,
    colorVar: '--success',
    submitLabel: 'ثبت درآمد',
  },
  saving: {
    label: 'پس‌انداز',
    icon: PiggyBank,
    colorVar: '--primary',
    submitLabel: 'ثبت پس‌انداز',
  },
} as const;

export function AddTransactionModal({ isOpen, onClose, onAdd, categories }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense' | 'saving'>('expense');
  const { currencyInfo } = useCurrency();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategories = useMemo(() => 
    categories.filter(c => c.type === type), 
    [categories, type]
  );

  const subcategories = useMemo((): string[] => {
    if (!category) return [];
    const found = categories.find(c => c.name === category);
    if (!found?.subcategories) return [];
    return found.subcategories.map(s => {
      if (typeof s === 'string') return s;
      return (s as { name: string }).name;
    });
  }, [category, categories]);

  const resetForm = useCallback(() => {
    setAmount('');
    setCategory('');
    setSubcategory('');
    setDescription('');
    setDate(() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });
    setIsRecurring(false);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitting || !amount || !category) return;
    
    setIsSubmitting(true);
    
    try {
      await onAdd({
        id: Date.now().toString(),
        type,
        amount: parseAmount(amount),
        category,
        subcategory: subcategory || undefined,
        description,
        date,
        isRecurring,
        tags: [],
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatAmountInput(value));
  };

  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    setSubcategory('');
  };

  const handleTypeChange = (newType: typeof type) => {
    setType(newType);
    setCategory('');
    setSubcategory('');
  };

  const quickAmounts = [
    { value: '50,000', label: '۵۰ هزار' },
    { value: '100,000', label: '۱۰۰ هزار' },
    { value: '500,000', label: '۵۰۰ هزار' },
    { value: '1,000,000', label: '۱ میلیون' },
  ];

  const config = TYPE_CONFIG[type];
  const SubmitIcon = config.icon;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="max-h-[92vh] flex flex-col">
        {/* Header */}
        <DrawerHeader className="px-5 py-4 flex items-center justify-between border-b border-border/30">
          <DrawerTitle className="text-lg font-bold text-foreground">ثبت تراکنش جدید</DrawerTitle>
          <DrawerClose asChild>
            <button className="w-9 h-9 rounded-full flex items-center justify-center bg-muted/50 active:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Type Toggle — Segmented Control */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-muted/50 border border-border/30">
            {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map((t) => {
              const cfg = TYPE_CONFIG[t];
              const Icon = cfg.icon;
              const isActive = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-3 rounded-xl font-semibold transition-all text-sm",
                    isActive 
                      ? "text-white shadow-md" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={isActive ? {
                    background: `hsl(var(${cfg.colorVar}))`,
                  } : undefined}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span className="text-xs font-bold">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Amount — Large Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">مبلغ ({currencyInfo.name})</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="۰"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-2xl font-bold text-center h-14 rounded-xl bg-muted/30 border-border/40 focus:border-primary focus:ring-1 focus:ring-primary/30"
              autoFocus
            />
            
            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((qa) => {
                const isSelected = amount === qa.value;
                return (
                  <button
                    key={qa.value}
                    type="button"
                    onClick={() => setAmount(qa.value)}
                    className={cn(
                      "h-11 text-xs font-semibold rounded-xl transition-all active:scale-95 border",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "text-primary bg-primary/10 border-primary/30"
                        : "text-foreground bg-muted/30 border-border/30 active:bg-muted/50"
                    )}
                  >
                    {qa.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category — Visual Grid */}
          <div key={`category-${type}`} className="space-y-2.5">
            <Label className="text-sm font-medium text-foreground">دسته‌بندی</Label>
            {currentCategories.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-hide">
                {currentCategories.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.name)}
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-xl border transition-all text-right",
                        "active:scale-[0.97]",
                        isSelected
                          ? "border-primary/40 bg-primary/8"
                          : "border-border/30 bg-muted/20 active:bg-muted/40"
                      )}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat.color + '20' }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      </div>
                      <span className={cn(
                        "text-xs font-medium truncate flex-1",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {cat.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground rounded-xl bg-muted/20 border border-border/30">
                دسته‌بندی یافت نشد
              </div>
            )}
          </div>

          {/* Subcategory — Chip Selection */}
          {subcategories.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ChevronDown className="w-4 h-4" />
                زیردسته
              </Label>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(subcategory === sub ? '' : sub)}
                    className={cn(
                      "px-3.5 py-2 text-xs rounded-full border transition-all active:scale-95",
                      subcategory === sub
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/40 bg-muted/20 text-foreground hover:border-primary/40"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">توضیحات (اختیاری)</Label>
            <Textarea
              placeholder="مثلا: خرید از فروشگاه..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="rounded-xl resize-none bg-muted/30 border-border/40"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              تاریخ
            </Label>
            <PersianDatePicker 
              value={date} 
              onChange={setDate}
              placeholder="انتخاب تاریخ"
            />
          </div>

          {/* Recurring Toggle */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-xl border transition-all",
            isRecurring 
              ? "bg-primary/5 border-primary/20" 
              : "bg-muted/20 border-border/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isRecurring ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"
              )}>
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">تراکنش تکراری</p>
                <p className="text-xs text-muted-foreground">هر ماه تکرار شود</p>
              </div>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-border/30">
          <Button 
            type="button"
            onClick={() => handleSubmit()}
            className="w-full h-14 rounded-xl font-bold text-base text-white shadow-lg active:scale-[0.98] transition-transform"
            style={{ background: `hsl(var(${config.colorVar}))` }}
            disabled={!amount || !category || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin ml-2" />
                در حال ثبت...
              </>
            ) : (
              <>
                <SubmitIcon className="w-5 h-5 ml-2" />
                {config.submitLabel}
              </>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
