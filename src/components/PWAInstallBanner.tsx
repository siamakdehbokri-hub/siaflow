import { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'siaflow-pwa-banner-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PWAInstallBanner() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check dismiss cooldown
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION) {
      return;
    }

    // Show banner after 3 seconds for discoverability
    const timer = setTimeout(() => setVisible(true), 3000);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
      setVisible(false);
    } else {
      navigate('/install');
    }
  }, [deferredPrompt, navigate]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (isInstalled || !visible) return null;

  return (
    <div
      className={cn(
        "mx-4 mb-3 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-lg",
        "flex items-center gap-3 p-3 animate-fade-in relative"
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
        <Download className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">SiaFlow رو نصب کن!</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">آفلاین کار کن + آیکون روی گوشی</p>
      </div>
      <Button
        size="sm"
        onClick={handleInstall}
        className="rounded-xl text-xs font-bold h-9 px-4 shrink-0"
      >
        {deferredPrompt ? 'نصب' : 'آموزش'}
      </Button>
      <button
        onClick={handleDismiss}
        className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="بستن"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}