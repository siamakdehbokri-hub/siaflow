import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, User, Eye, EyeOff, Loader2, Sparkles, Shield, TrendingUp, CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const features = [
  { icon: TrendingUp, text: 'مدیریت هوشمند بودجه', color: 'text-emerald-500' },
  { icon: Shield, text: 'امنیت بالای داده‌ها', color: 'text-blue-500' },
  { icon: Sparkles, text: 'گزارش هوشمند AI', color: 'text-purple-500' },
];

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
  const [mounted, setMounted] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Format phone number for display (Persian style)
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  };

  // Validate Iranian phone number
  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return /^09\d{9}$/.test(digits);
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Password validation function
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
      if (authMethod === 'phone') {
        toast.error('لطفاً شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      } else {
        toast.error('لطفاً ایمیل معتبر وارد کنید');
      }
      return;
    }

    setLoading(true);
    
    // Use email directly or create email from phone
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className={cn(
        "w-full max-w-md relative z-10 transition-all duration-700",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        {/* Logo/Title - Enhanced */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-28 h-28 mx-auto mb-5 rounded-3xl gradient-primary flex items-center justify-center shadow-glow-lg relative overflow-hidden">
              <span className="text-5xl font-black text-primary-foreground tracking-tight relative z-10">SF</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-background border-2 border-primary flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">SiaFlow</h1>
          <p className="text-2xl text-primary font-bold mt-1">سیا فلو</p>
          <p className="text-muted-foreground mt-3 text-sm">مدیریت مالی هوشمند با قدرت AI</p>
        </div>

        {/* Features - only show on signup */}
        {!isLogin && (
          <div className={cn(
            "flex justify-center gap-3 mb-6 transition-all duration-500",
            mounted ? "opacity-100" : "opacity-0"
          )}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className={cn("w-5 h-5", feature.color)} />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        )}

        <Card variant="glass" className="backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'ورود به حساب' : 'ایجاد حساب جدید'}
            </CardTitle>
            <CardDescription className="text-sm">
              {isLogin 
                ? 'خوش برگشتید! وارد شوید' 
                : 'برای شروع مدیریت مالی، ثبت‌نام کنید'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Auth Method Tabs */}
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as AuthMethod)} className="mb-5">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="phone" className="gap-2">
                  <Phone className="w-4 h-4" />
                  موبایل
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="w-4 h-4" />
                  ایمیل
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="displayName" className="text-sm font-medium">
                    نام نمایشی
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="نام شما"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pr-11 h-12 text-base rounded-xl bg-muted/50 border-border/50 focus:bg-background focus:border-primary transition-all"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Phone Input */}
              {authMethod === 'phone' && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    شماره موبایل
                  </Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                      value={formatPhoneDisplay(phone)}
                      onChange={handlePhoneChange}
                      className="pr-11 h-12 text-base rounded-xl bg-muted/50 border-border/50 focus:bg-background focus:border-primary transition-all tracking-wide"
                      required={authMethod === 'phone'}
                      dir="ltr"
                    />
                    {phone.length > 0 && (
                      <div className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                        isPhoneValid ? "bg-emerald-500" : "bg-muted"
                      )}>
                        {isPhoneValid && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    )}
                  </div>
                  {!isLogin && (
                    <p className="text-[11px] text-muted-foreground">
                      شماره موبایل ایرانی وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)
                    </p>
                  )}
                </div>
              )}

              {/* Email Input */}
              {authMethod === 'email' && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="email" className="text-sm font-medium">
                    ایمیل
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-11 h-12 text-base rounded-xl bg-muted/50 border-border/50 focus:bg-background focus:border-primary transition-all"
                      required={authMethod === 'email'}
                      dir="ltr"
                    />
                    {email.length > 0 && (
                      <div className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                        isEmailValid ? "bg-emerald-500" : "bg-muted"
                      )}>
                        {isEmailValid && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    )}
                  </div>
                  {!isLogin && (
                    <p className="text-[11px] text-muted-foreground">
                      ایمیل معتبر وارد کنید - بدون نیاز به تأیید
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  رمز عبور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-11 pl-11 h-12 text-base rounded-xl bg-muted/50 border-border/50 focus:bg-background focus:border-primary transition-all"
                    required
                    minLength={isLogin ? 6 : 8}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <div className="space-y-1.5 text-xs bg-muted/30 rounded-xl p-3 mt-2">
                    {['حداقل ۸ کاراکتر', 'یک حرف بزرگ انگلیسی', 'یک حرف کوچک انگلیسی', 'یک عدد'].map((req, i) => {
                      const checks = [
                        password.length >= 8,
                        /[A-Z]/.test(password),
                        /[a-z]/.test(password),
                        /[0-9]/.test(password),
                      ];
                      return (
                        <div
                          key={req}
                          className={`flex items-center gap-2 ${
                            checks[i] ? 'text-emerald-500' : 'text-muted-foreground'
                          }`}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center transition-all",
                            checks[i] ? "bg-emerald-500" : "bg-muted-foreground/20"
                          )}>
                            {checks[i] && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          {req}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'ورود به حساب' : 'ایجاد حساب'}
                    <ArrowRight className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-4 text-muted-foreground">
                    {isLogin ? 'حساب ندارید؟' : 'قبلاً ثبت‌نام کردید؟'}
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="mt-4 text-primary font-semibold hover:text-primary/80 hover:bg-primary/5"
              >
                {isLogin ? 'ایجاد حساب جدید' : 'ورود به حساب موجود'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
          با ورود یا ثبت‌نام، قوانین و شرایط استفاده را می‌پذیرید
        </p>
      </div>
    </div>
  );
};

export default Auth;