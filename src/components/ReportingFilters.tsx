import { useState, useMemo } from 'react';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PersianDatePicker } from './PersianDatePicker';
import { Category, Transaction } from '@/types/expense';
import { formatPersianDateShort } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface ReportingFiltersProps {
  transactions: Transaction[];
  categories: Category[];
  onFilterChange: (filtered: Transaction[]) => void;
}

export function ReportingFilters({
  transactions,
  categories,
  onFilterChange,
}: ReportingFiltersProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Get subcategories for selected category
  const subcategories = useMemo(() => {
    if (categoryFilter === 'all') return [];
    const cat = categories.find(c => c.name === categoryFilter);
    if (!cat?.subcategories) return [];
    return cat.subcategories.map(s => typeof s === 'string' ? s : (s as { name: string }).name);
  }, [categoryFilter, categories]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    const result = transactions.filter((t) => {
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesSubcategory = subcategoryFilter === 'all' || t.subcategory === subcategoryFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      
      let matchesDateRange = true;
      if (startDate) matchesDateRange = matchesDateRange && t.date >= startDate;
      if (endDate) matchesDateRange = matchesDateRange && t.date <= endDate;

      return matchesCategory && matchesSubcategory && matchesType && matchesDateRange;
    });

    onFilterChange(result);
    return result;
  }, [transactions, categoryFilter, subcategoryFilter, typeFilter, startDate, endDate, onFilterChange]);

  const clearAllFilters = () => {
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setTypeFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setSubcategoryFilter('all');
  };

  const activeFiltersCount = [
    categoryFilter !== 'all',
    subcategoryFilter !== 'all',
    typeFilter !== 'all',
    startDate !== null,
    endDate !== null,
  ].filter(Boolean).length;

  const hasDateFilter = startDate || endDate;
  const dateDisplayText = hasDateFilter
    ? `${startDate ? formatPersianDateShort(startDate) : '...'} تا ${endDate ? formatPersianDateShort(endDate) : '...'}`
    : 'بازه تاریخی';

  return (
    <div className="space-y-3">
      {/* Filter Row */}
      <div className="flex flex-wrap gap-2">
        {/* Type Filter */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {[
            { value: 'all', label: 'همه' },
            { value: 'expense', label: 'هزینه' },
            { value: 'income', label: 'درآمد' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value as any)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                typeFilter === opt.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-auto min-w-[120px] h-9 text-xs">
            <Filter className="w-3.5 h-3.5 ml-1.5" />
            <SelectValue placeholder="دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌ها</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subcategory Filter */}
        {subcategories.length > 0 && (
          <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
            <SelectTrigger className="w-auto min-w-[100px] h-9 text-xs animate-fade-in">
              <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
              <SelectValue placeholder="زیردسته" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه زیردسته‌ها</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date Range Filter */}
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 text-xs gap-1.5",
                hasDateFilter && "border-primary text-primary"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{dateDisplayText}</span>
              <span className="sm:hidden">تاریخ</span>
              {hasDateFilter && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="p-0.5 rounded hover:bg-destructive/20"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 space-y-4" align="start">
            <h4 className="text-sm font-semibold text-foreground">فیلتر بازه تاریخی</h4>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">از تاریخ</label>
                <PersianDatePicker
                  value={startDate || ''}
                  onChange={(date) => setStartDate(date)}
                  placeholder="انتخاب تاریخ شروع"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">تا تاریخ</label>
                <PersianDatePicker
                  value={endDate || ''}
                  onChange={(date) => setEndDate(date)}
                  placeholder="انتخاب تاریخ پایان"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setDatePopoverOpen(false);
                }}
              >
                پاک کردن
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setDatePopoverOpen(false)}
              >
                اعمال
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear All Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={clearAllFilters}
          >
            <X className="w-3.5 h-3.5 ml-1" />
            پاک کردن ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1.5 animate-fade-in">
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {categoryFilter}
              <button onClick={() => handleCategoryChange('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {subcategoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {subcategoryFilter}
              <button onClick={() => setSubcategoryFilter('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {typeFilter === 'expense' ? 'هزینه' : 'درآمد'}
              <button onClick={() => setTypeFilter('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {hasDateFilter && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {dateDisplayText}
              <button onClick={() => { setStartDate(null); setEndDate(null); }}>
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
