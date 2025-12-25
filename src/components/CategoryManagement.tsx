import { useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, Home, Gift, Briefcase,
  Smartphone, Plane, Book, Music
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { Category } from '@/types/expense';
import { formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const iconOptions = [
  { name: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'غذا' },
  { name: 'Car', icon: Car, label: 'حمل و نقل' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'خرید' },
  { name: 'Receipt', icon: Receipt, label: 'قبوض' },
  { name: 'Heart', icon: Heart, label: 'سلامت' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'تفریح' },
  { name: 'Wallet', icon: Wallet, label: 'مالی' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'سرمایه‌گذاری' },
  { name: 'Home', icon: Home, label: 'خانه' },
  { name: 'Gift', icon: Gift, label: 'هدیه' },
  { name: 'Briefcase', icon: Briefcase, label: 'کار' },
  { name: 'Smartphone', icon: Smartphone, label: 'تکنولوژی' },
  { name: 'Plane', icon: Plane, label: 'سفر' },
  { name: 'Book', icon: Book, label: 'آموزش' },
  { name: 'Music', icon: Music, label: 'موسیقی' },
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
  Smartphone, Plane, Book, Music
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

  const resetForm = () => {
    setName('');
    setSelectedIcon('Receipt');
    setSelectedColor(colorOptions[0]);
    setBudget('');
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
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name,
      icon: selectedIcon,
      color: selectedColor,
      budget: budget ? parseInt(budget.replace(/,/g, '')) : undefined,
      spent: editingCategory?.spent || 0,
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

  const expenseCategories = categories.filter(c => c.budget);
  const incomeCategories = categories.filter(c => !c.budget);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">مدیریت دسته‌بندی‌ها</h2>
        <Button onClick={openAddModal} size="sm">
          <Plus className="w-4 h-4 ml-2" />
          دسته جدید
        </Button>
      </div>

      {/* Expense Categories */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">دسته‌بندی هزینه‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenseCategories.map((category) => {
            const Icon = iconMap[category.icon] || Receipt;
            const progress = category.budget && category.spent 
              ? (category.spent / category.budget) * 100 
              : 0;

            return (
              <div 
                key={category.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: category.color }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.budget ? formatCurrency(category.budget) : '-'}
                    </span>
                  </div>
                  {category.budget && (
                    <Progress value={Math.min(progress, 100)} className="h-1.5" />
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={() => setDeleteId(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Income Categories */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">دسته‌بندی درآمدها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incomeCategories.map((category) => {
            const Icon = iconMap[category.icon] || Receipt;

            return (
              <div 
                key={category.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div 
                  className="p-2 rounded-lg"
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
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={() => setDeleteId(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cat-name">نام دسته‌بندی</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلا: خرید لباس"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>آیکون</Label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedIcon(opt.name)}
                      className={cn(
                        "p-3 rounded-xl transition-all",
                        selectedIcon === opt.name
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      )}
                    >
                      <Icon className="w-5 h-5 mx-auto" />
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
                      selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-budget">بودجه ماهانه (اختیاری)</Label>
              <Input
                id="cat-budget"
                type="text"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(formatAmount(e.target.value))}
                placeholder="0 تومان"
              />
              <p className="text-xs text-muted-foreground">
                اگر بودجه تعیین نکنید، این دسته به عنوان درآمد در نظر گرفته می‌شود
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                انصراف
              </Button>
              <Button type="submit" className="flex-1">
                {editingCategory ? 'ذخیره' : 'ایجاد'}
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
    </div>
  );
}
