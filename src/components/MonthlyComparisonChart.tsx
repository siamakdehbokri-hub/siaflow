import { useMemo, forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/expense';
import { formatCurrency, toPersianNum } from '@/utils/persianDate';
import { getLastNMonthBounds, filterTransactionsByDateRange } from '@/utils/financialEngine';
import { cn } from '@/lib/utils';

interface MonthlyComparisonChartProps {
  transactions: Transaction[];
}

const CustomTooltip = forwardRef<HTMLDivElement, any>(({ active, payload, label }, ref) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.name === 'income')?.value || 0;
    const expense = payload.find((p: any) => p.name === 'expense')?.value || 0;
    const saving = payload.find((p: any) => p.name === 'saving')?.value || 0;
    const net = income - expense - saving;

    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-2 text-sm">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: item.color }}>
            {item.name === 'expense' ? 'هزینه' : item.name === 'income' ? 'درآمد' : 'پس‌انداز'}: {formatCurrency(item.value)}
          </p>
        ))}
        <p className="text-xs mt-1 pt-1 border-t border-border text-muted-foreground">
          مانده خالص: {formatCurrency(net)}
        </p>
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = 'CustomTooltip';

export function MonthlyComparisonChart({ transactions }: MonthlyComparisonChartProps) {
  const { data, hasSavings, monthSummaries } = useMemo(() => {
    // Use financial engine for strict month isolation
    const monthBounds = getLastNMonthBounds(6);
    
    const chartData = monthBounds.map(({ start, end, label }) => {
      const monthTx = filterTransactionsByDateRange(transactions, start, end);
      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const saving = monthTx.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
      
      return { name: label, income, expense, saving, net: income - expense - saving, txCount: monthTx.length };
    }).filter(d => d.txCount > 0); // Only show months with data

    return {
      data: chartData,
      hasSavings: chartData.some(d => d.saving > 0),
      monthSummaries: chartData,
    };
  }, [transactions]);

  if (data.length === 0) {
    return null;
  }

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const avgMonthlyExpense = data.length > 0 ? Math.round(totalExpense / data.length) : 0;

  // INTEGRITY: verify sum
  const categoryIntegrity = totalIncome === data.reduce((s, d) => s + d.income, 0);

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-base">مقایسه ماه‌به‌ماه</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
              barCategoryGap="20%"
            >
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
              <Legend 
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">
                    {value === 'expense' ? 'هزینه' : value === 'income' ? 'درآمد' : 'پس‌انداز'}
                  </span>
                )}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={30} />
              {hasSavings && (
                <Bar dataKey="saving" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={30} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary with per-month net balance */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">مجموع درآمد</p>
            <p className="text-sm font-bold text-success tabular-nums">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">مجموع هزینه</p>
            <p className="text-sm font-bold text-destructive tabular-nums">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">میانگین ماهانه</p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {formatCurrency(avgMonthlyExpense)}
            </p>
          </div>
        </div>

        {/* Per-month net balance row */}
        {data.length > 1 && (
          <div className="flex gap-1.5 mt-3 pt-3 border-t border-border overflow-x-auto scrollbar-hide">
            {data.map((d, i) => (
              <div key={i} className={cn(
                "flex-1 min-w-[70px] text-center p-2 rounded-lg text-xs",
                d.net >= 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                <p className="text-[10px] text-muted-foreground truncate">{d.name}</p>
                <p className={cn("font-bold", d.net >= 0 ? "text-success" : "text-destructive")}>
                  {d.net >= 0 ? '+' : ''}{formatCurrency(d.net)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
