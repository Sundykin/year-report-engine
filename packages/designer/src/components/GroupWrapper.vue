<template>
  <div
    class="groupWrapper"
    :class="{ selected: isSelected }"
    :style="wrapperStyle"
    @mousedown.stop="handleMouseDown"
    @contextmenu.prevent.stop="$emit('contextmenu', $event)"
  >
    <!-- 组内元素（相对于分组左上角定位） -->
    <div
      v-for="el in bounds.elements"
      :key="el.id"
      class="groupElement"
      :style="getElementStyle(el)"
    >
      <div v-if="el.type === 'text'" class="textElement" :style="el.style">{{ el.content }}</div>
      <div v-else-if="el.type === 'richtext'" class="richTextElement" :style="el.style" v-html="el.content" />
      <img v-else-if="el.type === 'image'" :src="el.src" class="imageElement" :style="el.style" alt="" />
      <div v-else-if="el.type === 'shape'" class="shapeElement" :class="`shape-${el.shapeType || 'rectangle'}`" :style="el.style" />
      <div v-else-if="el.type === 'video'" class="videoPlaceholder" :style="el.style">🎬</div>
      <div v-else-if="el.type === 'chart'" class="chartPlaceholder" :style="el.style">📊 图表</div>
    </div>

    <!-- 选中时的控制点 -->
    <template v-if="isSelected">
      <div class="rotateConnector" />
      <div class="rotateHandle" @mousedown.stop="startRotate" />
      <div class="resizeHandle corner nw" :style="{ cursor: cursorNW }" @mousedown.stop="startResize($event, 'nw')" />
      <div class="resizeHandle corner ne" :style="{ cursor: cursorNE }" @mousedown.stop="startResize($event, 'ne')" />
      <div class="resizeHandle corner sw" :style="{ cursor: cursorSW }" @mousedown.stop="startResize($event, 'sw')" />
      <div class="resizeHandle corner se" :style="{ cursor: cursorSE }" @mousedown.stop="startResize($event, 'se')" />
      <div class="resizeHandle edge n" :style="{ cursor: cursorN }" @mousedown.stop="startResize($event, 'n')" />
      <div class="resizeHandle edge s" :style="{ cursor: cursorS }" @mousedown.stop="startResize($event, 's')" />
      <div class="resizeHandle edge w" :style="{ cursor: cursorW }" @mousedown.stop="startResize($event, 'w')" />
      <div class="resizeHandle edge e" :style="{ cursor: cursorE }" @mousedown.stop="startResize($event, 'e')" />
    </template>

    <span class="groupLabel">组</span>

    <div v-if="showInfo && isSelected" class="infoTip">
      {{ Math.round(bounds.x) }}, {{ Math.round(bounds.y) }} | {{ Math.round(bounds.width) }} × {{ Math.round(bounds.height) }}<template v-if="groupRotation"> | {{ Math.round(groupRotation) }}°</template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { H5Element } from '@year-report/core'
import type { GroupBounds } from '../composables/useGroupOperations'

interface Props {
  bounds: GroupBounds
  isSelected: boolean
  groupRotation?: number
  offsetX?: number
  offsetY?: number
}

const props = withDefaults(defineProps<Props>(), {
  offsetX: 0,
  offsetY: 0,
  groupRotation: 0
})

// 根据旋转角度计算cursor方向
const cursorMap = ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize']
const getRotatedCursor = (direction: string) => {
  const rotation = props.groupRotation || 0
  const index = Math.round(rotation / 45) % 8
  const absIndex = index < 0 ? index + 8 : index

  const directionIndex: Record<string, number> = {
    n: 0, ne: 1, e: 2, se: 3, s: 4, sw: 5, w: 6, nw: 7
  }
  const baseIndex = directionIndex[direction] || 0
  const newIndex = (baseIndex + absIndex) % 8
  return cursorMap[newIndex % 4]
}

const cursorN = computed(() => getRotatedCursor('n'))
const cursorS = computed(() => getRotatedCursor('s'))
const cursorE = computed(() => getRotatedCursor('e'))
const cursorW = computed(() => getRotatedCursor('w'))
const cursorNW = computed(() => getRotatedCursor('nw'))
const cursorNE = computed(() => getRotatedCursor('ne'))
const cursorSW = computed(() => getRotatedCursor('sw'))
const cursorSE = computed(() => getRotatedCursor('se'))

const emit = defineEmits<{
  select: [groupId: string]
  move: [deltaX: number, deltaY: number]
  resize: [scaleX: number, scaleY: number, anchorX: number, anchorY: number]
  rotate: [angle: number]
  dragend: []
  contextmenu: [e: MouseEvent]
}>()

const showInfo = ref(false)

const wrapperStyle = computed(() => ({
  left: `${props.bounds.x + props.offsetX}px`,
  top: `${props.bounds.y + props.offsetY}px`,
  width: `${props.bounds.width}px`,
  height: `${props.bounds.height}px`,
  transform: props.groupRotation ? `rotate(${props.groupRotation}deg)` : undefined,
  transformOrigin: 'center center'
}))

// 计算元素相对于分组的位置
const getElementStyle = (el: H5Element) => {
  const transforms = []
  if (el.rotation) transforms.push(`rotate(${el.rotation}deg)`)

  return {
    left: `${el.x - props.bounds.x}px`,
    top: `${el.y - props.bounds.y}px`,
    width: `${el.width}px`,
    height: `${el.height}px`,
    zIndex: el.zIndex ?? 1,
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    transformOrigin: 'center center'
  }
}

