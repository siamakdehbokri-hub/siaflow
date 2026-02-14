import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/types/expense';
import { formatCurrency, getJalaliMonthName, getJalaliMonthKey } from '@/utils/persianDate';

interface TrendChartProps {
  transactions?: Transaction[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-2 text-sm">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: item.color }}>
            {item.name === 'income' ? 'درآمد' : item.name === 'expense' ? 'هزینه' : 'پس‌انداز'}: {formatCurrency(item.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart({ transactions = [] }: TrendChartProps) {
  const data = useMemo(() => {
    // Group transactions by Jalali month
    const monthlyData: Record<string, { income: number; expense: number; saving: number; firstDate: string }> = {};
    
    transactions.forEach(t => {
      const monthKey = getJalaliMonthKey(t.date);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, saving: 0, firstDate: t.date };
      }
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else if (t.type === 'saving') {
        monthlyData[monthKey].saving += t.amount;
      } else {
        monthlyData[monthKey].expense += t.amount;
      }
    });

    // Get last 6 months
    const months = Object.keys(monthlyData).sort().slice(-6);
    
    return months.map(month => {
      const dateStr = monthlyData[month].firstDate || `${month}-01`;
      return {
        name: getJalaliMonthName(dateStr),
        income: monthlyData[month].income,
        expense: monthlyData[month].expense,
        saving: monthlyData[month].saving,
      };
    });
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">داده کافی برای نمایش نمودار نیست</p>
      </div>
    );
  }

  const hasSavings = data.some(d => d.saving > 0);

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="savingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
              interval={0}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              fill="url(#expenseGradient)"
            />
            {hasSavings && (
              <Area
                type="monotone"
                dataKey="saving"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#savingGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/10">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-success">درآمد</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-destructive/10">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-xs text-destructive">هزینه</span>
        </div>
        {hasSavings && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-primary">پس‌انداز</span>
          </div>
        )}
      </div>
    </div>
  );
}
