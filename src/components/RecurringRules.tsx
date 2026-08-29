import { useMemo, useState } from 'react';
import {
  Repeat, Plus, Trash2, Play, Pause, Loader2, CalendarClock, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useRecurringRules, RecurringFrequency } from '@/hooks/useRecurringRules';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { formatCurrency, formatPersianDateShort } from '@/utils/persianDate';
import { parseAmount } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const FREQUENCIES: { id: RecurringFrequency; label: string }[] = [
  { id: 'daily', label: 'روزانه' },
  { id: 'weekly', label: 'هفتگی' },
  { id: 'monthly', label: 'ماهانه' },
  { id: 'yearly', label: 'سالانه' },
];

const TYPES = [
  { id: 'expense', label: 'هزینه', color: 'text-destructive' },
  { id: 'income', label: 'درآمد', color: 'text-success' },
  { id: 'saving', label: 'پس‌انداز', color: 'text-primary' },
] as const;

const todayISO = () => new Date().toISOString().slice(0, 10);

export function RecurringRules() {
  const { rules, loading, addRule, updateRule, deleteRule, runNow } = useRecurringRules();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'saving'>('expense');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState<string>('none');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [intervalCount, setIntervalCount] = useState('1');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState('');

  const typeCategories = useMemo(
    () => categories.filter((c) => (c.type || 'expense') === type),
    [categories, type],
  );

  const resetForm = () => {
    setName('');
    setAmount('');
    setType('expense');
    setCategory('');
    setAccountId('none');
    setFrequency('monthly');
    setIntervalCount('1');
    setStartDate(todayISO());
    setEndDate('');
  };

  const handleSubmit = async () => {
    const value = parseAmount(amount);
    if (!name.trim()) return toast.error('نام قانون را وارد کنید');
    if (!value || value <= 0) return toast.error('مبلغ معتبر وارد کنید');
    if (!category) return toast.error('دسته‌بندی را انتخاب کنید');

    setSaving(true);
    try {
      await addRule({
        name: name.trim(),
        amount: value,
        type,
        category,
        accountId: accountId === 'none' ? undefined : accountId,
        frequency,
        intervalCount: Math.max(1, parseAmount(intervalCount) || 1),
        startDate,
        endDate: endDate || undefined,
        isActive: true,
      });
      setOpen(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const result = await runNow();
      toast.success(
        result?.created ? `${result.created} تراکنش ثبت شد` : 'در حال حاضر تراکنش سررسیدشده‌ای نیست',
      );
    } catch {
      toast.error('اجرای قوانین ناموفق بود');
    } finally {
      setRunning(false);
    }
  };

  const activeCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="space-y-4">
      <Card className="glass border-0">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">تراکنش‌های تکرارشونده</p>
              <p className="text-xs text-muted-foreground">{activeCount} قانون فعال</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunNow}
            disabled={running}
            className="gap-1.5"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            اجرا
          </Button>
        </CardContent>
      </Card>

      <Button className="w-full h-12 gap-2" onClick={() => setOpen(true)}>
        <Plus className="w-5 h-5" />
        قانون جدید
      </Button>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : rules.length === 0 ? (
        <Card className="glass border-0">
          <CardContent className="p-8 text-center space-y-2">
            <CalendarClock className="w-10 h-10 mx-auto text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              هنوز قانون تکرارشونده‌ای نساخته‌اید. قبض‌ها، اجاره و حقوق را یک‌بار تعریف کنید تا خودکار ثبت شوند.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const typeMeta = TYPES.find((t) => t.id === rule.type);
            const freqMeta = FREQUENCIES.find((f) => f.id === rule.frequency);
            return (
              <Card key={rule.id} className={cn('glass border-0', !rule.isActive && 'opacity-60')}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-right min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{rule.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {rule.category}
                        {rule.subcategory ? ` • ${rule.subcategory}` : ''}
                      </p>
                    </div>
                    <p className={cn('text-sm font-black tabular-nums', typeMeta?.color)}>
                      {formatCurrency(rule.amount)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[11px]">
                      {rule.intervalCount > 1 ? `هر ${rule.intervalCount} ` : ''}
                      {freqMeta?.label}
                    </Badge>
                    <Badge variant="outline" className="text-[11px]">
                      اجرای بعدی: {formatPersianDateShort(rule.nextRunDate)}
                    </Badge>
                    {rule.endDate && (
                      <Badge variant="outline" className="text-[11px]">
                        پایان: {formatPersianDateShort(rule.endDate)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) =>
                          updateRule({ id: rule.id, isActive: checked })
                        }
                        aria-label="فعال یا غیرفعال"
                      />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {rule.isActive ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        {rule.isActive ? 'فعال' : 'متوقف'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-9 w-9"
                      onClick={() => deleteRule(rule.id)}
                      aria-label="حذف قانون"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw] rounded-3xl max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">قانون تکرارشونده جدید</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id);
                    setCategory('');
                  }}
                  className={cn(
                    'h-11 rounded-xl text-sm font-semibold border transition-colors',
                    type === t.id
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : 'bg-muted/40 border-border text-muted-foreground',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">نام قانون</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً اجاره خانه"
                enterKeyHint="done"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">مبلغ</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
                placeholder="0"
                enterKeyHint="done"
                className="tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">دسته‌بندی</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
                <SelectContent>
                  {typeCategories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {accounts.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">حساب (اختیاری)</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون حساب</SelectItem>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">تکرار</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">هر چند دوره</Label>
                <Input
                  value={intervalCount}
                  onChange={(e) => setIntervalCount(e.target.value)}
                  inputMode="numeric"
                  className="tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">شروع</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">پایان (اختیاری)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">انصراف</Button>
            <Button onClick={handleSubmit} disabled={saving} className="flex-1 gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RecurringRules;
