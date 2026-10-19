/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'icons/*.png'],
            manifest: {
                name: 'Meal Plan',
                short_name: 'Meal Plan',
                description: "David's 3-week meal plan",
                // Android paints the installed app's navigation bar with background_color, and a manifest
                // can't follow light/dark mode, so use the dark page colour: the system buttons stay
                // visible in both modes. The status bar follows the theme-color meta tags in index.html.
                theme_color: '#151715',
                background_color: '#151715',
                display: 'standalone',
                icons: [
                    {
                        src: '/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\./,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24
                            }
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
            '@data': fileURLToPath(new URL('..', import.meta.url))
        }
    },
    test: {
        include: ['src/**/*.test.ts'],
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8787',
                changeOrigin: true
            }
        }
    }
});
