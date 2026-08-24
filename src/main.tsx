import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ─── App-like lock: no pinch-zoom, no double-tap zoom ──────
(() => {
  // iOS Safari pinch gestures
  ["gesturestart", "gesturechange", "gestureend"].forEach((evt) =>
    document.addEventListener(evt, (e) => e.preventDefault(), { passive: false })
  );

  // Ctrl/⌘ + wheel zoom (trackpad pinch)
  document.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    },
    { passive: false }
  );

  // Multi-touch pinch
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false }
  );

  // Double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd < 300) e.preventDefault();
      lastTouchEnd = now;
    },
    { passive: false }
  );

  // Ctrl/⌘ +/-/0 keyboard zoom
  document.addEventListener(
    "keydown",
    (e) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
})();


// ─── PWA Guard: prevent SW issues in iframe/preview ────────
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
}

// ─── Listen for SW sync messages to refresh data ───────────
if ("serviceWorker" in navigator && !isPreviewHost && !isInIframe) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "FORCE_SYNC") {
      // Handled by useNetworkStatus hook
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
