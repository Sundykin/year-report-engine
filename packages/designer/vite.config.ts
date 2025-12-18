import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'YearReportDesigner',
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      external: [
        'vue',
        '@year-report/core',
        '@year-report/renderer-vue3',
        'animate.css',
        'jszip',
        'lodash-es',
        '@codemirror/lang-javascript',
        '@codemirror/lang-json',
        '@codemirror/state',
        '@codemirror/theme-one-dark',
        'codemirror',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        '@better-scroll/core',
        '@better-scroll/scroll-bar',
        'simplebar',
        'simplebar-vue'
      ],
      output: {
        globals: {
          vue: 'Vue',
          '@year-report/core': 'YearReportCore',
          '@year-report/renderer-vue3': 'YearReportRendererVue3'
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
