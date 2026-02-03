import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, Category, defaultExpenseCategories } from '@/types/expense';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  categories: Category[];
}

const COLORS = [
  'hsl(38, 92%, 50%)',
  'hsl(25, 95%, 53%)',
  'hsl(199, 89%, 48%)',
  'hsl(0, 72%, 51%)',
  'hsl(330, 80%, 60%)',
  'hsl(262, 83%, 58%)',
  'hsl(168, 76%, 42%)',
  'hsl(142, 71%, 45%)',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border-2 border-border rounded-xl p-3 shadow-lg">
        <p className="text-sm font-bold text-foreground mb-1">{data.name}</p>
        <p className="text-sm text-muted-foreground tabular-nums">{formatCurrency(data.value)}</p>
        <p className="text-xs text-primary font-medium">{data.percentage.toFixed(1)}٪</p>
      </div>
    );
  }
  return null;
};

export function CategoryBreakdown({ transactions, categories }: CategoryBreakdownProps) {
  // Calculate expense breakdown by category
  const { chartData, totalExpense, categoryList } = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const categoryTotals: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    // Convert to array and sort
    const sortedCategories = Object.entries(categoryTotals)
      .map(([name, value], index) => {
        const cat = categories.find(c => c.name === name);
        const defaultCat = defaultExpenseCategories.find(c => c.name === name);
        const color = cat?.color || defaultCat?.color || COLORS[index % COLORS.length];
        
        return {
          name,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
          color,
        };
      })
      .sort((a, b) => b.value - a.value);
    
    return {
      chartData: sortedCategories.slice(0, 8),
      totalExpense: total,
      categoryList: sortedCategories,
    };
  }, [transactions, categories]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">هزینه‌ای در این ماه ثبت نشده</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart + Total */}
      <div className="flex items-center gap-4">
        <div className="w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`catGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#catGradient-${index})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground">کل هزینه‌ها</p>
          <p className="text-2xl font-bold text-destructive tabular-nums">
            {formatCurrency(totalExpense)}
          </p>
          <p className="text-xs text-muted-foreground">
            {categoryList.length} دسته‌بندی
          </p>
        </div>
      </div>
      
      {/* Category List */}
      <div className="space-y-2">
        {categoryList.slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div 
              className="w-3 h-10 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatCurrency(item.value)}
              </p>
            </div>
            <div className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-bold",
              item.percentage > 30 ? "bg-destructive/10 text-destructive" :
              item.percentage > 15 ? "bg-warning/10 text-warning" :
              "bg-muted text-muted-foreground"
            )}>
              {item.percentage.toFixed(0)}٪
            </div>
          </div>
        ))}
        
        {categoryList.length > 6 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            و {categoryList.length - 6} دسته‌بندی دیگر
          </p>
        )}
      </div>
    </div>
  );
}
