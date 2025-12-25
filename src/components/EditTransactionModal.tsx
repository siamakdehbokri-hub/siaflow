import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { categories } from '@/data/mockData';
import { Transaction } from '@/types/expense';
import { cn } from '@/lib/utils';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function EditTransactionModal({ 
  isOpen, 
  transaction, 
  onClose, 
  onSave, 
  onDelete 
}: EditTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toLocaleString());
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(transaction.date);
      setIsRecurring(transaction.isRecurring || false);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    
    onSave({
      ...transaction,
      type,
      amount: parseInt(amount.replace(/,/g, '')),
      category,
      description,
      date,
      isRecurring,
    });
    onClose();
  };

  const handleDelete = () => {
    if (transaction) {
      onDelete(transaction.id);
      setShowDeleteDialog(false);
      onClose();
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (!isOpen || !transaction) return null;

  const expenseCategories = categories.filter(c => c.budget);
  const incomeCategories = categories.filter(c => !c.budget);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-card z-10 p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">ویرایش تراکنش</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
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
                onClick={() => setType('income')}
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
              <Label htmlFor="edit-amount">مبلغ (تومان)</Label>
              <Input
                id="edit-amount"
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
              <Select value={category} onValueChange={setCategory} required>
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">توضیحات</Label>
              <Textarea
                id="edit-description"
                placeholder="توضیحات مختصر..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-date">تاریخ</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
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
            >
              ذخیره تغییرات
            </Button>
          </form>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف تراکنش</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید این تراکنش را حذف کنید؟ این عمل غیرقابل بازگشت است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
