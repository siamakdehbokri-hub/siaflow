import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, Tag, Calendar, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DateRangeFilter } from './DateRangeFilter';
import { Category, Transaction } from '@/types/expense';
import { cn } from '@/lib/utils';

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

interface AdvancedSearchProps {
  transactions: Transaction[];
  categories: Category[];
  onFilterChange: (filtered: Transaction[]) => void;
}

export function AdvancedSearch({
  transactions,
  categories,
  onFilterChange,
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [onlyRecurring, setOnlyRecurring] = useState(false);

  // Get all unique tags from transactions
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    transactions.forEach((t) => {
      (t.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [transactions]);

  // Apply filters and sorting
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((t) => {
      // Search query
      const matchesSearch =
        !searchQuery ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.subcategory && t.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      // Type filter
      const matchesType = typeFilter === 'all' || t.type === typeFilter;

      // Date range
      let matchesDateRange = true;
      if (startDate) matchesDateRange = matchesDateRange && t.date >= startDate;
      if (endDate) matchesDateRange = matchesDateRange && t.date <= endDate;

      // Tag filter
      const matchesTags =
        tagFilter.length === 0 ||
        tagFilter.some((tag) => (t.tags || []).includes(tag));

      // Amount range
      const minAmt = minAmount ? parseInt(minAmount.replace(/,/g, '')) : 0;
      const maxAmt = maxAmount ? parseInt(maxAmount.replace(/,/g, '')) : Infinity;
      const matchesAmount = t.amount >= minAmt && t.amount <= maxAmt;

      // Recurring filter
      const matchesRecurring = !onlyRecurring || t.isRecurring;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesDateRange &&
        matchesTags &&
        matchesAmount &&
        matchesRecurring
      );
    });

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    onFilterChange(result);
    return result;
  }, [
    transactions,
    searchQuery,
    categoryFilter,
    typeFilter,
    startDate,
    endDate,
    tagFilter,
    sortOption,
    minAmount,
    maxAmount,
    onlyRecurring,
    onFilterChange,
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setTypeFilter('all');
    setStartDate(null);
    setEndDate(null);
    setTagFilter([]);
    setSortOption('date-desc');
    setMinAmount('');
    setMaxAmount('');
    setOnlyRecurring(false);
  };

  const activeFiltersCount = [
    categoryFilter !== 'all',
    typeFilter !== 'all',
    startDate !== null,
    endDate !== null,
    tagFilter.length > 0,
    minAmount !== '',
    maxAmount !== '',
    onlyRecurring,
  ].filter(Boolean).length;

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="space-y-3">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="جستجو در تراکنش‌ها، برچسب‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
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

        {/* Sort Button */}
        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="w-[130px]">
            <ArrowUpDown className="w-4 h-4 ml-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">جدیدترین</SelectItem>
            <SelectItem value="date-asc">قدیمی‌ترین</SelectItem>
            <SelectItem value="amount-desc">بیشترین مبلغ</SelectItem>
            <SelectItem value="amount-asc">کمترین مبلغ</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <SlidersHorizontal className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader className="text-right">
              <SheetTitle>فیلترهای پیشرفته</SheetTitle>
              <SheetDescription>
                تراکنش‌ها را بر اساس معیارهای مختلف فیلتر کنید
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Type Filter */}
              <div className="space-y-2">
                <Label>نوع تراکنش</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'همه' },
                    { value: 'expense', label: 'هزینه' },
                    { value: 'income', label: 'درآمد' },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      variant={typeFilter === opt.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTypeFilter(opt.value as any)}
                      className="flex-1"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>دسته‌بندی</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب دسته" />
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
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  بازه تاریخی
                </Label>
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onClear={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                />
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  محدوده مبلغ
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="حداقل"
                    value={minAmount}
                    onChange={(e) => setMinAmount(formatAmount(e.target.value))}
                    inputMode="numeric"
                  />
                  <span className="self-center text-muted-foreground">تا</span>
                  <Input
                    placeholder="حداکثر"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(formatAmount(e.target.value))}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    برچسب‌ها
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={tagFilter.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          if (tagFilter.includes(tag)) {
                            setTagFilter(tagFilter.filter((t) => t !== tag));
                          } else {
                            setTagFilter([...tagFilter, tag]);
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recurring Only */}
              <div className="flex items-center justify-between">
                <Label>فقط تراکنش‌های تکراری</Label>
                <Switch checked={onlyRecurring} onCheckedChange={setOnlyRecurring} />
              </div>

              {/* Clear All */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={clearAllFilters}
                >
                  <X className="w-4 h-4 ml-2" />
                  پاک کردن فیلترها ({activeFiltersCount})
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {categoryFilter}
              <button onClick={() => setCategoryFilter('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {typeFilter === 'expense' ? 'هزینه' : 'درآمد'}
              <button onClick={() => setTypeFilter('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {tagFilter.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <Tag className="w-3 h-3" />
              {tag}
              <button onClick={() => setTagFilter(tagFilter.filter((t) => t !== tag))}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {onlyRecurring && (
            <Badge variant="secondary" className="gap-1">
              تکراری
              <button onClick={() => setOnlyRecurring(false)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <p className="text-xs text-muted-foreground">
        {filteredTransactions.length} تراکنش یافت شد
      </p>
    </div>
  );
}
