import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles, Shield, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const features = [
  { icon: TrendingUp, text: 'مدیریت هوشمند بودجه', color: 'text-emerald-500' },
  { icon: Shield, text: 'امنیت بالای داده‌ها', color: 'text-blue-500' },
  { icon: Sparkles, text: 'گزارش‌های دقیق مالی', color: 'text-purple-500' },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
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

  // Password validation function - same as PasswordChange component
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('لطفاً یک ایمیل معتبر وارد کنید');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('ایمیل یا رمز عبور اشتباه است');
          } else {
            toast.error('خطا در ورود: ' + error.message);
          }
        } else {
          toast.success('خوش آمدید!');
          navigate('/');
        }
      } else {
        // Strong password validation for sign-up
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
        
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('این ایمیل قبلاً ثبت شده است');
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
      </div>

      <div className={cn(
        "w-full max-w-md relative z-10 transition-all duration-700",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-5 rounded-3xl gradient-primary flex items-center justify-center shadow-glow relative">
            <span className="text-4xl font-black text-primary-foreground tracking-tight">SF</span>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-background border-2 border-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-foreground">SiaFlow</h1>
          <p className="text-xl text-primary font-bold mt-1">سیا فلو</p>
          <p className="text-muted-foreground mt-2 text-sm">مدیریت مالی هوشمند شما</p>
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
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/50 backdrop-blur-sm"
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

        <Card variant="glass" className="backdrop-blur-xl border-border/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold">
              {isLogin ? 'ورود به حساب' : 'ایجاد حساب جدید'}
            </CardTitle>
            <CardDescription className="text-sm">
              {isLogin 
                ? 'خوش برگشتید! برای ادامه وارد شوید' 
                : 'برای شروع مدیریت مالی، ثبت‌نام کنید'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="pr-11 h-12 text-base rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  ایمیل
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-11 h-12 text-base rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

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
                    className="pr-11 pl-11 h-12 text-base rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
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
                  <div className="space-y-1 text-xs">
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
                          className={`flex items-center gap-1.5 ${
                            checks[i] ? 'text-emerald-500' : 'text-muted-foreground'
                          }`}
                        >
                          <CheckCircle className={`w-3 h-3 ${checks[i] ? 'opacity-100' : 'opacity-30'}`} />
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
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'ورود به حساب' : 'ایجاد حساب'}
                    <Sparkles className="w-4 h-4 mr-2" />
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