import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Transaction, Category, defaultExpenseCategories } from '@/types/expense';
import { formatCurrency } from '@/utils/persianDate';

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

export function CategoryBreakdown({ transactions, categories }: CategoryBreakdownProps) {
  const { chartData, totalExpense, categoryList } = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense' || t.type === 'saving');
    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryTotals: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const sortedCategories = Object.entries(categoryTotals)
      .map(([name, value], index) => {
        const cat = categories.find(c => c.name === name);
        const defaultCat = defaultExpenseCategories.find(c => c.name === name);
        const color = cat?.color || defaultCat?.color || COLORS[index % COLORS.length];
        return { name, value, percentage: total > 0 ? (value / total) * 100 : 0, color };
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
    <div className="space-y-5">
      {/* Donut Chart with center label */}
      <div className="flex justify-center">
        <div className="relative w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={`g-${index}`} id={`cbGrad-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.65} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                cornerRadius={4}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={`url(#cbGrad-${index})`} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted-foreground">مجموع</span>
            <span className="text-sm font-black text-foreground tabular-nums leading-tight">
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Category rows */}
      <div className="space-y-1.5">
        {categoryList.slice(0, 6).map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass"
          >
            {/* Color dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}55` }}
            />

            {/* Name */}
            <span className="flex-1 text-[13px] font-medium text-foreground truncate">
              {item.name}
            </span>

            {/* Amount */}
            <span className="text-[12px] text-muted-foreground tabular-nums shrink-0">
              {formatCurrency(item.value)}
            </span>

            {/* Percentage badge */}
            <span
              className="min-w-[38px] text-center text-[11px] font-bold tabular-nums py-0.5 px-1.5 rounded-lg shrink-0"
              style={{
                backgroundColor: `${item.color}18`,
                color: item.color,
              }}
            >
              {item.percentage.toFixed(0)}٪
            </span>
          </div>
        ))}
      </div>

      {categoryList.length > 6 && (
        <p className="text-[11px] text-muted-foreground text-center">
          و {categoryList.length - 6} دسته‌بندی دیگر
        </p>
      )}
    </div>
  );
}
