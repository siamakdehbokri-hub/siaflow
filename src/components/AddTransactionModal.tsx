import { useState, useMemo } from 'react';
import { X, Plus, Minus } from 'lucide-react';
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

  if (!isOpen) return null;

  const expenseCategories = categories.filter(c => c.budget);
  const incomeCategories = categories.filter(c => !c.budget);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card z-10 p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">افزودن تراکنش</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
                setSubcategory('');
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-200",
                type === 'expense' 
                  ? "bg-destructive text-destructive-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Minus className="w-4 h-4" />
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
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-200",
                type === 'income' 
                  ? "bg-success text-success-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Plus className="w-4 h-4" />
              درآمد
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">مبلغ (تومان)</Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              className="text-2xl font-bold text-center h-14"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>دسته‌بندی</Label>
            <Select value={category} onValueChange={handleCategoryChange} required>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          {subcategories.length > 0 && (
            <div className="space-y-2">
              <Label>زیردسته‌بندی (اختیاری)</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب زیردسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              placeholder="توضیحات مختصر..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Persian Date Picker */}
          <div className="space-y-2">
            <Label>تاریخ</Label>
            <PersianDatePicker 
              value={date} 
              onChange={setDate}
              placeholder="انتخاب تاریخ"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>برچسب‌ها (اختیاری)</Label>
            <TagInput tags={tags} onChange={setTags} maxTags={3} />
          </div>
            <PersianDatePicker 
              value={date} 
              onChange={setDate}
              placeholder="انتخاب تاریخ"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium text-foreground">تراکنش تکراری</p>
              <p className="text-sm text-muted-foreground">هر ماه تکرار شود</p>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            variant={type === 'income' ? 'income' : 'expense'}
          >
            {type === 'income' ? 'ثبت درآمد' : 'ثبت هزینه'}
          </Button>
        </form>
      </div>
    </div>
  );
}
