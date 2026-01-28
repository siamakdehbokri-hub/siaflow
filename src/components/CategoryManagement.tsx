import { useState } from 'react';
import { Plus, Edit3, Trash2, ChevronDown, ChevronRight, FolderTree } from 'lucide-react';
import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, Home, Gift, Briefcase,
  Smartphone, Plane, Book, Music, MoreHorizontal,
  ShoppingCart, GraduationCap, CreditCard, Landmark, Users
} from 'lucide-react';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  'hsl(211, 100%, 50%)',
  'hsl(38, 92%, 50%)',
  'hsl(199, 89%, 48%)',
  'hsl(262, 83%, 58%)',
  'hsl(0, 72%, 51%)',
  'hsl(145, 65%, 42%)',
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Receipt');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [budget, setBudget] = useState('');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [subcategoriesInput, setSubcategoriesInput] = useState('');

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedCategories(newSet);
  };

  const resetForm = () => {
    setName('');
    setSelectedIcon('Receipt');
    setSelectedColor(colorOptions[0]);
    setBudget('');
    setCategoryType('expense');
    setSubcategoriesInput('');
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
    const subs = category.subcategories || [];
    const subNames = subs.map(s => typeof s === 'string' ? s : s.name);
    setSubcategoriesInput(subNames.join('، '));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('نام دسته‌بندی را وارد کنید');
      return;
    }

    const subcategories = subcategoriesInput
      .split(/[،,]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const categoryData: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      budget: categoryType === 'expense' && budget ? parseInt(budget.replace(/,/g, '')) : undefined,
      spent: editingCategory?.spent || 0,
      type: categoryType,
      subcategories,
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

  const renderCategoryItem = (category: Category) => {
    const Icon = iconMap[category.icon] || Receipt;
    const progress = category.budget && category.spent 
      ? (category.spent / category.budget) * 100 
      : 0;
    const isOverBudget = progress > 100;
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const subcats = category.subcategories || [];
    const subcatNames = subcats.map(s => typeof s === 'string' ? s : s.name);

    return (
      <Collapsible
        key={category.id}
        open={isExpanded}
        onOpenChange={() => hasSubcategories && toggleExpanded(category.id)}
      >
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden active:bg-accent/50 transition-colors">
          {/* Main Row */}
          <div className="flex items-center gap-2 p-3">
            {/* Tree Toggle - Mobile Optimized */}
            <CollapsibleTrigger asChild>
              <button 
                className={cn(
                  "min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center active:bg-accent",
                  !hasSubcategories && "opacity-0 pointer-events-none"
                )}
                disabled={!hasSubcategories}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>

            {/* Icon */}
            <div 
              className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center"
              style={{ backgroundColor: `${category.color}15` }}
            >
              <Icon 
                className="w-5 h-5" 
                style={{ color: category.color }}
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground text-sm truncate">{category.name}</span>
                {hasSubcategories && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground border-0 shrink-0">
                    {subcatNames.length} زیردسته
                  </Badge>
                )}
              </div>
              {category.budget && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  بودجه: {formatCurrency(category.budget)}
                </p>
              )}
            </div>

            {/* Actions - Always Visible on Mobile */}
            <div className="flex items-center gap-1 shrink-0">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(category);
                }}
                className="h-10 w-10 rounded-xl active:bg-accent"
              >
                <Edit3 className="w-4 h-4 text-primary" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(category.id);
                }}
                className="h-10 w-10 rounded-xl text-destructive active:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Budget Progress - Mobile Optimized */}
          {category.budget && (
            <div className="px-3 pb-3 pt-0">
              <div className="bg-accent/50 rounded-xl p-2.5">
                <Progress 
                  value={Math.min(progress, 100)} 
                  className={cn("h-2 mb-2", isOverBudget && "[&>div]:bg-destructive")}
                />
                <div className="flex justify-between text-xs">
                  <span className={cn(
                    "font-medium",
                    isOverBudget ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {formatCurrency(category.spent || 0)} خرج شده
                  </span>
                  <span className={cn(
                    "font-bold",
                    isOverBudget ? "text-destructive" : "text-primary"
                  )}>
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subcategories Tree - Mobile Optimized */}
        <CollapsibleContent>
          {hasSubcategories && (
            <div className="mr-6 mt-2 space-y-1.5 border-r-2 border-primary/30 pr-3">
              {subcatNames.map((subcat, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/50"
                >
                  <div 
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-foreground">{subcat}</span>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header - Mobile Optimized */}
      <div className="bg-primary rounded-2xl p-4 text-primary-foreground">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FolderTree className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold truncate">مدیریت دسته‌بندی‌ها</h2>
              <p className="text-xs text-primary-foreground/70">{categories.length} دسته‌بندی</p>
            </div>
          </div>
          <Button 
            onClick={openAddModal} 
            size="sm" 
            className="rounded-xl bg-white text-primary hover:bg-white/90 font-bold h-10 px-4 shrink-0"
          >
            <Plus className="w-4 h-4 ml-1" />
            جدید
          </Button>
        </div>
      </div>

      {/* Expense Categories Card - Mobile Optimized */}
      <div className="bg-card rounded-2xl border-2 border-border overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <h3 className="font-bold text-foreground text-sm">دسته‌بندی هزینه‌ها</h3>
          </div>
          <Badge variant="outline" className="rounded-lg border-border text-muted-foreground text-xs">
            {expenseCategories.length}
          </Badge>
        </div>
        <div className="p-3 space-y-2">
          {expenseCategories.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-accent mx-auto mb-2 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">هنوز دسته‌بندی هزینه‌ای ندارید</p>
            </div>
          ) : (
            expenseCategories.map(renderCategoryItem)
          )}
        </div>
      </div>

      {/* Income Categories Card - Mobile Optimized */}
      <div className="bg-card rounded-2xl border-2 border-border overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <h3 className="font-bold text-foreground text-sm">دسته‌بندی درآمدها</h3>
          </div>
          <Badge variant="outline" className="rounded-lg border-border text-muted-foreground text-xs">
            {incomeCategories.length}
          </Badge>
        </div>
        <div className="p-3 space-y-2">
          {incomeCategories.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-accent mx-auto mb-2 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">هنوز دسته‌بندی درآمدی ندارید</p>
            </div>
          ) : (
            incomeCategories.map(renderCategoryItem)
          )}
        </div>
      </div>

      {/* Add/Edit Modal - Full Mobile Sheet Style */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[100vw] w-full sm:max-w-md max-h-[95vh] overflow-hidden p-0 rounded-t-3xl sm:rounded-2xl">
          <DialogHeader className="bg-primary text-primary-foreground p-4">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              {editingCategory ? (
                <>
                  <Edit3 className="w-5 h-5" />
                  ویرایش دسته‌بندی
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  دسته‌بندی جدید
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(95vh-80px)]">
            {/* Type Selection - Mobile Optimized */}
            <div className="space-y-2">
              <Label className="font-bold text-sm">نوع دسته‌بندی</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryType('expense')}
                  className={cn(
                    "h-12 rounded-xl border-2 transition-all text-center font-bold text-sm",
                    categoryType === 'expense'
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border active:border-primary/50"
                  )}
                >
                  هزینه
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType('income')}
                  className={cn(
                    "h-12 rounded-xl border-2 transition-all text-center font-bold text-sm",
                    categoryType === 'income'
                      ? "border-success bg-success/10 text-success"
                      : "border-border active:border-primary/50"
                  )}
                >
                  درآمد
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-name" className="font-bold text-sm">نام دسته‌بندی</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلا: خرید لباس"
                className="h-12 rounded-xl border-2 text-base"
                required
              />
            </div>

            {/* Subcategories Input */}
            <div className="space-y-2">
              <Label htmlFor="cat-subcategories" className="font-bold text-sm">زیردسته‌ها</Label>
              <Input
                id="cat-subcategories"
                value={subcategoriesInput}
                onChange={(e) => setSubcategoriesInput(e.target.value)}
                placeholder="لباس، کفش، اکسسوری"
                className="h-12 rounded-xl border-2 text-base"
              />
              <p className="text-[11px] text-muted-foreground">
                با ویرگول جدا کنید
              </p>
            </div>

            {/* Icons - Mobile Grid 5 columns */}
            <div className="space-y-2">
              <Label className="font-bold text-sm">آیکون</Label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedIcon(opt.name)}
                      className={cn(
                        "aspect-square rounded-xl transition-all flex items-center justify-center border-2 min-h-[44px]",
                        selectedIcon === opt.name
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border active:border-primary/50 bg-card"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors - Mobile Optimized */}
            <div className="space-y-2">
              <Label className="font-bold text-sm">رنگ</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-11 h-11 rounded-xl transition-all border-2",
                      selectedColor === color 
                        ? "border-foreground ring-2 ring-primary ring-offset-2" 
                        : "border-transparent active:scale-95"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {categoryType === 'expense' && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="cat-budget" className="font-bold text-sm">بودجه ماهانه (اختیاری)</Label>
                <Input
                  id="cat-budget"
                  type="text"
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => setBudget(formatAmount(e.target.value))}
                  placeholder="5,000,000 تومان"
                  className="h-12 rounded-xl border-2 text-base"
                />
              </div>
            )}

            {/* Action Buttons - Mobile Safe Area */}
            <div className="flex gap-2 pt-2 pb-safe">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="flex-1 rounded-xl h-12 border-2 font-bold"
              >
                انصراف
              </Button>
              <Button type="submit" className="flex-1 rounded-xl h-12 font-bold">
                {editingCategory ? 'ذخیره' : 'افزودن'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation - Mobile Optimized */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-base">حذف دسته‌بندی</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              آیا مطمئنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 flex-row">
            <AlertDialogCancel className="rounded-xl border-2 flex-1 h-11">انصراف</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 rounded-xl flex-1 h-11"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
