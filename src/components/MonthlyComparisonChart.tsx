import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '@/types/expense';
import { formatCurrency, getJalaliMonthName, getJalaliMonthKey } from '@/utils/persianDate';

interface MonthlyComparisonChartProps {
  transactions: Transaction[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-2 text-sm">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: item.color }}>
            {item.name === 'expense' ? 'هزینه' : item.name === 'income' ? 'درآمد' : 'پس‌انداز'}: {formatCurrency(item.value)}
          </p>
        ))}
        {payload.length >= 2 && (
          <p className="text-xs mt-1 pt-1 border-t border-border text-muted-foreground">
            مانده: {formatCurrency(
              (payload.find((p: any) => p.name === 'income')?.value || 0) - 
              (payload.find((p: any) => p.name === 'expense')?.value || 0) -
              (payload.find((p: any) => p.name === 'saving')?.value || 0)
            )}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function MonthlyComparisonChart({ transactions }: MonthlyComparisonChartProps) {
  const { data, hasSavings } = useMemo(() => {
    // Group transactions by Jalali month key
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

    // Get last 6 months and sort
    const sortedKeys = Object.keys(monthlyData).sort().slice(-6);
    
    const chartData = sortedKeys.map(key => {
      const d = monthlyData[key];
      return {
        name: getJalaliMonthName(d.firstDate),
        expense: d.expense,
        income: d.income,
        saving: d.saving,
      };
    });

    return {
      data: chartData,
      hasSavings: chartData.some(d => d.saving > 0),
    };
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">داده کافی برای نمایش نمودار نیست</p>
      </div>
    );
  }

  return (
    <div>
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
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">مجموع درآمد</p>
          <p className="text-sm font-bold text-success tabular-nums">
            {formatCurrency(data.reduce((sum, d) => sum + d.income, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">مجموع هزینه</p>
          <p className="text-sm font-bold text-destructive tabular-nums">
            {formatCurrency(data.reduce((sum, d) => sum + d.expense, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">میانگین ماهانه</p>
          <p className="text-sm font-bold text-foreground tabular-nums">
            {formatCurrency(Math.round(data.reduce((sum, d) => sum + d.expense, 0) / data.length))}
          </p>
        </div>
      </div>
    </div>
  );
}
