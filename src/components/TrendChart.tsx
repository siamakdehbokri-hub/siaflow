import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'فروردین', income: 25000000, expense: 18000000 },
  { name: 'اردیبهشت', income: 28000000, expense: 20000000 },
  { name: 'خرداد', income: 26000000, expense: 22000000 },
  { name: 'تیر', income: 30000000, expense: 19000000 },
  { name: 'مرداد', income: 27000000, expense: 21000000 },
  { name: 'شهریور', income: 32000000, expense: 23000000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-2 sm:p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1 sm:mb-2 text-sm">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs sm:text-sm" style={{ color: item.color }}>
            {item.name === 'income' ? 'درآمد' : 'هزینه'}: {new Intl.NumberFormat('fa-IR').format(item.value)} تومان
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart() {
  return (
    <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <CardHeader className="px-4 sm:px-5">
        <CardTitle className="text-base">روند درآمد و هزینه</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-5">
        <div className="h-40 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                interval={0}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">درآمد</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-destructive" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">هزینه</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
