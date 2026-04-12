import { useState, useEffect } from 'react';
import { Download, Smartphone, WifiOff, RefreshCw, CheckCircle2, ArrowRight, Share2, MoreVertical, Zap, Database, Shield, Bell } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'install' | 'offline' | 'faq'>('install');
  const navigate = useNavigate();

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

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
    { icon: RefreshCw, label: 'سینک خودکار', desc: 'همگام‌سازی بعد از اتصال' },
    { icon: Zap, label: 'سرعت بالا', desc: 'بارگذاری فوری از کش' },
    { icon: Smartphone, label: 'تجربه اپ واقعی', desc: 'تمام‌صفحه بدون مرورگر' },
  ];

  const offlineFeatures = [
    { icon: Database, title: 'ذخیره‌سازی محلی', items: ['تراکنش‌ها در IndexedDB ذخیره می‌شن', 'داده‌ها تا ۲۴ ساعت در کش می‌مونن', 'بدون نیاز به اینترنت قابل مشاهده‌ان'] },
    { icon: RefreshCw, title: 'همگام‌سازی هوشمند', items: ['تا ۵ بار تلاش مجدد خودکار', 'ارسال به ترتیب و بدون تکرار', 'تشخیص تداخل و اطلاع‌رسانی'] },
    { icon: Shield, title: 'امنیت داده', items: ['رمزنگاری توکن احراز هویت', 'جلوگیری از ارسال تکراری', 'ثبت خطاها برای بررسی'] },
    { icon: Bell, title: 'اطلاع‌رسانی', items: ['نمایش وضعیت آنلاین/آفلاین', 'تعداد تغییرات در صف', 'پیام موفقیت بعد از سینک'] },
  ];

  const faqs = [
    { q: 'آیا داده‌هام از بین میره؟', a: 'خیر. تمام تغییرات آفلاین در حافظه دستگاه ذخیره می‌شن و بعد از اتصال به اینترنت خودکار ارسال می‌شن.' },
    { q: 'اگه اینترنتم وسط کار قطع بشه چی؟', a: 'SiaFlow خودکار تشخیص میده و تغییرات رو در صف قرار میده. یه نشانگر بالای صفحه وضعیت رو نشون میده.' },
    { q: 'چند بار تلاش مجدد انجام میشه؟', a: 'تا ۵ بار با فاصله زمانی افزایشی (۲، ۴، ۸، ۱۶، ۳۰ ثانیه). اگه بازم نشد، خطا ثبت میشه.' },
    { q: 'تفاوت نصب اپ با مرورگر چیه؟', a: 'اپ نصب‌شده تمام‌صفحه باز میشه، آیکون روی هوم‌اسکرین داره، سریع‌تر لود میشه و حالت آفلاین کامل‌تری داره.' },
    { q: 'چطور اپ رو حذف کنم؟', a: 'مثل هر اپ دیگه‌ای: آیکون رو نگه دارید و «حذف» یا «Uninstall» رو بزنید.' },
  ];

  const tabs = [
    { id: 'install' as const, label: 'نصب' },
    { id: 'offline' as const, label: 'آفلاین' },
    { id: 'faq' as const, label: 'سوالات' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/pwa-192x192.png" alt="SiaFlow" className="w-9 h-9 rounded-xl" />
            <h1 className="text-lg font-bold text-foreground">نصب و راهنما</h1>
          </div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary font-medium">
            بازگشت
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 max-w-md mx-auto w-full pb-24">
        {/* ─── TAB: Install ─── */}
        {activeTab === 'install' && (
          <>
            {/* Hero */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden shadow-xl shadow-primary/20">
                <img src="/pwa-512x512.png" alt="SiaFlow" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">SiaFlow رو نصب کن</h2>
                <p className="text-sm text-muted-foreground mt-1">دسترسی سریع + حالت آفلاین کامل</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border/50 p-3.5 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Install CTA */}
            {isInstalled ? (
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                <p className="text-base font-bold text-foreground">اپ نصب شده! ✓</p>
                <p className="text-sm text-muted-foreground">SiaFlow رو از هوم‌اسکرین باز کنید</p>
              </div>
            ) : isIOS ? (
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <p className="text-base font-bold text-foreground text-center">نصب در آیفون / آیپد</p>
                <div className="space-y-4">
                  {[
                    { num: '۱', content: <span className="flex items-center gap-2">در Safari دکمه <Share2 className="w-5 h-5 text-primary inline" /> رو بزنید</span> },
                    { num: '۲', content: <span>از لیست «Add to Home Screen» رو انتخاب کنید</span> },
                    { num: '۳', content: <span>«Add» رو بزنید — تمام!</span> },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{step.num}</div>
                      <div className="text-sm text-foreground pt-1.5">{step.content}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg p-2">
                  ⚠️ فقط از مرورگر Safari امکان نصب وجود داره
                </p>
              </div>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full h-14 rounded-2xl text-base font-bold gap-3 shadow-xl shadow-primary/30">
                <Download className="w-5 h-5" />
                نصب SiaFlow
              </Button>
            ) : (
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <p className="text-base font-bold text-foreground text-center">نصب از مرورگر Chrome / Edge</p>
                <div className="space-y-4">
                  {[
                    { num: '۱', content: <span className="flex items-center gap-2">منوی <MoreVertical className="w-5 h-5 text-primary inline" /> رو باز کنید</span> },
                    { num: '۲', content: <span>«نصب برنامه» یا «Install app» رو بزنید</span> },
                    { num: '۳', content: <span>«نصب» رو تأیید کنید — تمام!</span> },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{step.num}</div>
                      <div className="text-sm text-foreground pt-1.5">{step.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── TAB: Offline Guide ─── */}
        {activeTab === 'offline' && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-foreground">حالت آفلاین چطور کار می‌کنه؟</h2>
              <p className="text-sm text-muted-foreground">SiaFlow طوری طراحی شده که بدون اینترنت هم کامل کار کنه</p>
            </div>

            {/* Flow diagram */}
            <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">مسیر داده‌ها:</p>
              <div className="flex items-center justify-between gap-2">
                {[
                  { label: 'ثبت تراکنش', color: 'bg-primary/10 text-primary' },
                  { label: 'ذخیره محلی', color: 'bg-amber-500/10 text-amber-500' },
                  { label: 'سینک خودکار', color: 'bg-blue-500/10 text-blue-500' },
                  { label: 'سرور', color: 'bg-emerald-500/10 text-emerald-500' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={cn("rounded-lg px-2 py-1.5 text-[10px] font-bold text-center", step.color)}>
                      {step.label}
                    </div>
                    {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Feature details */}
            <div className="space-y-3">
              {offlineFeatures.map((f, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{f.title}</p>
                  </div>
                  <ul className="space-y-1.5 pr-5">
                    {f.items.map((item, j) => (
                      <li key={j} className="text-xs text-muted-foreground list-disc leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Status indicator guide */}
            <div className="rounded-2xl bg-muted/30 border border-border/50 p-4 space-y-3">
              <p className="text-sm font-bold text-foreground">نشانگر وضعیت اتصال</p>
              <p className="text-xs text-muted-foreground">بالای صفحه یه نشانگر کوچک وضعیت اتصال رو نمایش میده:</p>
              <div className="space-y-2">
                {[
                  { color: 'bg-emerald-500', label: 'سبز: آنلاین — همه چیز عالیه' },
                  { color: 'bg-amber-500', label: 'زرد: در حال سینک — صبر کنید' },
                  { color: 'bg-red-500', label: 'قرمز: آفلاین — تغییرات ذخیره می‌شن' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className={cn("w-3 h-3 rounded-full shrink-0", s.color)} />
                    <span className="text-xs text-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── TAB: FAQ ─── */}
        {activeTab === 'faq' && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-foreground">سوالات متداول</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border/50 p-4 space-y-2">
                  <p className="text-sm font-bold text-foreground">{faq.q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
