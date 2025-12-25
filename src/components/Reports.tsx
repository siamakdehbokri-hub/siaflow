import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { SpendingChart } from './SpendingChart';
import { TrendChart } from './TrendChart';
import { CategoryBudget } from './CategoryBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/expense';
import { cn } from '@/lib/utils';

interface ReportsProps {
  categories: Category[];
}

const weeklyData = [
  { name: 'ش', expense: 1200000 },
  { name: 'ی', expense: 800000 },
  { name: 'د', expense: 1500000 },
  { name: 'س', expense: 600000 },
  { name: 'چ', expense: 2100000 },
  { name: 'پ', expense: 1800000 },
  { name: 'ج', expense: 900000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
        <p className="text-sm text-foreground">
          {new Intl.NumberFormat('fa-IR').format(payload[0].value)} تومان
        </p>
      </div>
    );
  }
  return null;
};

export function Reports({ categories }: ReportsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const budgetCategories = categories.filter(c => c.budget);

  const maxExpense = Math.max(...weeklyData.map(d => d.expense));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Period Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl">
        {[
          { id: 'week', label: 'هفتگی' },
          { id: 'month', label: 'ماهانه' },
          { id: 'year', label: 'سالانه' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id as any)}
            className={cn(
              "flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-200",
              period === item.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Weekly Bar Chart */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">هزینه‌های هفتگی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="expense" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.expense === maxExpense 
                        ? 'hsl(var(--primary))' 
                        : 'hsl(var(--muted))'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <SpendingChart />
      <TrendChart />

      {/* All Budgets */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">بودجه دسته‌بندی‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {budgetCategories.map((category) => (
            <CategoryBudget key={category.id} category={category} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
