import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://ServerIP:18007', 
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    sourcemap: true,
    minify: false
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico'
      ],

      manifest: {
        name: 'Offline POS',
        short_name: 'POS',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2'
      },

      workbox: {
        cleanupOutdatedCaches: true
      }
    })
  ],

  
})
