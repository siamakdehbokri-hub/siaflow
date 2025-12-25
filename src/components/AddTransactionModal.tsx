import { useState, useMemo } from 'react';
import { X, Plus, Minus, Calendar, Tag, RefreshCw, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, defaultExpenseCategories, defaultIncomeCategories } from '@/types/expense';
import { cn } from '@/lib/utils';
import { PersianDatePicker } from './PersianDatePicker';
import { TagInput } from './TagInput';

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
  const [tags, setTags] = useState<string[]>([]);

  // Get subcategories based on selected category
  const subcategories = useMemo(() => {
    if (!category) return [];
    
    const allCategories = [...defaultExpenseCategories, ...defaultIncomeCategories];
    const found = allCategories.find(c => c.name === category);
    return found?.subcategories || [];
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      type,
      amount: parseInt(amount.replace(/,/g, '')),
      category,
      subcategory: subcategory || undefined,
      description,
      date,
      isRecurring,
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
    // Reset form
    setAmount('');
    setCategory('');
    setSubcategory('');
    setDescription('');
    setIsRecurring(false);
    setTags([]);
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Reset subcategory when category changes
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory('');
  };

  // Quick amount buttons
  const quickAmounts = ['50,000', '100,000', '500,000', '1,000,000'];

  if (!isOpen) return null;

  const expenseCategories = categories.filter(c => c.budget);
  const incomeCategories = categories.filter(c => !c.budget);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header with gradient */}
        <div className="sticky top-0 z-10 overflow-hidden">
          <div className={cn(
            "absolute inset-0",
            type === 'expense' ? "gradient-expense" : "gradient-income"
          )} />
          <div className="relative p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-background/20 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-background">تراکنش جدید</h2>
                <p className="text-xs text-background/80">ثبت هزینه یا درآمد</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={onClose}
              className="text-background hover:bg-background/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type Toggle - Improved */}
          <div className="flex gap-2 p-1.5 bg-muted rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
                setSubcategory('');
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl font-semibold transition-all duration-300 min-w-0",
                type === 'expense' 
                  ? "gradient-expense text-destructive-foreground shadow-lg scale-[1.02]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Minus className="w-5 h-5 shrink-0" />
              <span className="truncate">هزینه</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
                setSubcategory('');
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl font-semibold transition-all duration-300 min-w-0",
                type === 'income' 
                  ? "gradient-income text-success-foreground shadow-lg scale-[1.02]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span className="truncate">درآمد</span>
            </button>
          </div>

          {/* Amount - Enhanced */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <span>مبلغ</span>
              <Badge variant="secondary" className="text-xs font-normal">تومان</Badge>
            </Label>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                className={cn(
                  "text-3xl font-bold text-center h-16 rounded-2xl border-2 transition-all",
                  type === 'expense' 
                    ? "focus:border-destructive/50" 
                    : "focus:border-success/50"
                )}
                required
              />
            </div>
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  type="button"
                  onClick={() => setAmount(qa)}
                  className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-accent rounded-lg transition-colors"
                >
                  {qa}
                </button>
              ))}
            </div>
          </div>

          {/* Category - Enhanced */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">دسته‌بندی</Label>
            <Select value={category} onValueChange={handleCategoryChange} required>
              <SelectTrigger className="h-12 rounded-xl text-base">
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                  <SelectItem key={cat.id} value={cat.name} className="py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory - Responsive Grid */}
          {subcategories.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                زیردسته
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(subcategory === sub ? '' : sub)}
                    className={cn(
                      "px-2 py-2 text-xs sm:text-sm rounded-xl border-2 transition-all duration-200 truncate min-w-0",
                      subcategory === sub
                        ? type === 'expense'
                          ? "border-destructive bg-destructive/10 text-destructive font-medium"
                          : "border-success bg-success/10 text-success font-medium"
                        : "border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground"
                    )}
                    title={sub}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">توضیحات (اختیاری)</Label>
            <Textarea
              placeholder="مثلا: خرید از فروشگاه..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Date & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                تاریخ
              </Label>
              <PersianDatePicker 
                value={date} 
                onChange={setDate}
                placeholder="انتخاب تاریخ"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                برچسب‌ها
              </Label>
              <TagInput tags={tags} onChange={setTags} maxTags={3} />
            </div>
          </div>

          {/* Recurring Toggle - Enhanced */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
            isRecurring 
              ? "border-primary/30 bg-primary/5" 
              : "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isRecurring ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <RefreshCw className={cn("w-5 h-5", isRecurring && "animate-spin")} style={{ animationDuration: '3s' }} />
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

          {/* Submit Button - Enhanced */}
          <Button 
            type="submit" 
            size="xl" 
            className={cn(
              "w-full rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all",
              type === 'income' ? 'gradient-income' : 'gradient-expense'
            )}
            disabled={!amount || !category}
          >
            {type === 'income' ? (
              <>
                <Plus className="w-5 h-5" />
                ثبت درآمد
              </>
            ) : (
              <>
                <Minus className="w-5 h-5" />
                ثبت هزینه
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}