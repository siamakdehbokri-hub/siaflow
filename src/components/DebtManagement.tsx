import { useState } from 'react';
import { 
  Plus, Landmark, Trash2, Pencil, Banknote, 
  UserRound, FileText, TrendingDown, CheckCircle2,
  AlertCircle, Loader2, CalendarDays
} from 'lucide-react';
import { PersianDatePicker } from './PersianDatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Debt } from '@/hooks/useDebts';
import { formatCurrency, formatPersianDateShort } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface DebtManagementProps {
  debts: Debt[];
  stats: {
    totalDebt: number;
    totalPaid: number;
    totalRemaining: number;
    progress: number;
  };
  onAddDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDebt: (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  onDeleteDebt: (id: string) => void;
  onAddPayment: (id: string, amount: number) => void;
}

export function DebtManagement({ 
  debts, 
  stats, 
  onAddDebt, 
  onUpdateDebt, 
  onDeleteDebt, 
  onAddPayment 
}: DebtManagementProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [paymentModal, setPaymentModal] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [creditor, setCreditor] = useState('');
  const [reason, setReason] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Payment form
  const [paymentAmount, setPaymentAmount] = useState('');

  const resetForm = () => {
    setName('');
    setTotalAmount('');
    setPaidAmount('');
    setCreditor('');
    setReason('');
    setDueDate('');
  };

  const openEditModal = (debt: Debt) => {
    setEditingDebt(debt);
    setName(debt.name);
    setTotalAmount(debt.totalAmount.toString());
    setPaidAmount(debt.paidAmount.toString());
    setCreditor(debt.creditor);
    setReason(debt.reason || '');
    setDueDate(debt.dueDate || '');
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const debtData = {
      name,
      totalAmount: parseInt(totalAmount.replace(/,/g, '')),
      paidAmount: parseInt(paidAmount.replace(/,/g, '') || '0'),
      creditor,
      reason: reason || undefined,
      dueDate: dueDate || undefined,
    };

    if (editingDebt) {
      onUpdateDebt(editingDebt.id, debtData);
      setEditingDebt(null);
    } else {
      onAddDebt(debtData);
    }
    
    setIsAddModalOpen(false);
    resetForm();
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal) return;
    
    onAddPayment(paymentModal, parseInt(paymentAmount.replace(/,/g, '')));
    setPaymentModal(null);
    setPaymentAmount('');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
            <Landmark className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">مدیریت بدهی‌ها</h2>
            <p className="text-xs text-muted-foreground">{debts.length} بدهی فعال</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          size="sm" 
          className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4 ml-2" />
          بدهی جدید
        </Button>
      </div>

      {/* Summary Card - Enhanced */}
      {debts.length > 0 && (
        <Card variant="glass" className="border-rose-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-pink-500/5 pointer-events-none" />
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 rounded-2xl bg-rose-500/10">
                <TrendingDown className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">مجموع بدهی باقی‌مانده</p>
                <p className="text-3xl font-black text-rose-500">{formatCurrency(stats.totalRemaining)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">کل بدهی</p>
                <p className="text-base font-bold text-rose-500">{formatCurrency(stats.totalDebt)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">پرداخت شده</p>
                <p className="text-base font-bold text-emerald-500">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">پیشرفت</p>
                <p className="text-base font-bold text-primary">{Math.round(stats.progress)}%</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={stats.progress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-400" />
              <p className="text-xs text-muted-foreground text-center">
                {stats.progress >= 100 
                  ? '🎉 تبریک! تمام بدهی‌ها تسویه شده‌اند' 
                  : `${formatCurrency(stats.totalRemaining)} تا تسویه کامل`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debts List */}
      <div className="space-y-3">
        {debts.length === 0 ? (
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Landmark className="w-8 h-8 text-rose-500/50" strokeWidth={2} />
              </div>
              <p className="text-muted-foreground mb-2">هنوز بدهی‌ای ثبت نکرده‌اید</p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                بدهی‌های خود را ثبت کنید و پیشرفت پرداخت را پیگیری کنید
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
                <Plus className="w-4 h-4 ml-2" />
                ثبت اولین بدهی
              </Button>
            </CardContent>
          </Card>
        ) : (
          debts.map((debt) => {
            const progress = (debt.paidAmount / debt.totalAmount) * 100;
            const remaining = debt.totalAmount - debt.paidAmount;
            const isComplete = progress >= 100;
            const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && !isComplete;

            return (
              <Card 
                key={debt.id} 
                variant="glass" 
                className={cn(
                  "overflow-hidden transition-all hover:shadow-lg",
                  isComplete && "border-emerald-500/30 bg-emerald-500/5",
                  isOverdue && "border-rose-500/30 bg-rose-500/5"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "p-2.5 rounded-xl shrink-0",
                      isComplete ? "bg-emerald-500/10" : isOverdue ? "bg-rose-500/10" : "bg-rose-500/10"
                    )}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      ) : (
                        <Landmark className="w-5 h-5 text-rose-500" strokeWidth={2} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground truncate">{debt.name}</h3>
                        {isComplete && (
                          <Badge className="bg-emerald-500 text-white text-[10px]">
                            ✓ تسویه شد
                          </Badge>
                        )}
                        {isOverdue && (
                          <Badge variant="destructive" className="text-[10px]">
                            سررسید گذشته
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <UserRound className="w-3 h-3" strokeWidth={2} />
                        <span>{debt.creditor}</span>
                        {debt.dueDate && (
                          <>
                            <span className="text-border">•</span>
                        <CalendarDays className="w-3 h-3" strokeWidth={2} />
                            <span>{formatPersianDateShort(debt.dueDate)}</span>
                          </>
                        )}
                      </div>

                      {debt.reason && (
                        <p className="text-xs text-muted-foreground/70 mb-2 line-clamp-1">
                          {debt.reason}
                        </p>
                      )}

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={cn(
                          "text-lg font-bold",
                          isComplete ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {formatCurrency(debt.paidAmount)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          از {formatCurrency(debt.totalAmount)}
                        </span>
                      </div>

                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={cn(
                          "h-2",
                          isComplete && "[&>div]:bg-emerald-500"
                        )}
                      />
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>{Math.round(progress)}% پرداخت شده</span>
                        {!isComplete && (
                          <span>{formatCurrency(remaining)} باقیمانده</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    {!isComplete && (
                      <Button
                        size="sm"
                        className="flex-1 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => setPaymentModal(debt.id)}
                      >
                        <Banknote className="w-4 h-4 ml-1" strokeWidth={2} />
                        ثبت پرداخت
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl"
                      onClick={() => openEditModal(debt)}
                    >
                      <Pencil className="w-4 h-4" strokeWidth={2} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(debt.id)}
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

      {/* Add/Edit Debt Modal */}
      <Dialog open={isAddModalOpen || !!editingDebt} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setEditingDebt(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-rose-500" strokeWidth={2} />
              {editingDebt ? 'ویرایش بدهی' : 'ثبت بدهی جدید'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>عنوان بدهی</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلا: وام مسکن"
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>مبلغ کل (تومان)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(formatAmount(e.target.value))}
                  placeholder="0"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>پرداخت شده (تومان)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(formatAmount(e.target.value))}
                  placeholder="0"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>بستانکار (فرد یا سازمان)</Label>
              <Input
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                placeholder="مثلا: بانک ملی"
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>تاریخ سررسید (اختیاری)</Label>
              <PersianDatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="انتخاب تاریخ سررسید"
              />
            </div>

            <div className="space-y-2">
              <Label>دلیل بدهی (اختیاری)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="توضیحات..."
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            <Button type="submit" size="lg" className="w-full rounded-xl">
              {editingDebt ? 'ذخیره تغییرات' : 'ثبت بدهی'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={!!paymentModal} onOpenChange={() => setPaymentModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-500" strokeWidth={2} />
              ثبت پرداخت
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePayment} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>مبلغ پرداختی (تومان)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(formatAmount(e.target.value))}
                placeholder="0"
                className="h-12 rounded-xl text-xl font-bold text-center"
                required
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
            >
              ثبت پرداخت
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف بدهی</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDeleteDebt(deleteId);
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
