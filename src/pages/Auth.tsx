import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, User, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AuthMethod = 'phone' | 'email';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  };

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return /^09\d{9}$/.test(digits);
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('حداقل ۸ کاراکتر');
    if (!/[A-Z]/.test(password)) errors.push('یک حرف بزرگ انگلیسی');
    if (!/[a-z]/.test(password)) errors.push('یک حرف کوچک انگلیسی');
    if (!/[0-9]/.test(password)) errors.push('یک عدد');
    return errors;
  };

  const passwordErrors = !isLogin ? validatePassword(password) : [];
  const isPasswordValid = passwordErrors.length === 0;
  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = validatePhone(phoneDigits);
  const isEmailValid = validateEmail(email);
  const isInputValid = authMethod === 'phone' ? isPhoneValid : isEmailValid;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isInputValid) {
      toast.error(authMethod === 'phone' 
        ? 'لطفاً شماره موبایل معتبر وارد کنید'
        : 'لطفاً ایمیل معتبر وارد کنید'
      );
      return;
    }

    setLoading(true);
    
    const authEmail = authMethod === 'email' 
      ? email.trim().toLowerCase()
      : `${phoneDigits}@siaflow.app`;

    try {
      if (isLogin) {
        const { error } = await signIn(authEmail, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(authMethod === 'phone' 
              ? 'شماره موبایل یا رمز عبور اشتباه است'
              : 'ایمیل یا رمز عبور اشتباه است'
            );
          } else {
            toast.error('خطا در ورود: ' + error.message);
          }
        } else {
          toast.success('خوش آمدید!');
          navigate('/');
        }
      } else {
        if (!isPasswordValid) {
          toast.error('رمز عبور باید شامل ' + passwordErrors.join('، ') + ' باشد');
          setLoading(false);
          return;
        }

        if (!displayName.trim()) {
          toast.error('لطفاً نام خود را وارد کنید');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(
          authEmail, 
          password, 
          displayName, 
          authMethod === 'phone' ? phoneDigits : undefined
        );
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error(authMethod === 'phone' 
              ? 'این شماره موبایل قبلاً ثبت شده است'
              : 'این ایمیل قبلاً ثبت شده است'
            );
          } else {
            toast.error('خطا در ثبت‌نام: ' + error.message);
          }
        } else {
          toast.success('حساب شما با موفقیت ایجاد شد!');
          navigate('/');
        }
      }
    } catch (error: any) {
      toast.error('خطای غیرمنتظره رخ داد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ambient glow blobs — matches app aesthetic */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl" style={{ background: 'var(--blob-purple)' }} />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-64 h-64 rounded-full blur-3xl" style={{ background: 'var(--blob-teal)' }} />

      {/* Header */}
      <div className="relative pt-safe">
        <div className="px-6 pt-10 pb-6 text-center">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-3xl font-black text-primary-foreground">SF</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">SiaFlow</h1>
          <p className="text-muted-foreground mt-1 text-sm">مدیریت مالی هوشمند</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="relative flex-1 px-5 pb-8">
        <div className="max-w-sm mx-auto glass-heavy rounded-2xl p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {isLogin ? 'ورود به حساب' : 'ایجاد حساب جدید'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? 'خوش برگشتید! وارد شوید' : 'برای شروع ثبت‌نام کنید'}
            </p>
          </div>

          {/* Auth Method Tabs */}
          <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as AuthMethod)} className="mb-6">
            <TabsList className="grid grid-cols-2 w-full h-12 bg-muted/60 rounded-xl p-1">
              <TabsTrigger 
                value="phone" 
                className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Phone className="w-4 h-4" />
                موبایل
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Mail className="w-4 h-4" />
                ایمیل
              </TabsTrigger>
            </TabsList>
            <TabsContent value="phone" className="sr-only" />
            <TabsContent value="email" className="sr-only" />
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name - Signup only */}
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">نام نمایشی</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="نام شما"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pr-11 h-12 rounded-xl bg-muted/40 border border-border focus:border-primary"
                    required={!isLogin}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Phone Input */}
            {authMethod === 'phone' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">شماره موبایل</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                    value={formatPhoneDisplay(phone)}
                    onChange={handlePhoneChange}
                    className={cn(
                      "pr-11 h-12 rounded-xl bg-muted/40 border border-border focus:border-primary tracking-wide",
                      phone.length > 0 && isPhoneValid && "pl-11"
                    )}
                    required={authMethod === 'phone'}
                    dir="ltr"
                    autoComplete="tel"
                  />
                  {phone.length > 0 && isPhoneValid && (
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                  )}
                </div>
              </div>
            )}

            {/* Email Input */}
            {authMethod === 'email' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">ایمیل</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "pr-11 h-12 rounded-xl bg-muted/40 border border-border focus:border-primary",
                      email.length > 0 && isEmailValid && "pl-11"
                    )}
                    required={authMethod === 'email'}
                    dir="ltr"
                    autoComplete="email"
                  />
                  {email.length > 0 && isEmailValid && (
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                  )}
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11 pl-11 h-12 rounded-xl bg-muted/40 border border-border focus:border-primary"
                  required
                  minLength={isLogin ? 6 : 8}
                  dir="ltr"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password requirements - Signup only */}
              {!isLogin && (
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
                        req.valid 
                          ? "bg-success/10 text-success" 
                          : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full flex items-center justify-center",
                        req.valid ? "bg-success" : "bg-muted-foreground/30"
                      )}>
                        {req.valid && <CheckCircle className="w-2 h-2 text-success-foreground" />}
                      </div>
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Forgot Password - Login only */}
            {isLogin && (
              <div className="text-left">
                <button
                  type="button"
                  onClick={async () => {
                    const authEmail = authMethod === 'email' 
                      ? email.trim().toLowerCase()
                      : phoneDigits ? `${phoneDigits}@siaflow.app` : '';
                    if (!authEmail || !isInputValid) {
                      toast.error(authMethod === 'phone' 
                        ? 'ابتدا شماره موبایل خود را وارد کنید'
                        : 'ابتدا ایمیل خود را وارد کنید'
                      );
                      return;
                    }
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
                        redirectTo: `${window.location.origin}/reset-password`,
                      });
                      if (error) {
                        toast.error('خطا در ارسال لینک بازیابی');
                      } else {
                        toast.success('لینک بازیابی رمز عبور ارسال شد');
                      }
                    } catch {
                      toast.error('خطای غیرمنتظره رخ داد');
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  رمز عبور را فراموش کردید؟
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 rounded-xl font-bold text-base shadow-lg shadow-primary/25"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'ورود به حساب' : 'ایجاد حساب'}
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </>
              )}
            </Button>
          </form>

          {/* Switch Login/Signup */}
          <div className="mt-8 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-muted-foreground bg-transparent">
                  {isLogin ? 'حساب ندارید؟' : 'قبلاً ثبت‌نام کردید؟'}
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full h-12 rounded-xl font-semibold border border-primary/40 text-primary hover:bg-primary/10"
            >
              {isLogin ? 'ایجاد حساب جدید' : 'ورود به حساب موجود'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-sm mx-auto text-center pt-5">
          <p className="text-xs text-muted-foreground">
            با ورود یا ثبت‌نام، <Link to="/terms" className="text-primary hover:underline">قوانین و شرایط استفاده</Link> را می‌پذیرید
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
