import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // En production : aucun console.* ni debugger dans le bundle.
  esbuild: command === 'build' ? { drop: ['console', 'debugger'] } : undefined,
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
}))
