
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ['.'],
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['jspdf'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2'],
  // Improved public directory handling for fonts
  publicDir: 'public',
}));
