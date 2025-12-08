import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-nojekyll",
      closeBundle() {
        // isso aqui é só pra GitHub Pages, mas não atrapalha o Firebase
        copyFileSync(".nojekyll", "dist/.nojekyll");
      },
    },
  ],
  // ❌ REMOVA essa linha:
  // base: '/Connecta-ServicosPro/',
  // ✅ deixe sem base (Vite usa '/')
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
