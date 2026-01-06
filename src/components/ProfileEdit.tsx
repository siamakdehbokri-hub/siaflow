import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Camera, User, Phone, Save, Loader2 } from 'lucide-react';
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
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
      // Extract phone from email (09xxxxxxxxx@siaflow.app)
      const emailPhone = user.email?.replace('@siaflow.app', '') || '';
      if (/^09\d{9}$/.test(emailPhone)) {
        setPhone(emailPhone);
      }
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, phone')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        if (data.display_name) setDisplayName(data.display_name);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
        if (data.phone) setPhone(data.phone);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;
    
    // Validate file type
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt?.toLowerCase() || '')) {
      toast.error('فقط فایل‌های تصویری مجاز هستند');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حداکثر حجم فایل ۲ مگابایت است');
      return;
    }

    setUploading(true);
    
    try {
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache-busting query param
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithCacheBust);

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      toast.success('تصویر پروفایل بروزرسانی شد');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('خطا در آپلود تصویر');
    } finally {
      setUploading(false);
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
          phone: phone,
          avatar_url: avatarUrl?.split('?')[0], // Remove cache-busting param
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
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground overflow-hidden">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button 
              type="button"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground text-center">
            روی آیکون دوربین کلیک کنید تا تصویر پروفایل را تغییر دهید
            <br />
            <span className="text-xs">(حداکثر ۲ مگابایت)</span>
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
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              شماره موبایل
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formatPhoneDisplay(phone)}
              disabled
              className="bg-muted tracking-wide"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              شماره موبایل قابل تغییر نیست
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
        {loading ? (
          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 ml-2" />
        )}
        {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </Button>
    </div>
  );
}