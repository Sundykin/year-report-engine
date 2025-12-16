<template>
  <div v-if="!isPreview">
    <YearReportDesigner
      v-model:project="project"
      @preview="isPreview = true"
    />
  </div>
  <div v-else>
    <YearReportRenderer
      :data="project"
      :on-close="() => isPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { YearReportDesigner } from '@year-report/designer'
import { YearReportRenderer } from '@year-report/renderer-vue3'
import type { ProjectData } from '@year-report/core'
import { generateId } from '@year-report/core'

const isPreview = ref(false)

const project = ref<ProjectData>({
  title: '我的年度报告',
  author: '未命名',
  dataSources: [
    {
      id: 'ds1',
      name: 'user',
      type: 'static',
      staticData: {
        name: '张三',
        year: 2024,
        songs: 1234,
        hours: 567
      }
    }
  ],
  pages: [
    {
      id: generateId(),
      backgroundType: 'color',
      backgroundColor: '#1a1a1a',
      elements: [
        {
          id: generateId(),
          type: 'text',
          x: 87.5,
          y: 280,
          width: 200,
          height: 40,
          zIndex: 1,
          style: {
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center'
          },
          content: '{{user.name}}的',
          animation: { type: 'fadeInDown', duration: 1, delay: 0 }
        },
        {
          id: generateId(),
          type: 'text',
          x: 87.5,
          y: 320,
          width: 200,
          height: 60,
          zIndex: 1,
          style: {
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center'
          },
          content: '{{user.year}}年度报告',
          animation: { type: 'fadeInUp', duration: 1, delay: 0.3 }
        },
        {
          id: generateId(),
          type: 'text',
          x: 87.5,
          y: 420,
          width: 200,
          height: 30,
          zIndex: 1,
          style: {
            color: '#60a5fa',
            fontSize: '16px',
            textAlign: 'center'
          },
          content: '听了 {{user.songs}} 首歌',
          animation: { type: 'fadeIn', duration: 1, delay: 0.6 }
        }
      ]
    }
  ]
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
