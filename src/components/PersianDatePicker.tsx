import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  getDay,
  isSameDay,
  isToday
} from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { CalendarIcon } from 'lucide-react';

interface PersianDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const persianWeekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function PersianDatePicker({ value, onChange, placeholder = 'انتخاب تاریخ' }: PersianDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  
  const selectedDate = value ? new Date(value) : null;
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of week for the first day (0 = Saturday in Persian calendar)
  const startDayOfWeek = getDay(monthStart);
  // Adjust for Persian week (Saturday = 0)
  const persianStartDay = startDayOfWeek === 6 ? 0 : startDayOfWeek + 1;
  
  const handleDateSelect = (date: Date) => {
    // Convert to ISO string for storage (Gregorian format for database)
    onChange(date.toISOString().split('T')[0]);
    setOpen(false);
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const displayValue = selectedDate 
    ? format(selectedDate, 'd MMMM yyyy', { locale: faIR })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-right font-normal h-10",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h4 className="text-sm font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy', { locale: faIR })}
            </h4>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1">
            {persianWeekDays.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for alignment */}
            {Array.from({ length: persianStartDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            
            {/* Day buttons */}
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    isCurrentDay && !isSelected && "bg-accent text-accent-foreground font-semibold",
                    !isSelected && !isCurrentDay && "text-foreground"
                  )}
                >
                  {format(day, 'd', { locale: faIR })}
                </button>
              );
            })}
          </div>
          
          {/* Today button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleDateSelect(new Date())}
          >
            امروز
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
