import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/frontend/", // Update to match the URL in your screenshot
  server: {
    port: 5173,
    strictPort: true, // Hata versin başka port kullanmaya çalışırsa
  },
});
