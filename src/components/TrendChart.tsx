import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/expense';
import { formatCurrency, getPersianMonthName } from '@/utils/persianDate';

interface TrendChartProps {
  transactions?: Transaction[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-2 sm:p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1 sm:mb-2 text-sm">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs sm:text-sm" style={{ color: item.color }}>
            {item.name === 'income' ? 'درآمد' : 'هزینه'}: {formatCurrency(item.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 
  'مرداد', 'شهریور', 'مهر', 'آبان', 
  'آذر', 'دی', 'بهمن', 'اسفند'
];

export function TrendChart({ transactions = [] }: TrendChartProps) {
  const data = useMemo(() => {
    // Group transactions by month
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(t => {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });

    // Get last 6 months
    const months = Object.keys(monthlyData).sort().slice(-6);
    
    return months.map(month => {
      const monthIndex = parseInt(month.split('-')[1]) - 1;
      return {
        name: persianMonths[monthIndex] || month,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense,
      };
    });
  }, [transactions]);

  if (data.length === 0) {
    return (
      <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="px-4 sm:px-5">
          <CardTitle className="text-base">روند درآمد و هزینه</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-5">
          <div className="h-40 sm:h-48 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">داده کافی برای نمایش نمودار نیست</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);

  return (
    <Card variant="glass" className="animate-slide-up overflow-hidden" style={{ animationDelay: '0.1s' }}>
      <CardHeader className="px-4 sm:px-5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">روند مالی</CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-success">+{formatCurrency(totalIncome)}</span>
            <span className="text-destructive">-{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5">
        <div className="h-40 sm:h-48">
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
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Legend chips */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/10">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-success">درآمد</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-destructive/10">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-xs text-destructive">هزینه</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
