<template>
  <div class="carouselElement" :style="containerStyle">
    <div class="carouselTrack" :style="trackStyle">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="carouselSlide"
        :style="getSlideStyle(index)"
      >
        <img :src="item.src" :alt="item.title || ''" />
        <div v-if="item.title" class="slideTitle">{{ item.title }}</div>
      </div>
    </div>

    <!-- 指示器 -->
    <div v-if="indicator !== 'none'" class="carouselIndicators">
      <template v-if="indicator === 'dots'">
        <span
          v-for="(_, index) in items"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="goTo(index)"
        />
      </template>
      <template v-else-if="indicator === 'numbers'">
        <span class="numbers">{{ currentIndex + 1 }} / {{ items.length }}</span>
      </template>
    </div>

    <!-- 箭头 -->
    <button class="carouselArrow prev" @click="prev">‹</button>
    <button class="carouselArrow next" @click="next">›</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

// 默认轮播项
const defaultItems = [
  { src: 'https://via.placeholder.com/400x200/4ecdc4/fff?text=Slide+1', title: '轮播图 1' },
  { src: 'https://via.placeholder.com/400x200/ff6b6b/fff?text=Slide+2', title: '轮播图 2' },
  { src: 'https://via.placeholder.com/400x200/45b7d1/fff?text=Slide+3', title: '轮播图 3' }
]

const items = computed(() => props.element.carouselItems?.length
  ? props.element.carouselItems
  : defaultItems
)

const autoplay = computed(() => props.element.carouselAutoplay !== false)
const interval = computed(() => props.element.carouselInterval || 3000)
const indicator = computed(() => props.element.carouselIndicator || 'dots')
const effect = computed(() => props.element.carouselEffect || 'slide')

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  position: 'relative' as const,
  overflow: 'hidden',
  ...props.element.style
}))

const trackStyle = computed(() => {
  if (effect.value === 'fade') {
    return { position: 'relative' as const, width: '100%', height: '100%' }
  }
  return {
    display: 'flex',
    transition: 'transform 0.3s ease',
    transform: `translateX(-${currentIndex.value * 100}%)`,
    width: '100%',
    height: '100%'
  }
})

const getSlideStyle = (index: number) => {
  if (effect.value === 'fade') {
    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: index === currentIndex.value ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }
  }
  return {
    flexShrink: 0,
    width: '100%',
    height: '100%'
  }
}

const goTo = (index: number) => {
  currentIndex.value = index
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % items.value.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + items.value.length) % items.value.length
}

const startAutoplay = () => {
  if (autoplay.value && props.mode === 'render') {
    timer = setInterval(next, interval.value)
  }
}

const stopAutoplay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(startAutoplay)
onUnmounted(stopAutoplay)

watch([autoplay, interval], () => {
  stopAutoplay()
  startAutoplay()
})
</script>

<style scoped>
.carouselElement {
  background: #f5f5f5;
  border-radius: 4px;
}

.carouselSlide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slideTitle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  color: #fff;
  font-size: 14px;
}

.carouselIndicators {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.2s;
}

.dot.active {
  background: #fff;
}

.numbers {
  background: rgba(0,0,0,0.5);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.carouselArrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0,0,0,0.3);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.carouselArrow:hover {
  background: rgba(0,0,0,0.5);
}

.carouselArrow.prev {
  left: 8px;
}

.carouselArrow.next {
  right: 8px;
}
</style>
