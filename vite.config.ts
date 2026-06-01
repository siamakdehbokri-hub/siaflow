import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "custom-sw.ts",
      injectRegister: false,
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "favicon.png",
        "fonts/Vazirmatn-Regular.woff2",
        "fonts/Vazirmatn-Medium.woff2",
        "fonts/Vazirmatn-Bold.woff2",
      ],
      manifest: false,
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
