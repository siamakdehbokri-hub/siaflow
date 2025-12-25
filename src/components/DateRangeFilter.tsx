import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PersianDatePicker } from './PersianDatePicker';
import { formatPersianDateShort } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
  onClear: () => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const hasFilter = startDate || endDate;

  const displayText = hasFilter
    ? `${startDate ? formatPersianDateShort(startDate) : '...'} تا ${endDate ? formatPersianDateShort(endDate) : '...'}`
    : 'بازه تاریخی';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 shrink-0",
            hasFilter && "border-primary text-primary"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{displayText}</span>
          {hasFilter && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
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
              onChange={(date) => onStartDateChange(date)}
              placeholder="انتخاب تاریخ شروع"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">تا تاریخ</label>
            <PersianDatePicker
              value={endDate || ''}
              onChange={(date) => onEndDateChange(date)}
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
              onClear();
              setOpen(false);
            }}
          >
            پاک کردن
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            اعمال
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}