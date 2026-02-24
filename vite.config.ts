import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "the System - LevelUp",
        short_name: "the System",
        description: "Level Up or Die",
        theme_color: "#141414",
        background_color: "#141414",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/appIcon.png", sizes: "192x192", type: "image/png" },
          { src: "/appIcon.png", sizes: "512x512", type: "image/png" },
          { src: "/appIcon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
