import { useState } from 'react';
import { 
  Plus, Target, Wallet, TrendingUp, ArrowUpCircle, ArrowDownCircle, 
  Trash2, Sparkles, PiggyBank, Gift, Home, Car, Plane, Laptop, 
  Smartphone, GraduationCap, Heart
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
import { SavingGoal } from '@/hooks/useSavingGoals';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

const iconOptions = [
  { name: 'Target', icon: Target, label: 'هدف' },
  { name: 'PiggyBank', icon: PiggyBank, label: 'پس‌انداز' },
  { name: 'Laptop', icon: Laptop, label: 'لپ‌تاپ' },
  { name: 'Smartphone', icon: Smartphone, label: 'موبایل' },
  { name: 'Car', icon: Car, label: 'خودرو' },
  { name: 'Home', icon: Home, label: 'خانه' },
  { name: 'Plane', icon: Plane, label: 'سفر' },
  { name: 'Gift', icon: Gift, label: 'هدیه' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'تحصیل' },
  { name: 'Heart', icon: Heart, label: 'سلامت' },
];

const colorOptions = [
  'hsl(175, 85%, 42%)',
  'hsl(38, 92%, 50%)',
  'hsl(262, 83%, 58%)',
  'hsl(199, 89%, 48%)',
  'hsl(0, 72%, 51%)',
  'hsl(155, 80%, 40%)',
  'hsl(330, 80%, 60%)',
  'hsl(220, 70%, 50%)',
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, PiggyBank, Laptop, Smartphone, Car, Home, Plane, Gift, GraduationCap, Heart
};

interface SavingGoalsProps {
  goals: SavingGoal[];
  onAddGoal: (goal: Omit<SavingGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => void;
  onUpdateAmount: (goalId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) => void;
  onDeleteGoal: (id: string) => void;
}

export function SavingGoals({ goals, onAddGoal, onUpdateAmount, onDeleteGoal }: SavingGoalsProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionModal, setTransactionModal] = useState<{ goalId: string; type: 'deposit' | 'withdraw' } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Add goal form
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  
  // Transaction form
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setSelectedIcon('Target');
    setSelectedColor(colorOptions[0]);
  };

  const resetTxForm = () => {
    setTxAmount('');
    setTxNote('');
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddGoal({
      name,
      targetAmount: parseInt(targetAmount.replace(/,/g, '')),
      color: selectedColor,
      icon: selectedIcon,
    });
    
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionModal) return;
    
    onUpdateAmount(
      transactionModal.goalId,
      parseInt(txAmount.replace(/,/g, '')),
      transactionModal.type,
      txNote || undefined
    );
    
    setTransactionModal(null);
    resetTxForm();
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary shadow-glow-sm">
            <PiggyBank className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">اهداف پس‌انداز</h2>
            <p className="text-xs text-muted-foreground">{goals.length} هدف فعال</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="rounded-xl">
          <Plus className="w-4 h-4 ml-2" />
          هدف جدید
        </Button>
      </div>

      {/* Summary Card */}
      {goals.length > 0 && (
        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مجموع پس‌انداز</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalSaved)}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">از مجموع هدف</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(totalTarget)}</p>
              </div>
            </div>
            <Progress 
              value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0} 
              className="h-2 mt-3"
            />
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid gap-4">
        {goals.length === 0 ? (
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <PiggyBank className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">هنوز هدفی تعریف نکرده‌اید</p>
              <Button 
                onClick={() => setIsAddModalOpen(true)} 
                variant="outline" 
                className="mt-4"
              >
                <Plus className="w-4 h-4 ml-2" />
                ایجاد اولین هدف
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const Icon = iconMap[goal.icon] || Target;
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            const isComplete = progress >= 100;

            return (
              <Card 
                key={goal.id} 
                variant="glass" 
                className={cn(
                  "overflow-hidden transition-all hover:shadow-lg",
                  isComplete && "border-success/30 bg-success/5"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div 
                      className="p-3 rounded-2xl shrink-0"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <Icon 
                        className="w-6 h-6" 
                        style={{ color: goal.color }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground truncate">{goal.name}</h3>
                        {isComplete && (
                          <Badge className="bg-success text-success-foreground text-[10px]">
                            🎉 تکمیل شد
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-bold" style={{ color: goal.color }}>
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          از {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>

                      <Progress 
                        value={Math.min(progress, 100)} 
                        className="h-2 mb-2"
                        style={{ 
                          ['--progress-background' as any]: goal.color 
                        }}
                      />

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progress)}% پیشرفت</span>
                        {!isComplete && (
                          <span>{formatCurrency(remaining)} باقیمانده</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 rounded-xl border-success/30 text-success hover:bg-success/10 hover:text-success"
                      onClick={() => setTransactionModal({ goalId: goal.id, type: 'deposit' })}
                    >
                      <ArrowUpCircle className="w-4 h-4 ml-1" />
                      واریز
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setTransactionModal({ goalId: goal.id, type: 'withdraw' })}
                      disabled={goal.currentAmount === 0}
                    >
                      <ArrowDownCircle className="w-4 h-4 ml-1" />
                      برداشت
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              هدف جدید
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitGoal} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label>نام هدف</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلا: خرید لپ‌تاپ"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>مبلغ هدف (تومان)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={targetAmount}
                onChange={(e) => setTargetAmount(formatAmount(e.target.value))}
                placeholder="مثلا: 50,000,000"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>آیکون</Label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedIcon(opt.name)}
                      className={cn(
                        "p-3 rounded-xl transition-all aspect-square flex items-center justify-center",
                        selectedIcon === opt.name
                          ? "bg-primary text-primary-foreground shadow-md scale-110"
                          : "bg-muted hover:bg-accent"
                      )}
                    >
                      <IconComp className="w-5 h-5" />
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

            <Button type="submit" size="lg" className="w-full rounded-xl">
              <Plus className="w-5 h-5 ml-2" />
              ایجاد هدف
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <Dialog open={!!transactionModal} onOpenChange={() => setTransactionModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {transactionModal?.type === 'deposit' ? (
                <>
                  <ArrowUpCircle className="w-5 h-5 text-success" />
                  واریز به هدف
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-5 h-5 text-destructive" />
                  برداشت از هدف
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitTransaction} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>مبلغ (تومان)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={txAmount}
                onChange={(e) => setTxAmount(formatAmount(e.target.value))}
                placeholder="0"
                className="h-12 rounded-xl text-xl font-bold text-center"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>یادداشت (اختیاری)</Label>
              <Input
                value={txNote}
                onChange={(e) => setTxNote(e.target.value)}
                placeholder="توضیحات..."
                className="rounded-xl"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className={cn(
                "w-full rounded-xl",
                transactionModal?.type === 'deposit' 
                  ? "gradient-income" 
                  : "gradient-expense"
              )}
            >
              {transactionModal?.type === 'deposit' ? 'ثبت واریز' : 'ثبت برداشت'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف هدف پس‌انداز</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDeleteGoal(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}