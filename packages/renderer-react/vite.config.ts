import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.*', '**/*.spec.*']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'YearReportRendererReact',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@year-report/core', 'animate.css', 'echarts', 'echarts-for-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@year-report/core': 'YearReportCore',
          'animate.css': 'animateCSS',
          echarts: 'echarts',
          'echarts-for-react': 'EChartsForReact'
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