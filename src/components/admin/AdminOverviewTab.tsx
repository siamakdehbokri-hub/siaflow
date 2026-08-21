import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Loader2, TrendingUp, Users, PieChart as PieIcon, Crown, Activity } from 'lucide-react';
import { AdminUser, AdminTransaction, SystemStats, FinancialSummary } from '@/hooks/useAdmin';
import { formatCurrency, formatPersianDateShort } from '@/utils/persianDate';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  users: AdminUser[];
  transactions: AdminTransaction[];
  stats: SystemStats | null;
  financialSummary: FinancialSummary | null;
  isLoading: boolean;
}

const DAYS = 14;

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AdminOverviewTab({ users, transactions, stats, financialSummary, isLoading }: Props) {
  const daily = useMemo(() => {
    const buckets: { key: string; label: string; income: number; expense: number; count: number }[] = [];
    const index = new Map<string, number>();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      index.set(key, buckets.length);
      buckets.push({ key, label: formatPersianDateShort(key), income: 0, expense: 0, count: 0 });
    }
    transactions.forEach((t) => {
      const i = index.get(t.date);
      if (i === undefined) return;
      buckets[i].count += 1;
      if (t.type === 'income') buckets[i].income += t.amount;
      else if (t.type === 'expense') buckets[i].expense += t.amount;
    });
    return buckets;
  }, [transactions]);

  const growth = useMemo(() => {
    const buckets: { label: string; total: number }[] = [];
    const sorted = [...users]
      .filter((u) => u.createdAt)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(23, 59, 59, 999);
      d.setDate(d.getDate() - i);
      const total = sorted.filter((u) => new Date(u.createdAt).getTime() <= d.getTime()).length;
      buckets.push({ label: formatPersianDateShort(dayKey(d)), total });
    }
    return buckets;
  }, [users]);

  const typeBreakdown = useMemo(() => {
    const acc = { income: 0, expense: 0, saving: 0 };
    transactions.forEach((t) => {
      if (t.type in acc) acc[t.type] += t.amount;
    });
    return [
      { name: 'درآمد', value: acc.income, color: 'hsl(var(--success))' },
      { name: 'هزینه', value: acc.expense, color: 'hsl(var(--destructive))' },
      { name: 'پس‌انداز', value: acc.saving, color: 'hsl(var(--primary))' },
    ].filter((s) => s.value > 0);
  }, [transactions]);

  const topUsers = useMemo(
    () => [...users].sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 5),
    [users]
  );

  const newUsers7d = useMemo(() => {
    const t = Date.now() - 7 * 86400000;
    return users.filter((u) => u.createdAt && new Date(u.createdAt).getTime() >= t).length;
  }, [users]);

  const tx7d = useMemo(() => daily.slice(-7).reduce((s, d) => s + d.count, 0), [daily]);
  const avgTxPerUser = users.length ? Math.round((stats?.totalTransactions ?? 0) / users.length) : 0;

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        <Kpi label="کاربر جدید (۷ روز)" value={newUsers7d} tone="primary" />
        <Kpi label="تراکنش (۷ روز)" value={tx7d} tone="success" />
        <Kpi label="میانگین تراکنش/کاربر" value={avgTxPerUser} tone="muted" />
      </div>

      {/* Income vs Expense */}
      <ChartCard icon={TrendingUp} title="درآمد و هزینه (۱۴ روز اخیر)">
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={daily} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="adm-inc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.45} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="adm-exp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.45} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={2} />
            <YAxis hide />
            <Tooltip content={<CurrencyTooltip />} />
            <Area type="monotone" dataKey="income" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#adm-inc)" name="درآمد" />
            <Area type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#adm-exp)" name="هزینه" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* User growth */}
      <ChartCard icon={Users} title="رشد کاربران">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={growth} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={2} />
            <YAxis hide />
            <Tooltip content={<CountTooltip suffix="کاربر" />} />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="کاربران" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Breakdown + financial */}
      {typeBreakdown.length > 0 && (
        <ChartCard icon={PieIcon} title="ترکیب مالی سیستم">
          <div className="flex items-center gap-2">
            <ResponsiveContainer width="55%" height={150}>
              <PieChart>
                <Pie data={typeBreakdown} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={3} stroke="none">
                  {typeBreakdown.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip content={<CurrencyTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {typeBreakdown.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-foreground" dir="ltr">
                    {formatCurrency(s.value)}
                  </span>
                </div>
              ))}
              <div className="pt-1.5 mt-1.5 border-t border-border/40 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">خالص</span>
                <span className="text-[11px] font-mono font-bold text-primary" dir="ltr">
                  {formatCurrency(financialSummary?.netBalance ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      {/* Top users */}
      <ChartCard icon={Crown} title="فعال‌ترین کاربران">
        <div className="space-y-2">
          {topUsers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">داده‌ای موجود نیست</p>
          )}
          {topUsers.map((u, i) => (
            <div key={u.id} className="flex items-center gap-2.5">
              <span className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0',
                i === 0 ? 'bg-primary/15 text-primary' : 'bg-muted/40 text-muted-foreground'
              )}>
                {i + 1}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarImage src={u.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                  {u.displayName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{u.displayName || 'بدون نام'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                {u.transactionCount}
              </Badge>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* System snapshot */}
      <ChartCard icon={Activity} title="وضعیت سیستم">
        <div className="grid grid-cols-2 gap-2">
          <SnapshotRow label="بدهی باقی‌مانده" value={formatCurrency(financialSummary?.totalDebtRemaining ?? 0)} />
          <SnapshotRow label="بدهی پرداخت‌شده" value={formatCurrency(financialSummary?.totalDebtPaid ?? 0)} />
          <SnapshotRow label="هدف پس‌انداز" value={formatCurrency(financialSummary?.totalGoalTarget ?? 0)} />
          <SnapshotRow label="پس‌انداز جمع‌شده" value={formatCurrency(financialSummary?.totalGoalCurrent ?? 0)} />
        </div>
      </ChartCard>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/20 p-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-mono font-bold text-foreground truncate" dir="ltr">{value}</p>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: 'primary' | 'success' | 'muted' }) {
  const toneClass = tone === 'primary' ? 'text-primary' : tone === 'success' ? 'text-success' : 'text-foreground';
  return (
    <div className="glass rounded-xl p-2.5 text-center">
      <p className={cn('text-lg font-bold font-mono', toneClass)}>{value}</p>
      <p className="text-[9px] text-muted-foreground font-medium leading-tight">{label}</p>
    </div>
  );
}

function ChartCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

interface TooltipPayload { name?: string; value?: number; color?: string }

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-heavy rounded-xl px-3 py-2 border border-border/40" dir="rtl">
      {label && <p className="text-[10px] text-muted-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-[11px] font-mono font-semibold" style={{ color: p.color }} dir="ltr">
          {formatCurrency(p.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function CountTooltip({ active, payload, label, suffix }: { active?: boolean; payload?: TooltipPayload[]; label?: string; suffix: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-heavy rounded-xl px-3 py-2 border border-border/40" dir="rtl">
      {label && <p className="text-[10px] text-muted-foreground mb-1">{label}</p>}
      <p className="text-[11px] font-semibold text-foreground">
        {payload[0].value} {suffix}
      </p>
    </div>
  );
}
