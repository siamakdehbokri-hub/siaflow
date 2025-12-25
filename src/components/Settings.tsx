import { 
  User, Bell, Shield, Palette, Download, 
  HelpCircle, LogOut, ChevronLeft, Moon, Sun 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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

export function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check system preference and set initial theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* User Profile */}
      <Card variant="glass">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              ک
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">کاربر مهمان</h3>
              <p className="text-sm text-muted-foreground">guest@example.com</p>
            </div>
            <Button variant="outline" size="sm">
              ویرایش
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">
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
                    className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      if (isTheme) toggleTheme();
                    }}
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      {isTheme ? (
                        isDark ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />
                      ) : (
                        <Icon className="w-5 h-5 text-foreground" />
                      )}
                    </div>
                    <span className="flex-1 text-right font-medium text-foreground">
                      {item.label}
                    </span>
                    {item.toggle ? (
                      <Switch
                        checked={isTheme ? isDark : notifications}
                        onCheckedChange={isTheme ? toggleTheme : setNotifications}
                      />
                    ) : (
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Logout */}
      <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
        <LogOut className="w-4 h-4 ml-2" />
        خروج از حساب
      </Button>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        نسخه ۱.۰.۰
      </p>
    </div>
  );
}
