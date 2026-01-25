import { Loader2, CreditCard, Trash2, Search, Download } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminTransaction, AdminUser } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface AdminTransactionsTabProps {
  transactions: AdminTransaction[];
  filteredTransactions: AdminTransaction[];
  transactionsLoading: boolean;
  users: AdminUser[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: 'all' | 'income' | 'expense';
  setTypeFilter: (filter: 'all' | 'income' | 'expense') => void;
  userFilter: string;
  setUserFilter: (filter: string) => void;
  onDeleteTransaction: (transaction: AdminTransaction) => void;
  exportToCSV: () => void;
}

export function AdminTransactionsTab({
  transactions,
  filteredTransactions,
  transactionsLoading,
  users,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  userFilter,
  setUserFilter,
  onDeleteTransaction,
  exportToCSV,
}: AdminTransactionsTabProps) {
  return (
    <div className="space-y-4">
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی تراکنش..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                <SelectTrigger className="w-[110px] rounded-xl">
                  <SelectValue placeholder="نوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="income">درآمد</SelectItem>
                  <SelectItem value="expense">هزینه</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[130px] rounded-xl">
                  <SelectValue placeholder="کاربر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه کاربران</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.displayName || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={exportToCSV}
                className="rounded-xl"
                title="خروجی CSV"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              تمام تراکنش‌ها
            </div>
            <Badge variant="outline" className="font-mono">
              {filteredTransactions.length} / {transactions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">تراکنشی یافت نشد</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">تاریخ</TableHead>
                    <TableHead className="text-right">کاربر</TableHead>
                    <TableHead className="text-right">نوع</TableHead>
                    <TableHead className="text-right">دسته‌بندی</TableHead>
                    <TableHead className="text-right">مبلغ</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.slice(0, 100).map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm">{tx.date}</TableCell>
                      <TableCell className="text-sm">{tx.userName}</TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "rounded-lg",
                            tx.type === 'income'
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-600"
                          )}
                        >
                          {tx.type === 'income' ? 'درآمد' : 'هزینه'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{tx.category}</TableCell>
                      <TableCell className={cn(
                        "font-mono text-sm",
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTransaction(tx)}
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
    </div>
  );
}
