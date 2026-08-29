import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function bufferToBase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function useWebPush() {
  const { user } = useAuth();
  const supported =
    typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => setSubscribed(false));
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported || !user) return false;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('اجازه دریافت نوتیفیکیشن داده نشد');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('push', {
        body: { action: 'public-key' },
      });
      if (error || !data?.publicKey) throw new Error('کلید سرور دریافت نشد');

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey) as BufferSource,
        }));

      const json = sub.toJSON();
      const { error: dbError } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh || bufferToBase64Url(sub.getKey('p256dh')),
          auth: json.keys?.auth || bufferToBase64Url(sub.getKey('auth')),
          user_agent: navigator.userAgent.slice(0, 250),
        },
        { onConflict: 'endpoint' },
      );
      if (dbError) throw dbError;

      setSubscribed(true);
      toast.success('نوتیفیکیشن فعال شد');
      return true;
    } catch (e) {
      toast.error((e as Error).message || 'فعال‌سازی نوتیفیکیشن ناموفق بود');
      return false;
    } finally {
      setBusy(false);
    }
  }, [supported, user]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success('نوتیفیکیشن غیرفعال شد');
    } catch (e) {
      toast.error((e as Error).message || 'خطا در غیرفعال‌سازی');
    } finally {
      setBusy(false);
    }
  }, [supported]);

  const sendTest = useCallback(async () => {
    const { error } = await supabase.functions.invoke('push', { body: { action: 'test' } });
    if (error) toast.error('ارسال آزمایشی ناموفق بود');
    else toast.success('نوتیفیکیشن آزمایشی ارسال شد');
  }, []);

  return { supported, subscribed, busy, subscribe, unsubscribe, sendTest };
}
