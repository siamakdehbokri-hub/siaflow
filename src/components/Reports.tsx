import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { SpendingChart } from './SpendingChart';
import { TrendChart } from './TrendChart';
import { CategoryBudget } from './CategoryBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category, Transaction } from '@/types/expense';
import { exportCategoryReport, exportToPDF } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getPersianWeekdays, formatCurrency } from '@/utils/persianDate';

interface ReportsProps {
  categories: Category[];
  transactions: Transaction[];
}

const persianWeekdays = getPersianWeekdays();
const weeklyData = [
  { name: persianWeekdays[0], expense: 1200000 },
  { name: persianWeekdays[1], expense: 800000 },
  { name: persianWeekdays[2], expense: 1500000 },
  { name: persianWeekdays[3], expense: 600000 },
  { name: persianWeekdays[4], expense: 2100000 },
  { name: persianWeekdays[5], expense: 1800000 },
  { name: persianWeekdays[6], expense: 900000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
        <p className="text-sm text-foreground">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function Reports({ categories, transactions }: ReportsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const budgetCategories = categories.filter(c => c.budget);

  const maxExpense = Math.max(...weeklyData.map(d => d.expense));

  const handleExportCategoryReport = () => {
    try {
      const data = budgetCategories.map(c => ({
        name: c.name,
        spent: c.spent || 0,
        budget: c.budget || 0,
      }));
      exportCategoryReport(data);
      toast.success('گزارش بودجه دانلود شد');
    } catch {
      toast.error('خطا در ایجاد گزارش');
    }
  };

  const handleExportFullReport = () => {
    try {
      exportToPDF(transactions, 'full-report');
      toast.success('گزارش کامل دانلود شد');
    } catch {
      toast.error('خطا در ایجاد گزارش');
    }
  };

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

      {/* Export Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportFullReport}
          className="flex-1"
        >
          <Download className="w-4 h-4 ml-2" />
          گزارش کامل
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportCategoryReport}
          className="flex-1"
        >
          <Download className="w-4 h-4 ml-2" />
          گزارش بودجه
        </Button>
      </div>

      {/* Weekly Bar Chart */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">هزینه‌های هفتگی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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

      {/* Charts - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SpendingChart />
        <TrendChart />
      </div>

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
