import { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Smartphone,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Share2,
  MoreVertical,
  Zap,
  Database,
  Shield,
  Bell,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

/* ─── Types ─── */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'desktop';

/* ─── Helpers ─── */
function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

/* ─── Sub-components ─── */
function StepCard({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-sm font-black text-primary-foreground shrink-0 shadow-lg shadow-primary/30">
        {num}
      </div>
      <div className="text-sm text-foreground pt-2 leading-relaxed flex-1">{children}</div>
    </div>
  );
}

function FeatureChip({ icon: Icon, label, desc }: { icon: LucideIcon; label: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-card/80 backdrop-blur border border-border/40 p-4 space-y-2.5">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-[13px] font-bold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full rounded-2xl bg-card border border-border/50 p-4 text-right transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground flex-1">{q}</p>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-40 mt-2.5 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </button>
  );
}

/* ─── Main Page ─── */
export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform] = useState<Platform>(detectPlatform);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const installed = () => setIsInstalled(true);

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/pwa-192x192.png" alt="SiaFlow" className="w-9 h-9 rounded-xl shadow-md" />
            <h1 className="text-lg font-bold text-foreground">نصب SiaFlow</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-primary font-medium active:opacity-70 transition-opacity min-h-[44px]"
          >
            بازگشت
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto w-full px-4 py-6 space-y-8 pb-safe pb-12">

          {/* ═══════════════════════════════════════════
              SECTION 1: Hero + Install
              ═══════════════════════════════════════════ */}
          <section className="space-y-5">
            {/* Hero */}
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-[28px] bg-primary/20 blur-xl animate-pulse" />
                <div className="relative w-24 h-24 rounded-[28px] overflow-hidden shadow-2xl shadow-primary/30 border-2 border-primary/20">
                  <img src="/pwa-512x512.png" alt="SiaFlow" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">SiaFlow رو نصب کن!</h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  مثل یه اپ واقعی روی گوشیت داشته باشش
                </p>
              </div>
            </div>

            {/* Install CTA — always visible */}
            {isInstalled ? (
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center space-y-2">
                <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
                <p className="text-base font-black text-foreground">اپ نصب شده!</p>
                <p className="text-sm text-muted-foreground">
                  SiaFlow رو از صفحه اصلی گوشیت باز کن
                </p>
              </div>
            ) : deferredPrompt ? (
              <Button
                onClick={handleInstall}
                className="w-full h-14 rounded-2xl text-base font-black gap-3 shadow-xl shadow-primary/30"
              >
                <Download className="w-6 h-6" />
                نصب فوری SiaFlow
              </Button>
            ) : null}
          </section>

          {/* ═══════════════════════════════════════════
              SECTION 2: Device-specific Guide
              ═══════════════════════════════════════════ */}
          {!isInstalled && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border/60" />
                <p className="text-xs font-bold text-muted-foreground shrink-0">
                  {platform === 'ios' ? 'آموزش نصب آیفون' : platform === 'android' ? 'آموزش نصب اندروید' : 'آموزش نصب'}
                </p>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              <div className="rounded-2xl bg-card border border-border/50 p-5 space-y-5">
                {platform === 'ios' ? (
                  <>
                    <div className="flex items-center gap-2.5 bg-amber-500/10 rounded-xl p-3">
                      <Globe className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-xs font-bold text-amber-500">فقط از Safari نصب کنید</p>
                    </div>
                    <StepCard num="۱">
                      <span className="flex items-center gap-2 flex-wrap">
                        دکمه اشتراک‌گذاری
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                          <Share2 className="w-4 h-4 text-primary" />
                        </span>
                        رو در پایین صفحه بزنید
                      </span>
                    </StepCard>
                    <StepCard num="۲">
                      در لیست پایین اسکرول کنید و
                      <span className="font-bold text-primary mx-1">«Add to Home Screen»</span>
                      رو انتخاب کنید
                    </StepCard>
                    <StepCard num="۳">
                      اسم رو تأیید کنید و
                      <span className="font-bold text-primary mx-1">«Add»</span>
                      رو بزنید — تمام!
                    </StepCard>
                  </>
                ) : platform === 'android' ? (
                  <>
                    <StepCard num="۱">
                      <span className="flex items-center gap-2 flex-wrap">
                        در Chrome منوی سه‌نقطه
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                          <MoreVertical className="w-4 h-4 text-primary" />
                        </span>
                        رو بزنید
                      </span>
                    </StepCard>
                    <StepCard num="۲">
                      <span className="font-bold text-primary">«نصب برنامه»</span>
                      {' '}یا{' '}
                      <span className="font-bold text-primary">«Install app»</span>
                      {' '}رو انتخاب کنید
                    </StepCard>
                    <StepCard num="۳">
                      <span className="font-bold text-primary">«نصب»</span>
                      {' '}رو تأیید کنید — آیکون اپ روی صفحه اصلی اضافه میشه!
                    </StepCard>
                    {!deferredPrompt && (
                      <div className="bg-muted/50 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground text-center leading-relaxed">
                          اگه بنر نصب نمایش داده نشد، از منوی سه‌نقطه اقدام کنید
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <StepCard num="۱">
                      در نوار آدرس Chrome / Edge آیکون نصب یا منوی سه‌نقطه رو بزنید
                    </StepCard>
                    <StepCard num="۲">
                      <span className="font-bold text-primary">«Install SiaFlow»</span>
                      {' '}رو انتخاب کنید
                    </StepCard>
                    <StepCard num="۳">
                      تأیید کنید — اپ مثل یه برنامه جداگانه باز میشه!
                    </StepCard>
                  </>
                )}
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
              SECTION 3: Why Install
              ═══════════════════════════════════════════ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/60" />
              <p className="text-xs font-bold text-muted-foreground shrink-0">چرا نصب کنم؟</p>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FeatureChip icon={WifiOff} label="کار بدون اینترنت" desc="تراکنش‌ها آفلاین ذخیره و بعداً سینک می‌شن" />
              <FeatureChip icon={RefreshCw} label="سینک خودکار" desc="وصل شدی؟ خودکار همگام‌سازی میشه" />
              <FeatureChip icon={Zap} label="سرعت بالا" desc="بارگذاری فوری بدون انتظار" />
              <FeatureChip icon={Smartphone} label="تجربه اپ واقعی" desc="تمام‌صفحه بدون نوار مرورگر" />
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              SECTION 4: How Offline Works
              ═══════════════════════════════════════════ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/60" />
              <p className="text-xs font-bold text-muted-foreground shrink-0">حالت آفلاین</p>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* Data flow */}
            <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-4">
              <p className="text-xs font-bold text-muted-foreground">مسیر داده‌ها</p>
              <div className="flex flex-col gap-2.5">
                {([
                  { label: 'ثبت تراکنش توسط شما', color: 'bg-primary/15 text-primary border-primary/20' },
                  { label: 'ذخیره در حافظه دستگاه', color: 'bg-amber-500/15 text-amber-600 border-amber-500/20' },
                  { label: 'ارسال خودکار به سرور', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' },
                ] as const).map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0", step.color)}>
                      {i + 1}
                    </div>
                    <div className={cn("flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold", step.color)}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline feature cards */}
            {([
              { icon: Database, title: 'ذخیره‌سازی محلی', desc: 'تراکنش‌ها در IndexedDB ذخیره می‌شن و تا ۲۴ ساعت در کش می‌مونن' },
              { icon: RefreshCw, title: 'سینک هوشمند', desc: 'تا ۵ بار تلاش مجدد خودکار با فاصله زمانی افزایشی' },
              { icon: Shield, title: 'امنیت داده', desc: 'رمزنگاری توکن، جلوگیری از ارسال تکراری' },
              { icon: Bell, title: 'نشانگر وضعیت', desc: 'نمایش آنلاین/آفلاین/سینک بالای صفحه' },
            ] as { icon: LucideIcon; title: string; desc: string }[]).map((f, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-card/60 border border-border/40 p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[13px] font-bold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}

            {/* Connection status guide */}
            <div className="rounded-2xl bg-muted/30 border border-border/40 p-4 space-y-3">
              <p className="text-[13px] font-bold text-foreground">معنی رنگ نشانگر</p>
              <div className="space-y-2.5">
                {[
                  { color: 'bg-emerald-500', label: 'سبز — آنلاین، همه چیز عالیه' },
                  { color: 'bg-amber-500', label: 'زرد — در حال همگام‌سازی' },
                  { color: 'bg-red-500', label: 'قرمز — آفلاین، تغییرات ذخیره می‌شن' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className={cn("absolute inset-0 rounded-full animate-ping opacity-40", s.color)} />
                      <span className={cn("relative inline-flex rounded-full h-3 w-3", s.color)} />
                    </span>
                    <span className="text-xs text-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              SECTION 5: FAQ
              ═══════════════════════════════════════════ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/60" />
              <p className="text-xs font-bold text-muted-foreground shrink-0">سوالات متداول</p>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="space-y-2.5">
              <AccordionItem q="آیا داده‌هام از بین میره؟" a="خیر. تمام تغییرات آفلاین در حافظه دستگاه ذخیره و بعد از اتصال خودکار ارسال می‌شن." />
              <AccordionItem q="اگه اینترنت وسط کار قطع بشه؟" a="SiaFlow خودکار تشخیص میده و تغییرات رو صف می‌کنه. نشانگر بالای صفحه وضعیت رو نشون میده." />
              <AccordionItem q="تفاوت نصب اپ با مرورگر چیه؟" a="اپ تمام‌صفحه باز میشه، آیکون روی هوم‌اسکرین داره، سریع‌تر لود میشه و آفلاین کامل‌تری داره." />
              <AccordionItem q="چطور اپ رو حذف کنم؟" a="مثل هر اپ دیگه: آیکون رو نگه دارید و حذف رو بزنید." />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
