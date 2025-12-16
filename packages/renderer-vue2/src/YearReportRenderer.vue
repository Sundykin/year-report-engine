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

<script lang="ts">
import Vue from 'vue'
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

export default Vue.extend({
  name: 'YearReportRenderer',

  components: {
    ElementRenderer,
    GroupRenderer
  },

  props: {
    data: {
      type: Object as () => ProjectData,
      required: true
    },
    onClose: {
      type: Function,
      default: null
    },
    requestAdapter: {
      type: Object as () => RequestAdapter,
      default: null
    }
  },

  data() {
    return {
      currentIndex: 0,
      prevIndex: -1,
      touchStartY: null as number | null,
      audioRef: null as HTMLAudioElement | null,
      isPlaying: false,
      dataManager: null as DataSourceManager | null,
      dataVersion: 0,
      pageSchedulers: new Map<number, AnimateCssScheduler>()
    }
  },

  watch: {
    currentIndex: {
      handler(newIndex: number, oldIndex: number) {
        // 播放退出动画
        if (oldIndex >= 0) {
          const oldScheduler = this.pageSchedulers.get(oldIndex)
          oldScheduler?.playExitAnimations()
        }

        // 播放进入动画（等待 DOM 更新）
        Vue.nextTick(() => {
          setTimeout(() => {
            const scheduler = this.pageSchedulers.get(newIndex)
            scheduler?.playEnterAnimations()
          }, 100)
        })

        this.prevIndex = oldIndex
      },
      immediate: true
    }
  },

  mounted() {
    // 初始化数据源管理器
    this.dataManager = new DataSourceManager(this.requestAdapter)

    // 初始化数据源
    if (this.data.dataSources?.length) {
      this.dataManager.subscribe(() => {
        this.dataVersion++
      })
      this.dataManager.setDataSources(this.data.dataSources)
    }

    // 自动播放音乐
    if (this.$refs.audioRef) {
      const audio = this.$refs.audioRef as HTMLAudioElement
      audio.play().then(() => {
        this.isPlaying = true
      }).catch(() => {
        this.isPlaying = false
      })
    }
  },

  beforeDestroy() {
    this.dataManager?.destroy()
  },

  methods: {
    calcGroupBounds,
    getUngroupedElements,

    toggleMusic() {
      if (!this.audioRef) return
      if (this.isPlaying) {
        this.audioRef.pause()
      } else {
        this.audioRef.play()
      }
      this.isPlaying = !this.isPlaying
    },

    handleTouchStart(e: TouchEvent) {
      this.touchStartY = e.touches[0].clientY
    },

    handleTouchEnd(e: TouchEvent) {
      if (this.touchStartY === null) return
      const touchEndY = e.changedTouches[0].clientY
      const diff = this.touchStartY - touchEndY

      if (Math.abs(diff) > 50) {
        if (diff > 0 && this.currentIndex < this.data.pages.length - 1) {
          this.currentIndex++
        } else if (diff < 0 && this.currentIndex > 0) {
          this.currentIndex--
        }
      }
      this.touchStartY = null
    },

    handleMouseDown(e: MouseEvent) {
      this.touchStartY = e.clientY
    },

    handleMouseUp(e: MouseEvent) {
      if (this.touchStartY === null) return
      const diff = this.touchStartY - e.clientY
      if (Math.abs(diff) > 50) {
        if (diff > 0 && this.currentIndex < this.data.pages.length - 1) {
          this.currentIndex++
        } else if (diff < 0 && this.currentIndex > 0) {
          this.currentIndex--
        }
      }
      this.touchStartY = null
    },

    // 获取页面样式（支持渐变）
    getPageStyle(page, index) {
      const style = {
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
  },

  provide() {
    return {
      dataManager: this.dataManager,
      dataVersion: this.dataVersion,
      pageSchedulers: this.pageSchedulers
    }
  }
})
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
