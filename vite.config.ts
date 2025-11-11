import {defineConfig} from 'vite'
import {createVuePlugin} from 'vite-plugin-vue2'
import {VitePWA} from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.vk\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vk-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Кудач',
        short_name: 'Кудач',
        description: 'Живые события',
        theme_color: '#1976d2',
        icons: [
          {
            src: './img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        start_url: '/',
        // gcm_sender_id: '103953800507',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    dedupe: ['vue', 'vue-router'],
  },
  server: {
    port: 8088,
    proxy: {
      '/authvk': {
        target: 'https://kuda.ch',
        changeOrigin: true,
        headers: {
          'x-redirect-host': 'http://localhost:8080',
        },
      },
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'vuex'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          'vendor-ui': ['vuetify'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'vuex',
      'vuetify',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'firebase/storage',
    ],
  },
})
