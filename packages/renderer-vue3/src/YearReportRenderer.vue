<template>
  <div class="fixedContainer">
    <!-- 背景音乐 -->
    <audio v-if="data.backgroundMusic" ref="audioRef" :src="data.backgroundMusic" loop />
    <button
      v-if="data.backgroundMusic"
      @click="toggleMusic"
      class="musicBtn"
    >
      {{ isPlaying ? '🔊' : '🔇' }}
    </button>

    <!-- 移动端容器 -->
    <div
      class="mobileContainer"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
    >
      <!-- 页面容器 -->
      <div class="pagesContainer" :style="{ transform: `translateY(-${currentIndex * 100}%)` }">
        <div
          v-for="(page, index) in data.pages"
          :key="page.id"
          class="pageItem"
          :style="getPageStyle(page, index)"
        >
          <!-- 背景视频 -->
          <video
            v-if="page.backgroundType === 'video' && page.backgroundVideo"
            :src="page.backgroundVideo"
            class="bgVideo"
            autoplay
            loop
            muted
            playsinline
          />

          <!-- 非分组元素 -->
          <ElementRenderer
            v-for="el in getUngroupedElements(page)"
            :key="el.id"
            :element="el"
            :page-index="index"
            :is-active="index === currentIndex"
          />

          <!-- 分组元素 -->
          <GroupRenderer
            v-for="group in calcGroupBounds(page)"
            :key="group.groupId"
            :elements="group.elements"
            :bounds="group"
            :rotation="page.groupRotations?.[group.groupId] || 0"
            :page-index="index"
            :is-active="index === currentIndex"
          />
        </div>
      </div>

      <!-- 下滑提示 -->
      <div v-if="currentIndex < data.pages.length - 1" class="scrollHint">
        <svg class="chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <!-- 关闭按钮 -->
      <button v-if="onClose" @click="onClose" class="closeBtn">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide, watch, nextTick } from 'vue'
import type { ProjectData, RequestAdapter, H5Element, H5Page } from '@year-report/core'
import { DataSourceManager, AnimateCssScheduler } from '@year-report/core'
import ElementRenderer from './ElementRenderer.vue'
import GroupRenderer from './GroupRenderer.vue'
import 'animate.css'

// 计算分组边界
interface GroupBounds {
  groupId: string
  x: number
  y: number
  width: number
  height: number
  elements: H5Element[]
}

function calcGroupBounds(page: H5Page): GroupBounds[] {
  const groups = new Map<string, H5Element[]>()
  page.elements.forEach(el => {
    if (el.groupId) {
      if (!groups.has(el.groupId)) groups.set(el.groupId, [])
      groups.get(el.groupId)!.push(el)
    }
  })

  const bounds: GroupBounds[] = []
  groups.forEach((elements, groupId) => {
    if (elements.length < 2) return
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    elements.forEach(el => {
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + el.width)
      maxY = Math.max(maxY, el.y + el.height)
    })
    bounds.push({ groupId, x: minX, y: minY, width: maxX - minX, height: maxY - minY, elements })
  })
  return bounds
}

function getUngroupedElements(page: H5Page): H5Element[] {
  return page.elements.filter(el => !el.groupId)
}

interface Props {
  data: ProjectData
  onClose?: () => void
  requestAdapter?: RequestAdapter
}

const props = defineProps<Props>()

// 数据源管理器
const dataManager = new DataSourceManager(props.requestAdapter)
const dataVersion = ref(0)

// 动画编排器（每个页面一个）
const pageSchedulers = ref<Map<number, AnimateCssScheduler>>(new Map())

// 提供给子组件
provide('dataManager', dataManager)
provide('dataVersion', dataVersion)
provide('pageSchedulers', pageSchedulers)

const currentIndex = ref(0)
const prevIndex = ref(-1)
const touchStartY = ref<number | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)

// 监听页面切换，播放动画
watch(currentIndex, (newIndex, oldIndex) => {
  // 播放退出动画
  if (oldIndex >= 0) {
    const oldScheduler = pageSchedulers.value.get(oldIndex)
    oldScheduler?.playExitAnimations()
  }

  // 播放进入动画（等待 DOM 更新）
  nextTick(() => {
    setTimeout(() => {
      const scheduler = pageSchedulers.value.get(newIndex)
      scheduler?.playEnterAnimations()
    }, 100)
  })

  prevIndex.value = oldIndex
}, { immediate: true })

// 注入动画样式和初始化数据源
onMounted(() => {
  // 初始化数据源
  if (props.data.dataSources?.length) {
    dataManager.subscribe(() => {
      dataVersion.value++
    })
    dataManager.setDataSources(props.data.dataSources)
  }

  // 自动播放音乐
  if (audioRef.value) {
    audioRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(() => {
      isPlaying.value = false
    })
  }
})

onUnmounted(() => {
  dataManager.destroy()
})

// 获取页面样式（支持渐变）
const getPageStyle = (page: H5Page, index: number) => {
  const style: any = {
    top: `${index * 100}%`
  }

  if (page.backgroundType === 'color') {
    style.backgroundColor = page.backgroundColor || '#ffffff'
  } else if (page.backgroundType === 'gradient' && page.backgroundGradient) {
    const { type, direction, colors } = page.backgroundGradient
    const colorStops = colors.map(c => `${c.color} ${c.position || ''}`).join(', ')
    if (type === 'linear') {
      style.background = `linear-gradient(${direction || 'to bottom'}, ${colorStops})`
    } else {
      style.background = `radial-gradient(circle, ${colorStops})`
    }
  } else if (page.backgroundType === 'image' && page.backgroundImage) {
    style.backgroundImage = `url(${page.backgroundImage})`
    style.backgroundSize = 'cover'
    style.backgroundColor = page.backgroundColor || '#ffffff'
  } else {
    style.backgroundColor = page.backgroundColor || '#ffffff'
  }

  return style
}

const toggleMusic = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY
}

const handleTouchEnd = (e: TouchEvent) => {
  if (touchStartY.value === null) return
  const touchEndY = e.changedTouches[0].clientY
  const diff = touchStartY.value - touchEndY

  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentIndex.value < props.data.pages.length - 1) {
      currentIndex.value++
    } else if (diff < 0 && currentIndex.value > 0) {
      currentIndex.value--
    }
  }
  touchStartY.value = null
}

const handleMouseDown = (e: MouseEvent) => {
  touchStartY.value = e.clientY
}

const handleMouseUp = (e: MouseEvent) => {
  if (touchStartY.value === null) return
  const diff = touchStartY.value - e.clientY
  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentIndex.value < props.data.pages.length - 1) {
      currentIndex.value++
    } else if (diff < 0 && currentIndex.value > 0) {
      currentIndex.value--
    }
  }
  touchStartY.value = null
}
</script>

<style scoped>
.fixedContainer {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: black;
  display: flex;
  align-items: center;
  justify-content: center;
}

.musicBtn {
  position: fixed;
  top: 1rem;
  right: 4rem;
  z-index: 60;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 9999px;
  backdrop-filter: blur(12px);
  border: none;
  cursor: pointer;
}

.mobileContainer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: white;
}

@media (min-width: 768px) {
  .mobileContainer {
    width: 375px;
    height: 667px;
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
}

.pagesContainer {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.pageItem {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bgVideo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.scrollHint {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  animation: bounce 1s infinite;
  pointer-events: none;
  z-index: 20;
}

.chevron {
  color: rgba(255, 255, 255, 0.5);
  width: 2rem;
  height: 2rem;
}

.closeBtn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  z-index: 50;
  transition: background-color 0.2s;
}

.closeBtn:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5rem);
  }
}
</style>
