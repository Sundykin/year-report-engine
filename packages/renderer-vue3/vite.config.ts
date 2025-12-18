import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.*', '**/*.spec.*']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'YearReportRendererVue3',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', '@year-report/core', 'animate.css', 'echarts', 'echarts/core', 'echarts/renderers', 'echarts/charts', 'echarts/components'],
      output: {
        globals: {
          vue: 'Vue',
          '@year-report/core': 'YearReportCore',
          'animate.css': 'animateCSS',
          echarts: 'echarts',
          'echarts/core': 'echartsCore',
          'echarts/renderers': 'echartsRenderers',
          'echarts/charts': 'echartsCharts',
          'echarts/components': 'echartsComponents'
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
