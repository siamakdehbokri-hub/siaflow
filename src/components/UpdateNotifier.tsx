import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Prompts the user to refresh when a new service worker is available.
 * Uses registerType: "prompt" so updates never silently swap the app.
 */
export function UpdateNotifier() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Periodically check for updates (every hour)
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("[PWA] SW registration error:", error);
    },
  });

  useEffect(() => {
    if (!needRefresh) return;
    const id = toast("نسخه جدید برنامه آماده است", {
      description: "برای اعمال تغییرات، برنامه را به‌روزرسانی کنید.",
      duration: Infinity,
      action: (
        <Button
          size="sm"
          onClick={() => {
            updateServiceWorker(true);
          }}
        >
          به‌روزرسانی
        </Button>
      ),
      onDismiss: () => setNeedRefresh(false),
      onAutoClose: () => setNeedRefresh(false),
    });
    return () => {
      toast.dismiss(id);
    };
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}
