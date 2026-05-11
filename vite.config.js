import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  plugins: [
    react(),
    imagetools({
      // Incluye .JPG / .JPEG (mayúsculas); el regex por defecto solo aceptaba minúsculas.
      include: /^[^?]+\.(avif|gif|heif|jpe?g|png|tiff|webp)(\?.*)?$/i
    })
  ],
  assetsInclude: ["**/*.JPG", "**/*.JPEG"],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
