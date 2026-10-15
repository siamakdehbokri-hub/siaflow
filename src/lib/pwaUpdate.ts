import { Workbox } from 'workbox-window';

/**
 * Single place that registers the service worker and manages updates.
 * - Checks for updates on open, when the app returns to the foreground, and every 5 minutes.
 * - Applies a waiting update directly (SKIP_WAITING) and reloads once the new worker takes control.
 */

type Listener = (waiting: boolean) => void;

let registration: ServiceWorkerRegistration | null = null;
let updateWaiting = false;
const listeners = new Set<Listener>();
let started = false;
let reloading = false;

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  return (
    h.startsWith('id-preview--') ||
    h.startsWith('preview--') ||
    h === 'lovableproject.com' ||
    h.endsWith('.lovableproject.com') ||
    h.endsWith('.lovableproject-dev.com') ||
    h.endsWith('.beta.lovable.dev')
  );
}

function setWaiting(v: boolean) {
  updateWaiting = v;
  listeners.forEach((l) => l(v));
}

export function onUpdateAvailable(l: Listener): () => void {
  listeners.add(l);
  l(updateWaiting);
  return () => listeners.delete(l);
}

export async function checkForUpdate(): Promise<boolean> {
  if (!registration) return false;
  try {
    await registration.update();
  } catch {
    /* offline */
  }
  if (registration.waiting) {
    setWaiting(true);
    return true;
  }
  // An install may still be in progress — wait briefly for it.
  const installing = registration.installing;
  if (installing) {
    await new Promise<void>((resolve) => {
      const t = setTimeout(resolve, 8000);
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' || installing.state === 'redundant') {
          clearTimeout(t);
          resolve();
        }
      });
    });
    if (registration.waiting) {
      setWaiting(true);
      return true;
    }
  }
  return false;
}

function reloadOnce() {
  if (reloading) return;
  reloading = true;
  window.location.reload();
}

export function applyUpdate(): void {
  const waiting = registration?.waiting;
  if (!waiting) {
    reloadOnce();
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', reloadOnce, { once: true });
  waiting.postMessage({ type: 'SKIP_WAITING' });
  // Safety net in case controllerchange never fires.
  setTimeout(reloadOnce, 4000);
}

export function startPwaUpdates(): void {
  if (started) return;
  started = true;

  if (isBlockedContext()) {
    navigator.serviceWorker?.getRegistrations?.().then((regs) => regs.forEach((r) => r.unregister()));
    return;
  }

  const wb = new Workbox('/custom-sw.js', { scope: '/' });
  wb.addEventListener('waiting', () => setWaiting(true));

  const openedAt = Date.now();

  wb.register()
    .then((reg) => {
      if (!reg) return;
      registration = reg;
      checkForUpdate().then((found) => {
        // Freshly opened app with an update already waiting → apply right away,
        // before the user starts working.
        if (found && Date.now() - openedAt < 10000) applyUpdate();
      });
    })
    .catch((e) => console.error('[PWA] SW registration error:', e));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdate();
    } else if (document.visibilityState === 'hidden' && registration?.waiting) {
      // User left the app — activate the new version so the next open is up to date.
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });

  window.addEventListener('online', () => checkForUpdate());
  setInterval(() => checkForUpdate(), 5 * 60 * 1000);
}
