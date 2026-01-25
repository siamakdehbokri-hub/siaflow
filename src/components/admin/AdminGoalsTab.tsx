import { Loader2, Target, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AdminGoal } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';

interface AdminGoalsTabProps {
  goals: AdminGoal[];
  goalsLoading: boolean;
  onDeleteGoal: (goal: AdminGoal) => void;
}

export function AdminGoalsTab({
  goals,
  goalsLoading,
  onDeleteGoal,
}: AdminGoalsTabProps) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            تمام اهداف پس‌انداز
          </div>
          <Badge variant="outline" className="font-mono">{goals.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goalsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">هدفی یافت نشد</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">کاربر</TableHead>
                  <TableHead className="text-right">هدف</TableHead>
                  <TableHead className="text-right">پس‌انداز</TableHead>
                  <TableHead className="text-right">پیشرفت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => {
                  const progress = goal.target_amount > 0 
                    ? Math.round((goal.current_amount / goal.target_amount) * 100) 
                    : 0;
                  return (
                    <TableRow key={goal.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: goal.color + '20' }}
                          >
                            <span style={{ color: goal.color }}>●</span>
                          </div>
                          <span className="font-medium">{goal.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{goal.userName}</TableCell>
                      <TableCell className="font-mono text-sm">{formatCurrency(goal.target_amount)}</TableCell>
                      <TableCell className="font-mono text-sm text-green-600">{formatCurrency(goal.current_amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-16 h-2" />
                          <span className="text-xs font-mono">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteGoal(goal)}
                          className="text-destructive hover:text-destructive rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
