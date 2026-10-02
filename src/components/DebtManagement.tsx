import { useMemo, useState } from 'react';
import {
  Plus, Landmark, Trash2, Pencil, Banknote,
  UserRound, TrendingDown, CheckCircle2,
  AlertCircle, CalendarDays, History, Repeat, Clock, Wallet,
} from 'lucide-react';
import { PersianDatePicker } from './PersianDatePicker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Debt, DebtPayment, DebtFrequency } from '@/hooks/useDebts';
import { formatCurrency, formatPersianDateShort, toPersianNum } from '@/utils/persianDate';
import { toLocalISODateString } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

type DebtInput = Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>;

interface DebtManagementProps {
  debts: Debt[];
  payments?: DebtPayment[];
  stats: {
    totalDebt: number;
    totalPaid: number;
    totalRemaining: number;
    progress: number;
    monthlyCommitment?: number;
    activeCount?: number;
    settledCount?: number;
  };
  onAddDebt: (debt: DebtInput) => unknown;
  onUpdateDebt: (id: string, updates: Partial<DebtInput>) => unknown;
  onDeleteDebt: (id: string) => unknown;
  onAddPayment: (id: string, amount: number, paidAt?: string, note?: string) => unknown;
  onDeletePayment?: (paymentId: string, debtId: string, amount: number) => unknown;
}

const FREQ_LABEL: Record<DebtFrequency, string> = {
  weekly: 'هفتگی',
  biweekly: 'دوهفته‌یکبار',
  monthly: 'ماهانه',
  quarterly: 'سه‌ماهه',
  yearly: 'سالانه',
};

const FREQ_DAYS: Record<DebtFrequency, number> = {
  weekly: 7, biweekly: 14, monthly: 30, quarterly: 91, yearly: 365,
};

type Filter = 'active' | 'overdue' | 'settled' | 'all';

