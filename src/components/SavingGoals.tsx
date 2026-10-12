import { useMemo, useState } from 'react';
import {
  Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Sparkles, PiggyBank,
  Pencil, History, CalendarClock, TrendingUp, AlertTriangle, CheckCircle2, Target,
} from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';
import { getCategoryIcon, goalIconOptions } from '@/utils/categoryIcons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PersianDatePicker } from '@/components/PersianDatePicker';
import { SavingGoal, GoalTransaction } from '@/hooks/useSavingGoals';
import { formatCurrency, formatPersianDate, toPersianNum } from '@/utils/persianDate';
import { parseLocalDate } from '@/utils/dateUtils';
import { parseAmount } from '@/utils/numberUtils';
import { cn } from '@/lib/utils';

const colorOptions = [
  'hsl(175, 85%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)',
  'hsl(0, 72%, 51%)', 'hsl(145, 65%, 42%)', 'hsl(330, 80%, 60%)', 'hsl(25, 95%, 53%)',
];

type GoalUpdates = Partial<Pick<SavingGoal, 'name' | 'targetAmount' | 'color' | 'icon' | 'deadline'>>;
type Filter = 'active' | 'behind' | 'done' | 'all';

interface SavingGoalsProps {
  goals: SavingGoal[];
  transactions?: GoalTransaction[];
  onAddGoal: (goal: Omit<SavingGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => void;
  onUpdateGoal?: (id: string, updates: GoalUpdates) => void;
  onUpdateAmount: (goalId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) => void;
  onDeleteGoal: (id: string) => void;
}

interface GoalStats {
  progress: number;
  remaining: number;
  isComplete: boolean;
  daysLeft?: number;
  monthlyNeeded?: number;
  avgMonthly: number;
  etaMonths?: number;
  status: 'done' | 'overdue' | 'behind' | 'ontrack' | 'nodeadline';
  expectedProgress?: number;
}

const DAY_MS = 86400000;

function computeStats(goal: SavingGoal, txs: GoalTransaction[]): GoalStats {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isComplete = progress >= 100;
  const today = new Date();
  const created = new Date(goal.createdAt);
  const ageMonths = Math.max(1, (today.getTime() - created.getTime()) / (DAY_MS * 30.44));
  // Net contributions in the last 90 days (or goal age if younger)
  const since = today.getTime() - 90 * DAY_MS;
  const recent = txs.filter(t => new Date(t.createdAt).getTime() >= since);
  const net = recent.reduce((s, t) => s + (t.type === 'deposit' ? t.amount : -t.amount), 0);
  const avgMonthly = Math.max(0, net / Math.min(3, ageMonths));
  const etaMonths = !isComplete && avgMonthly > 0 ? Math.ceil(remaining / avgMonthly) : undefined;

  let daysLeft: number | undefined;
  let monthlyNeeded: number | undefined;
  let expectedProgress: number | undefined;
  let status: GoalStats['status'] = isComplete ? 'done' : 'nodeadline';
  if (goal.deadline) {
    const dl = parseLocalDate(goal.deadline);
    daysLeft = differenceInCalendarDays(dl, today);
    const monthsLeft = Math.max(1, daysLeft / 30.44);
    monthlyNeeded = isComplete ? 0 : Math.ceil(remaining / monthsLeft);
    const total = Math.max(1, differenceInCalendarDays(dl, created));
    const elapsed = Math.min(total, Math.max(0, differenceInCalendarDays(today, created)));
    expectedProgress = (elapsed / total) * 100;
    if (!isComplete) {
      if (daysLeft < 0) status = 'overdue';
      else if (progress + 5 < expectedProgress) status = 'behind';
      else status = 'ontrack';
    }
  }
  return { progress, remaining, isComplete, daysLeft, monthlyNeeded, avgMonthly, etaMonths, status, expectedProgress };
}

const statusMeta: Record<GoalStats['status'], { label: string; className: string }> = {
  done: { label: 'تکمیل شد', className: 'bg-success/15 text-success border-success/30' },
  overdue: { label: 'سررسید گذشته', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  behind: { label: 'عقب از برنامه', className: 'bg-warning/15 text-warning border-warning/30' },
  ontrack: { label: 'طبق برنامه', className: 'bg-primary/15 text-primary border-primary/30' },
  nodeadline: { label: 'بدون مهلت', className: 'bg-muted text-muted-foreground border-border' },
};

const formatAmountInput = (value: string) => {
  const num = String(parseAmount(value) || '').replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function SavingGoals({ goals, transactions = [], onAddGoal, onUpdateGoal, onUpdateAmount, onDeleteGoal }: SavingGoalsProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SavingGoal | null>(null);
  const [txModal, setTxModal] = useState<{ goal: SavingGoal; type: 'deposit' | 'withdraw' } | null>(null);
  const [historyGoal, setHistoryGoal] = useState<SavingGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('active');

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  const txByGoal = useMemo(() => {
    const m = new Map<string, GoalTransaction[]>();
    transactions.forEach(t => {
      const arr = m.get(t.goalId) || [];
      arr.push(t);
      m.set(t.goalId, arr);
    });
    return m;
  }, [transactions]);

  const enriched = useMemo(
    () => goals.map(g => ({ goal: g, stats: computeStats(g, txByGoal.get(g.id) || []) })),
    [goals, txByGoal]
  );

  const filtered = useMemo(() => {
    const list = enriched.filter(({ stats }) => {
      if (filter === 'active') return !stats.isComplete;
      if (filter === 'done') return stats.isComplete;
      if (filter === 'behind') return stats.status === 'behind' || stats.status === 'overdue';
      return true;
    });
    // Nearest deadline first, then highest progress
    return list.sort((a, b) => {
      const da = a.goal.deadline || '9999';
      const db = b.goal.deadline || '9999';
      if (da !== db) return da < db ? -1 : 1;
      return b.stats.progress - a.stats.progress;
    });
  }, [enriched, filter]);

  const totals = useMemo(() => {
    const saved = goals.reduce((s, g) => s + g.currentAmount, 0);
    const target = goals.reduce((s, g) => s + g.targetAmount, 0);
    const monthlyNeeded = enriched.reduce((s, e) => s + (e.stats.monthlyNeeded || 0), 0);
    const monthStart = new Date(); monthStart.setDate(monthStart.getDate() - 30);
    const last30 = transactions
      .filter(t => new Date(t.createdAt) >= monthStart)
      .reduce((s, t) => s + (t.type === 'deposit' ? t.amount : -t.amount), 0);
    return {
      saved, target, monthlyNeeded, last30,
      progress: target > 0 ? (saved / target) * 100 : 0,
      done: enriched.filter(e => e.stats.isComplete).length,
      behind: enriched.filter(e => e.stats.status === 'behind' || e.stats.status === 'overdue').length,
    };
  }, [goals, enriched, transactions]);

  const openAdd = () => {
    setEditing(null);
    setName(''); setTargetAmount(''); setDeadline('');
    setSelectedIcon('Target'); setSelectedColor(colorOptions[0]);
    setFormOpen(true);
  };

  const openEdit = (g: SavingGoal) => {
    setEditing(g);
    setName(g.name);
    setTargetAmount(formatAmountInput(String(g.targetAmount)));
    setDeadline(g.deadline || '');
    setSelectedIcon(g.icon); setSelectedColor(g.color);
    setFormOpen(true);
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(targetAmount);
    if (!name.trim() || amount <= 0) return;
    const payload = { name: name.trim(), targetAmount: amount, color: selectedColor, icon: selectedIcon, deadline: deadline || undefined };
    if (editing && onUpdateGoal) onUpdateGoal(editing.id, { ...payload, deadline: deadline || '' });
    else onAddGoal(payload);
    setFormOpen(false);
  };

  const openTx = (goal: SavingGoal, type: 'deposit' | 'withdraw') => {
    setTxAmount(''); setTxNote('');
    setTxModal({ goal, type });
  };

  const txMax = txModal
    ? txModal.type === 'withdraw' ? txModal.goal.currentAmount : undefined
    : undefined;
  const txValue = parseAmount(txAmount);
  const txInvalid = txValue <= 0 || (txMax !== undefined && txValue > txMax);

  const handleSubmitTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txModal || txInvalid) return;
    onUpdateAmount(txModal.goal.id, txValue, txModal.type, txNote.trim() || undefined);
    setTxModal(null);
  };

  const quickAmounts = (() => {
    if (!txModal) return [];
    const g = txModal.goal;
    const st = computeStats(g, txByGoal.get(g.id) || []);
    if (txModal.type === 'withdraw') {
      return [
        { label: 'نصف', value: Math.floor(g.currentAmount / 2) },
        { label: 'کل موجودی', value: g.currentAmount },
      ].filter(q => q.value > 0);
    }
    const list: { label: string; value: number }[] = [];
    if (st.monthlyNeeded && st.monthlyNeeded > 0) list.push({ label: 'سهم ماهانه', value: st.monthlyNeeded });
    if (st.remaining > 0) list.push({ label: 'تکمیل هدف', value: st.remaining });
    [1_000_000, 5_000_000].forEach(v => list.push({ label: formatCurrency(v), value: v }));
    return list;
  })();

  const historyTxs = historyGoal ? txByGoal.get(historyGoal.id) || [] : [];

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'active', label: 'فعال', count: enriched.filter(e => !e.stats.isComplete).length },
    { key: 'behind', label: 'عقب‌افتاده', count: totals.behind },
    { key: 'done', label: 'تکمیل', count: totals.done },
    { key: 'all', label: 'همه', count: goals.length },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <PiggyBank className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">اهداف پس‌انداز</h2>
            <p className="text-xs text-muted-foreground">
              {toPersianNum(goals.length - totals.done)} فعال · {toPersianNum(totals.done)} تکمیل
            </p>
          </div>
        </div>
        <Button onClick={openAdd} size="sm" className="rounded-xl h-11 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 ml-1" />
          هدف جدید
        </Button>
      </div>

