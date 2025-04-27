import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    // Configuration du serveur de développement
    server: {
        port: 3000,
        open: true,
        // Proxy pour les API PHP
        proxy: {
            "/api": {
                target: "http://localhost/souris/api",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
            // Proxy pour les images des circuits
            "/images": {
                target: "http://localhost/souris/public/images",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/images/, ""),
            },
        },
    },
    // Configuration de production
    build: {
        outDir: "dist",
        // Génération de sourcemaps pour le débogage en production
        sourcemap: true,
        // Optimisation des bundles
        rollupOptions: {
            output: {
                manualChunks: {
                    // Séparer les dépendances React en un chunk distinct
                    "vendor-react": ["react", "react-dom"],
                    // Séparer les composants MiCetF en un chunk distinct
                    "vendor-micetf": ["@micetf/ui"],
                },
            },
        },
    },
});
