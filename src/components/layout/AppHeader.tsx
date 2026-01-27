import { Bell, Menu } from 'lucide-react';
import { formatPersianDateFull } from '@/utils/persianDate';
import { Button } from '@/components/ui/button';
import { DebtReminderNotifications } from '@/components/DebtReminderNotifications';
import { ReminderNotifications } from '@/components/ReminderNotifications';
import { DebtReminder } from '@/hooks/useDebtReminders';
import { Reminder } from '@/hooks/useReminders';

interface AppHeaderProps {
  title: string;
  showDate?: boolean;
  onMenuClick?: () => void;
  debtReminders?: DebtReminder[];
  reminders?: Reminder[];
  onDismissDebtReminder?: (id: string) => void;
  onDismissReminder?: (id: string) => void;
  onEnableNotifications?: () => void;
}

export function AppHeader({ 
  title, 
  showDate = true, 
  onMenuClick,
  debtReminders = [],
  reminders = [],
  onDismissDebtReminder,
  onDismissReminder,
  onEnableNotifications,
}: AppHeaderProps) {
  const today = new Date();
  const persianDate = formatPersianDateFull(today.toISOString());
  
  return (
    <header className="bg-primary text-primary-foreground">
      {/* Safe area padding */}
      <div className="pt-safe" />
      
      {/* Header content */}
      <div className="flex items-center justify-between h-14 px-4">
        {/* Notifications - Left side (RTL) */}
        <div className="flex items-center gap-1">
          <DebtReminderNotifications 
            reminders={debtReminders} 
            onDismiss={onDismissDebtReminder || (() => {})} 
            onEnableNotifications={onEnableNotifications} 
          />
          <ReminderNotifications 
            reminders={reminders} 
            onDismiss={onDismissReminder || (() => {})} 
          />
        </div>
        
        {/* Title - Center */}
        <h1 className="text-lg font-bold">{title}</h1>
        
        {/* Menu icon - Right side (RTL) */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="text-primary-foreground hover:bg-white/10 rounded-full"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Date strip */}
      {showDate && (
        <div className="text-center pb-3 text-sm opacity-90">
          ◂ {persianDate}
        </div>
      )}
    </header>
  );
}
