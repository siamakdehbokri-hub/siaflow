import { useState, useEffect } from 'react';
import { 
  UserCircle, Palette, Layers, LifeBuoy, LogOut, ChevronLeft, Moon, Sun, Monitor,
  Trash2, AlertTriangle, Loader2, ShieldCheck, Info, Mail, Lock, Download, 
  Calendar, Globe, Database, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ProfileEdit } from './ProfileEdit';
import { HelpGuide } from './HelpGuide';
import { SecuritySettings } from './SecuritySettings';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCurrency, currencies, CurrencyCode } from '@/hooks/useCurrency';

interface SettingsProps {
  onOpenCategories?: () => void;
}

type SettingsView = 'main' | 'profile' | 'help' | 'security';

// --- Reusable setting row ---
interface SettingRowProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}

function SettingRow({ icon: Icon, iconBg, iconColor, title, subtitle, trailing, onClick, showChevron = true, isLast = false }: SettingRowProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3.5 px-4 py-3.5 transition-colors text-right",
        onClick && "active:bg-accent/40",
        !isLast && "border-b border-border/40"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-relaxed">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{subtitle}</p>}
      </div>
      {trailing}
      {showChevron && onClick && <ChevronLeft className="w-4.5 h-4.5 text-muted-foreground/60 shrink-0" strokeWidth={2} />}
    </Comp>
  );
}

