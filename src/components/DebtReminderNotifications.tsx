import { DebtReminder } from '@/hooks/useDebtReminders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Calendar, AlertTriangle, Clock, CreditCard } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface DebtReminderNotificationsProps {
  reminders: DebtReminder[];
  onDismiss: (id: string) => void;
  onEnableNotifications?: () => void;
}

export function DebtReminderNotifications({ 
  reminders, 
  onDismiss,
  onEnableNotifications 
}: DebtReminderNotificationsProps) {
  const formatDaysUntil = (days: number, isOverdue: boolean) => {
    if (isOverdue) return `${Math.abs(days)} روز عقب‌افتاده`;
    if (days === 0) return 'امروز';
    if (days === 1) return 'فردا';
    return `${days} روز دیگر`;
  };

  const getUrgencyColor = (days: number, isOverdue: boolean) => {
    if (isOverdue) return 'bg-destructive text-destructive-foreground';
    if (days === 0) return 'bg-amber-500 text-white';
    if (days <= 3) return 'bg-orange-500 text-white';
    return 'bg-primary/20 text-primary';
  };

  const overdueCount = reminders.filter(r => r.isOverdue).length;
  const todayCount = reminders.filter(r => r.daysUntilDue === 0 && !r.isOverdue).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative w-9 h-9 rounded-xl hover:bg-primary/10 hover:shadow-glow-sm transition-all duration-300 group"
        >
          <CreditCard className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
          {reminders.length > 0 && (
            <span className={cn(
              "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg",
              overdueCount > 0 ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-amber-500 text-white"
            )}>
              {reminders.length}
            </span>
          )}
          {/* Glow ring when has overdue */}
          {overdueCount > 0 && (
            <span className="absolute inset-0 rounded-xl border-2 border-destructive/30 animate-ping opacity-50" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[75vh]">
        <SheetHeader className="text-right">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            یادآور بدهی‌ها
          </SheetTitle>
          <SheetDescription>
            بدهی‌هایی که سررسید آن‌ها نزدیک است یا گذشته
          </SheetDescription>
        </SheetHeader>
        
        {/* Stats */}
        {reminders.length > 0 && (
          <div className="mt-4 flex gap-3">
            {overdueCount > 0 && (
              <Badge variant="destructive" className="rounded-lg py-1.5 px-3">
                <AlertTriangle className="w-3.5 h-3.5 ml-1.5" />
                {overdueCount} عقب‌افتاده
              </Badge>
            )}
            {todayCount > 0 && (
              <Badge className="rounded-lg py-1.5 px-3 bg-amber-500 text-white">
                <Clock className="w-3.5 h-3.5 ml-1.5" />
                {todayCount} امروز
              </Badge>
            )}
          </div>
        )}

        {/* Enable Notifications Button */}
        {'Notification' in window && Notification.permission === 'default' && (
          <Button 
            variant="outline" 
            className="w-full mt-4 rounded-xl"
            onClick={onEnableNotifications}
          >
            <Bell className="w-4 h-4 ml-2" />
            فعال‌سازی نوتیفیکیشن مرورگر
          </Button>
        )}

        <div className="mt-6 space-y-3 overflow-y-auto max-h-[50vh]">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>یادآور بدهی فعالی وجود ندارد</p>
              <p className="text-xs mt-1">بدهی‌هایی که تاریخ سررسید دارند اینجا نمایش داده می‌شوند</p>
            </div>
          ) : (
            reminders.map(reminder => (
              <Card 
                key={reminder.id} 
                className={cn(
                  "relative overflow-hidden glass",
                  reminder.isOverdue && "border-destructive/30"
                )}
              >
                {reminder.isOverdue && (
                  <div className="absolute inset-0 bg-destructive/5" />
                )}
                {reminder.daysUntilDue === 0 && !reminder.isOverdue && (
                  <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                )}
                <CardContent className="p-4 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {reminder.isOverdue ? (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        ) : reminder.daysUntilDue === 0 ? (
                          <Clock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{reminder.name}</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>طلبکار: {reminder.creditor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>مبلغ باقی‌مانده:</span>
                          <span className="font-semibold text-foreground">
                            {formatCurrency(reminder.remainingAmount)}
                          </span>
                          <span className="text-xs">تومان</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getUrgencyColor(reminder.daysUntilDue, reminder.isOverdue)}>
                        {formatDaysUntil(reminder.daysUntilDue, reminder.isOverdue)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismiss(reminder.id)}
                        className="h-7 px-2 text-xs"
                      >
                        <X className="w-3 h-3 ml-1" />
                        رد کردن
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
