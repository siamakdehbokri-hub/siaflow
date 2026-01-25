import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type EventCategory = 'navigation' | 'transaction' | 'goal' | 'debt' | 'auth' | 'settings' | 'error';

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: number;
}

// Analytics storage key
const ANALYTICS_KEY = 'siaflow_analytics';
const MAX_EVENTS = 500;

// Get stored analytics
const getStoredAnalytics = () => {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : { events: [], pageViews: [] };
  } catch {
    return { events: [], pageViews: [] };
  }
};

// Save analytics
const saveAnalytics = (data: { events: AnalyticsEvent[]; pageViews: PageView[] }) => {
  try {
    // Keep only last MAX_EVENTS
    const trimmedData = {
      events: data.events.slice(-MAX_EVENTS),
      pageViews: data.pageViews.slice(-MAX_EVENTS),
    };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmedData));
  } catch {
    // Storage full, clear old data
    localStorage.removeItem(ANALYTICS_KEY);
  }
};

export function useAnalytics() {
  const location = useLocation();

  // Track page views automatically
  useEffect(() => {
    const pageView: PageView = {
      path: location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    };

    const analytics = getStoredAnalytics();
    analytics.pageViews.push(pageView);
    saveAnalytics(analytics);
  }, [location.pathname]);

  // Track custom events
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const eventWithTimestamp = {
      ...event,
      timestamp: Date.now(),
    };

    const analytics = getStoredAnalytics();
    analytics.events.push(eventWithTimestamp);
    saveAnalytics(analytics);

    // Console log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event.category, event.action, event.label || '');
    }
  }, []);

  // Track transaction events
  const trackTransaction = useCallback((action: 'create' | 'update' | 'delete', type: 'income' | 'expense', amount?: number) => {
    trackEvent({
      category: 'transaction',
      action,
      label: type,
      value: amount,
    });
  }, [trackEvent]);

  // Track goal events
  const trackGoal = useCallback((action: 'create' | 'update' | 'delete' | 'deposit' | 'withdraw', goalName?: string) => {
    trackEvent({
      category: 'goal',
      action,
      label: goalName,
    });
  }, [trackEvent]);

  // Track debt events
  const trackDebt = useCallback((action: 'create' | 'update' | 'delete' | 'payment', debtName?: string) => {
    trackEvent({
      category: 'debt',
      action,
      label: debtName,
    });
  }, [trackEvent]);

  // Track auth events
  const trackAuth = useCallback((action: 'login' | 'logout' | 'signup' | 'password_change') => {
    trackEvent({
      category: 'auth',
      action,
    });
  }, [trackEvent]);

  // Track error
  const trackError = useCallback((error: { type: string; message: string; stack?: string }) => {
    trackEvent({
      category: 'error',
      action: error.type,
      label: error.message,
      metadata: { stack: error.stack },
    });
  }, [trackEvent]);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const analytics = getStoredAnalytics();
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const recentEvents = analytics.events.filter((e: any) => e.timestamp > dayAgo);
    const weeklyEvents = analytics.events.filter((e: any) => e.timestamp > weekAgo);

    return {
      totalEvents: analytics.events.length,
      totalPageViews: analytics.pageViews.length,
      eventsToday: recentEvents.length,
      eventsThisWeek: weeklyEvents.length,
      topPages: getTopItems(analytics.pageViews.map((p: PageView) => p.path)),
      topActions: getTopItems(analytics.events.map((e: any) => `${e.category}:${e.action}`)),
    };
  }, []);

  return {
    trackEvent,
    trackTransaction,
    trackGoal,
    trackDebt,
    trackAuth,
    trackError,
    getAnalyticsSummary,
  };
}

// Helper to get top items
function getTopItems(items: string[], limit = 5): { item: string; count: number }[] {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Expose trackError globally for ErrorBoundary
if (typeof window !== 'undefined') {
  (window as any).trackError = (error: any) => {
    const analytics = getStoredAnalytics();
    analytics.events.push({
      category: 'error',
      action: error.type || 'unknown',
      label: error.message || error.error,
      metadata: error,
      timestamp: Date.now(),
    });
    saveAnalytics(analytics);
  };
}
