import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DebtReminderNotifications } from '@/components/DebtReminderNotifications';
import { ReminderNotifications } from '@/components/ReminderNotifications';
import { DebtReminder } from '@/hooks/useDebtReminders';
import { Reminder } from '@/hooks/useReminders';

interface AppHeaderProps {
  title: string;
  onMenuClick?: () => void;
  debtReminders?: DebtReminder[];
  reminders?: Reminder[];
  onDismissDebtReminder?: (id: string) => void;
  onDismissReminder?: (id: string) => void;
  onEnableNotifications?: () => void;
}

export function AppHeader({ 
  title, 
  onMenuClick,
  debtReminders = [],
  reminders = [],
  onDismissDebtReminder,
  onDismissReminder,
  onEnableNotifications,
}: AppHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground">
      {/* Safe area padding */}
      <div className="pt-safe" />
      
      {/* Header content - fixed height */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 px-4">
        {/* Notifications (right side in RTL) */}
        <div className="flex items-center gap-1 justify-self-start min-w-0">
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
        
        {/* Title - truly centered regardless of side widths */}
        <h1 className="text-lg font-bold justify-self-center text-center truncate max-w-[70vw]">
          {title}
        </h1>
        
        {/* Menu icon (left side in RTL) */}
        <div className="justify-self-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className="text-primary-foreground hover:bg-white/10 rounded-full"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
