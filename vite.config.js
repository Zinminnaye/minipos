import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
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

    server: {
    proxy: {
      '/api': {
        target: 'http://localhost:44555', 
        changeOrigin: true,
        secure: false
      }
    }
  }
})
