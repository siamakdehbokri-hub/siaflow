import { useState } from 'react';
import { 
  User, Bell, Shield, Palette, Download, 
  HelpCircle, LogOut, ChevronLeft, Moon, Sun, Monitor, FolderOpen,
  Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
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

const settingsGroups = [
  {
    title: 'حساب کاربری',
    items: [
      { icon: User, label: 'ویرایش پروفایل', action: 'profile', color: 'text-blue-500' },
      { icon: Bell, label: 'اعلان‌ها', action: 'notifications', toggle: true, color: 'text-amber-500' },
      { icon: Shield, label: 'امنیت و رمز عبور', action: 'security', color: 'text-emerald-500' },
    ],
  },
  {
    title: 'تنظیمات',
    items: [
      { icon: Palette, label: 'تم برنامه', action: 'theme', color: 'text-purple-500' },
      { icon: FolderOpen, label: 'دسته‌بندی‌ها', action: 'categories', color: 'text-cyan-500' },
      { icon: Download, label: 'پشتیبان‌گیری', action: 'backup', color: 'text-teal-500' },
    ],
  },
  {
    title: 'پشتیبانی',
    items: [
      { icon: HelpCircle, label: 'راهنما', action: 'help', color: 'text-indigo-500' },
    ],
  },
];

interface SettingsProps {
  onOpenCategories?: () => void;
}

type SettingsView = 'main' | 'profile' | 'help' | 'security';

export function Settings({ onOpenCategories }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { user, signOut } = useAuth();
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
      navigate('/auth');
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
      // Delete user avatar if exists
      const { data: avatarList } = await supabase.storage
        .from('avatars')
        .list(user.id);
      
      if (avatarList && avatarList.length > 0) {
        const filesToDelete = avatarList.map(file => `${user.id}/${file.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Call edge function to delete user completely from server
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'خطا در حذف حساب');
      }
      
      toast.success('حساب شما با موفقیت و به طور کامل از سرور حذف شد');
      navigate('/auth');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('خطا در حذف حساب. لطفاً دوباره تلاش کنید.');
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

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'کاربر';
  const email = user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <div className="space-y-5 animate-fade-in pb-6">
      {/* User Profile Card - Enhanced */}
      <Card variant="glass" className="overflow-hidden">
        <div className="h-16 sm:h-20 gradient-primary opacity-80" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
            <div className="-mt-10 sm:-mt-12 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl gradient-primary flex items-center justify-center text-xl sm:text-3xl font-bold text-primary-foreground shrink-0 border-4 border-background shadow-lg self-center sm:self-auto">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-right sm:pb-1">
              <h3 className="text-base sm:text-xl font-bold text-foreground truncate">{displayName}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate" dir="ltr">{email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 text-sm"
            onClick={() => setCurrentView('profile')}
          >
            <User className="w-4 h-4 ml-2" />
            ویرایش پروفایل
          </Button>
        </CardContent>
      </Card>

      {/* Settings Groups - Enhanced */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground px-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-primary" />
            {group.title}
          </h3>
          <Card variant="glass">
            <CardContent className="p-0 divide-y divide-border/50">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isTheme = item.action === 'theme';
                const isNotification = item.action === 'notifications';

                if (isTheme) {
                  return (
                    <Sheet key={item.action}>
                      <SheetTrigger asChild>
                        <button
                          className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 hover:bg-accent/50 transition-all duration-200"
                        >
                          <div className={`p-2.5 rounded-xl bg-purple-500/10 shrink-0`}>
                            <ThemeIcon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <span className="flex-1 text-right font-medium text-foreground text-sm sm:text-base">
                            {item.label}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2 bg-muted px-2 py-1 rounded-full">
                            {theme === 'dark' ? 'تاریک' : theme === 'light' ? 'روشن' : 'سیستم'}
                          </span>
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-auto rounded-t-3xl">
                        <SheetHeader className="text-right pb-2">
                          <SheetTitle className="text-xl">انتخاب تم</SheetTitle>
                          <SheetDescription>
                            تم مورد نظر خود را انتخاب کنید
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4 space-y-3">
                          <button
                            onClick={() => {
                              setTheme('light');
                              toast.success('حالت روشن فعال شد');
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                              theme === 'light' 
                                ? 'bg-primary/10 border-2 border-primary shadow-sm' 
                                : 'bg-muted/50 hover:bg-accent border-2 border-transparent'
                            }`}
                          >
                            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                              <Sun className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-foreground">حالت روشن</p>
                              <p className="text-sm text-muted-foreground">پس‌زمینه روشن و متن تیره</p>
                            </div>
                            {theme === 'light' && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setTheme('dark');
                              toast.success('حالت تاریک فعال شد');
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                              theme === 'dark' 
                                ? 'bg-primary/10 border-2 border-primary shadow-sm' 
                                : 'bg-muted/50 hover:bg-accent border-2 border-transparent'
                            }`}
                          >
                            <div className="p-3 rounded-xl bg-slate-800 dark:bg-slate-700">
                              <Moon className="w-6 h-6 text-slate-200" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-foreground">حالت تاریک</p>
                              <p className="text-sm text-muted-foreground">پس‌زمینه تیره و متن روشن</p>
                            </div>
                            {theme === 'dark' && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setTheme('system');
                              toast.success('تم سیستم فعال شد');
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                              theme === 'system' 
                                ? 'bg-primary/10 border-2 border-primary shadow-sm' 
                                : 'bg-muted/50 hover:bg-accent border-2 border-transparent'
                            }`}
                          >
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-slate-800">
                              <Monitor className="w-6 h-6 text-foreground" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-foreground">سیستم</p>
                              <p className="text-sm text-muted-foreground">مطابق با تنظیمات دستگاه</p>
                            </div>
                            {theme === 'system' && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                              </div>
                            )}
                          </button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  );
                }

                const bgColorClass = item.color?.replace('text-', 'bg-').replace('-500', '-500/10') || 'bg-muted';

                return (
                  <button
                    key={item.action}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 hover:bg-accent/50 transition-all duration-200"
                    onClick={() => {
                      if (!item.toggle) handleAction(item.action);
                    }}
                  >
                    <div className={`p-2.5 rounded-xl ${bgColorClass} shrink-0`}>
                      <Icon className={`w-5 h-5 ${item.color || 'text-foreground'}`} />
                    </div>
                    <span className="flex-1 text-right font-medium text-foreground text-sm sm:text-base">
                      {item.label}
                    </span>
                    {item.toggle ? (
                      <Switch
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    ) : (
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Danger Zone */}
      <div className="space-y-2">
        <h3 className="text-xs sm:text-sm font-semibold text-destructive/80 px-1 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-destructive" />
          منطقه خطر
        </h3>
        <Card variant="glass" className="border-destructive/20">
          <CardContent className="p-0">
            <button
              className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 hover:bg-destructive/5 transition-all duration-200"
              onClick={() => setShowDeleteDialog(true)}
            >
              <div className="p-2.5 rounded-xl bg-destructive/10 shrink-0">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 text-right">
                <span className="font-medium text-destructive text-sm sm:text-base block">
                  حذف حساب کاربری
                </span>
                <span className="text-xs text-muted-foreground">
                  تمام داده‌های شما برای همیشه پاک می‌شود
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-destructive/50" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <Button 
        variant="outline" 
        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 text-sm sm:text-base transition-all duration-200"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 ml-2" />
        خروج از حساب
      </Button>

      {/* Version */}
      <p className="text-center text-[10px] sm:text-xs text-muted-foreground/60">
        SiaFlow نسخه ۱.۸.۰ - سیستم بدهی‌ها و بهبود گزارشات
      </p>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-xl text-destructive">حذف حساب کاربری</DialogTitle>
            <DialogDescription className="text-center">
              آیا مطمئن هستید؟ این عمل غیرقابل بازگشت است و تمام داده‌های شما شامل:
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/5 rounded-xl p-4 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              تمام تراکنش‌ها
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              دسته‌بندی‌ها و بودجه‌ها
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              اهداف پس‌انداز
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              اطلاعات پروفایل
            </p>
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
              className="w-full"
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