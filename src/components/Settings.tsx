import { useState, useEffect } from 'react';
import { 
  User, Palette, FolderOpen, HelpCircle, LogOut, ChevronLeft, Moon, Sun, Monitor,
  Trash2, AlertTriangle, Loader2, ShieldCheck, Info, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ProfileEdit } from './ProfileEdit';
import { HelpGuide } from './HelpGuide';
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

interface SettingsProps {
  onOpenCategories?: () => void;
}

type SettingsView = 'main' | 'profile' | 'help';

export function Settings({ onOpenCategories }: SettingsProps) {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

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
  if (currentView === 'profile') {
    return <ProfileEdit onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'help') {
    return <HelpGuide onBack={() => setCurrentView('main')} />;
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'کاربر';
  const emailPart = user?.email?.replace('@siaflow.app', '') || '';
  const phone = /^09\d{9}$/.test(emailPart) ? emailPart : '';
  const displayPhone = phone ? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}` : user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const themeLabel = theme === 'dark' ? 'تاریک' : theme === 'light' ? 'روشن' : 'سیستم';

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Profile Card - Clean Blue Style */}
      <div className="bg-card rounded-2xl border-2 border-border overflow-hidden">
        <div className="flex items-center gap-4 p-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground overflow-hidden border-4 border-primary/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate">{displayName}</h3>
            <p className="text-sm text-muted-foreground truncate" dir="ltr">{displayPhone}</p>
          </div>
          
          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-10 px-4 border-2"
            onClick={() => setCurrentView('profile')}
          >
            ویرایش
          </Button>
        </div>
        
        {/* Admin Badge */}
        {isAdmin && (
          <div className="px-4 pb-4">
            <Button
              variant="default"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              onClick={() => navigate('/admin')}
            >
              <ShieldCheck className="w-5 h-5 ml-2" />
              پنل مدیریت
            </Button>
          </div>
        )}
      </div>

      {/* Settings List - Simple Cards */}
      <div className="space-y-2">
        {/* Theme */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-border hover:border-primary/30 active:bg-muted/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <ThemeIcon className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-semibold text-foreground">تم برنامه</p>
                <p className="text-sm text-muted-foreground">{themeLabel}</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-3xl">
            <SheetHeader className="text-right pb-4">
              <SheetTitle className="text-xl flex items-center gap-2">
                <Palette className="w-6 h-6 text-purple-500" />
                انتخاب تم
              </SheetTitle>
              <SheetDescription>تم مورد نظر خود را انتخاب کنید</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 pb-8">
              {[
                { value: 'light', label: 'حالت روشن', icon: Sun, bg: 'bg-amber-100', iconColor: 'text-amber-600' },
                { value: 'dark', label: 'حالت تاریک', icon: Moon, bg: 'bg-slate-700', iconColor: 'text-slate-200' },
                { value: 'system', label: 'سیستم', icon: Monitor, bg: 'bg-gradient-to-br from-amber-100 to-slate-700', iconColor: 'text-foreground' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value as any);
                    toast.success(`${option.label} فعال شد`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2",
                    theme === option.value 
                      ? "bg-primary/5 border-primary" 
                      : "bg-muted/30 border-transparent hover:border-border"
                  )}
                >
                  <div className={cn("p-3 rounded-xl", option.bg)}>
                    <option.icon className={cn("w-6 h-6", option.iconColor)} />
                  </div>
                  <p className="font-semibold text-foreground flex-1 text-right">{option.label}</p>
                  {theme === option.value && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Categories */}
        <button 
          onClick={() => onOpenCategories?.()}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-border hover:border-primary/30 active:bg-muted/50 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="flex-1 text-right">
            <p className="font-semibold text-foreground">دسته‌بندی‌ها</p>
            <p className="text-sm text-muted-foreground">مدیریت دسته‌های هزینه و درآمد</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Help */}
        <button 
          onClick={() => setCurrentView('help')}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-border hover:border-primary/30 active:bg-muted/50 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="flex-1 text-right">
            <p className="font-semibold text-foreground">راهنما</p>
            <p className="text-sm text-muted-foreground">آموزش کار با اپلیکیشن</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* About & Contact */}
      <div className="bg-card rounded-xl border-2 border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground">درباره ما</p>
            <p className="text-sm text-muted-foreground">طراحی و توسعه توسط Siamak.D</p>
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">ارتباط با ما</p>
              <p className="text-sm text-muted-foreground" dir="ltr">siamakflow@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <Button 
        variant="outline" 
        className="w-full h-14 rounded-xl border-2 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 ml-2" />
        خروج از حساب
      </Button>

      {/* Danger Zone */}
      <details className="group">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center justify-center gap-1 py-2">
          <span>گزینه‌های پیشرفته</span>
          <ChevronLeft className="w-3 h-3 rotate-90 group-open:-rotate-90 transition-transform" />
        </summary>
        <div className="mt-3">
          <Button
            variant="ghost"
            className="w-full h-12 text-destructive/70 hover:text-destructive hover:bg-destructive/5"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-5 h-5 ml-2" />
            حذف حساب کاربری
          </Button>
        </div>
      </details>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground/60">
        SiaFlow نسخه ۲.۰.۰
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