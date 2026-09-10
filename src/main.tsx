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

  // Keep the app shell from drifting sideways while preserving intentional
  // horizontal scrollers and swipe actions inside marked controls.
  let panStartX = 0;
  let panStartY = 0;
  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      panStartX = e.touches[0].clientX;
      panStartY = e.touches[0].clientY;
    },
    { passive: true }
  );
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length !== 1) return;
      const target = e.target as HTMLElement | null;
      const allowsHorizontalPan = target?.closest(
        '.overflow-x-auto, .overflow-x-scroll, [data-allow-pan-x="true"]'
      );
      if (allowsHorizontalPan) return;

      const deltaX = e.touches[0].clientX - panStartX;
      const deltaY = e.touches[0].clientY - panStartY;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 6) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      const target = e.target as HTMLElement | null;
      // Never block real taps on interactive controls
      const interactive = target?.closest(
        'button, a, input, textarea, select, label, [role="button"], [role="tab"], [contenteditable="true"]'
      );
      if (now - lastTouchEnd < 300 && !interactive) e.preventDefault();
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
