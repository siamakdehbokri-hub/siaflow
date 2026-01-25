import { Loader2, Banknote, Trash2 } from 'lucide-react';
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
import { AdminDebt } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';

interface AdminDebtsTabProps {
  debts: AdminDebt[];
  debtsLoading: boolean;
  onDeleteDebt: (debt: AdminDebt) => void;
}

export function AdminDebtsTab({
  debts,
  debtsLoading,
  onDeleteDebt,
}: AdminDebtsTabProps) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            تمام بدهی‌ها
          </div>
          <Badge variant="outline" className="font-mono">{debts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {debtsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-12">
            <Banknote className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">بدهی‌ای یافت نشد</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">کاربر</TableHead>
                  <TableHead className="text-right">طلبکار</TableHead>
                  <TableHead className="text-right">کل مبلغ</TableHead>
                  <TableHead className="text-right">پرداخت شده</TableHead>
                  <TableHead className="text-right">سررسید</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((debt) => (
                  <TableRow key={debt.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{debt.name}</TableCell>
                    <TableCell className="text-sm">{debt.userName}</TableCell>
                    <TableCell className="text-sm">{debt.creditor}</TableCell>
                    <TableCell className="font-mono text-sm">{formatCurrency(debt.total_amount)}</TableCell>
                    <TableCell className="font-mono text-sm text-green-600">{formatCurrency(debt.paid_amount)}</TableCell>
                    <TableCell className="text-sm">{debt.due_date || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteDebt(debt)}
                        className="text-destructive hover:text-destructive rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
