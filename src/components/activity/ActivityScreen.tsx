import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, X, ArrowUpDown } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { SwipeableTransaction } from '@/components/SwipeableTransaction';
import { ExportButtons } from '@/components/ExportButtons';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPersianDateFull } from '@/utils/persianDate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface ActivityScreenProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export function ActivityScreen({
  transactions,
  categories,
  onEditTransaction,
  onDeleteTransaction,
}: ActivityScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (categoryFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (startDate || endDate) count++;
    return count;
  }, [categoryFilter, typeFilter, startDate, endDate]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((t) => {
      const matchesSearch = 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.subcategory && t.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      
      let matchesDateRange = true;
      if (startDate) matchesDateRange = t.date >= startDate;
      if (endDate) matchesDateRange = matchesDateRange && t.date <= endDate;
      
      return matchesSearch && matchesCategory && matchesType && matchesDateRange;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        default: // newest
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [transactions, searchQuery, categoryFilter, typeFilter, startDate, endDate, sortOrder]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    sortOrder === 'oldest' 
      ? new Date(a).getTime() - new Date(b).getTime()
      : new Date(b).getTime() - new Date(a).getTime()
  );

  const clearAllFilters = () => {
    setCategoryFilter('all');
    setTypeFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold text-foreground">فعالیت‌ها</h2>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} تراکنش
          </p>
        </div>
        <ExportButtons transactions={filteredTransactions} />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="جستجو در تراکنش‌ها..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 h-12 rounded-xl bg-card border-border/30"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        {/* Type Quick Filter */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
          {(['all', 'expense', 'income'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                typeFilter === type
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {type === 'all' ? 'همه' : type === 'expense' ? 'هزینه' : 'درآمد'}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Filter className="w-4 h-4" />
              فیلتر
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 justify-center text-[10px]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader className="mb-4">
              <SheetTitle>فیلترهای پیشرفته</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-4 pb-8">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">دسته‌بندی</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="همه دسته‌ها" />
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
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">بازه زمانی</label>
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onClear={() => { setStartDate(null); setEndDate(null); }}
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium">مرتب‌سازی</label>
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">جدیدترین</SelectItem>
                    <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                    <SelectItem value="highest">بیشترین مبلغ</SelectItem>
                    <SelectItem value="lowest">کمترین مبلغ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex-1 rounded-xl"
                >
                  پاک کردن فیلترها
                </Button>
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  اعمال
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort Quick Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="rounded-xl"
        >
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 rounded-lg">
              {categoryFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
            </Badge>
          )}
          {(startDate || endDate) && (
            <Badge variant="secondary" className="gap-1 rounded-lg">
              <Calendar className="w-3 h-3" />
              بازه زمانی
              <X className="w-3 h-3 cursor-pointer" onClick={() => { setStartDate(null); setEndDate(null); }} />
            </Badge>
          )}
        </div>
      )}

      {/* Swipe Hint */}
      <p className="text-xs text-muted-foreground text-center sm:hidden">
        برای ویرایش یا حذف، به راست بکشید ←
      </p>

      {/* Transactions List */}
      <div className="space-y-4">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground px-1 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
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
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">تراکنشی یافت نشد</p>
            {activeFiltersCount > 0 && (
              <Button
                variant="link"
                onClick={clearAllFilters}
                className="mt-2"
              >
                پاک کردن فیلترها
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
