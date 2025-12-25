import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, defaultExpenseCategories } from '@/types/expense';
import { formatCurrency } from '@/utils/persianDate';

interface SubcategoryChartProps {
  transactions: Transaction[];
  selectedCategory?: string;
}

const COLORS = [
  'hsl(168, 76%, 42%)',
  'hsl(199, 89%, 48%)',
  'hsl(38, 92%, 50%)',
  'hsl(262, 83%, 58%)',
  'hsl(0, 72%, 51%)',
  'hsl(142, 71%, 45%)',
  'hsl(330, 80%, 60%)',
  'hsl(25, 95%, 53%)',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-1">{data.name}</p>
        <p className="text-xs text-muted-foreground">{formatCurrency(data.value)}</p>
        <p className="text-xs text-primary">{data.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export function SubcategoryChart({ transactions, selectedCategory }: SubcategoryChartProps) {
  const data = useMemo(() => {
    // Filter expense transactions
    let filtered = transactions.filter(t => t.type === 'expense');
    
    // If a category is selected, filter by that category and group by subcategory
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
      
      const subcategoryTotals: Record<string, number> = {};
      filtered.forEach(t => {
        const sub = t.subcategory || 'سایر';
        subcategoryTotals[sub] = (subcategoryTotals[sub] || 0) + t.amount;
      });
      
      const total = Object.values(subcategoryTotals).reduce((sum, val) => sum + val, 0);
      
      return Object.entries(subcategoryTotals)
        .map(([name, value], index) => ({
          name,
          value,
          percentage: (value / total) * 100,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);
    }
    
    // Otherwise, group by category
    const categoryTotals: Record<string, number> = {};
    filtered.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categoryTotals)
      .map(([name, value], index) => {
        const catConfig = defaultExpenseCategories.find(c => c.name === name);
        return {
          name,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
          color: catConfig?.color || COLORS[index % COLORS.length]
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, selectedCategory]);

  if (data.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedCategory ? `تحلیل ${selectedCategory}` : 'تحلیل دسته‌بندی‌ها'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8 text-sm">
            داده‌ای برای نمایش وجود ندارد
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-base">
          {selectedCategory ? `تحلیل زیردسته‌های ${selectedCategory}` : 'تحلیل دسته‌بندی‌ها'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 w-full space-y-2">
            {data.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground flex-1 truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
