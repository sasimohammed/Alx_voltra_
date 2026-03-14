import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy for node-core API (events)
      '/api': {
        target: 'https://node-core-1qx9.vercel.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to node-core:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from node-core:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Proxy for django API (user account)
      '/django-api': {
        target: 'https://django-kf3s.vercel.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/django-api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('django proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to django:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from django:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
});