// --- Section wrapper ---
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground px-1 mb-2 uppercase tracking-wide">{title}</h3>
      <div className="glass rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function Settings({ onOpenCategories }: SettingsProps) {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, currencyInfo, exchangeRates, ratesLoading, refreshRates } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.avatar_url) {
        setAvatarUrl(`${data.avatar_url}?t=${Date.now()}`);
      }
    };
    fetchAvatar();
  }, [user?.id, currentView]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('با موفقیت خارج شدید');
      window.location.href = '/auth';
    } catch (error) {
      toast.error('خطا در خروج از حساب');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'حذف حساب') {
      toast.error('لطفاً عبارت "حذف حساب" را دقیق وارد کنید');
      return;
    }
    if (!user) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user-account');
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success('حساب شما کاملاً حذف شد.');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error?.message || 'خطا در حذف حساب');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
    }
  };

  // Sub-views
  if (currentView === 'profile') return <ProfileEdit onBack={() => setCurrentView('main')} />;
  if (currentView === 'help') return <HelpGuide onBack={() => setCurrentView('main')} />;
  if (currentView === 'security') return <SecuritySettings onBack={() => setCurrentView('main')} />;

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'کاربر';
  const emailPart = user?.email?.replace('@siaflow.app', '') || '';
  const phone = /^09\d{9}$/.test(emailPart) ? emailPart : '';
  const displayPhone = phone ? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}` : user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const themeLabel = theme === 'dark' ? 'تاریک' : theme === 'light' ? 'روشن' : 'سیستم';

  return (
    <div className="space-y-5 animate-fade-in pb-6">
      {/* ─── Profile Card ─── */}
      <div className="glass-heavy rounded-2xl overflow-hidden">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--glass-inset)), transparent)' }} />
        </div>
        <div className="flex items-center gap-4 p-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-xl font-bold text-primary overflow-hidden border-2 border-primary/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">{displayName}</h3>
            <p className="text-sm text-muted-foreground truncate mt-0.5" dir="ltr">{displayPhone}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-9 px-4 text-xs font-semibold border-border/60"
            onClick={() => setCurrentView('profile')}
          >
            ویرایش
          </Button>
        </div>

        {isAdmin && (
          <div className="px-5 pb-5 pt-0">
            <Button
              variant="default"
              className="w-full h-11 rounded-xl bg-warning hover:bg-warning/90 text-warning-foreground font-semibold text-sm"
              onClick={() => navigate('/admin')}
            >
              <ShieldCheck className="w-4.5 h-4.5 ml-2" />
              پنل مدیریت
            </Button>
          </div>
        )}
      </div>

      {/* ─── Appearance & Preferences ─── */}
      <SettingsSection title="ظاهر و ترجیحات">
        <Sheet>
          <SheetTrigger asChild>
            <div>
              <SettingRow
                icon={ThemeIcon}
                iconBg="bg-accent"
                iconColor="text-accent-foreground"
                title="تم برنامه"
                subtitle={themeLabel}
                onClick={() => {}}
              />
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-3xl">
            <SheetHeader className="text-right pb-4">
              <SheetTitle className="text-xl flex items-center gap-2">
                <Palette className="w-6 h-6 text-primary" strokeWidth={2} />
                انتخاب تم
              </SheetTitle>
              <SheetDescription className="leading-relaxed">تم مورد نظر خود را انتخاب کنید</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 pb-8">
              {[
                { value: 'light', label: 'حالت روشن', icon: Sun, bg: 'bg-warning/15', iconColor: 'text-warning' },
                { value: 'dark', label: 'حالت تاریک', icon: Moon, bg: 'bg-muted', iconColor: 'text-foreground' },
                { value: 'system', label: 'پیروی از سیستم', icon: Monitor, bg: 'bg-accent', iconColor: 'text-accent-foreground' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value as any);
                    toast.success(`${option.label} فعال شد`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 min-h-[60px]",
                    theme === option.value
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/30 border-transparent hover:border-border"
                  )}
                >
                  <div className={cn("p-2.5 rounded-xl", option.bg)}>
                    <option.icon className={cn("w-5 h-5", option.iconColor)} strokeWidth={2} />
                  </div>
                  <p className="font-semibold text-foreground flex-1 text-right leading-relaxed text-sm">{option.label}</p>
                  {theme === option.value && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <div>
              <SettingRow
                icon={Globe}
                iconBg="bg-warning/10"
                iconColor="text-warning"
                title="واحد پول"
                subtitle={currencyInfo.name}
                onClick={() => {}}
              />
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-3xl">
            <SheetHeader className="text-right pb-4">
              <SheetTitle className="text-xl flex items-center gap-2">
                <Globe className="w-6 h-6 text-warning" strokeWidth={2} />
                انتخاب واحد پول
              </SheetTitle>
              <SheetDescription className="leading-relaxed">واحد پول مورد نظر را انتخاب کنید</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 pb-4">
              {[
                { value: 'IRT' as CurrencyCode, label: 'تومان', symbol: 'تومان', flag: '🇮🇷' },
                { value: 'IRR' as CurrencyCode, label: 'ریال', symbol: 'ریال', flag: '🇮🇷' },
                { value: 'USD' as CurrencyCode, label: 'دلار آمریکا', symbol: '$', flag: '🇺🇸' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setCurrency(option.value);
                    toast.success(`واحد پول به ${option.label} تغییر کرد`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 min-h-[60px]",
                    currency === option.value
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/30 border-transparent hover:border-border"
                  )}
                >
                  <span className="text-2xl">{option.flag}</span>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-foreground leading-relaxed text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.symbol}</p>
                  </div>
                  {currency === option.value && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Exchange Rate Info */}
            <div className="border-t border-border pt-4 pb-8">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => refreshRates()}
                  disabled={ratesLoading}
                  className="text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  {ratesLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  بروزرسانی نرخ
                </button>
                <p className="text-xs font-medium text-muted-foreground">نرخ لحظه‌ای ارز</p>
              </div>
              {exchangeRates ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {new Intl.NumberFormat('fa-IR').format(exchangeRates.usd_to_irt)} تومان
                    </span>
                    <span className="text-sm text-muted-foreground">دلار</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {new Intl.NumberFormat('fa-IR').format(exchangeRates.usd_to_irr)} ریال
                    </span>
                    <span className="text-sm text-muted-foreground">دلار</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    آخرین بروزرسانی: {new Date(exchangeRates.updated_at).toLocaleTimeString('fa-IR')}
                    {exchangeRates.source ? ` • منبع: ${exchangeRates.source}` : ''}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  {ratesLoading ? 'در حال دریافت نرخ...' : 'نرخ ارز در دسترس نیست'}
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <SettingRow
          icon={Calendar}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="تقویم"
          subtitle="شمسی (جلالی)"
          showChevron={false}
          isLast={true}
          trailing={
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-lg">فعال</span>
          }
        />
      </SettingsSection>

      {/* ─── Data Management ─── */}
      <SettingsSection title="مدیریت داده‌ها">
        <SettingRow
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="دسته‌بندی‌ها"
          subtitle="مدیریت دسته‌های هزینه و درآمد"
          onClick={() => onOpenCategories?.()}
        />
        <SettingRow
          icon={Download}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="پشتیبان‌گیری و خروجی"
          subtitle="دانلود داده‌های شما"
          onClick={() => toast.info('این قابلیت به زودی فعال خواهد شد')}
          isLast={true}
        />
      </SettingsSection>

      {/* ─── Security ─── */}
      <SettingsSection title="امنیت">
        <SettingRow
          icon={Lock}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="امنیت و حریم خصوصی"
          subtitle="تغییر رمز عبور و تنظیمات امنیتی"
          onClick={() => setCurrentView('security')}
          isLast={true}
        />
      </SettingsSection>

      {/* ─── Support ─── */}
      <SettingsSection title="پشتیبانی">
        <SettingRow
          icon={LifeBuoy}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="راهنمای استفاده"
          subtitle="آموزش کار با اپلیکیشن"
          onClick={() => setCurrentView('help')}
        />
        <div className="px-4 py-3.5 border-b border-border/40">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-relaxed">درباره ما</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">طراحی و توسعه توسط Siamak.D</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-relaxed">ارتباط با ما</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5" dir="ltr">siamakflow@gmail.com</p>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* ─── Logout ─── */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-semibold text-muted-foreground transition-colors active:bg-destructive/10 hover:text-destructive border border-border/40"
      >
        <LogOut className="w-4.5 h-4.5" strokeWidth={2} />
        خروج از حساب
      </button>

      {/* ─── Danger Zone ─── */}
      <details className="group">
        <summary className="text-xs text-muted-foreground/60 cursor-pointer hover:text-muted-foreground transition-colors list-none flex items-center justify-center gap-1 py-2">
          <span>گزینه‌های پیشرفته</span>
          <ChevronLeft className="w-3 h-3 rotate-90 group-open:-rotate-90 transition-transform" />
        </summary>
        <div className="mt-2">
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-medium text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            حذف حساب کاربری
          </button>
        </div>
      </details>

      {/* Version */}
      <p className="text-center text-[11px] text-muted-foreground/50 pb-2">
        SiaFlow نسخه ۲.۰.۳
      </p>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <DialogTitle className="text-lg text-destructive">حذف حساب کاربری</DialogTitle>
            <DialogDescription className="text-center">
              این عمل غیرقابل بازگشت است. تمام داده‌های شما حذف خواهد شد.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="deleteConfirm">
              عبارت <span className="font-bold text-destructive">"حذف حساب"</span> را تایپ کنید:
            </Label>
            <Input
              id="deleteConfirm"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="حذف حساب"
              className="text-center h-12 border-2"
            />
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button
              variant="destructive"
              className="w-full h-12"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmation !== 'حذف حساب'}
            >
              {deleting ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <Trash2 className="w-5 h-5 ml-2" />}
              حذف
            </Button>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation('');
              }}
            >
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