// 拖拽移动
const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return
  emit('select', props.bounds.groupId)

  const startX = e.clientX
  const startY = e.clientY
  showInfo.value = true

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    emit('move', deltaX, deltaY)
  }

  const handleMouseUp = () => {
    showInfo.value = false
    emit('dragend')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'

const startResize = (e: MouseEvent, direction: ResizeDirection) => {
  e.preventDefault()

  const startMouseX = e.clientX
  const startMouseY = e.clientY
  const initialX = props.bounds.x
  const initialY = props.bounds.y
  const initialWidth = props.bounds.width
  const initialHeight = props.bounds.height
  const rotation = props.groupRotation || 0
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // 分组中心点（世界坐标）- 使用初始值
  const initialCenterX = initialX + initialWidth / 2
  const initialCenterY = initialY + initialHeight / 2

  // 根据方向确定固定点（本地坐标，相对于中心）
  let anchorLocalX = 0, anchorLocalY = 0
  if (direction.includes('e')) anchorLocalX = -initialWidth / 2
  if (direction.includes('w')) anchorLocalX = initialWidth / 2
  if (direction.includes('s')) anchorLocalY = -initialHeight / 2
  if (direction.includes('n')) anchorLocalY = initialHeight / 2

  // 固定点的世界坐标
  const anchorWorldX = initialCenterX + anchorLocalX * cos - anchorLocalY * sin
  const anchorWorldY = initialCenterY + anchorLocalX * sin + anchorLocalY * cos

  showInfo.value = true

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startMouseX
    const deltaY = e.clientY - startMouseY

    // 将鼠标移动转换到本地坐标系
    const localDeltaX = deltaX * cos + deltaY * sin
    const localDeltaY = -deltaX * sin + deltaY * cos

    let scaleX = 1
    let scaleY = 1

    if (direction.includes('e')) scaleX = Math.max(0.1, (initialWidth + localDeltaX) / initialWidth)
    if (direction.includes('w')) scaleX = Math.max(0.1, (initialWidth - localDeltaX) / initialWidth)
    if (direction.includes('s')) scaleY = Math.max(0.1, (initialHeight + localDeltaY) / initialHeight)
    if (direction.includes('n')) scaleY = Math.max(0.1, (initialHeight - localDeltaY) / initialHeight)

    if (e.shiftKey) {
      const avgScale = (scaleX + scaleY) / 2
      scaleX = avgScale
      scaleY = avgScale
    }

    // 传递direction让父组件知道resize方向
    emit('resize', scaleX, scaleY, anchorWorldX, anchorWorldY)
  }

  const handleMouseUp = () => {
    showInfo.value = false
    emit('dragend')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startRotate = (e: MouseEvent) => {
  e.preventDefault()

  const rect = (e.target as HTMLElement).parentElement!.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  showInfo.value = true

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90

    const snapAngle = 45
    const snapThreshold = 5
    const remainder = angle % snapAngle
    if (Math.abs(remainder) < snapThreshold) {
      angle = angle - remainder
    } else if (Math.abs(remainder - snapAngle) < snapThreshold) {
      angle = angle + (snapAngle - remainder)
    }

    emit('rotate', Math.round(angle))
  }

  const handleMouseUp = () => {
    showInfo.value = false
    emit('dragend')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
</script>

<style scoped>
.groupWrapper {
  position: absolute;
  cursor: move;
  border: 2px dashed rgba(168, 85, 247, 0.6);
  z-index: 9998;
  background: transparent;
}

.groupWrapper.selected {
  border-color: #a855f7;
  border-style: solid;
}

.groupElement {
  position: absolute;
  pointer-events: none;
}

.groupElement > * {
  width: 100%;
  height: 100%;
}

.textElement {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: pre-wrap;
  line-height: 1.2;
}

.richTextElement {
  overflow: auto;
  padding: 4px;
}

.imageElement {
  object-fit: cover;
}

.shapeElement {
  width: 100%;
  height: 100%;
}

.shape-rectangle { border-radius: 0; }
.shape-circle { border-radius: 50%; }
.shape-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
.shape-parallelogram { transform: skewX(-20deg); }
.shape-diamond { transform: rotate(45deg); border-radius: 8%; }
.shape-star { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
.shape-hexagon { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }

.videoPlaceholder, .chartPlaceholder {
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #404040;
  font-size: 12px;
  color: #737373;
}

.groupLabel {
  position: absolute;
  top: -18px;
  left: 0;
  background: rgba(168, 85, 247, 0.8);
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 2px;
  pointer-events: none;
}

.resizeHandle {
  position: absolute;
  z-index: 10;
}

.resizeHandle.corner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #a855f7;
}

.resizeHandle.edge {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #a855f7;
}

.resizeHandle.nw { top: -3px; left: -3px; }
.resizeHandle.ne { top: -3px; right: -3px; }
.resizeHandle.sw { bottom: -3px; left: -3px; }
.resizeHandle.se { bottom: -3px; right: -3px; }

.resizeHandle.n { top: -3px; left: 50%; transform: translateX(-50%); }
.resizeHandle.s { bottom: -3px; left: 50%; transform: translateX(-50%); }
.resizeHandle.w { left: -3px; top: 50%; transform: translateY(-50%); }
.resizeHandle.e { right: -3px; top: 50%; transform: translateY(-50%); }

.rotateConnector {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 24px;
  background-color: #a855f7;
  pointer-events: none;
}

.rotateHandle {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background-color: transparent;
  border: 2px solid #a855f7;
  border-radius: 50%;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>') 12 12, grab;
  z-index: 10;
}

.rotateHandle:hover {
  background-color: rgba(168, 85, 247, 0.2);
}

.infoTip {
  position: absolute;
  top: -24px;
  left: 50px;
  background-color: rgba(168, 85, 247, 0.9);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
}
</style>
