import { useMemo, useState } from 'react';
import { 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  Calendar, Filter, AlertTriangle, Award, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction, Category } from '@/types/expense';
import { 
  formatCurrency, 
  toPersianNum, 
  getCurrentJalaliMonthBounds, 
  getPreviousJalaliMonthBounds,
  getJalaliMonthName 
} from '@/utils/persianDate';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid
} from 'recharts';

interface MonthlyAnalysisProps {
  transactions: Transaction[];
  categories: Category[];
}

export function MonthlyAnalysis({ transactions, categories }: MonthlyAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { currentMonth, lastMonth, comparison, dangerousCategories, topExpenseCategory, topSavingCategory } = useMemo(() => {
    // Use Jalali month bounds for filtering
    const { start: currentStart, end: currentEnd } = getCurrentJalaliMonthBounds();
    const { start: lastStart, end: lastEnd } = getPreviousJalaliMonthBounds();

    // Filter by category if selected
    const filterByCategory = (tx: Transaction[]) => {
      if (selectedCategory === 'all') return tx;
      return tx.filter(t => t.category === selectedCategory);
    };

    // Current month data using Jalali calendar
    const currentMonthTx = filterByCategory(
      transactions.filter(t => t.date >= currentStart && t.date <= currentEnd)
    );
    const currentIncome = currentMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const currentExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Last month data using Jalali calendar
    const lastMonthTx = filterByCategory(
      transactions.filter(t => t.date >= lastStart && t.date <= lastEnd)
    );
    const lastIncome = lastMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const lastExpense = lastMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Calculate changes
    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense) * 100 : 0;
    const savingCurrent = currentIncome - currentExpense;
    const savingLast = lastIncome - lastExpense;
    const savingChange = savingLast !== 0 ? ((savingCurrent - savingLast) / Math.abs(savingLast)) * 100 : 0;

    // Dangerous categories (over budget)
    const dangerousCategories = categories
      .filter(c => c.budget && c.spent && (c.spent / c.budget) > 0.9)
      .sort((a, b) => ((b.spent || 0) / (b.budget || 1)) - ((a.spent || 0) / (a.budget || 1)));

    // Top expense category
    const categoryExpenses: Record<string, number> = {};
    currentMonthTx.filter(t => t.type === 'expense').forEach(t => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });
    const topExpenseCategory = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])[0];

    // Top saving (category with most remaining budget)
    const topSavingCategory = categories
      .filter(c => c.budget && c.spent !== undefined)
      .map(c => ({
        name: c.name,
        remaining: (c.budget || 0) - (c.spent || 0),
        percentage: ((c.budget || 0) - (c.spent || 0)) / (c.budget || 1) * 100
      }))
      .sort((a, b) => b.remaining - a.remaining)[0];

    return {
      currentMonth: { income: currentIncome, expense: currentExpense, saving: savingCurrent },
      lastMonth: { income: lastIncome, expense: lastExpense, saving: savingLast },
      comparison: { incomeChange, expenseChange, savingChange },
      dangerousCategories,
      topExpenseCategory: topExpenseCategory ? { name: topExpenseCategory[0], amount: topExpenseCategory[1] } : null,
      topSavingCategory,
    };
  }, [transactions, categories, selectedCategory]);

  // Chart data
  const chartData = useMemo(() => {
    return [
      {
        name: 'ماه قبل',
        income: lastMonth.income,
        expense: lastMonth.expense,
      },
      {
        name: 'ماه جاری',
        income: currentMonth.income,
        expense: currentMonth.expense,
      },
    ];
  }, [currentMonth, lastMonth]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="glass-card rounded-xl p-3 shadow-lg border border-border/50">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {entry.name === 'income' ? 'درآمد' : 'هزینه'}:
            </span>
            <span className="font-medium text-foreground">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const expenseCategories = categories.filter(c => c.budget || c.type === 'expense');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary shadow-glow-sm">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">تحلیل ماهانه</h2>
            <p className="text-xs text-muted-foreground">مقایسه با ماه قبل</p>
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-36 h-9 rounded-xl text-sm">
            <Filter className="w-4 h-4 ml-2 text-muted-foreground" />
            <SelectValue placeholder="فیلتر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌ها</SelectItem>
            {expenseCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comparison Chart */}
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">نمودار مقایسه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="income" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="expense" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">درآمد</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">هزینه</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Income Change */}
        <Card variant="glass" className="text-center">
          <CardContent className="p-4">
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2",
              comparison.incomeChange >= 0 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {comparison.incomeChange >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {toPersianNum(Math.abs(Math.round(comparison.incomeChange)))}%
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(currentMonth.income)}
            </p>
            <p className="text-xs text-muted-foreground">درآمد</p>
          </CardContent>
        </Card>

        {/* Expense Change */}
        <Card variant="glass" className="text-center">
          <CardContent className="p-4">
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2",
              comparison.expenseChange <= 0 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {comparison.expenseChange <= 0 ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3 h-3" />
              )}
              {toPersianNum(Math.abs(Math.round(comparison.expenseChange)))}%
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(currentMonth.expense)}
            </p>
            <p className="text-xs text-muted-foreground">هزینه</p>
          </CardContent>
        </Card>

        {/* Saving Change */}
        <Card variant="glass" className="text-center">
          <CardContent className="p-4">
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2",
              comparison.savingChange >= 0 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {comparison.savingChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {toPersianNum(Math.abs(Math.round(comparison.savingChange)))}%
            </div>
            <p className={cn(
              "text-lg font-bold",
              currentMonth.saving >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatCurrency(Math.abs(currentMonth.saving))}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentMonth.saving >= 0 ? 'پس‌انداز' : 'کسری'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Summary */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Top Expense Category */}
        {topExpenseCategory && (
          <Card variant="glass" className="border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-destructive/10">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">بیشترین هزینه</p>
                  <p className="font-bold text-foreground truncate">{topExpenseCategory.name}</p>
                  <p className="text-sm text-destructive font-medium">
                    {formatCurrency(topExpenseCategory.amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Saving Category */}
        {topSavingCategory && (
          <Card variant="glass" className="border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-success/10">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">بهترین صرفه‌جویی</p>
                  <p className="font-bold text-foreground truncate">{topSavingCategory.name}</p>
                  <p className="text-sm text-success font-medium">
                    {formatCurrency(topSavingCategory.remaining)} باقیمانده
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dangerous Categories */}
      {dangerousCategories.length > 0 && (
        <Card variant="glass" className="border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              دسته‌های پرخطر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dangerousCategories.slice(0, 3).map((cat) => {
              const percentage = ((cat.spent || 0) / (cat.budget || 1)) * 100;
              const isOver = percentage > 100;
              
              return (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <p className="font-medium text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(cat.spent || 0)} از {formatCurrency(cat.budget || 0)}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={isOver ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {toPersianNum(Math.round(percentage))}%
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}