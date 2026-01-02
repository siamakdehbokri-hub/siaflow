import { Reminder } from '@/hooks/useReminders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Calendar, AlertTriangle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { formatCurrency } from '@/utils/persianDate';

interface ReminderNotificationsProps {
  reminders: Reminder[];
  onDismiss: (id: string) => void;
}

export function ReminderNotifications({ reminders, onDismiss }: ReminderNotificationsProps) {
  const formatDaysUntil = (days: number) => {
    if (days === 0) return 'امروز';
    if (days === 1) return 'فردا';
    return `${days} روز دیگر`;
  };

  const getUrgencyColor = (days: number) => {
    if (days === 0) return 'bg-destructive text-destructive-foreground';
    if (days <= 1) return 'bg-amber-500 text-white';
    return 'bg-primary/20 text-primary';
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative w-9 h-9 rounded-xl hover:bg-primary/10 hover:shadow-glow-sm transition-all duration-300 group"
        >
          <Bell className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          {reminders.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold animate-bounce shadow-lg">
              {reminders.length}
            </span>
          )}
          {/* Glow ring when has reminders */}
          {reminders.length > 0 && (
            <span className="absolute inset-0 rounded-xl border-2 border-destructive/30 animate-ping opacity-50" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader className="text-right">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            یادآورها
          </SheetTitle>
          <SheetDescription>
            پرداخت‌های تکراری که سررسید آن‌ها نزدیک است
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3 overflow-y-auto max-h-[50vh]">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>یادآوری فعالی وجود ندارد</p>
            </div>
          ) : (
            reminders.map(reminder => (
              <Card key={reminder.id} variant="glass" className="relative overflow-hidden">
                {reminder.daysUntilDue === 0 && (
                  <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {reminder.daysUntilDue === 0 ? (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        ) : (
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{reminder.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{reminder.category}</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(reminder.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(reminder.daysUntilDue)}>
                        {formatDaysUntil(reminder.daysUntilDue)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDismiss(reminder.id)}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
