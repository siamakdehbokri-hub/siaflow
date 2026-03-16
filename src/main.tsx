import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker is auto-registered by vite-plugin-pwa (injectRegister: 'auto')
// No manual registration needed.

createRoot(document.getElementById("root")!).render(<App />);
