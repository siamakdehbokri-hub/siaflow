import { useState } from 'react';
import { ArrowRight, Lock, Shield, Key, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PasswordChange } from './PasswordChange';

interface SecuritySettingsProps {
  onBack: () => void;
}

type SecurityView = 'main' | 'password';

export function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const [currentView, setCurrentView] = useState<SecurityView>('main');
  const [resetEmail, setResetEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const { user } = useAuth();

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error('لطفاً ایمیل خود را وارد کنید');
      return;
    }

    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast.error('خطا در ارسال ایمیل: ' + error.message);
      } else {
        toast.success('لینک بازنشانی به ایمیل شما ارسال شد');
        setResetEmail('');
      }
    } catch (error) {
      toast.error('خطای غیرمنتظره رخ داد');
    } finally {
      setSendingReset(false);
    }
  };

  if (currentView === 'password') {
    return <PasswordChange onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">تنظیمات امنیتی</h2>
      </div>

      {/* Password Section */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            رمز عبور
          </CardTitle>
          <CardDescription>
            رمز عبور خود را تغییر دهید یا بازنشانی کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setCurrentView('password')}
          >
            <Key className="w-4 h-4 ml-2" />
            تغییر رمز عبور
          </Button>

          <div className="border-t border-border pt-3 space-y-2">
            <Label htmlFor="resetEmail" className="text-sm text-muted-foreground">
              بازنشانی رمز عبور از طریق ایمیل
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder={user?.email || 'ایمیل خود را وارد کنید'}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                />
              </div>
              <Button
                variant="secondary"
                onClick={handlePasswordReset}
                disabled={sendingReset}
              >
                {sendingReset ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'ارسال'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Auth (Future) */}
      <Card variant="glass" className="opacity-60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            احراز هویت دو مرحله‌ای
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              به زودی
            </span>
          </CardTitle>
          <CardDescription>
            امنیت حساب را با کد تأیید افزایش دهید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">فعال‌سازی 2FA</span>
            <Switch disabled checked={false} />
          </div>
        </CardContent>
      </Card>

      {/* Data Security Info */}
      <Card variant="glass" className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                داده‌های شما امن هستند
              </p>
              <p className="text-xs text-muted-foreground">
                تمام داده‌ها با رمزگذاری SSL/TLS محافظت می‌شوند و در سرورهای امن ذخیره می‌گردند.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
