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
        <div 
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all group"
        >
          {/* Tree Toggle */}
          <CollapsibleTrigger asChild>
            <button 
              className={cn(
                "p-1.5 rounded-xl hover:bg-accent transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center",
                !hasSubcategories && "invisible"
              )}
              disabled={!hasSubcategories}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>

          <div 
            className="p-3 rounded-xl shrink-0"
            style={{ backgroundColor: `${category.color}15` }}
          >
            <Icon 
              className="w-5 h-5" 
              style={{ color: category.color }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">{category.name}</span>
                {hasSubcategories && (
                  <Badge variant="secondary" className="text-[10px] bg-accent text-accent-foreground border-0">
                    {subcatNames.length} زیردسته
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                isOverBudget ? "text-destructive" : "text-muted-foreground"
              )}>
                {category.budget ? formatCurrency(category.budget) : '-'}
              </span>
            </div>
            {category.budget && (
              <div className="space-y-1.5">
                <Progress 
                  value={Math.min(progress, 100)} 
                  className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{formatCurrency(category.spent || 0)} خرج شده</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => openEditModal(category)}
              className="h-10 w-10 rounded-xl hover:bg-accent"
            >
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setDeleteId(category.id)}
              className="h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Subcategories Tree */}
        <CollapsibleContent>
          {hasSubcategories && (
            <div className="mr-12 mt-2 space-y-1.5 border-r-2 border-primary/20 pr-4">
              {subcatNames.map((subcat, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-accent/50 text-sm"
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-foreground font-medium">{subcat}</span>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header - Clean Blue Style */}
      <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">مدیریت دسته‌بندی‌ها</h2>
              <p className="text-xs text-primary-foreground/70">{categories.length} دسته‌بندی</p>
            </div>
          </div>
          <Button 
            onClick={openAddModal} 
            size="sm" 
            className="rounded-xl bg-white text-primary hover:bg-white/90 font-semibold"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            جدید
          </Button>
        </div>
      </div>

      {/* Expense Categories Card */}
      <div className="bg-card rounded-2xl border-2 border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <h3 className="font-bold text-foreground">دسته‌بندی هزینه‌ها</h3>
          </div>
          <Badge variant="outline" className="rounded-lg border-border text-muted-foreground">
            {expenseCategories.length}
          </Badge>
        </div>
        <div className="p-4 space-y-3">
          {expenseCategories.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-accent mx-auto mb-3 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">هنوز دسته‌بندی هزینه‌ای ندارید</p>
            </div>
          ) : (
            expenseCategories.map(renderCategoryItem)
          )}
        </div>
      </div>

      {/* Income Categories Card */}
      <div className="bg-card rounded-2xl border-2 border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <h3 className="font-bold text-foreground">دسته‌بندی درآمدها</h3>
          </div>
          <Badge variant="outline" className="rounded-lg border-border text-muted-foreground">
            {incomeCategories.length}
          </Badge>
        </div>
        <div className="p-4 space-y-3">
          {incomeCategories.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-accent mx-auto mb-3 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">هنوز دسته‌بندی درآمدی ندارید</p>
            </div>
          ) : (
            incomeCategories.map((category) => {
              const Icon = iconMap[category.icon] || Receipt;
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
                  <div 
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all group"
                  >
                    {/* Tree Toggle */}
                    <CollapsibleTrigger asChild>
                      <button 
                        className={cn(
                          "p-1.5 rounded-xl hover:bg-accent transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center",
                          !hasSubcategories && "invisible"
                        )}
                        disabled={!hasSubcategories}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>

                    <div 
                      className="p-3 rounded-xl shrink-0"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <Icon 
                        className="w-5 h-5" 
                        style={{ color: category.color }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-semibold text-foreground text-sm">{category.name}</span>
                      {hasSubcategories && (
                        <Badge variant="secondary" className="text-[10px] bg-accent text-accent-foreground border-0">
                          {subcatNames.length} زیردسته
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditModal(category)}
                        className="h-10 w-10 rounded-xl hover:bg-accent"
                      >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteId(category.id)}
                        className="h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories Tree */}
                  <CollapsibleContent>
                    {hasSubcategories && (
                      <div className="mr-12 mt-2 space-y-1.5 border-r-2 border-primary/20 pr-4">
                        {subcatNames.map((subcat, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-2.5 p-3 rounded-xl bg-accent/50 text-sm"
                          >
                            <div 
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-foreground font-medium">{subcat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Modal - Clean Blue Header */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="bg-primary text-primary-foreground p-5 rounded-t-2xl">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
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
          
          <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Type Selection */}
            <div className="space-y-2.5">
              <Label className="font-semibold">نوع دسته‌بندی</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryType('expense')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center font-semibold",
                    categoryType === 'expense'
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  هزینه
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType('income')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center font-semibold",
                    categoryType === 'income'
                      ? "border-success bg-success/10 text-success"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  درآمد
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="cat-name" className="font-semibold">نام دسته‌بندی</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلا: خرید لباس"
                className="h-12 rounded-xl border-2"
                required
              />
            </div>

            {/* Subcategories Input */}
            <div className="space-y-2.5">
              <Label htmlFor="cat-subcategories" className="font-semibold">زیردسته‌ها (با ویرگول جدا کنید)</Label>
              <Input
                id="cat-subcategories"
                value={subcategoriesInput}
                onChange={(e) => setSubcategoriesInput(e.target.value)}
                placeholder="مثلا: لباس، کفش، اکسسوری"
                className="h-12 rounded-xl border-2"
              />
              <p className="text-xs text-muted-foreground">
                زیردسته‌ها را با ویرگول (،) یا کاما (,) جدا کنید
              </p>
            </div>

            <div className="space-y-2.5">
              <Label className="font-semibold">آیکون</Label>
              <div className="grid grid-cols-6 gap-2">
                {iconOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedIcon(opt.name)}
                      className={cn(
                        "p-3 rounded-xl transition-all aspect-square flex items-center justify-center border-2",
                        selectedIcon === opt.name
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/30 bg-card"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="font-semibold">رنگ</Label>
              <div className="flex gap-2.5 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-11 h-11 rounded-xl transition-all border-2",
                      selectedColor === color 
                        ? "border-foreground scale-110 shadow-lg" 
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {categoryType === 'expense' && (
              <div className="space-y-2.5 animate-fade-in">
                <Label htmlFor="cat-budget" className="font-semibold">بودجه ماهانه (اختیاری)</Label>
                <Input
                  id="cat-budget"
                  type="text"
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => setBudget(formatAmount(e.target.value))}
                  placeholder="مثلا: 5,000,000 تومان"
                  className="h-12 rounded-xl border-2"
                />
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="flex-1 rounded-xl h-12 border-2 font-semibold"
              >
                انصراف
              </Button>
              <Button type="submit" className="flex-1 rounded-xl h-12 font-semibold">
                {editingCategory ? 'ذخیره تغییرات' : 'افزودن'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">حذف دسته‌بندی</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl border-2">انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
