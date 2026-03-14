import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register the custom service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[App] SW registered, scope:', reg.scope);
    } catch (err) {
      console.warn('[App] SW registration failed:', err);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
