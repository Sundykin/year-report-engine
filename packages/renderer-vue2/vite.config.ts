import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'YearReportRendererVue2',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', '@year-report/core', 'animate.css', 'echarts'],
      output: {
        globals: {
          vue: 'Vue',
          '@year-report/core': 'YearReportCore',
          'animate.css': 'animateCSS',
          echarts: 'echarts'
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})