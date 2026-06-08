import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'notifications-enabled';
const EVENT_NAME = 'notification-prefs-changed';

export function getNotificationsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

/**
 * User preference for in-app reminder notifications.
 * Persisted to localStorage and synced across components via a custom event.
 */
export function useNotificationPrefs() {
  const [enabled, setEnabledState] = useState<boolean>(getNotificationsEnabled);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    const sync = () => setEnabledState(getNotificationsEnabled());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
    setEnabledState(value);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported' as const;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return Notification.permission;
    }
  }, []);

  return { enabled, setEnabled, permission, requestPermission };
}
