import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { applyUpdate, onUpdateAvailable, startPwaUpdates } from "@/lib/pwaUpdate";

/**
 * Shows a persistent prompt when a new version is ready.
 */
export function UpdateNotifier() {
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    startPwaUpdates();
    return onUpdateAvailable(setNeedRefresh);
  }, []);

  useEffect(() => {
    if (!needRefresh) return;
    const id = toast("نسخه جدید برنامه آماده است", {
      description: "برای اعمال تغییرات، برنامه را به‌روزرسانی کنید.",
      duration: Infinity,
      dismissible: false,
      action: (
        <Button size="sm" onClick={() => applyUpdate()}>
          به‌روزرسانی
        </Button>
      ),
    });
    return () => {
      toast.dismiss(id);
    };
  }, [needRefresh]);

  return null;
}
