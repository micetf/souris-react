import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/souris/", // Chemin de base pour les assets en production
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    // Configuration du serveur de développement
    server: {
        port: 3001,
        open: true,
        // Proxy pour les API PHP via Docker
        proxy: {
            "/api": {
                target: "http://localhost:8080", // Pointez vers votre conteneur Docker
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
            },
        },
    },
    // Configuration de production (reste inchangée)
    build: {
        outDir: "dist",
        sourcemap: process.env.NODE_ENV !== "production",
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: process.env.NODE_ENV === "production",
            },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    "vendor-react": ["react", "react-dom"],
                    "vendor-micetf": ["@micetf/ui"],
                },
            },
        },
    },
});
