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
    <header className="relative z-10" style={{ background: 'linear-gradient(135deg, var(--header-from), var(--header-to))' }}>
      {/* Safe area padding */}
      <div className="pt-safe" />
      
      {/* Header content - 56px height */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 px-4">
        {/* Notifications (right side in RTL) */}
        <div className="flex items-center gap-0.5 justify-self-start min-w-0">
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
        
        {/* Title - centered */}
        <h1 className="justify-self-center text-center truncate max-w-[60vw] text-lg font-bold text-primary-foreground">
          {title}
        </h1>
        
        {/* Menu icon (left side in RTL) */}
        <div className="justify-self-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className="hover:bg-primary-foreground/15 rounded-xl h-11 w-11 text-primary-foreground"
            aria-label="منو"
          >
            <Menu className="w-[22px] h-[22px]" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </header>
  );
}
