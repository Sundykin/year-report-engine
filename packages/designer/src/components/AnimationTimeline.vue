<template>
  <div class="animationTimeline">
    <div class="timelineHeader">
      <span class="title">动画时间线</span>
      <div class="controls">
        <button class="btn" @click="playAll" :disabled="!animations.length">
          {{ isPlaying ? '⏹' : '▶' }} 预览
        </button>
        <button class="btn" @click="$emit('add')" :disabled="!selectedElement || disabled">
          + 添加动画
        </button>
      </div>
    </div>

    <SimpleScrollView v-if="animations.length" class="timelineBody">
      <!-- 时间刻度 -->
      <div class="timeRuler">
        <div class="elementLabel">元素</div>
        <div class="rulerTrack">
          <span v-for="t in timeMarks" :key="t" class="timeMark" :style="{ left: `${t * 100}px` }">
            {{ t }}s
          </span>
        </div>
      </div>

      <!-- 动画轨道 -->
      <div class="tracks">
        <div
          v-for="(anim, index) in sortedAnimations"
          :key="anim.id || index"
          class="track"
          :class="{ active: selectedAnimIndex === index }"
          @click="selectAnimation(index)"
        >
          <div class="elementLabel">{{ getAnimLabel(anim) }}</div>
          <div class="trackBar">
            <div
              class="animBar"
              :class="getTriggerClass(anim.trigger)"
              :style="getBarStyle(anim)"
              @mousedown.stop="startDragBar($event, index)"
            >
              <span class="animName">{{ getAnimTypeName(anim.type) }}</span>
              <span class="triggerIcon">{{ getTriggerIcon(anim.trigger) }}</span>
            </div>
          </div>
        </div>
      </div>
    </SimpleScrollView>

    <div v-else class="emptyTip">
      选择元素后添加动画
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AnimationConfig, H5Element } from '@year-report/core'
import { ANIMATION_GROUPS, ANIMATION_TRIGGERS, EASING_FUNCTIONS } from '@year-report/core'
import SimpleScrollView from './SimpleScrollView.vue'

interface Props {
  animations: AnimationConfig[]
  selectedElement: H5Element | null
  previewingElement?: string | null
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: []
  update: [animations: AnimationConfig[]]
  preview: [animations: AnimationConfig[]]
  select: [index: number]
}>()

const animationGroups = ANIMATION_GROUPS
const _triggers = ANIMATION_TRIGGERS
const _easings = EASING_FUNCTIONS

const selectedAnimIndex = ref(-1)
const isPlaying = computed(() => !!props.previewingElement)

const sortedAnimations = computed(() =>
  [...props.animations].sort((a, b) => (a.order || 0) - (b.order || 0))
)

// 时间刻度 (0-5秒)
const timeMarks = computed(() => {
  const maxTime = Math.max(5, ...props.animations.map(a => (a.delay || 0) + a.duration))
  return Array.from({ length: Math.ceil(maxTime) + 1 }, (_, i) => i)
})

const getAnimLabel = (anim: AnimationConfig) => {
  return `动画 ${(anim.order || 0) + 1}`
}

const getAnimTypeName = (type: string) => {
  for (const group of animationGroups) {
    const item = group.items.find(i => i.value === type)
    if (item) return item.label
  }
  return type
}

const getTriggerIcon = (trigger?: string) => {
  const icons: Record<string, string> = {
    onEnter: '🚀',
    afterPrevious: '⏭',
    withPrevious: '⏸',
    onClick: '👆',
    onDelay: '⏰'
  }
  return icons[trigger || 'onEnter'] || '🚀'
}

const getTriggerClass = (trigger?: string) => `trigger-${trigger || 'onEnter'}`

const getBarStyle = (anim: AnimationConfig) => ({
  left: `${(anim.delay || 0) * 100}px`,
  width: `${anim.duration * 100}px`
})

const selectAnimation = (index: number) => {
  selectedAnimIndex.value = index
  emit('select', index)
}

const playAll = () => {
  if (!isPlaying.value) {
    emit('preview', props.animations)
  }
}

const updateAnimation = () => {
  emit('update', [...props.animations])
}

const startDragBar = (e: MouseEvent, index: number) => {
  if (props.disabled) return
  const startX = e.clientX
  const anim = props.animations[index]
  const initialDelay = anim.delay || 0

  const onMove = (e: MouseEvent) => {
    const delta = (e.clientX - startX) / 100
    anim.delay = Math.max(0, initialDelay + delta)
    updateAnimation()
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

watch(() => props.selectedElement, () => {
  selectedAnimIndex.value = -1
})
</script>

<style scoped>
.animationTimeline {
  background: #1e1e1e;
  color: #fff;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.timelineHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 8px;
}

.btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timelineBody {
  flex: 1;
  min-height: 0;
}

.timeRuler {
  display: flex;
  border-bottom: 1px solid #333;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.elementLabel {
  width: 80px;
  flex-shrink: 0;
  color: #888;
}

.rulerTrack {
  position: relative;
  height: 20px;
  flex: 1;
}

.timeMark {
  position: absolute;
  color: #666;
  font-size: 10px;
}

.tracks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track {
  display: flex;
  align-items: center;
  padding: 4px 0;
  border-radius: 4px;
  cursor: pointer;
}

.track:hover {
  background: #2a2a2a;
}

.track.active {
  background: #333;
}

.trackBar {
  position: relative;
  height: 24px;
  flex: 1;
  background: #2a2a2a;
  border-radius: 4px;
}

.animBar {
  position: absolute;
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  cursor: grab;
  min-width: 60px;
}

.animBar.trigger-afterPrevious { background: #10b981; }
.animBar.trigger-withPrevious { background: #8b5cf6; }
.animBar.trigger-onClick { background: #f59e0b; }
.animBar.trigger-onDelay { background: #ef4444; }

.animName {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.triggerIcon {
  font-size: 14px;
}

.emptyTip {
  color: #666;
  text-align: center;
  padding: 20px;
}
</style>