      {goals.length > 0 && (
        <Card className="glass rounded-2xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">مجموع پس‌انداز</p>
                <p className="text-2xl font-black text-primary truncate">{formatCurrency(totals.saved)}</p>
              </div>
              <span className="text-lg font-bold text-foreground">{toPersianNum(Math.round(totals.progress))}٪</span>
            </div>
            <Progress value={Math.min(100, totals.progress)} className="h-2.5" />
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-[11px] text-muted-foreground mb-1">باقی‌مانده تا همه اهداف</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(Math.max(0, totals.target - totals.saved))}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-[11px] text-muted-foreground mb-1">نیاز ماهانه (طبق مهلت‌ها)</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(totals.monthlyNeeded)}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-[11px] text-muted-foreground mb-1">پس‌انداز ۳۰ روز اخیر</p>
                <p className={cn('text-sm font-bold', totals.last30 >= 0 ? 'text-success' : 'text-destructive')}>
                  {formatCurrency(totals.last30)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-[11px] text-muted-foreground mb-1">اهداف عقب‌افتاده</p>
                <p className={cn('text-sm font-bold', totals.behind > 0 ? 'text-warning' : 'text-foreground')}>
                  {toPersianNum(totals.behind)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {goals.length > 0 && (
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-muted/50">
          {filters.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'h-11 rounded-xl text-xs font-medium transition-colors',
                filter === f.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              {f.label} {toPersianNum(f.count)}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {goals.length === 0 ? (
          <Card className="glass rounded-2xl">
            <CardContent className="p-8 text-center">
              <PiggyBank className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">هنوز هدفی تعریف نکرده‌اید</p>
              <p className="text-xs text-muted-foreground mt-1">با تعیین مهلت، مبلغ لازم هر ماه را محاسبه می‌کنیم.</p>
              <Button onClick={openAdd} variant="outline" className="mt-4 rounded-xl">
                <Plus className="w-4 h-4 ml-2" />
                ایجاد اولین هدف
              </Button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">موردی در این دسته نیست</p>
        ) : (
          filtered.map(({ goal, stats }) => {
            const Icon = getCategoryIcon(goal.icon);
            const meta = statusMeta[stats.status];
            return (
              <Card key={goal.id} className={cn('glass rounded-2xl overflow-hidden', stats.isComplete && 'border-success/30')}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: `${goal.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: goal.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-foreground truncate">{goal.name}</h3>
                        <Badge variant="outline" className={cn('text-[10px] shrink-0', meta.className)}>{meta.label}</Badge>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                        <span className="text-lg font-bold" style={{ color: goal.color }}>{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-xs text-muted-foreground">از {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={Math.min(stats.progress, 100)}
                          className="h-2"
                          style={{ ['--progress-background' as string]: goal.color } as React.CSSProperties}
                        />
                        {stats.expectedProgress !== undefined && !stats.isComplete && (
                          <div
                            className="absolute -top-1 h-4 w-0.5 rounded bg-foreground/60"
                            style={{ right: `${Math.min(100, stats.expectedProgress)}%` }}
                            aria-label="جایگاه مورد انتظار"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>{toPersianNum(Math.round(stats.progress))}٪</span>
                        {!stats.isComplete && <span>{formatCurrency(stats.remaining)} مانده</span>}
                      </div>
                    </div>
                  </div>

                  {!stats.isComplete && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 min-w-0">
                        <CalendarClock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">مهلت</p>
                          <p className="text-xs font-medium truncate">
                            {goal.deadline
                              ? `${formatPersianDate(goal.deadline)} · ${stats.daysLeft! < 0 ? `${toPersianNum(-stats.daysLeft!)} روز گذشته` : `${toPersianNum(stats.daysLeft!)} روز`}`
                              : 'تعیین نشده'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 min-w-0">
                        {stats.monthlyNeeded ? <Target className="w-4 h-4 text-muted-foreground shrink-0" /> : <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">{stats.monthlyNeeded ? 'لازم در هر ماه' : 'پیش‌بینی رسیدن'}</p>
                          <p className="text-xs font-medium truncate">
                            {stats.monthlyNeeded
                              ? formatCurrency(stats.monthlyNeeded)
                              : stats.etaMonths ? `حدود ${toPersianNum(stats.etaMonths)} ماه دیگر` : 'نیاز به واریز'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!stats.isComplete && stats.monthlyNeeded && stats.avgMonthly > 0 && stats.avgMonthly < stats.monthlyNeeded && (
                    <p className="flex items-center gap-1.5 text-[11px] text-warning mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      میانگین واریز شما {formatCurrency(Math.round(stats.avgMonthly))} در ماه است؛ برای رسیدن به مهلت بیشتر لازم است.
                    </p>
                  )}
                  {stats.isComplete && (
                    <p className="flex items-center gap-1.5 text-xs text-success mt-3">
                      <CheckCircle2 className="w-4 h-4" /> به این هدف رسیدید.
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                    <Button size="sm" variant="outline" className="flex-1 h-11 rounded-xl border-success/30 text-success hover:bg-success/10 hover:text-success" onClick={() => openTx(goal, 'deposit')}>
                      <ArrowUpCircle className="w-4 h-4 ml-1" /> واریز
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => openTx(goal, 'withdraw')} disabled={goal.currentAmount === 0}>
                      <ArrowDownCircle className="w-4 h-4 ml-1" /> برداشت
                    </Button>
                    <Button size="icon" variant="ghost" className="h-11 w-11 rounded-xl" onClick={() => setHistoryGoal(goal)} aria-label="تاریخچه">
                      <History className="w-4 h-4" />
                    </Button>
                    {onUpdateGoal && (
                      <Button size="icon" variant="ghost" className="h-11 w-11 rounded-xl" onClick={() => openEdit(goal)} aria-label="ویرایش">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(goal.id)} aria-label="حذف">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add / Edit Goal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {editing ? 'ویرایش هدف' : 'هدف جدید'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitGoal} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label>نام هدف</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلا: خرید لپ‌تاپ" className="h-12 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>مبلغ هدف (تومان)</Label>
              <Input type="text" inputMode="numeric" value={targetAmount} onChange={(e) => setTargetAmount(formatAmountInput(e.target.value))} placeholder="50,000,000" className="h-12 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>مهلت رسیدن (اختیاری)</Label>
              <PersianDatePicker value={deadline} onChange={setDeadline} placeholder="انتخاب تاریخ" />
              {deadline && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {(() => {
                      const amount = parseAmount(targetAmount) - (editing?.currentAmount || 0);
                      const days = differenceInCalendarDays(parseLocalDate(deadline), new Date());
                      if (amount <= 0 || days <= 0) return '';
                      return `حدود ${formatCurrency(Math.ceil(amount / Math.max(1, days / 30.44)))} در ماه`;
                    })()}
                  </span>
                  <button type="button" className="text-destructive" onClick={() => setDeadline('')}>حذف مهلت</button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>آیکون</Label>
              <div className="grid grid-cols-5 gap-2">
                {goalIconOptions.map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <button key={opt.name} type="button" onClick={() => setSelectedIcon(opt.name)}
                      className={cn('p-3 rounded-xl transition-all aspect-square flex items-center justify-center',
                        selectedIcon === opt.name ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-accent')}>
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
                  <button key={color} type="button" onClick={() => setSelectedColor(color)} aria-label="رنگ"
                    className={cn('w-10 h-10 rounded-xl transition-all', selectedColor === color && 'ring-2 ring-offset-2 ring-offset-background ring-foreground')}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full rounded-xl h-12">
              {editing ? 'ذخیره تغییرات' : 'ایجاد هدف'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deposit / Withdraw */}
      <Dialog open={!!txModal} onOpenChange={(o) => !o && setTxModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {txModal?.type === 'deposit'
                ? <><ArrowUpCircle className="w-5 h-5 text-success" /> واریز به «{txModal?.goal.name}»</>
                : <><ArrowDownCircle className="w-5 h-5 text-destructive" /> برداشت از «{txModal?.goal.name}»</>}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTx} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>مبلغ (تومان)</Label>
              <Input type="text" inputMode="numeric" enterKeyHint="done" value={txAmount} onChange={(e) => setTxAmount(formatAmountInput(e.target.value))} placeholder="0" className="h-12 rounded-xl text-xl font-bold text-center" required />
              {txMax !== undefined && (
                <p className={cn('text-xs', txValue > txMax ? 'text-destructive' : 'text-muted-foreground')}>
                  موجودی قابل برداشت: {formatCurrency(txMax)}
                </p>
              )}
            </div>
            {quickAmounts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(q => (
                  <button key={q.label} type="button" onClick={() => setTxAmount(formatAmountInput(String(q.value)))}
                    className="h-9 px-3 rounded-full bg-muted text-xs font-medium hover:bg-accent">
                    {q.label}
                  </button>
                ))}
              </div>
            )}
            {txModal?.type === 'deposit' && txValue > 0 && (
              <p className="text-xs text-muted-foreground">
                پس از واریز: {toPersianNum(Math.min(100, Math.round(((txModal.goal.currentAmount + txValue) / txModal.goal.targetAmount) * 100)))}٪ پیشرفت
              </p>
            )}
            <div className="space-y-2">
              <Label>یادداشت (اختیاری)</Label>
              <Input value={txNote} onChange={(e) => setTxNote(e.target.value)} placeholder="توضیحات..." className="h-11 rounded-xl" />
            </div>
            <Button type="submit" size="lg" disabled={txInvalid} className={cn('w-full rounded-xl h-12', txModal?.type === 'deposit' ? 'gradient-income' : 'gradient-expense')}>
              {txModal?.type === 'deposit' ? 'ثبت واریز' : 'ثبت برداشت'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={!!historyGoal} onOpenChange={(o) => !o && setHistoryGoal(null)}>
        <DialogContent className="max-w-sm max-h-[80dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> تاریخچه «{historyGoal?.name}»
            </DialogTitle>
          </DialogHeader>
          {historyTxs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">هنوز تراکنشی ثبت نشده</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[11px] text-muted-foreground">کل واریز</p>
                  <p className="text-sm font-bold text-success">{formatCurrency(historyTxs.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0))}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[11px] text-muted-foreground">کل برداشت</p>
                  <p className="text-sm font-bold text-destructive">{formatCurrency(historyTxs.filter(t => t.type === 'withdraw').reduce((s, t) => s + t.amount, 0))}</p>
                </div>
              </div>
              <ul className="divide-y divide-border/50">
                {historyTxs.map(t => (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    {t.type === 'deposit'
                      ? <ArrowUpCircle className="w-5 h-5 text-success shrink-0" />
                      : <ArrowDownCircle className="w-5 h-5 text-destructive shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.note || (t.type === 'deposit' ? 'واریز' : 'برداشت')}</p>
                      <p className="text-[11px] text-muted-foreground">{formatPersianDate(t.createdAt.slice(0, 10))}</p>
                    </div>
                    <span className={cn('text-sm font-bold', t.type === 'deposit' ? 'text-success' : 'text-destructive')}>
                      {t.type === 'deposit' ? '+' : '−'}{formatCurrency(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف هدف پس‌انداز</AlertDialogTitle>
            <AlertDialogDescription>آیا مطمئنید؟ این هدف و تاریخچه آن حذف می‌شود.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) onDeleteGoal(deleteId); setDeleteId(null); }} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
