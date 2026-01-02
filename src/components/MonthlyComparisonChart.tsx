import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/expense';
import { formatCurrency, getJalaliMonthName } from '@/utils/persianDate';
import { format } from 'date-fns-jalali';

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
            {item.name === 'expense' ? 'هزینه' : 'درآمد'}: {formatCurrency(item.value)}
          </p>
        ))}
        {payload.length === 2 && (
          <p className="text-xs mt-1 pt-1 border-t border-border text-muted-foreground">
            تفاوت: {formatCurrency(Math.abs(payload[1].value - payload[0].value))}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function MonthlyComparisonChart({ transactions }: MonthlyComparisonChartProps) {
  const data = useMemo(() => {
    // Group transactions by Persian month
    const monthlyData: Record<string, { income: number; expense: number; firstDate: string }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      // Get Persian month key using date-fns-jalali
      const persianMonthKey = format(date, 'yyyy-MM');
      
      if (!monthlyData[persianMonthKey]) {
        monthlyData[persianMonthKey] = { income: 0, expense: 0, firstDate: t.date };
      }
      
      if (t.type === 'income') {
        monthlyData[persianMonthKey].income += t.amount;
      } else {
        monthlyData[persianMonthKey].expense += t.amount;
      }
    });

    // Get last 6 months and sort
    const sortedKeys = Object.keys(monthlyData).sort().slice(-6);
    
    return sortedKeys.map(key => {
      const data = monthlyData[key];
      // Use the actual date to get correct Jalali month name
      return {
        name: getJalaliMonthName(data.firstDate),
        expense: data.expense,
        income: data.income,
        difference: data.income - data.expense,
      };
    });
  }, [transactions]);

  if (data.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">مقایسه ماهانه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">داده کافی برای نمایش نمودار نیست</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>مقایسه ماهانه درآمد و هزینه</span>
          <span className="text-xs font-normal text-muted-foreground">۶ ماه اخیر</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              barCategoryGap="20%"
            >
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                hide 
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
              <Legend 
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">
                    {value === 'expense' ? 'هزینه' : 'درآمد'}
                  </span>
                )}
                iconType="circle"
                iconSize={8}
              />
              <Bar 
                dataKey="expense" 
                fill="hsl(var(--destructive))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="income" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">مجموع هزینه</p>
            <p className="text-sm font-semibold text-destructive">
              {formatCurrency(data.reduce((sum, d) => sum + d.expense, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">مجموع درآمد</p>
            <p className="text-sm font-semibold text-success">
              {formatCurrency(data.reduce((sum, d) => sum + d.income, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">میانگین ماهانه</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(Math.round(data.reduce((sum, d) => sum + d.expense, 0) / data.length))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
