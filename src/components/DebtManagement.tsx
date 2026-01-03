import { useState } from 'react';
import { 
  Plus, CreditCard, Trash2, Edit3, DollarSign, 
  User, FileText, TrendingDown, CheckCircle2,
  AlertCircle, Loader2, Calendar
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
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">مدیریت بدهی‌ها</h2>
            <p className="text-xs text-muted-foreground">{debts.length} بدهی فعال</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="rounded-xl">
          <Plus className="w-4 h-4 ml-2" />
          بدهی جدید
        </Button>
      </div>

      {/* Summary Card */}
      {debts.length > 0 && (
        <Card variant="glass" className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-pink-500/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">کل بدهی</p>
                <p className="text-lg font-bold text-rose-500">{formatCurrency(stats.totalDebt)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">پرداخت شده</p>
                <p className="text-lg font-bold text-emerald-500">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">باقی‌مانده</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalRemaining)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">پیشرفت پرداخت</span>
                <span className="font-medium text-emerald-500">{Math.round(stats.progress)}%</span>
              </div>
              <Progress value={stats.progress} className="h-2.5" />
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
                <CreditCard className="w-8 h-8 text-rose-500/50" />
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
                        <CreditCard className="w-5 h-5 text-rose-500" />
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
                        <User className="w-3 h-3" />
                        <span>{debt.creditor}</span>
                        {debt.dueDate && (
                          <>
                            <span className="text-border">•</span>
                        <Calendar className="w-3 h-3" />
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
                        <DollarSign className="w-4 h-4 ml-1" />
                        ثبت پرداخت
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl"
                      onClick={() => openEditModal(debt)}
                    >
                      <Edit3 className="w-4 h-4" />
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
              <CreditCard className="w-5 h-5 text-rose-500" />
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
              <DollarSign className="w-5 h-5 text-emerald-500" />
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
