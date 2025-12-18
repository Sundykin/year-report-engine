import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: '/year-report-engine/',
  plugins: [vue()],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@year-report/core': resolve(__dirname, '../../packages/core/src'),
      '@year-report/renderer-vue3': resolve(__dirname, '../../packages/renderer-vue3/src'),
      '@year-report/designer': resolve(__dirname, '../../packages/designer/src')
    }
  },
  optimizeDeps: {
    exclude: ['@year-report/core', '@year-report/renderer-vue3', '@year-report/designer']
  }
})
