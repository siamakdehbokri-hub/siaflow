import { useState } from 'react';
import { 
  User, Bell, Shield, Palette, Download, 
  HelpCircle, LogOut, ChevronLeft, Moon, Sun, Monitor, FolderOpen 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ProfileEdit } from './ProfileEdit';
import { HelpGuide } from './HelpGuide';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const settingsGroups = [
  {
    title: 'حساب کاربری',
    items: [
      { icon: User, label: 'ویرایش پروفایل', action: 'profile' },
      { icon: Bell, label: 'اعلان‌ها', action: 'notifications', toggle: true },
      { icon: Shield, label: 'امنیت', action: 'security' },
    ],
  },
  {
    title: 'تنظیمات',
    items: [
      { icon: Palette, label: 'تم برنامه', action: 'theme' },
      { icon: FolderOpen, label: 'دسته‌بندی‌ها', action: 'categories' },
      { icon: Download, label: 'پشتیبان‌گیری', action: 'backup' },
    ],
  },
  {
    title: 'پشتیبانی',
    items: [
      { icon: HelpCircle, label: 'راهنما', action: 'help' },
    ],
  },
];

interface SettingsProps {
  onOpenCategories?: () => void;
}

type SettingsView = 'main' | 'profile' | 'help';

export function Settings({ onOpenCategories }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [currentView, setCurrentView] = useState<SettingsView>('main');
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
      case 'backup':
        toast.success('پشتیبان‌گیری انجام شد');
        break;
      case 'categories':
        onOpenCategories?.();
        break;
      case 'security':
        toast.info('تنظیمات امنیتی به زودی اضافه می‌شود');
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

  // Sub-views
  if (currentView === 'profile') {
    return <ProfileEdit onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'help') {
    return <HelpGuide onBack={() => setCurrentView('main')} />;
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'کاربر';
  const email = user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* User Profile */}
      <Card variant="glass">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full gradient-primary flex items-center justify-center text-xl sm:text-2xl font-bold text-primary-foreground shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{displayName}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate" dir="ltr">{email}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0 text-xs sm:text-sm"
              onClick={() => setCurrentView('profile')}
            >
              ویرایش
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground px-1">
            {group.title}
          </h3>
          <Card variant="glass">
            <CardContent className="p-0 divide-y divide-border">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isTheme = item.action === 'theme';
                const isNotification = item.action === 'notifications';

                if (isTheme) {
                  return (
                    <Sheet key={item.action}>
                      <SheetTrigger asChild>
                        <button
                          className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                            <ThemeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                          </div>
                          <span className="flex-1 text-right font-medium text-foreground text-sm sm:text-base">
                            {item.label}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {theme === 'dark' ? 'تاریک' : theme === 'light' ? 'روشن' : 'سیستم'}
                          </span>
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-auto">
                        <SheetHeader className="text-right">
                          <SheetTitle>انتخاب تم</SheetTitle>
                          <SheetDescription>
                            تم مورد نظر خود را انتخاب کنید
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-2">
                          <button
                            onClick={() => {
                              setTheme('light');
                              toast.success('حالت روشن فعال شد');
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                              theme === 'light' ? 'bg-primary/10 border-2 border-primary' : 'bg-muted hover:bg-accent'
                            }`}
                          >
                            <div className="p-3 rounded-full bg-amber-100">
                              <Sun className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-foreground">حالت روشن</p>
                              <p className="text-sm text-muted-foreground">پس‌زمینه روشن و متن تیره</p>
                            </div>
                            {theme === 'light' && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setTheme('dark');
                              toast.success('حالت تاریک فعال شد');
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                              theme === 'dark' ? 'bg-primary/10 border-2 border-primary' : 'bg-muted hover:bg-accent'
                            }`}
                          >
                            <div className="p-3 rounded-full bg-slate-800">
                              <Moon className="w-6 h-6 text-slate-200" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-foreground">حالت تاریک</p>
                              <p className="text-sm text-muted-foreground">پس‌زمینه تیره و متن روشن</p>
                            </div>
                            {theme === 'dark' && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setTheme('system');
                              toast.success('تم سیستم فعال شد');
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                              theme === 'system' ? 'bg-primary/10 border-2 border-primary' : 'bg-muted hover:bg-accent'
                            }`}
                          >
                            <div className="p-3 rounded-full bg-gradient-to-br from-amber-100 to-slate-800">
                              <Monitor className="w-6 h-6 text-foreground" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-foreground">سیستم</p>
                              <p className="text-sm text-muted-foreground">مطابق با تنظیمات دستگاه</p>
                            </div>
                            {theme === 'system' && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                              </div>
                            )}
                          </button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  );
                }

                return (
                  <button
                    key={item.action}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      if (!item.toggle) handleAction(item.action);
                    }}
                  >
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
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

      {/* Logout */}
      <Button 
        variant="outline" 
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-sm sm:text-base"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 ml-2" />
        خروج از حساب
      </Button>

      {/* Version */}
      <p className="text-center text-[10px] sm:text-xs text-muted-foreground">
        نسخه ۱.۵.۱ - فونت ایران‌سنس و حالت روشن/تاریک
      </p>
    </div>
  );
}
