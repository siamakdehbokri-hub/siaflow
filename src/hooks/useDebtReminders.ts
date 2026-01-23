import { useState, useEffect, useCallback } from 'react';
import { Debt } from './useDebts';
import { toast } from 'sonner';

export interface DebtReminder {
  id: string;
  debtId: string;
  name: string;
  creditor: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
}

export function useDebtReminders(debts: Debt[]) {
  const [reminders, setReminders] = useState<DebtReminder[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    const stored = localStorage.getItem('dismissed-debt-reminders');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('dismissed-debt-reminders', JSON.stringify(dismissed));
  }, [dismissed]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingReminders: DebtReminder[] = debts
      .filter(d => d.dueDate && d.paidAmount < d.totalAmount)
      .map(d => {
        const dueDate = new Date(d.dueDate!);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntil < 0;

        const reminderId = `${d.id}-${d.dueDate}`;
        
        // Show reminder if within 7 days or overdue, and not dismissed
        if ((daysUntil <= 7 || isOverdue) && !dismissed.includes(reminderId)) {
          return {
            id: reminderId,
            debtId: d.id,
            name: d.name,
            creditor: d.creditor,
            totalAmount: d.totalAmount,
            remainingAmount: d.totalAmount - d.paidAmount,
            dueDate: d.dueDate!,
            daysUntilDue: daysUntil,
            isOverdue,
          };
        }
        return null;
      })
      .filter((r): r is DebtReminder => r !== null)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    setReminders(upcomingReminders);
  }, [debts, dismissed]);

  const dismissReminder = useCallback((id: string) => {
    setDismissed(prev => [...prev, id]);
  }, []);

  const showNotifications = useCallback(() => {
    reminders.forEach(reminder => {
      if (reminder.isOverdue) {
        toast.error(`⚠️ بدهی عقب‌افتاده: ${reminder.name}`, {
          description: `مبلغ باقی‌مانده: ${reminder.remainingAmount.toLocaleString('fa-IR')} تومان`,
          duration: 8000,
        });
      } else if (reminder.daysUntilDue === 0) {
        toast.warning(`🔔 سررسید امروز: ${reminder.name}`, {
          description: `مبلغ باقی‌مانده: ${reminder.remainingAmount.toLocaleString('fa-IR')} تومان`,
          duration: 6000,
        });
      } else if (reminder.daysUntilDue <= 3) {
        toast.info(`📅 یادآور بدهی: ${reminder.name}`, {
          description: `${reminder.daysUntilDue} روز تا سررسید - مبلغ: ${reminder.remainingAmount.toLocaleString('fa-IR')} تومان`,
          duration: 5000,
        });
      }
    });
  }, [reminders]);

  // Show notifications on mount and when reminders change
  useEffect(() => {
    if (reminders.length > 0) {
      const timer = setTimeout(showNotifications, 1500);
      return () => clearTimeout(timer);
    }
  }, [reminders.length]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('نوتیفیکیشن‌های مرورگر فعال شد');
      }
    }
  }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  }, []);

  // Check for overdue debts and send browser notifications
  useEffect(() => {
    const overdueReminders = reminders.filter(r => r.isOverdue || r.daysUntilDue === 0);
    
    if (overdueReminders.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      overdueReminders.forEach(reminder => {
        const title = reminder.isOverdue ? '⚠️ بدهی عقب‌افتاده!' : '🔔 سررسید بدهی امروز';
        const body = `${reminder.name} به ${reminder.creditor} - مبلغ: ${reminder.remainingAmount.toLocaleString('fa-IR')} تومان`;
        sendBrowserNotification(title, body);
      });
    }
  }, [reminders, sendBrowserNotification]);

  return {
    reminders,
    dismissReminder,
    hasReminders: reminders.length > 0,
    overdueCount: reminders.filter(r => r.isOverdue).length,
    requestNotificationPermission,
    sendBrowserNotification,
  };
}
