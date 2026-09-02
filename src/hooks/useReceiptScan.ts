import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReceiptScanResult {
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'saving';
  category: string;
  description: string;
  confidence: number | null;
}

const MAX_DIMENSION = 1600;

/** Downscale + compress the picked image to keep the upload small and fast. */
async function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('decode-failed'));
      image.src = dataUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no-canvas');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = canvas.toDataURL('image/jpeg', 0.8);
    return { base64: out.split(',')[1] ?? '', mimeType: 'image/jpeg' };
  } catch {
    // Fall back to the original file bytes
    return {
      base64: dataUrl.split(',')[1] ?? '',
      mimeType: file.type || 'image/jpeg',
    };
  }
}

export function useReceiptScan() {
  const [scanning, setScanning] = useState(false);

  const scan = useCallback(
    async (file: File, categories: string[]): Promise<ReceiptScanResult | null> => {
      if (!file.type.startsWith('image/')) {
        toast.error('لطفاً یک تصویر انتخاب کنید');
        return null;
      }
      setScanning(true);
      try {
        const { base64, mimeType } = await compressImage(file);
        if (!base64) throw new Error('empty-image');

        const { data, error } = await supabase.functions.invoke('scan-receipt', {
          body: { imageBase64: base64, mimeType, categories },
        });

        if (error) {
          console.error('scan-receipt invoke error', error);
          toast.error('خطا در خواندن فیش. دوباره تلاش کنید.');
          return null;
        }
        if (!data || (data as { error?: string }).error) {
          toast.error((data as { error?: string })?.error || 'اطلاعاتی از فیش استخراج نشد');
          return null;
        }

        const result = data as ReceiptScanResult;
        if (!result.amount) {
          toast.warning('مبلغ از روی فیش خوانده نشد، لطفاً دستی وارد کنید');
        } else {
          toast.success('اطلاعات فیش استخراج شد');
        }
        return result;
      } catch (err) {
        console.error('receipt scan failed', err);
        toast.error('خطا در پردازش تصویر');
        return null;
      } finally {
        setScanning(false);
      }
    },
    []
  );

  return { scan, scanning };
}
