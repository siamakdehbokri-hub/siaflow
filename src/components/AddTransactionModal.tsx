import { useState, useMemo } from 'react';
import { X, Plus, Minus, Calendar, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types/expense';
import { cn } from '@/lib/utils';
import { PersianDatePicker } from './PersianDatePicker';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: any) => void;
  categories: Category[];
}

export function AddTransactionModal({ isOpen, onClose, onAdd, categories }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseCategories = useMemo(() => 
    categories.filter(c => c.budget !== undefined && c.budget !== null && c.budget > 0), 
    [categories]
  );
  
  const incomeCategories = useMemo(() => 
    categories.filter(c => c.budget === undefined || c.budget === null || c.budget === 0), 
    [categories]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !amount || !category) return;
    
    setIsSubmitting(true);
    
    try {
      await onAdd({
        id: Date.now().toString(),
        type,
        amount: parseInt(amount.replace(/,/g, '')),
        category,
        subcategory: subcategory || undefined,
        description,
        date,
        isRecurring,
        tags: [],
      });
      
      setAmount('');
      setCategory('');
      setSubcategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory('');
  };

  const quickAmounts = [
    { value: '50,000', label: '۵۰ هزار' },
    { value: '100,000', label: '۱۰۰ هزار' },
    { value: '500,000', label: '۵۰۰ هزار' },
    { value: '1,000,000', label: '۱ میلیون' },
  ];

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-t-2xl shadow-xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header - Clean Blue */}
        <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">ثبت تراکنش جدید</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
                setSubcategory('');
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all border-2",
                type === 'expense' 
                  ? "bg-destructive text-white border-destructive" 
                  : "bg-card text-muted-foreground border-border hover:border-destructive/50"
              )}
            >
              <Minus className="w-5 h-5" />
              هزینه
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
                setSubcategory('');
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all border-2",
                type === 'income' 
                  ? "bg-success text-white border-success" 
                  : "bg-card text-muted-foreground border-border hover:border-success/50"
              )}
            >
              <Plus className="w-5 h-5" />
              درآمد
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">مبلغ (تومان)</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="۰"
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              className="text-2xl font-bold text-center h-14 rounded-xl border-2 border-border focus:border-primary"
              required
            />
            
            {/* Quick Amounts - 44px touch targets */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((qa) => (
                <button
                  key={qa.value}
                  type="button"
                  onClick={() => setAmount(qa.value)}
                  className={cn(
                    // 44px minimum height for iOS compliance
                    "h-11 text-xs font-semibold rounded-xl border-2 transition-all active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    amount === qa.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">دسته‌بندی</Label>
            <Select value={category} onValueChange={handleCategoryChange} required>
              <SelectTrigger className="h-12 rounded-xl border-2 border-border">
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {currentCategories.length > 0 ? (
                  currentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className="py-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    دسته‌بندی یافت نشد
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
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
                      "px-4 py-2 text-sm rounded-full border transition-all",
                      subcategory === sub
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-muted/30 text-foreground hover:border-primary/50"
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
              className="rounded-xl border-2 border-border resize-none"
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
            "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
            isRecurring 
              ? "border-primary bg-primary/5" 
              : "border-border bg-muted/20"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isRecurring ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">تراکنش تکراری</p>
                <p className="text-xs text-muted-foreground">هر ماه تکرار شود</p>
              </div>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>
        </form>

        {/* Footer - Submit Button */}
        <div className="p-5 border-t border-border bg-card">
          <Button 
            type="submit"
            onClick={handleSubmit}
            className={cn(
              "w-full h-14 rounded-xl font-bold text-base",
              type === 'income' 
                ? 'bg-success hover:bg-success/90' 
                : 'bg-destructive hover:bg-destructive/90'
            )}
            disabled={!amount || !category || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin ml-2" />
                در حال ثبت...
              </>
            ) : type === 'income' ? (
              <>
                <Plus className="w-5 h-5 ml-2" />
                ثبت درآمد
              </>
            ) : (
              <>
                <Minus className="w-5 h-5 ml-2" />
                ثبت هزینه
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
