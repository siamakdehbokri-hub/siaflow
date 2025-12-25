import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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
          <div className="h-52 sm:h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">هنوز هزینه‌ای ثبت نشده</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="animate-slide-up">
      <CardHeader className="px-4 sm:px-5">
        <CardTitle className="text-base">توزیع هزینه‌ها</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-5">
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index]} 
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={6}
                formatter={(value: string) => (
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{value}</span>
                )}
                wrapperStyle={{ fontSize: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
