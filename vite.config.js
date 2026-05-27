import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";

function normalizeSiteUrl(url) {
  return String(url || "").replace(/\/$/, "");
}

function siteUrlHtmlPlugin() {
  return {
    name: "html-site-url",
    transformIndexHtml(html) {
      const base = normalizeSiteUrl(process.env.VITE_SITE_URL);
      return html.replaceAll("%VITE_SITE_URL%", base);
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    imagetools({
      // Incluye .JPG / .JPEG (mayúsculas); el regex por defecto solo aceptaba minúsculas.
      include: /^[^?]+\.(avif|gif|heif|jpe?g|png|tiff|webp)(\?.*)?$/i
    }),
    siteUrlHtmlPlugin()
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
