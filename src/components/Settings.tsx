import { 
  User, Bell, Shield, Palette, Download, 
  HelpCircle, LogOut, ChevronLeft, Moon, Sun, FolderOpen 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
      { icon: Palette, label: 'حالت شب', action: 'theme', toggle: true },
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

export function Settings({ onOpenCategories }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const prefersDark = document.documentElement.classList.contains('dark');
    setIsDark(prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    toast.success(isDark ? 'حالت روز فعال شد' : 'حالت شب فعال شد');
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'backup':
        toast.success('پشتیبان‌گیری انجام شد');
        break;
      case 'categories':
        onOpenCategories?.();
        break;
      case 'help':
        toast.info('راهنما به زودی اضافه می‌شود');
        break;
      default:
        toast.info('این بخش به زودی فعال می‌شود');
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

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'کاربر';
  const email = user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

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
            <Button variant="outline" size="sm" className="shrink-0 text-xs sm:text-sm">
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

                return (
                  <button
                    key={item.action}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      if (isTheme) toggleTheme();
                      else if (!item.toggle) handleAction(item.action);
                    }}
                  >
                    <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                      {isTheme ? (
                        isDark ? <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                      )}
                    </div>
                    <span className="flex-1 text-right font-medium text-foreground text-sm sm:text-base">
                      {item.label}
                    </span>
                    {item.toggle ? (
                      <Switch
                        checked={isTheme ? isDark : notifications}
                        onCheckedChange={isTheme ? toggleTheme : setNotifications}
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
        نسخه ۱.۲.۰ - تقویم شمسی و دسته‌بندی جامع
      </p>
    </div>
  );
}
