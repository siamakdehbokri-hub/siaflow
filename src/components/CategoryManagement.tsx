import { useState } from 'react';
import { Plus, Edit3, Trash2, ChevronLeft, Sparkles } from 'lucide-react';
import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, Home, Gift, Briefcase,
  Smartphone, Plane, Book, Music, MoreHorizontal,
  ShoppingCart, GraduationCap, CreditCard, Landmark, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types/expense';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const iconOptions = [
  { name: 'Home', icon: Home, label: 'خانه' },
  { name: 'ShoppingCart', icon: ShoppingCart, label: 'خرید' },
  { name: 'Car', icon: Car, label: 'حمل و نقل' },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'غذا' },
  { name: 'Heart', icon: Heart, label: 'سلامت' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'پوشاک' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'تفریح' },
  { name: 'CreditCard', icon: CreditCard, label: 'اشتراک' },
  { name: 'Landmark', icon: Landmark, label: 'بانک' },
  { name: 'Users', icon: Users, label: 'خانواده' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'آموزش' },
  { name: 'Wallet', icon: Wallet, label: 'مالی' },
  { name: 'Briefcase', icon: Briefcase, label: 'کار' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'سرمایه‌گذاری' },
  { name: 'Gift', icon: Gift, label: 'هدیه' },
  { name: 'Book', icon: Book, label: 'کتاب' },
  { name: 'Plane', icon: Plane, label: 'سفر' },
  { name: 'Receipt', icon: Receipt, label: 'قبوض' },
  { name: 'MoreHorizontal', icon: MoreHorizontal, label: 'سایر' },
];

const colorOptions = [
  'hsl(38, 92%, 50%)',
  'hsl(199, 89%, 48%)',
  'hsl(262, 83%, 58%)',
  'hsl(0, 72%, 51%)',
  'hsl(142, 71%, 45%)',
  'hsl(168, 76%, 42%)',
  'hsl(330, 80%, 60%)',
  'hsl(25, 95%, 53%)',
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, Home, Gift, Briefcase,
  Smartphone, Plane, Book, Music, MoreHorizontal,
  ShoppingCart, GraduationCap, CreditCard, Landmark, Users
};

interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoryManagement({ 
  categories, 
  onAddCategory, 
  onEditCategory, 
  onDeleteCategory 
}: CategoryManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Receipt');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [budget, setBudget] = useState('');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  const resetForm = () => {
    setName('');
    setSelectedIcon('Receipt');
    setSelectedColor(colorOptions[0]);
    setBudget('');
    setCategoryType('expense');
    setEditingCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setBudget(category.budget?.toString() || '');
    setCategoryType(category.budget ? 'expense' : 'income');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('نام دسته‌بندی را وارد کنید');
      return;
    }
    
    const categoryData: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      budget: categoryType === 'expense' && budget ? parseInt(budget.replace(/,/g, '')) : undefined,
      spent: editingCategory?.spent || 0,
      type: categoryType,
    };

    if (editingCategory) {
      onEditCategory(categoryData);
      toast.success('دسته‌بندی با موفقیت ویرایش شد');
    } else {
      onAddCategory(categoryData);
      toast.success('دسته‌بندی با موفقیت اضافه شد');
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      onDeleteCategory(deleteId);
      toast.success('دسته‌بندی با موفقیت حذف شد');
      setDeleteId(null);
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const expenseCategories = categories.filter(c => c.budget || c.type === 'expense');
  const incomeCategories = categories.filter(c => !c.budget && c.type !== 'expense');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-primary">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">مدیریت دسته‌بندی‌ها</h2>
            <p className="text-xs text-muted-foreground">{categories.length} دسته‌بندی</p>
          </div>
        </div>
        <Button onClick={openAddModal} size="sm" className="rounded-xl">
          <Plus className="w-4 h-4 ml-2" />
          دسته جدید
        </Button>
      </div>

      {/* Expense Categories */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              دسته‌بندی هزینه‌ها
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{expenseCategories.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {expenseCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              هنوز دسته‌بندی هزینه‌ای ندارید
            </p>
          ) : (
            expenseCategories.map((category) => {
              const Icon = iconMap[category.icon] || Receipt;
              const progress = category.budget && category.spent 
                ? (category.spent / category.budget) * 100 
                : 0;
              const isOverBudget = progress > 100;

              return (
                <div 
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all group"
                >
                  <div 
                    className="p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: category.color }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        isOverBudget ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {category.budget ? formatCurrency(category.budget) : '-'}
                      </span>
                    </div>
                    {category.budget && (
                      <div className="space-y-1">
                        <Progress 
                          value={Math.min(progress, 100)} 
                          className={cn("h-1.5", isOverBudget && "[&>div]:bg-destructive")}
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{formatCurrency(category.spent || 0)} خرج شده</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => openEditModal(category)}
                      className="h-8 w-8"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => setDeleteId(category.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Income Categories */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              دسته‌بندی درآمدها
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{incomeCategories.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {incomeCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              هنوز دسته‌بندی درآمدی ندارید
            </p>
          ) : (
            incomeCategories.map((category) => {
              const Icon = iconMap[category.icon] || Receipt;

              return (
                <div 
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all group"
                >
                  <div 
                    className="p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: category.color }}
                    />
                  </div>
                  
                  <span className="flex-1 font-medium text-foreground">{category.name}</span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => openEditModal(category)}
                      className="h-8 w-8"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => setDeleteId(category.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingCategory ? (
                <>
                  <Edit3 className="w-5 h-5 text-primary" />
                  ویرایش دسته‌بندی
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-primary" />
                  دسته‌بندی جدید
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>نوع دسته‌بندی</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryType('expense')}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-center font-medium",
                    categoryType === 'expense'
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  هزینه
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType('income')}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-center font-medium",
                    categoryType === 'income'
                      ? "border-success bg-success/10 text-success"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  درآمد
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-name">نام دسته‌بندی</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلا: خرید لباس"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>آیکون</Label>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {iconOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedIcon(opt.name)}
                      className={cn(
                        "p-2.5 rounded-xl transition-all aspect-square flex items-center justify-center",
                        selectedIcon === opt.name
                          ? "bg-primary text-primary-foreground shadow-md scale-110"
                          : "bg-muted hover:bg-accent"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>رنگ</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-10 h-10 rounded-xl transition-all",
                      selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {categoryType === 'expense' && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="cat-budget">بودجه ماهانه (اختیاری)</Label>
                <Input
                  id="cat-budget"
                  type="text"
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => setBudget(formatAmount(e.target.value))}
                  placeholder="مثلا: 5,000,000 تومان"
                  className="h-12 rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  با تعیین بودجه، پیشرفت مصرف را می‌بینید
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 rounded-xl" 
                onClick={() => setIsModalOpen(false)}
              >
                انصراف
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-xl"
              >
                {editingCategory ? 'ذخیره تغییرات' : 'ایجاد دسته'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟
              تراکنش‌های مرتبط با این دسته حذف نمی‌شوند.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}