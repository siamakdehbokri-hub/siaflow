import { useState, useEffect } from 'react';
import { ArrowRight, Camera, User, Mail, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileEditProps {
  onBack: () => void;
}

export function ProfileEdit({ onBack }: ProfileEditProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
      setEmail(user.email || '');
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        if (data.display_name) setDisplayName(data.display_name);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (authError) throw authError;

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          email: user.email,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      toast.success('پروفایل با موفقیت بروزرسانی شد');
      onBack();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('خطا در بروزرسانی پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const initials = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">ویرایش پروفایل</h2>
      </div>

      {/* Avatar Section */}
      <Card variant="glass">
        <CardContent className="p-5 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <button 
              type="button"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              onClick={() => toast.info('آپلود تصویر به زودی فعال می‌شود')}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            روی آیکون دوربین کلیک کنید تا تصویر پروفایل را تغییر دهید
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">اطلاعات کاربری</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              نام نمایشی
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="نام نمایشی خود را وارد کنید"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              ایمیل
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              ایمیل قابل تغییر نیست
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleSave}
        disabled={loading}
      >
        <Save className="w-4 h-4 ml-2" />
        {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </Button>
    </div>
  );
}