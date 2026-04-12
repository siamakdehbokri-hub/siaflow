import { useState, useEffect } from 'react';
import { Download, Smartphone, Wifi, WifiOff, RefreshCw, CheckCircle2, ArrowLeft, Share2, MoreVertical, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // iOS detection
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const features = [
    { icon: WifiOff, label: 'کار بدون اینترنت', desc: 'تراکنش‌ها آفلاین ذخیره می‌شن' },
    { icon: RefreshCw, label: 'سینک خودکار', desc: 'همگام‌سازی خودکار بعد از اتصال' },
    { icon: Zap, label: 'سرعت بالا', desc: 'بارگذاری فوری از کش' },
    { icon: Smartphone, label: 'تجربه اپ واقعی', desc: 'تمام‌صفحه بدون آدرس‌بار مرورگر' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">نصب اپلیکیشن</h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 max-w-md mx-auto w-full">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
            <Download className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">SiaFlow رو نصب کن</h2>
            <p className="text-sm text-muted-foreground mt-1">دسترسی سریع از هوم‌اسکرین + حالت آفلاین کامل</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border/50 p-4 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Install Action */}
        {isInstalled ? (
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <p className="text-base font-bold text-foreground">اپ نصب شده! ✓</p>
            <p className="text-sm text-muted-foreground">SiaFlow رو از هوم‌اسکرین باز کنید</p>
          </div>
        ) : isIOS ? (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <p className="text-sm font-bold text-foreground text-center">نصب در آیفون / آیپد:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground">۱</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>دکمه</span>
                  <Share2 className="w-4 h-4 text-primary" />
                  <span>رو بزنید (پایین Safari)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground">۲</div>
                <p className="text-sm text-muted-foreground">«Add to Home Screen» رو انتخاب کنید</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground">۳</div>
                <p className="text-sm text-muted-foreground">«Add» رو بزنید</p>
              </div>
            </div>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full h-14 rounded-2xl text-base font-bold gap-3 shadow-xl shadow-primary/30">
            <Download className="w-5 h-5" />
            نصب SiaFlow
          </Button>
        ) : (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <p className="text-sm font-bold text-foreground text-center">نصب از مرورگر:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground">۱</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>منوی مرورگر</span>
                  <MoreVertical className="w-4 h-4 text-primary" />
                  <span>رو باز کنید</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground">۲</div>
                <p className="text-sm text-muted-foreground">«نصب برنامه» یا «Add to Home screen» رو بزنید</p>
              </div>
            </div>
          </div>
        )}

        {/* Offline info */}
        <div className="rounded-2xl bg-muted/30 border border-border/50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">حالت آفلاین چطور کار می‌کنه؟</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 pr-6 list-disc">
            <li>تراکنش‌ها و تغییرات آفلاین در حافظه دستگاه ذخیره می‌شن</li>
            <li>بعد از وصل شدن اینترنت، خودکار همگام‌سازی انجام میشه</li>
            <li>اگه تداخلی باشه، سیستم بهتون اطلاع میده</li>
            <li>داده‌ها تا ۵ بار تلاش مجدد برای ارسال دارن</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
