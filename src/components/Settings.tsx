import { useState, useEffect } from 'react';
import { 
  User, Bell, Shield, Palette, Download, 
  HelpCircle, LogOut, ChevronLeft, Moon, Sun, Monitor, FolderOpen,
  Trash2, AlertTriangle, Loader2, ShieldCheck, Info, Mail, Heart, Sparkles,
  MessageCircleQuestion, ChevronDown, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const settingsGroups = [
  {
    title: 'حساب کاربری',
    items: [
      { icon: User, label: 'ویرایش پروفایل', action: 'profile', color: 'text-blue-500', description: 'نام، تصویر و اطلاعات شخصی' },
      { icon: Bell, label: 'اعلان‌ها', action: 'notifications', toggle: true, color: 'text-amber-500', description: 'یادآوری‌ها و هشدارها' },
      { icon: Shield, label: 'امنیت و رمز عبور', action: 'security', color: 'text-emerald-500', description: 'تغییر رمز عبور' },
    ],
  },
  {
    title: 'تنظیمات',
    items: [
      { icon: Palette, label: 'تم برنامه', action: 'theme', color: 'text-purple-500', description: 'حالت روشن یا تاریک' },
      { icon: FolderOpen, label: 'دسته‌بندی‌ها', action: 'categories', color: 'text-cyan-500', description: 'مدیریت دسته‌بندی‌ها' },
      { icon: Download, label: 'پشتیبان‌گیری', action: 'backup', color: 'text-teal-500', description: 'دانلود داده‌ها' },
    ],
  },
  {
    title: 'پشتیبانی',
    items: [
      { icon: HelpCircle, label: 'راهنما', action: 'help', color: 'text-indigo-500', description: 'آموزش استفاده' },
      { icon: MessageCircleQuestion, label: 'سوالات متداول', action: 'faq', color: 'text-violet-500', description: 'پاسخ سوالات رایج' },
      { icon: Info, label: 'درباره ما', action: 'about', color: 'text-pink-500', description: 'معرفی SiaFlow' },
      { icon: Mail, label: 'تماس با ما', action: 'contact', color: 'text-orange-500', description: 'ارسال پیام' },
    ],
  },
];

const faqItems = [
  {
    question: 'چگونه تراکنش جدید اضافه کنم؟',
    answer: 'از دکمه + در پایین صفحه استفاده کنید. نوع تراکنش (درآمد یا هزینه)، مبلغ، دسته‌بندی و توضیحات را وارد کنید.'
  },
  {
    question: 'بودجه ماهانه چگونه کار می‌کند؟',
    answer: 'در بخش «برنامه‌ریزی» می‌توانید برای هر دسته‌بندی یک سقف بودجه تعیین کنید. برنامه به صورت خودکار هزینه‌های شما را پیگیری و در صورت نزدیک شدن به سقف هشدار می‌دهد.'
  },
  {
    question: 'چطور هدف پس‌انداز بسازم؟',
    answer: 'در بخش «برنامه‌ریزی» > «اهداف پس‌انداز»، روی دکمه افزودن هدف کلیک کنید. نام، مبلغ هدف و تاریخ موردنظر را وارد کنید.'
  },
  {
    question: 'گزارش هوش مصنوعی چیست؟',
    answer: 'هوش مصنوعی SiaFlow الگوهای خرج کردن شما را تحلیل می‌کند و پیشنهادات شخصی برای بهبود وضعیت مالی ارائه می‌دهد.'
  },
  {
    question: 'اطلاعات من امن هستند؟',
    answer: 'بله! تمام داده‌های شما با رمزنگاری پیشرفته محافظت می‌شوند و فقط شما به آن‌ها دسترسی دارید.'
  },
  {
    question: 'چگونه تم برنامه را تغییر دهم؟',
    answer: 'در تنظیمات > تم برنامه، می‌توانید بین حالت روشن، تاریک یا خودکار (مطابق سیستم) انتخاب کنید.'
  },
  {
    question: 'مدیریت بدهی چه امکاناتی دارد؟',
    answer: 'می‌توانید بدهی‌های خود را ثبت کنید، تاریخ سررسید تعیین کنید و پرداخت‌های جزئی را پیگیری کنید. برنامه یادآوری‌ها را مدیریت می‌کند.'
  },
];

interface SettingsProps {
  onOpenCategories?: () => void;
}

type SettingsView = 'main' | 'profile' | 'help' | 'security' | 'about' | 'contact' | 'faq';

export function Settings({ onOpenCategories }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    switch (action) {
      case 'profile':
        setCurrentView('profile');
        break;
      case 'help':
        setCurrentView('help');
        break;
      case 'security':
        setCurrentView('security');
        break;
      case 'about':
        setCurrentView('about');
        break;
      case 'contact':
        setCurrentView('contact');
        break;
      case 'faq':
        setCurrentView('faq');
        break;
      case 'backup':
        toast.success('پشتیبان‌گیری انجام شد');
        break;
      case 'categories':
        onOpenCategories?.();
        break;
      default:
        break;
    }
  };

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

      toast.success('حساب شما کاملاً حذف شد. برای استفاده دوباره باید ثبت‌نام کنید.');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error?.message || 'خطا در حذف حساب. لطفاً دوباره تلاش کنید.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
    }
  };

  // Sub-views
  if (currentView === 'profile') {
    return <ProfileEdit onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'help') {
    return <HelpGuide onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'security') {
    return <SecuritySettings onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'about') {
    return (
      <div className="space-y-5 animate-fade-in pb-6">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('main')} className="mb-2 hover-scale">
          <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
          بازگشت
        </Button>
        
        <Card variant="glass" className="overflow-hidden animate-scale-in">
          <div className="h-36 gradient-primary opacity-90 flex items-center justify-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/30 blur-2xl animate-pulse" />
              <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white/20 blur-xl" style={{ animationDelay: '0.5s' }} />
            </div>
            
            <div className="text-center relative z-10">
              <div className="w-18 h-18 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">SiaFlow</h2>
              <p className="text-white/70 text-xs mt-1">دستیار هوشمند مالی</p>
            </div>
          </div>
          
          <CardContent className="p-5 space-y-5">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
                <span className="text-sm">ساخته شده با عشق و هوش مصنوعی</span>
              </div>
              
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-5 space-y-4 border border-border/30">
                <p className="text-foreground leading-relaxed text-sm">
                  این برنامه توسط <span className="font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">سیامک.د</span> توسعه داده شده است.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  SiaFlow یک دستیار هوشمند مدیریت مالی شخصی است که با بهره‌گیری از هوش مصنوعی پیشرفته، به شما کمک می‌کند درک عمیق‌تری از وضعیت مالی خود داشته باشید و تصمیمات هوشمندانه‌تری بگیرید.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['هوش مصنوعی', 'مدیریت بودجه', 'گزارش‌گیری', 'اهداف پس‌انداز'].map((tag, i) => (
                  <span 
                    key={tag}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 hover-scale cursor-default"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground/60 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          نسخه ۲.۰.۰
        </p>
      </div>
    );
  }

  if (currentView === 'contact') {
    return (
      <div className="space-y-5 animate-fade-in pb-6">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('main')} className="mb-2 hover-scale">
          <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
          بازگشت
        </Button>
        
        <Card variant="glass" className="animate-scale-in">
          <CardHeader className="text-center pb-3">
            <div className="w-18 h-18 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-4 shadow-lg">
              <Mail className="w-9 h-9 text-orange-500" />
            </div>
            <CardTitle className="text-xl">تماس با ما</CardTitle>
            <CardDescription className="text-sm">
              سوال، پیشنهاد یا انتقادی دارید؟ خوشحال می‌شویم از شما بشنویم
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <a 
              href="mailto:siamakflow@gmail.com"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-primary/5 border border-border/30 hover:border-primary/30 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">ایمیل</p>
                <p className="text-sm text-muted-foreground truncate" dir="ltr">siamakflow@gmail.com</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
            
            <div className="bg-gradient-to-br from-muted/30 to-transparent rounded-2xl p-4 text-center border border-border/20">
              <p className="text-sm text-muted-foreground">
                ✨ پاسخگوی شما هستیم. معمولاً ظرف ۲۴ ساعت پاسخ می‌دهیم.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'faq') {
    return (
      <div className="space-y-5 animate-fade-in pb-6">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('main')} className="mb-2 hover-scale">
          <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
          بازگشت
        </Button>
        
        <Card variant="glass" className="animate-scale-in">
          <CardHeader className="text-center pb-3">
            <div className="w-18 h-18 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4 shadow-lg">
              <MessageCircleQuestion className="w-9 h-9 text-violet-500" />
            </div>
            <CardTitle className="text-xl">سوالات متداول</CardTitle>
            <CardDescription className="text-sm">
              پاسخ سوالات رایج کاربران
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-3">
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-muted/30 rounded-xl border border-border/30 overflow-hidden px-0 data-[state=open]:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors text-right text-sm font-medium [&[data-state=open]>svg]:text-primary">
                    <span className="flex-1 text-right leading-relaxed">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        
        <Card variant="glass" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground font-medium">سوال دیگری دارید؟</p>
              <p className="text-xs text-muted-foreground">با ما تماس بگیرید</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setCurrentView('contact')} className="hover-scale">
              تماس
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'کاربر';
  const emailPart = user?.email?.replace('@siaflow.app', '') || '';
  const phone = /^09\d{9}$/.test(emailPart) ? emailPart : '';
  const displayPhone = phone ? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}` : user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

  // Fetch avatar URL from profile
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      if (data?.avatar_url) {
        setAvatarUrl(`${data.avatar_url}?t=${Date.now()}`);
      }
    };
    fetchAvatar();
  }, [user, currentView]);

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <div className="space-y-5 animate-fade-in pb-6">
      {/* User Profile Card - Enhanced with animations */}
      <Card variant="glass" className="overflow-hidden animate-scale-in">
        <div className="relative">
          <div className="h-24 gradient-primary opacity-90 relative overflow-hidden">
            {/* Decorative animated elements */}
            <div className="absolute inset-0">
              <div className="absolute top-2 left-6 w-12 h-12 rounded-full bg-white/10 blur-xl animate-pulse" />
              <div className="absolute bottom-2 right-10 w-8 h-8 rounded-full bg-white/15 blur-lg" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary flex items-center justify-center text-xl sm:text-2xl font-bold text-primary-foreground border-4 border-background shadow-xl transform hover:scale-105 transition-transform duration-300 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-5 pt-12 sm:pt-14 text-center">
          <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
          <p className="text-sm text-muted-foreground mt-1" dir="ltr">{displayPhone}</p>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-sm hover-scale"
              onClick={() => setCurrentView('profile')}
            >
              <User className="w-4 h-4 ml-2" />
              ویرایش
            </Button>
            
            {isAdmin && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover-scale"
                onClick={() => navigate('/admin')}
              >
                <ShieldCheck className="w-4 h-4 ml-2" />
                مدیریت
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups - Enhanced with staggered animations */}
      {settingsGroups.map((group, groupIndex) => (
        <div 
          key={group.title} 
          className="space-y-2 animate-fade-in"
          style={{ animationDelay: `${groupIndex * 0.1}s` }}
        >
          <h3 className="text-xs font-semibold text-muted-foreground px-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            {group.title}
          </h3>
          <Card variant="glass" className="overflow-hidden">
            <CardContent className="p-0 divide-y divide-border/30">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isTheme = item.action === 'theme';

                if (isTheme) {
                  return (
                    <Sheet key={item.action}>
                      <SheetTrigger asChild>
                        <button
                          className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 active:bg-accent/70 transition-all duration-200 group"
                        >
                          <div className="p-2.5 rounded-xl bg-purple-500/10 shrink-0 group-hover:scale-110 transition-transform">
                            <ThemeIcon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div className="flex-1 text-right min-w-0">
                            <span className="font-medium text-foreground text-sm block">{item.label}</span>
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          </div>
                          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                            {theme === 'dark' ? 'تاریک' : theme === 'light' ? 'روشن' : 'سیستم'}
                          </span>
                          <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-auto rounded-t-3xl">
                        <SheetHeader className="text-right pb-2">
                          <SheetTitle className="text-xl flex items-center gap-2">
                            <Palette className="w-5 h-5 text-purple-500" />
                            انتخاب تم
                          </SheetTitle>
                          <SheetDescription>
                            تم مورد نظر خود را انتخاب کنید
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4 space-y-3 pb-6">
                          {[
                            { value: 'light', label: 'حالت روشن', desc: 'پس‌زمینه روشن و متن تیره', icon: Sun, bg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
                            { value: 'dark', label: 'حالت تاریک', desc: 'پس‌زمینه تیره و متن روشن', icon: Moon, bg: 'bg-slate-800 dark:bg-slate-700', iconColor: 'text-slate-200' },
                            { value: 'system', label: 'سیستم', desc: 'مطابق با تنظیمات دستگاه', icon: Monitor, bg: 'bg-gradient-to-br from-amber-100 to-slate-800', iconColor: 'text-foreground' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setTheme(option.value as any);
                                toast.success(`${option.label} فعال شد`);
                              }}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover-scale ${
                                theme === option.value 
                                  ? 'bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10' 
                                  : 'bg-muted/50 hover:bg-accent border-2 border-transparent'
                              }`}
                            >
                              <div className={`p-3 rounded-xl ${option.bg}`}>
                                <option.icon className={`w-6 h-6 ${option.iconColor}`} />
                              </div>
                              <div className="flex-1 text-right">
                                <p className="font-semibold text-foreground">{option.label}</p>
                                <p className="text-sm text-muted-foreground">{option.desc}</p>
                              </div>
                              {theme === option.value && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  );
                }

                const bgColorClass = item.color?.replace('text-', 'bg-').replace('-500', '-500/10') || 'bg-muted';

                return (
                  <button
                    key={item.action}
                    className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 active:bg-accent/70 transition-all duration-200 group"
                    onClick={() => {
                      if (!item.toggle) handleAction(item.action);
                    }}
                  >
                    <div className={`p-2.5 rounded-xl ${bgColorClass} shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${item.color || 'text-foreground'}`} />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <span className="font-medium text-foreground text-sm block">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    {item.toggle ? (
                      <Switch
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    ) : (
                      <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Danger Zone - Enhanced */}
      <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-xs font-semibold text-destructive/80 px-1 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-gradient-to-b from-destructive to-destructive/50" />
          منطقه خطر
        </h3>
        <Card variant="glass" className="border-destructive/20 overflow-hidden">
          <CardContent className="p-0">
            <button
              className="w-full flex items-center gap-3 p-4 hover:bg-destructive/5 active:bg-destructive/10 transition-all duration-200 group"
              onClick={() => setShowDeleteDialog(true)}
            >
              <div className="p-2.5 rounded-xl bg-destructive/10 shrink-0 group-hover:scale-110 transition-transform">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 text-right">
                <span className="font-medium text-destructive text-sm block">
                  حذف حساب کاربری
                </span>
                <span className="text-xs text-muted-foreground">
                  تمام داده‌های شما برای همیشه پاک می‌شود
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 text-destructive/50 group-hover:text-destructive transition-colors" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Logout - Enhanced */}
      <Button 
        variant="outline" 
        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all duration-200 hover-scale"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 ml-2" />
        خروج از حساب
      </Button>

      {/* Version - Enhanced */}
      <div className="text-center space-y-1 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <p className="text-xs text-muted-foreground/60">
          SiaFlow نسخه ۲.۰.۰
        </p>
        <p className="text-[10px] text-muted-foreground/40">
          ساخته شده با ❤️ در ایران
        </p>
      </div>

      {/* Delete Account Dialog - Enhanced */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 animate-scale-in">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-xl text-destructive">حذف حساب کاربری</DialogTitle>
            <DialogDescription className="text-center">
              آیا مطمئن هستید؟ این عمل غیرقابل بازگشت است و تمام داده‌های شما شامل:
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/5 rounded-xl p-4 space-y-2 text-sm">
            {['تمام تراکنش‌ها', 'دسته‌بندی‌ها و بودجه‌ها', 'اهداف پس‌انداز', 'اطلاعات پروفایل'].map((item) => (
              <p key={item} className="flex items-center gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                {item}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deleteConfirm" className="text-sm">
              برای تأیید، عبارت <span className="font-bold text-destructive">"حذف حساب"</span> را تایپ کنید:
            </Label>
            <Input
              id="deleteConfirm"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="حذف حساب"
              className="text-center"
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              variant="destructive"
              className="w-full hover-scale"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmation !== 'حذف حساب'}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Trash2 className="w-4 h-4 ml-2" />
              )}
              بله، حساب را حذف کن
            </Button>
            <Button
              variant="outline"
              className="w-full"
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
