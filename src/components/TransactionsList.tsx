import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { SwipeableTransaction } from './SwipeableTransaction';
import { ExportButtons } from './ExportButtons';
import { DateRangeFilter } from './DateRangeFilter';
import { Input } from '@/components/ui/input';
import { formatPersianDateFull } from '@/utils/persianDate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction, Category } from '@/types/expense';

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionsList({ 
  transactions, 
  categories,
  onEditTransaction,
  onDeleteTransaction 
}: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.subcategory && t.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      
      // Date range filter
      let matchesDateRange = true;
      if (startDate) {
        matchesDateRange = matchesDateRange && t.date >= startDate;
      }
      if (endDate) {
        matchesDateRange = matchesDateRange && t.date <= endDate;
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesDateRange;
    });
  }, [transactions, searchQuery, categoryFilter, typeFilter, startDate, endDate]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header with Export */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="جستجوی تراکنش..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <ExportButtons transactions={filteredTransactions} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-24 sm:w-28 shrink-0 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="expense">هزینه</SelectItem>
            <SelectItem value="income">درآمد</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-32 sm:w-36 shrink-0 text-sm">
            <Filter className="w-4 h-4 ml-1 sm:ml-2" />
            <SelectValue placeholder="دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌ها</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClear={clearDateFilter}
        />
      </div>

      {/* Tip */}
      <p className="text-xs text-muted-foreground text-center sm:hidden">
        برای ویرایش یا حذف، تراکنش را به راست بکشید
      </p>

      {/* Transactions by Date */}
      <div className="space-y-4">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-1">
              {formatPersianDateFull(date)}
            </h3>
            <div className="space-y-2">
              {groupedTransactions[date].map((transaction) => (
                <SwipeableTransaction 
                  key={transaction.id} 
                  transaction={transaction}
                  onEdit={onEditTransaction}
                  onDelete={onDeleteTransaction}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">تراکنشی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
