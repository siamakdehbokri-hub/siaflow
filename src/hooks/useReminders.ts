import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types/expense';
import { toast } from '@/hooks/use-toast';

export interface Reminder {
  id: string;
  transactionId: string;
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}

export function useReminders(transactions: Transaction[]) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    const stored = localStorage.getItem('dismissed-reminders');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('dismissed-reminders', JSON.stringify(dismissed));
  }, [dismissed]);

  useEffect(() => {
    const recurringTransactions = transactions.filter(t => t.isRecurring);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingReminders: Reminder[] = recurringTransactions
      .map(t => {
        // Calculate next due date based on transaction date
        const transDate = new Date(t.date);
        const dayOfMonth = transDate.getDate();
        
        // Get next occurrence
        let nextDue = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
        if (nextDue <= today) {
          nextDue.setMonth(nextDue.getMonth() + 1);
        }

        const daysUntil = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const reminderDays = t.reminderDays || 3;

        // Only show reminder if within reminder window and not dismissed
        if (daysUntil <= reminderDays && !dismissed.includes(`${t.id}-${nextDue.toISOString().slice(0, 10)}`)) {
          return {
            id: `${t.id}-${nextDue.toISOString().slice(0, 10)}`,
            transactionId: t.id,
            title: t.description || t.category,
            category: t.category,
            amount: t.amount,
            dueDate: nextDue.toISOString().slice(0, 10),
            daysUntilDue: daysUntil,
          };
        }
        return null;
      })
      .filter((r): r is Reminder => r !== null)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    setReminders(upcomingReminders);
  }, [transactions, dismissed]);

  const dismissReminder = useCallback((id: string) => {
    setDismissed(prev => [...prev, id]);
  }, []);

  const showNotifications = useCallback(() => {
    reminders.forEach(reminder => {
      if (reminder.daysUntilDue === 0) {
        toast({
          title: '⚠️ سررسید امروز',
          description: `${reminder.title}: ${reminder.amount.toLocaleString('fa-IR')} تومان`,
          variant: 'destructive',
        });
      } else if (reminder.daysUntilDue <= 1) {
        toast({
          title: '🔔 یادآور فردا',
          description: `${reminder.title}: ${reminder.amount.toLocaleString('fa-IR')} تومان`,
        });
      }
    });
  }, [reminders]);

  // Show notifications on mount
  useEffect(() => {
    if (reminders.length > 0) {
      const timer = setTimeout(showNotifications, 1000);
      return () => clearTimeout(timer);
    }
  }, [reminders.length > 0]);

  return {
    reminders,
    dismissReminder,
    hasReminders: reminders.length > 0,
  };
}
