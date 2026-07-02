import { useState, useMemo, useCallback } from 'react';
import { X, Plus, Minus, Calendar, RefreshCw, ChevronDown, PiggyBank, Check, StickyNote, Search } from 'lucide-react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from '@/components/ui/drawer';
import { Category } from '@/types/expense';
import { cn } from '@/lib/utils';
import { PersianDatePicker } from './PersianDatePicker';
import { formatAmountInput, parseAmount } from '@/utils/numberUtils';
import { useCurrency } from '@/hooks/useCurrency';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';

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
  const [showMore, setShowMore] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const currentCategories = useMemo(() => {
    const list = categories.filter(c => c.type === type);
    const q = categorySearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(c => {
      if (c.name.toLowerCase().includes(q)) return true;
      const subs = (c.subcategories || []).map(s =>
        (typeof s === 'string' ? s : (s as { name: string }).name).toLowerCase()
      );
      return subs.some(s => s.includes(q));
    });
  }, [categories, type, categorySearch]);

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
    setShowMore(false);
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
  const accentColor = `hsl(var(${config.colorVar}))`;
  const keyboardInset = useKeyboardInset();

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DrawerContent
        className="flex flex-col border-0 bg-background/95 backdrop-blur-2xl"
        style={{ maxHeight: '94dvh', height: '94dvh' }}
      >
        
        {/* Accent bar */}
        <div className="mx-auto mt-3 mb-1 w-10 h-1 rounded-full" style={{ background: accentColor, opacity: 0.5 }} />

        {/* Header */}
        <div className="px-5 pt-2 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">تراکنش جدید</h2>
          <DrawerClose asChild>
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/40 active:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </DrawerClose>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4 space-y-5"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          
          {/* Type Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-muted/40">
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
                    "flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold transition-all text-sm",
                    isActive 
                      ? "text-white shadow-lg" 
                      : "text-muted-foreground active:text-foreground"
                  )}
                  style={isActive ? { background: accentColor } : undefined}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="text-xs font-bold">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Amount Section */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="مبلغ"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                onFocus={(e) => {
                  // Delay scroll until keyboard animation begins
                  setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
                }}
                className="text-2xl font-bold text-center h-16 rounded-2xl bg-muted/20 border-border/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40 placeholder:text-lg"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 font-medium">
                {currencyInfo.name}
              </span>
            </div>
            
            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-1.5">
              {quickAmounts.map((qa) => {
                const isSelected = amount === qa.value;
                return (
                  <button
                    key={qa.value}
                    type="button"
                    onClick={() => setAmount(qa.value)}
                    className={cn(
                      "h-9 text-[11px] font-semibold rounded-xl transition-all active:scale-95",
                      isSelected
                        ? "text-white shadow-sm"
                        : "text-muted-foreground bg-muted/30 active:bg-muted/50"
                    )}
                    style={isSelected ? { background: accentColor } : undefined}
                  >
                    {qa.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Grid */}
          <div key={`category-${type}`} className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">دسته‌بندی</span>
            {currentCategories.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto scrollbar-hide">
                {currentCategories.map((cat) => {
                  const isSelected = category === cat.name;
                  const CatIcon = getCategoryIcon(cat.icon);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.name)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-95",
                        isSelected
                          ? "bg-primary/10 ring-1 ring-primary/30"
                          : "bg-muted/20 active:bg-muted/40"
                      )}
                    >
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: cat.color + '18' }}
                      >
                        <CatIcon className="w-4.5 h-4.5" style={{ color: cat.color }} strokeWidth={2} />
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium text-center leading-tight line-clamp-2",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {cat.name}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground rounded-xl bg-muted/10">
                دسته‌بندی یافت نشد
              </div>
            )}
          </div>

          {/* Subcategory Chips */}
          {subcategories.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <ChevronDown className="w-3 h-3" />
                زیردسته
              </span>
              <div className="flex flex-wrap gap-1.5">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(subcategory === sub ? '' : sub)}
                    className={cn(
                      "px-3 py-1.5 text-[11px] rounded-full transition-all active:scale-95",
                      subcategory === sub
                        ? "text-white font-semibold shadow-sm"
                        : "bg-muted/30 text-muted-foreground active:bg-muted/50"
                    )}
                    style={subcategory === sub ? { background: accentColor } : undefined}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional fields toggle */}
          {!showMore && (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-muted-foreground rounded-xl bg-muted/15 active:bg-muted/30 transition-colors"
            >
              <StickyNote className="w-3.5 h-3.5" />
              توضیحات، تاریخ و تکرار
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}

          {showMore && (
            <div className="space-y-4 animate-fade-in">
              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">توضیحات</span>
                <Textarea
                  placeholder="مثلا: خرید از فروشگاه..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={(e) => {
                    setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
                  }}
                  rows={2}
                  className="rounded-xl resize-none bg-muted/15 border-border/20 text-sm placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  تاریخ
                </span>
                <PersianDatePicker 
                  value={date} 
                  onChange={setDate}
                  placeholder="انتخاب تاریخ"
                />
              </div>

              {/* Recurring */}
              <div className={cn(
                "flex items-center justify-between p-3.5 rounded-xl transition-all",
                isRecurring 
                  ? "bg-primary/5 ring-1 ring-primary/15" 
                  : "bg-muted/15"
              )}>
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isRecurring ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground"
                  )}>
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-xs">تکرار ماهانه</p>
                  </div>
                </div>
                <Switch
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer — Submit (sticky, keyboard & safe-area aware) */}
        <div
          className="flex-shrink-0 px-4 pt-3 border-t border-border/20 bg-background/80 backdrop-blur-xl"
          style={{
            paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px + ${keyboardInset}px)`,
            transition: 'padding-bottom 0.2s ease-out',
          }}
        >
          <Button 
            type="button"
            onClick={() => handleSubmit()}
            className="w-full h-13 rounded-2xl font-bold text-sm text-white shadow-xl active:scale-[0.98] transition-transform border-0"
            style={{ background: accentColor }}
            disabled={!amount || !category || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                در حال ثبت...
              </>
            ) : (
              <>
                <SubmitIcon className="w-4 h-4 ml-2" />
                {config.submitLabel}
              </>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
