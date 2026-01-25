import { useState, useEffect } from 'react';
import { 
  User, Palette, FolderOpen, HelpCircle, LogOut, ChevronLeft, Moon, Sun, Monitor,
  Trash2, AlertTriangle, Loader2, ShieldCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  // 5 Simple settings items
  const settingsItems = [
    { icon: User, label: 'ویرایش پروفایل', action: () => setCurrentView('profile'), color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { icon: Palette, label: 'تم برنامه', action: 'theme', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { icon: FolderOpen, label: 'دسته‌بندی‌ها', action: () => onOpenCategories?.(), color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
    { icon: HelpCircle, label: 'راهنما', action: () => setCurrentView('help'), color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-6">
      {/* User Profile Card */}
      <Card variant="glass" className="overflow-hidden">
        <div className="relative">
          <div className="h-20 gradient-primary opacity-90" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground border-4 border-background shadow-xl overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-5 pt-12 text-center">
          <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
          <p className="text-sm text-muted-foreground mt-1" dir="ltr">{displayPhone}</p>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-sm"
              onClick={() => setCurrentView('profile')}
            >
              <User className="w-4 h-4 ml-2" />
              ویرایش
            </Button>
            
            {isAdmin && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={() => navigate('/admin')}
              >
                <ShieldCheck className="w-4 h-4 ml-2" />
                مدیریت
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simple Settings List - 5 Items Only */}
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-0 divide-y divide-border/30">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isTheme = item.action === 'theme';

            if (isTheme) {
              return (
                <Sheet key="theme">
                  <SheetTrigger asChild>
                    <button className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-all group">
                      <div className={cn("p-2.5 rounded-xl shrink-0", item.bgColor)}>
                        <ThemeIcon className={cn("w-5 h-5", item.color)} />
                      </div>
                      <span className="flex-1 text-right font-medium text-foreground text-sm">{item.label}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {theme === 'dark' ? 'تاریک' : theme === 'light' ? 'روشن' : 'سیستم'}
                      </span>
                      <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto rounded-t-3xl">
                    <SheetHeader className="text-right pb-2">
                      <SheetTitle className="text-xl flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-500" />
                        انتخاب تم
                      </SheetTitle>
                      <SheetDescription>تم مورد نظر خود را انتخاب کنید</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-3 pb-6">
                      {[
                        { value: 'light', label: 'حالت روشن', icon: Sun, bg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
                        { value: 'dark', label: 'حالت تاریک', icon: Moon, bg: 'bg-slate-800 dark:bg-slate-700', iconColor: 'text-slate-200' },
                        { value: 'system', label: 'سیستم', icon: Monitor, bg: 'bg-gradient-to-br from-amber-100 to-slate-800', iconColor: 'text-foreground' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value as any);
                            toast.success(`${option.label} فعال شد`);
                          }}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                            theme === option.value 
                              ? "bg-primary/10 border-2 border-primary shadow-lg" 
                              : "bg-muted/50 hover:bg-accent border-2 border-transparent"
                          )}
                        >
                          <div className={cn("p-3 rounded-xl", option.bg)}>
                            <option.icon className={cn("w-6 h-6", option.iconColor)} />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="font-semibold text-foreground">{option.label}</p>
                          </div>
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
              );
            }

            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-all group"
                onClick={typeof item.action === 'function' ? item.action : undefined}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0", item.bgColor)}>
                  <Icon className={cn("w-5 h-5", item.color)} />
                </div>
                <span className="flex-1 text-right font-medium text-foreground text-sm">{item.label}</span>
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button 
        variant="outline" 
        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 ml-2" />
        خروج از حساب
      </Button>

      {/* Danger Zone - Collapsible */}
      <details className="group">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center justify-center gap-1">
          <span>گزینه‌های پیشرفته</span>
          <ChevronLeft className="w-3 h-3 rotate-90 group-open:-rotate-90 transition-transform" />
        </summary>
        <div className="mt-3">
          <Button
            variant="ghost"
            className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/5"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 ml-2" />
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
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <DialogTitle className="text-lg text-destructive">حذف حساب کاربری</DialogTitle>
            <DialogDescription className="text-center text-sm">
              این عمل غیرقابل بازگشت است. تمام داده‌های شما حذف خواهد شد.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="deleteConfirm" className="text-sm">
              عبارت <span className="font-bold text-destructive">"حذف حساب"</span> را تایپ کنید:
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
              className="w-full"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmation !== 'حذف حساب'}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Trash2 className="w-4 h-4 ml-2" />}
              حذف
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
