import { DashboardWidget } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronUp, ChevronDown, RotateCcw, Settings2, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface WidgetSettingsProps {
  widgets: DashboardWidget[];
  onToggle: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onReset: () => void;
}

export function WidgetSettings({ widgets, onToggle, onMove, onReset }: WidgetSettingsProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Settings2 className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="text-right pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </SheetClose>
            <SheetTitle className="text-lg">تنظیمات داشبورد</SheetTitle>
          </div>
          <SheetDescription className="text-right">
            ویجت‌ها را فعال/غیرفعال کنید و ترتیب آن‌ها را تغییر دهید
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-5 space-y-3 overflow-y-auto max-h-[calc(80vh-180px)]">
          {widgets.map((widget, index) => (
            <div 
              key={widget.id} 
              className={cn(
                "flex items-center justify-between gap-3 p-3.5 rounded-2xl transition-all duration-200",
                "bg-muted/50 border border-border/50",
                widget.enabled ? "opacity-100" : "opacity-60"
              )}
            >
              {/* Right side - Toggle and Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Switch
                  checked={widget.enabled}
                  onCheckedChange={() => onToggle(widget.id)}
                />
                <span className="text-sm font-medium truncate">{widget.title}</span>
              </div>
              
              {/* Left side - Move buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onMove(widget.id, 'up')}
                  disabled={index === 0}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200",
                    index === 0
                      ? "opacity-30 cursor-not-allowed bg-muted/30"
                      : "bg-muted hover:bg-accent active:scale-95"
                  )}
                >
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(widget.id, 'down')}
                  disabled={index === widgets.length - 1}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200",
                    index === widgets.length - 1
                      ? "opacity-30 cursor-not-allowed bg-muted/30"
                      : "bg-muted hover:bg-accent active:scale-95"
                  )}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Reset Button */}
        <div className="mt-5 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            className="w-full rounded-xl h-12"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            بازنشانی به پیش‌فرض
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}