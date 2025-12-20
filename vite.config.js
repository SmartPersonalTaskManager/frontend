import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/SPTM/", // Base path for GitHub Pages matching Repo Name 'SPTM'
  server: {
    port: 5173,
    strictPort: true, // Hata versin başka port kullanmaya çalışırsa
  },
});
