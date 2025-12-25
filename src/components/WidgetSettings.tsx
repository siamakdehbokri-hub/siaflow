import { DashboardWidget } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronUp, ChevronDown, RotateCcw, Settings2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="text-right">
          <SheetTitle>تنظیمات داشبورد</SheetTitle>
          <SheetDescription>
            ویجت‌ها را فعال/غیرفعال کنید و ترتیب آن‌ها را تغییر دهید
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {widgets.map((widget, index) => (
            <Card key={widget.id} variant="glass" className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <Switch
                    checked={widget.enabled}
                    onCheckedChange={() => onToggle(widget.id)}
                  />
                  <span className="text-sm font-medium">{widget.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onMove(widget.id, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onMove(widget.id, 'down')}
                    disabled={index === widgets.length - 1}
                    className="h-8 w-8"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          <Button
            variant="outline"
            className="w-full mt-4"
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
