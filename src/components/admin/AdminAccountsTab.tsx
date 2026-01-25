import { Loader2, Wallet } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminAccount } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface AdminAccountsTabProps {
  accounts: AdminAccount[];
  accountsLoading: boolean;
}

export function AdminAccountsTab({
  accounts,
  accountsLoading,
}: AdminAccountsTabProps) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            تمام حساب‌ها
          </div>
          <Badge variant="outline" className="font-mono">{accounts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {accountsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">حسابی یافت نشد</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">کاربر</TableHead>
                  <TableHead className="text-right">نوع</TableHead>
                  <TableHead className="text-right">موجودی</TableHead>
                  <TableHead className="text-right">پیش‌فرض</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow key={acc.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: acc.color + '20' }}
                        >
                          <span style={{ color: acc.color }}>●</span>
                        </div>
                        <span className="font-medium">{acc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{acc.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg">{acc.type}</Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "font-mono text-sm",
                      acc.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {formatCurrency(acc.balance)}
                    </TableCell>
                    <TableCell>
                      {acc.is_default && (
                        <Badge className="bg-primary/10 text-primary rounded-lg">پیش‌فرض</Badge>
                      )}
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
