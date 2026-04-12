import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
