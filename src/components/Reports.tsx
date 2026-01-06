import { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Download, FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import { SpendingChart } from './SpendingChart';
import { TrendChart } from './TrendChart';
import { CategoryBudget } from './CategoryBudget';
import { MonthlyComparisonChart } from './MonthlyComparisonChart';
import { SubcategoryChart } from './SubcategoryChart';
import { ReportingFilters } from './ReportingFilters';
import { ReportStatistics } from './ReportStatistics';
import { AIReport } from './AIReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Category, Transaction } from '@/types/expense';
import { exportCategoryReport, exportToPDF, exportToExcel, exportToCSV } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getPersianWeekdays, formatCurrency } from '@/utils/persianDate';

interface ReportsProps {
  categories: Category[];
  transactions: Transaction[];
}

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
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const budgetCategories = categories.filter(c => c.budget);

  // Memoized filter callback to prevent unnecessary re-renders
  const handleFilterChange = useCallback((filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  }, []);

  // Calculate weekly data from filtered transactions
  const weeklyData = useMemo(() => {
    const persianWeekdays = getPersianWeekdays();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    const dailyExpenses: Record<number, number> = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date);
        const dayOfWeek = date.getDay();
        const adjustedDay = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
        dailyExpenses[adjustedDay] = (dailyExpenses[adjustedDay] || 0) + t.amount;
      });
    
    return persianWeekdays.map((name, index) => ({
      name,
      expense: dailyExpenses[index] || 0,
    }));
  }, [filteredTransactions]);

  const maxExpense = Math.max(...weeklyData.map(d => d.expense), 1);

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

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredTransactions, 'full-report');
      toast.success('گزارش PDF دانلود شد');
    } catch {
      toast.error('خطا در ایجاد گزارش');
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(filteredTransactions, 'transactions');
      toast.success('فایل Excel دانلود شد');
    } catch {
      toast.error('خطا در ایجاد فایل');
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredTransactions, 'transactions');
      toast.success('فایل CSV دانلود شد');
    } catch {
      toast.error('خطا در ایجاد فایل');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* AI Report - New Feature */}
      <AIReport 
        transactions={filteredTransactions} 
        categories={categories} 
      />

      {/* Filters */}
      <ReportingFilters
        transactions={transactions}
        categories={categories}
        onFilterChange={handleFilterChange}
      />

      {/* Statistics Cards */}
      <ReportStatistics 
        transactions={filteredTransactions} 
        categories={categories} 
      />

      {/* Period Toggle & Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 p-1 bg-muted rounded-xl flex-1">
          {[
            { id: 'week', label: 'هفتگی' },
            { id: 'month', label: 'ماهانه' },
            { id: 'year', label: 'سالانه' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as any)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200",
                period === item.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span>خروجی</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>گزارش کامل (PDF)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" />
              <span>اکسل (XLSX)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
              <FileDown className="w-4 h-4" />
              <span>CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCategoryReport} className="gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>گزارش بودجه (PDF)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

      {/* Monthly Comparison Chart */}
      <MonthlyComparisonChart transactions={filteredTransactions} />

      {/* Subcategory Analysis */}
      <SubcategoryChart transactions={filteredTransactions} />

      {/* Charts - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SpendingChart categories={categories} />
        <TrendChart transactions={filteredTransactions} />
      </div>

      {/* All Budgets */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">بودجه دسته‌بندی‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {budgetCategories.length > 0 ? (
            budgetCategories.map((category) => (
              <CategoryBudget key={category.id} category={category} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4 text-sm">
              بودجه‌ای تعریف نشده است
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
