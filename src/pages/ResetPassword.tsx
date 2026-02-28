import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    } else {
      // No recovery token, redirect to auth
      toast.error('لینک بازیابی نامعتبر است');
      navigate('/auth');
    }
  }, [navigate]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('حداقل ۸ کاراکتر');
    if (!/[A-Z]/.test(password)) errors.push('یک حرف بزرگ انگلیسی');
    if (!/[a-z]/.test(password)) errors.push('یک حرف کوچک انگلیسی');
    if (!/[0-9]/.test(password)) errors.push('یک عدد');
    return errors;
  };

  const passwordErrors = validatePassword(password);
  const isPasswordValid = passwordErrors.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('رمز عبور معتبر نیست');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error('خطا در تغییر رمز عبور: ' + error.message);
      } else {
        toast.success('رمز عبور با موفقیت تغییر کرد!');
        navigate('/');
      }
    } catch {
      toast.error('خطای غیرمنتظره رخ داد');
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground pt-safe">
        <div className="px-6 py-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">تغییر رمز عبور</h1>
          <p className="text-primary-foreground/80 mt-1">رمز عبور جدید خود را وارد کنید</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 -mt-4 bg-card rounded-t-3xl px-6 py-8">
        <div className="max-w-sm mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">رمز عبور جدید</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11 pl-11 h-12 rounded-xl border-2 border-border focus:border-primary"
                  required
                  minLength={8}
                  dir="ltr"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password requirements */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { label: 'حداقل ۸ کاراکتر', valid: password.length >= 8 },
                  { label: 'حرف بزرگ', valid: /[A-Z]/.test(password) },
                  { label: 'حرف کوچک', valid: /[a-z]/.test(password) },
                  { label: 'عدد', valid: /[0-9]/.test(password) },
                ].map((req) => (
                  <div
                    key={req.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs py-1.5 px-2 rounded-lg",
                      req.valid ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 rounded-full flex items-center justify-center",
                      req.valid ? "bg-success" : "bg-muted-foreground/30"
                    )}>
                      {req.valid && <CheckCircle className="w-2 h-2 text-white" />}
                    </div>
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">تکرار رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "pr-11 h-12 rounded-xl border-2 border-border focus:border-primary",
                    confirmPassword && password === confirmPassword && "pl-11"
                  )}
                  required
                  dir="ltr"
                  autoComplete="new-password"
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl font-bold text-base"
              disabled={loading || !isPasswordValid || password !== confirmPassword}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'تغییر رمز عبور'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
