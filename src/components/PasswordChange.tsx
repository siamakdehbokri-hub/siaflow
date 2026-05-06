import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PasswordChangeProps {
  onBack: () => void;
}

export function PasswordChange({ onBack }: PasswordChangeProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('حداقل ۸ کاراکتر');
    if (!/[A-Z]/.test(password)) errors.push('یک حرف بزرگ انگلیسی');
    if (!/[a-z]/.test(password)) errors.push('یک حرف کوچک انگلیسی');
    if (!/[0-9]/.test(password)) errors.push('یک عدد');
    return errors;
  };

  const passwordErrors = validatePassword(newPassword);
  const isPasswordValid = passwordErrors.length === 0;
  const doPasswordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error('رمز عبور جدید معتبر نیست');
      return;
    }

    if (!doPasswordsMatch) {
      toast.error('رمزهای عبور مطابقت ندارند');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.includes('same_password')) {
          toast.error('رمز عبور جدید نمی‌تواند با رمز قبلی یکسان باشد');
        } else {
          toast.error('خطا در تغییر رمز عبور: ' + error.message);
        }
      } else {
        toast.success('رمز عبور با موفقیت تغییر کرد');
        onBack();
      }
    } catch (error) {
      toast.error('خطای غیرمنتظره رخ داد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">تغییر رمز عبور</h2>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">رمز عبور جدید</CardTitle>
          <CardDescription>
            رمز عبور جدید باید قوی و منحصر به فرد باشد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">رمز عبور جدید</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10 pl-10"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="space-y-1 text-xs">
                {['حداقل ۸ کاراکتر', 'یک حرف بزرگ انگلیسی', 'یک حرف کوچک انگلیسی', 'یک عدد'].map((req, i) => {
                  const checks = [
                    newPassword.length >= 8,
                    /[A-Z]/.test(newPassword),
                    /[a-z]/.test(newPassword),
                    /[0-9]/.test(newPassword),
                  ];
                  return (
                    <div
                      key={req}
                      className={`flex items-center gap-1.5 ${
                        checks[i] ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      <CheckCircle className={`w-3 h-3 ${checks[i] ? 'opacity-100' : 'opacity-30'}`} />
                      {req}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                />
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="text-xs text-destructive">رمزهای عبور مطابقت ندارند</p>
              )}
              {confirmPassword && doPasswordsMatch && (
                <p className="text-xs text-success">رمزهای عبور مطابقت دارند</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isPasswordValid || !doPasswordsMatch}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'ذخیره رمز عبور جدید'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Note */}
      <Card variant="glass" className="bg-amber-500/10 border-amber-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            پس از تغییر رمز، ممکن است نیاز به ورود مجدد داشته باشید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
