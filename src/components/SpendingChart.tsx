import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/types/expense';
import { formatCurrency } from '@/utils/persianDate';

interface SpendingChartProps {
  categories?: Category[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-2 sm:p-3 shadow-lg">
        <p className="font-medium text-foreground text-sm">{payload[0].name}</p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function SpendingChart({ categories = [] }: SpendingChartProps) {
  const chartData = categories
    .filter(c => c.spent && c.spent > 0)
    .map(c => ({
      name: c.name,
      value: c.spent || 0,
      color: c.color,
    }));

  const COLORS = chartData.map(d => d.color);

  if (chartData.length === 0) {
    return (
      <Card variant="glass" className="animate-slide-up">
        <CardHeader className="px-4 sm:px-5">
          <CardTitle className="text-base">توزیع هزینه‌ها</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-5">
          <div className="h-40 sm:h-48 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">هنوز هزینه‌ای ثبت نشده</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSpending = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card variant="glass" className="animate-slide-up overflow-hidden">
      <CardHeader className="px-4 sm:px-5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">توزیع هزینه‌ها</CardTitle>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(totalSpending)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5">
        <div className="h-40 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#pieGradient-${index})`}
                    className="drop-shadow-sm"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend as chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {chartData.slice(0, 4).map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 text-xs"
            >
              <span 
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground truncate max-w-[60px]">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
