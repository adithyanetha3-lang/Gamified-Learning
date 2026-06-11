import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  
  build: {
    // Production optimizations
    target: "es2015",
    minify: "esbuild", // Use esbuild for faster builds (alternative to terser)
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (set to false for smaller builds)
    sourcemap: false,
  },

  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },

  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
});