const fmtInput = (v: string) => {
  const en = v.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const num = en.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const toNum = (v: string) => {
  const n = parseInt(v.replace(/,/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

function addPeriods(dateStr: string, freq: DebtFrequency, n: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (freq === 'monthly') d.setMonth(d.getMonth() + n);
  else if (freq === 'quarterly') d.setMonth(d.getMonth() + 3 * n);
  else if (freq === 'yearly') d.setFullYear(d.getFullYear() + n);
  else d.setDate(d.getDate() + FREQ_DAYS[freq] * n);
  return toLocalISODateString(d);
}

function analyze(debt: Debt) {
  const remaining = Math.max(0, debt.totalAmount - debt.paidAmount);
  const progress = debt.totalAmount > 0 ? Math.min(100, (debt.paidAmount / debt.totalAmount) * 100) : 0;
  const isComplete = remaining <= 0;
  const today = toLocalISODateString(new Date());
  const nextDue = debt.nextDueDate || debt.dueDate;
  const isOverdue = !isComplete && !!nextDue && nextDue < today;
  const daysToDue = nextDue
    ? Math.round((new Date(nextDue + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) / 86400000)
    : null;
  const instAmount = debt.installmentAmount || 0;
  const paidInstallments = instAmount > 0 ? Math.floor(debt.paidAmount / instAmount) : 0;
  const remainingInstallments = instAmount > 0 ? Math.ceil(remaining / instAmount) : 0;
  const estimatedFinish = instAmount > 0 && nextDue && !isComplete
    ? addPeriods(nextDue, debt.frequency, Math.max(0, remainingInstallments - 1))
    : null;
  return { remaining, progress, isComplete, isOverdue, nextDue, daysToDue, instAmount, paidInstallments, remainingInstallments, estimatedFinish };
}

export function DebtManagement({
  debts, payments = [], stats, onAddDebt, onUpdateDebt, onDeleteDebt, onAddPayment, onDeletePayment,
}: DebtManagementProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const [historyDebt, setHistoryDebt] = useState<Debt | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('active');

  // Form
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [creditor, setCreditor] = useState('');
  const [reason, setReason] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [frequency, setFrequency] = useState<DebtFrequency>('monthly');
  const [startDate, setStartDate] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [interestRate, setInterestRate] = useState('');

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const resetForm = () => {
    setName(''); setTotalAmount(''); setPaidAmount(''); setCreditor(''); setReason('');
    setDueDate(''); setIsInstallment(false); setInstallmentCount(''); setInstallmentAmount('');
    setFrequency('monthly'); setStartDate(''); setNextDueDate(''); setInterestRate('');
  };

  const openEditModal = (debt: Debt) => {
    setEditingDebt(debt);
    setName(debt.name);
    setTotalAmount(fmtInput(String(debt.totalAmount)));
    setPaidAmount(fmtInput(String(debt.paidAmount)));
    setCreditor(debt.creditor);
    setReason(debt.reason || '');
    setDueDate(debt.dueDate || '');
    setIsInstallment(!!debt.installmentAmount);
    setInstallmentCount(debt.installmentCount ? String(debt.installmentCount) : '');
    setInstallmentAmount(debt.installmentAmount ? fmtInput(String(debt.installmentAmount)) : '');
    setFrequency(debt.frequency);
    setStartDate(debt.startDate || '');
    setNextDueDate(debt.nextDueDate || '');
    setInterestRate(debt.interestRate ? String(debt.interestRate) : '');
  };

  // Auto-calc installment amount from total / count
  const handleCountChange = (v: string) => {
    const clean = fmtInput(v).replace(/,/g, '');
    setInstallmentCount(clean);
    const c = parseInt(clean, 10);
    const t = toNum(totalAmount);
    if (c > 0 && t > 0) setInstallmentAmount(fmtInput(String(Math.ceil(t / c))));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = toNum(totalAmount);
    if (total <= 0) return;
    const inst = isInstallment ? toNum(installmentAmount) : 0;
    const start = isInstallment ? (startDate || toLocalISODateString(new Date())) : '';
    const next = isInstallment ? (nextDueDate || start) : '';
    const data: DebtInput = {
      name: name.trim(),
      totalAmount: total,
      paidAmount: Math.min(toNum(paidAmount), total),
      creditor: creditor.trim(),
      reason: reason.trim() || undefined,
      dueDate: dueDate || undefined,
      installmentCount: isInstallment ? (parseInt(installmentCount, 10) || undefined) : undefined,
      installmentAmount: inst || undefined,
      frequency,
      startDate: start || undefined,
      nextDueDate: next || undefined,
      interestRate: parseFloat(interestRate) || 0,
    };
    if (editingDebt) {
      onUpdateDebt(editingDebt.id, {
        ...data,
        // explicit clears when switching off installments
        installmentCount: data.installmentCount ?? 0,
        installmentAmount: data.installmentAmount ?? 0,
        startDate: data.startDate ?? '',
        nextDueDate: data.nextDueDate ?? '',
        dueDate: data.dueDate ?? '',
        reason: data.reason ?? '',
      });
      setEditingDebt(null);
    } else {
      onAddDebt(data);
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const openPayment = (debt: Debt) => {
    const a = analyze(debt);
    setPaymentDebt(debt);
    setPaymentAmount(a.instAmount ? fmtInput(String(Math.min(a.instAmount, a.remaining))) : '');
    setPaymentDate(toLocalISODateString(new Date()));
    setPaymentNote('');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDebt) return;
    const amt = toNum(paymentAmount);
    if (amt <= 0) return;
    onAddPayment(paymentDebt.id, amt, paymentDate || undefined, paymentNote.trim() || undefined);
    setPaymentDebt(null);
  };

  const analyzed = useMemo(() => debts.map((d) => ({ debt: d, a: analyze(d) })), [debts]);

  const counts = useMemo(() => ({
    active: analyzed.filter((x) => !x.a.isComplete).length,
    overdue: analyzed.filter((x) => x.a.isOverdue).length,
    settled: analyzed.filter((x) => x.a.isComplete).length,
    all: analyzed.length,
  }), [analyzed]);

  const visible = useMemo(() => {
    const list = analyzed.filter((x) =>
      filter === 'all' ? true
        : filter === 'active' ? !x.a.isComplete
          : filter === 'overdue' ? x.a.isOverdue
            : x.a.isComplete);
    // Overdue first, then nearest due date
    return list.sort((x, y) => {
      if (x.a.isOverdue !== y.a.isOverdue) return x.a.isOverdue ? -1 : 1;
      const dx = x.a.nextDue || '9999'; const dy = y.a.nextDue || '9999';
      return dx.localeCompare(dy);
    });
  }, [analyzed, filter]);

  const upcoming = useMemo(() =>
    analyzed
      .filter((x) => !x.a.isComplete && x.a.daysToDue !== null && x.a.daysToDue <= 30)
      .reduce((s, x) => s + (x.a.instAmount ? Math.min(x.a.instAmount, x.a.remaining) : x.a.remaining), 0),
  [analyzed]);

  const historyPayments = historyDebt ? payments.filter((p) => p.debtId === historyDebt.id) : [];
  const formTotal = toNum(totalAmount);
  const formInst = toNum(installmentAmount);
  const rate = parseFloat(interestRate) || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 rounded-2xl bg-destructive/15 border border-destructive/20">
            <Landmark className="w-6 h-6 text-destructive" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground">مدیریت بدهی‌ها</h2>
            <p className="text-xs text-muted-foreground">
              {toPersianNum(counts.active)} فعال • {toPersianNum(counts.settled)} تسویه‌شده
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="h-11 rounded-xl shrink-0">
          <Plus className="w-4 h-4 ml-1" />
          بدهی جدید
        </Button>
      </div>

      {/* Summary */}
      {debts.length > 0 && (
        <Card className="glass rounded-2xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-destructive/10">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">مانده کل بدهی</p>
                <p className="text-2xl font-black text-destructive truncate">{formatCurrency(stats.totalRemaining)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Repeat className="w-3 h-3" />تعهد ماهانه اقساط</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(Math.round(stats.monthlyCommitment || 0))}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />سررسید ۳۰ روز آینده</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(upcoming)}</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <p className="text-[11px] text-muted-foreground mb-1">پرداخت‌شده</p>
                <p className="text-sm font-bold text-success">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-[11px] text-muted-foreground mb-1">کل بدهی</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(stats.totalDebt)}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">پیشرفت تسویه</span>
                <span className="font-bold text-primary">{toPersianNum(Math.round(stats.progress))}٪</span>
              </div>
              <Progress value={stats.progress} className="h-2.5 [&>div]:bg-success" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {debts.length > 0 && (
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-muted/40 border border-border">
          {([
            ['active', 'فعال'], ['overdue', 'معوق'], ['settled', 'تسویه'], ['all', 'همه'],
          ] as [Filter, string][]).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cn(
                'h-10 rounded-xl text-xs font-medium transition-colors',
                filter === k ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {label} ({toPersianNum(counts[k])})
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {debts.length === 0 ? (
          <Card className="glass rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Landmark className="w-8 h-8 text-destructive/60" strokeWidth={2} />
              </div>
              <p className="text-foreground mb-2 font-medium">هنوز بدهی‌ای ثبت نکرده‌اید</p>
              <p className="text-xs text-muted-foreground mb-4">
                وام‌ها و بدهی‌های قسطی را ثبت کنید تا اقساط، سررسیدها و پیشرفت پرداخت را دقیق دنبال کنید
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="h-11 rounded-xl">
                <Plus className="w-4 h-4 ml-2" />
                ثبت اولین بدهی
              </Button>
            </CardContent>
          </Card>
        ) : visible.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">موردی در این بخش نیست</p>
        ) : (
          visible.map(({ debt, a }) => {
            const debtPayments = payments.filter((p) => p.debtId === debt.id);
            return (
              <Card
                key={debt.id}
                className={cn(
                  'glass rounded-2xl overflow-hidden',
                  a.isComplete && 'border-success/30',
                  a.isOverdue && 'border-destructive/40',
                )}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2.5 rounded-xl shrink-0', a.isComplete ? 'bg-success/10' : 'bg-destructive/10')}>
                      {a.isComplete ? <CheckCircle2 className="w-5 h-5 text-success" />
                        : a.isOverdue ? <AlertCircle className="w-5 h-5 text-destructive" />
                          : <Landmark className="w-5 h-5 text-destructive" strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-foreground truncate">{debt.name}</h3>
                        {a.isComplete ? (
                          <Badge className="bg-success text-success-foreground text-[10px] shrink-0">تسویه شد</Badge>
                        ) : a.isOverdue ? (
                          <Badge variant="destructive" className="text-[10px] shrink-0">معوق</Badge>
                        ) : a.instAmount ? (
                          <Badge variant="outline" className="text-[10px] shrink-0">{FREQ_LABEL[debt.frequency]}</Badge>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><UserRound className="w-3 h-3" />{debt.creditor}</span>
                        {debt.interestRate > 0 && <span>• سود {toPersianNum(debt.interestRate)}٪</span>}
                      </div>
                      {debt.reason && <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">{debt.reason}</p>}
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground">مانده</p>
                      <p className={cn('text-lg font-bold', a.isComplete ? 'text-success' : 'text-destructive')}>
                        {formatCurrency(a.remaining)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">از {formatCurrency(debt.totalAmount)}</p>
                  </div>

                  <div className="space-y-1">
                    <Progress value={a.progress} className={cn('h-2', a.isComplete && '[&>div]:bg-success')} />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{toPersianNum(Math.round(a.progress))}٪ پرداخت‌شده</span>
                      {a.instAmount > 0 && debt.installmentCount ? (
                        <span>قسط {toPersianNum(Math.min(a.paidInstallments, debt.installmentCount))} از {toPersianNum(debt.installmentCount)}</span>
                      ) : null}
                    </div>
                  </div>

                  {!a.isComplete && (a.instAmount > 0 || a.nextDue) && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {a.instAmount > 0 && (
                        <div className="rounded-xl bg-muted/30 border border-border p-2.5">
                          <p className="text-muted-foreground mb-0.5">مبلغ هر قسط</p>
                          <p className="font-bold text-foreground">{formatCurrency(a.instAmount)}</p>
                        </div>
                      )}
                      {a.nextDue && (
                        <div className={cn(
                          'rounded-xl border p-2.5',
                          a.isOverdue ? 'bg-destructive/10 border-destructive/20'
                            : (a.daysToDue ?? 99) <= 7 ? 'bg-warning/10 border-warning/20' : 'bg-muted/30 border-border',
                        )}>
                          <p className="text-muted-foreground mb-0.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{a.instAmount ? 'قسط بعدی' : 'سررسید'}</p>
                          <p className="font-bold text-foreground">
                            {formatPersianDateShort(a.nextDue)}
                            <span className="font-normal text-muted-foreground mr-1">
                              {a.daysToDue === 0 ? '(امروز)'
                                : a.daysToDue! < 0 ? `(${toPersianNum(-a.daysToDue!)} روز گذشته)`
                                  : `(${toPersianNum(a.daysToDue!)} روز)`}
                            </span>
                          </p>
                        </div>
                      )}
                      {a.estimatedFinish && (
                        <div className="col-span-2 rounded-xl bg-primary/5 border border-primary/15 p-2.5 flex justify-between">
                          <span className="text-muted-foreground">{toPersianNum(a.remainingInstallments)} قسط مانده • پایان تقریبی</span>
                          <span className="font-bold text-foreground">{formatPersianDateShort(a.estimatedFinish)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    {!a.isComplete && (
                      <Button className="flex-1 h-11 rounded-xl bg-success hover:bg-success/90 text-success-foreground" onClick={() => openPayment(debt)}>
                        <Banknote className="w-4 h-4 ml-1" />
                        {a.instAmount ? 'پرداخت قسط' : 'ثبت پرداخت'}
                      </Button>
                    )}
                    <Button variant="outline" className={cn('h-11 rounded-xl', a.isComplete && 'flex-1')} onClick={() => setHistoryDebt(debt)} aria-label="تاریخچه پرداخت">
                      <History className="w-4 h-4" />
                      {debtPayments.length > 0 && <span className="mr-1 text-xs">{toPersianNum(debtPayments.length)}</span>}
                    </Button>
                    <Button variant="outline" className="h-11 w-11 p-0 rounded-xl" onClick={() => openEditModal(debt)} aria-label="ویرایش">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="h-11 w-11 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(debt.id)} aria-label="حذف">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit */}
      <Dialog open={isAddModalOpen || !!editingDebt} onOpenChange={(open) => {
        if (!open) { setIsAddModalOpen(false); setEditingDebt(null); resetForm(); }
      }}>
        <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-destructive" />
              {editingDebt ? 'ویرایش بدهی' : 'ثبت بدهی جدید'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>عنوان بدهی</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: وام مسکن" className="h-11 rounded-xl" required />
            </div>

            <div className="space-y-2">
              <Label>بستانکار (فرد یا سازمان)</Label>
              <Input value={creditor} onChange={(e) => setCreditor(e.target.value)} placeholder="مثلاً: بانک ملی" className="h-11 rounded-xl" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>مبلغ کل (تومان)</Label>
                <Input inputMode="numeric" value={totalAmount} onChange={(e) => setTotalAmount(fmtInput(e.target.value))} placeholder="0" className="h-11 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label>پرداخت‌شده تاکنون</Label>
                <Input inputMode="numeric" value={paidAmount} onChange={(e) => setPaidAmount(fmtInput(e.target.value))} placeholder="0" className="h-11 rounded-xl" />
              </div>
            </div>

            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-muted/40 border border-border">
              <button type="button" onClick={() => setIsInstallment(false)}
                className={cn('h-10 rounded-xl text-sm', !isInstallment ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>
                یک‌جا
              </button>
              <button type="button" onClick={() => setIsInstallment(true)}
                className={cn('h-10 rounded-xl text-sm', isInstallment ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>
                قسطی / بلندمدت
              </button>
            </div>

            {isInstallment ? (
              <div className="space-y-3 rounded-2xl border border-border p-3 bg-muted/20">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>تعداد اقساط</Label>
                    <Input inputMode="numeric" value={installmentCount} onChange={(e) => handleCountChange(e.target.value)} placeholder="مثلاً ۳۶" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>مبلغ هر قسط</Label>
                    <Input inputMode="numeric" value={installmentAmount} onChange={(e) => setInstallmentAmount(fmtInput(e.target.value))} placeholder="0" className="h-11 rounded-xl" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>دوره پرداخت</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as DebtFrequency)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(FREQ_LABEL) as DebtFrequency[]).map((f) => (
                          <SelectItem key={f} value={f}>{FREQ_LABEL[f]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نرخ سود سالانه ٪</Label>
                    <Input inputMode="decimal" value={interestRate} onChange={(e) => setInterestRate(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>تاریخ شروع</Label>
                  <PersianDatePicker value={startDate} onChange={setStartDate} placeholder="انتخاب تاریخ شروع" />
                </div>
                <div className="space-y-2">
                  <Label>سررسید قسط بعدی</Label>
                  <PersianDatePicker value={nextDueDate} onChange={setNextDueDate} placeholder="پیش‌فرض: تاریخ شروع" />
                </div>
                {formTotal > 0 && formInst > 0 && (
                  <div className="text-xs text-muted-foreground rounded-xl bg-background/50 p-2.5 space-y-1">
                    <p>تعداد قسط لازم برای مانده: <strong className="text-foreground">{toPersianNum(Math.ceil(Math.max(0, formTotal - toNum(paidAmount)) / formInst))}</strong></p>
                    {rate > 0 && <p>نرخ سود فقط برای اطلاع ثبت می‌شود؛ مبلغ کل را با احتساب سود وارد کنید.</p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>تاریخ سررسید (اختیاری)</Label>
                <PersianDatePicker value={dueDate} onChange={setDueDate} placeholder="انتخاب تاریخ سررسید" />
              </div>
            )}

            <div className="space-y-2">
              <Label>توضیحات (اختیاری)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="توضیحات..." className="rounded-xl resize-none" rows={2} />
            </div>

            <Button type="submit" size="lg" className="w-full h-12 rounded-xl">
              {editingDebt ? 'ذخیره تغییرات' : 'ثبت بدهی'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment */}
      <Dialog open={!!paymentDebt} onOpenChange={(o) => !o && setPaymentDebt(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-success" />
              پرداخت — {paymentDebt?.name}
            </DialogTitle>
          </DialogHeader>
          {paymentDebt && (() => {
            const a = analyze(paymentDebt);
            const amt = toNum(paymentAmount);
            return (
              <form onSubmit={handlePayment} className="space-y-4 mt-2">
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>مانده فعلی</span>
                  <strong className="text-foreground">{formatCurrency(a.remaining)}</strong>
                </div>
                <div className="space-y-2">
                  <Label>مبلغ پرداختی (تومان)</Label>
                  <Input inputMode="numeric" value={paymentAmount} onChange={(e) => setPaymentAmount(fmtInput(e.target.value))} placeholder="0" className="h-12 rounded-xl text-xl font-bold text-center" required />
                  <div className="flex gap-2">
                    {a.instAmount > 0 && (
                      <Button type="button" variant="outline" size="sm" className="flex-1 rounded-xl h-9" onClick={() => setPaymentAmount(fmtInput(String(Math.min(a.instAmount, a.remaining))))}>یک قسط</Button>
                    )}
                    {a.instAmount > 0 && a.remaining > a.instAmount * 2 && (
                      <Button type="button" variant="outline" size="sm" className="flex-1 rounded-xl h-9" onClick={() => setPaymentAmount(fmtInput(String(a.instAmount * 2)))}>دو قسط</Button>
                    )}
                    <Button type="button" variant="outline" size="sm" className="flex-1 rounded-xl h-9" onClick={() => setPaymentAmount(fmtInput(String(a.remaining)))}>تسویه کامل</Button>
                  </div>
                  {amt > a.remaining && <p className="text-xs text-warning">مبلغ بیشتر از مانده است؛ فقط تا سقف مانده محاسبه می‌شود.</p>}
                </div>
                <div className="space-y-2">
                  <Label>تاریخ پرداخت</Label>
                  <PersianDatePicker value={paymentDate} onChange={setPaymentDate} placeholder="امروز" />
                </div>
                <div className="space-y-2">
                  <Label>یادداشت (اختیاری)</Label>
                  <Input value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="مثلاً: شماره پیگیری" className="h-11 rounded-xl" />
                </div>
                <Button type="submit" size="lg" className="w-full h-12 rounded-xl bg-success hover:bg-success/90 text-success-foreground">
                  ثبت پرداخت
                </Button>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={!!historyDebt} onOpenChange={(o) => !o && setHistoryDebt(null)}>
        <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              تاریخچه پرداخت — {historyDebt?.name}
            </DialogTitle>
          </DialogHeader>
          {historyPayments.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">هنوز پرداختی ثبت نشده</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>{toPersianNum(historyPayments.length)} پرداخت</span>
                <span>جمع: <strong className="text-success">{formatCurrency(historyPayments.reduce((s, p) => s + p.amount, 0))}</strong></span>
              </div>
              {historyPayments.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 text-success text-xs font-bold flex items-center justify-center shrink-0">
                    {toPersianNum(historyPayments.length - i)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(p.amount)}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {formatPersianDateShort(p.paidAt)}{p.note ? ` • ${p.note}` : ''}
                    </p>
                  </div>
                  {onDeletePayment && historyDebt && (
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive"
                      aria-label="حذف پرداخت"
                      onClick={() => onDeletePayment(p.id, historyDebt.id, p.amount)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف بدهی</AlertDialogTitle>
            <AlertDialogDescription>این بدهی و تمام تاریخچه پرداخت آن حذف می‌شود. قابل بازگشت نیست.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) onDeleteDebt(deleteId); setDeleteId(null); }} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
