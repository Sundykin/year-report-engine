<template>
  <div
    class="elementWrapper"
    :class="{ selected: isSelected, locked: element.locked, showBorder: showBorder && !isSelected }"
    :style="wrapperStyle"
    @mousedown.stop="handleMouseDown"
    @contextmenu.prevent.stop="$emit('contextmenu', $event)"
  >
    <!-- 未选中时的虚线边框 -->
    <div v-if="showBorder && !isSelected" class="dashedBorder" />

    <!-- 选中边框和控制点 -->
    <template v-if="isSelected && !element.locked">
      <div class="selectionBorder" />
      <!-- 旋转控制点 -->
      <div class="rotateConnector" />
      <div class="rotateHandle" @mousedown.stop="startRotate" />
      <!-- 四角缩放 -->
      <div class="resizeHandle corner nw" :style="{ cursor: cursorNW }" @mousedown.stop="startResize($event, 'nw')" />
      <div class="resizeHandle corner ne" :style="{ cursor: cursorNE }" @mousedown.stop="startResize($event, 'ne')" />
      <div class="resizeHandle corner sw" :style="{ cursor: cursorSW }" @mousedown.stop="startResize($event, 'sw')" />
      <div class="resizeHandle corner se" :style="{ cursor: cursorSE }" @mousedown.stop="startResize($event, 'se')" />
      <!-- 四边缩放 -->
      <div class="resizeHandle edge n" :style="{ cursor: cursorN }" @mousedown.stop="startResize($event, 'n')" />
      <div class="resizeHandle edge s" :style="{ cursor: cursorS }" @mousedown.stop="startResize($event, 's')" />
      <div class="resizeHandle edge w" :style="{ cursor: cursorW }" @mousedown.stop="startResize($event, 'w')" />
      <div class="resizeHandle edge e" :style="{ cursor: cursorE }" @mousedown.stop="startResize($event, 'e')" />
    </template>

    <!-- 锁定元素的选中边框 -->
    <template v-if="isSelected && element.locked">
      <div class="lockedBorder" />
      <div class="lockIcon">🔒</div>
    </template>

    <!-- 元素内容 -->
    <div class="elementContent" :style="element.type === 'shape' ? {} : element.style">
      <slot />
    </div>

    <!-- 位置/尺寸/旋转提示 -->
    <div v-if="showInfo && isSelected" class="infoTip">
      {{ Math.round(element.x) }}, {{ Math.round(element.y) }} | {{ Math.round(element.width) }} × {{ Math.round(element.height) }}<template v-if="element.rotation"> | {{ Math.round(element.rotation) }}°</template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { H5Element } from '@year-report/core'

interface Props {
  element: H5Element
  isSelected: boolean
  showBorder?: boolean
  isInGroup?: boolean
  canvasWidth: number
  canvasHeight: number
  extendWidth: number
  extendHeight: number
  offsetX?: number
  offsetY?: number
  keyframePreview?: { x?: number; y?: number; opacity?: number; rotate?: number; scale?: number } | null
}

const props = withDefaults(defineProps<Props>(), {
  offsetX: 0,
  offsetY: 0,
  showBorder: false,
  isInGroup: false
})

const emit = defineEmits<{
  select: [id: string, multiSelect: boolean]
  update: [updates: Partial<H5Element>]
  contextmenu: [e: MouseEvent]
  dragend: []
}>()

const showInfo = ref(false)
const isDragging = ref(false)
const isResizing = ref(false)

// 根据旋转角度计算cursor方向
const cursorMap = ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize']
const getRotatedCursor = (direction: string) => {
  const rotation = props.element.rotation || 0
  // 每45度切换一次cursor
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

// 边界计算（相对于可视区域的坐标）
const bounds = computed(() => ({
  minX: -props.extendWidth / 2,
  maxX: props.canvasWidth + props.extendWidth / 2,
  minY: -props.extendHeight / 2,
  maxY: props.canvasHeight + props.extendHeight / 2
}))

// 元素在extendArea中的实际位置
const wrapperStyle = computed(() => {
  const kf = props.keyframePreview
  const transforms = []

  // 位置
  const x = kf?.x !== undefined ? kf.x : props.element.x
  const y = kf?.y !== undefined ? kf.y : props.element.y

  // 变换
  if (kf?.scale !== undefined) {
    transforms.push(`scale(${kf.scale})`)
  }
  const rotation = kf?.rotate !== undefined ? kf.rotate : (props.element.rotation || 0)
  if (rotation !== 0) {
    transforms.push(`rotate(${rotation}deg)`)
  }

  return {
    left: `${x + props.offsetX}px`,
    top: `${y + props.offsetY}px`,
    width: `${props.element.width}px`,
    height: `${props.element.height}px`,
    zIndex: props.isSelected ? 9999 : props.element.zIndex ?? 1,
    opacity: kf?.opacity !== undefined ? kf.opacity : 1,
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    transformOrigin: 'center center',
    // 拖拽时禁用 transition，只有非拖拽状态下的关键帧切换才用 transition
    transition: (props.keyframePreview && !isDragging.value) ? 'all 0.2s ease' : 'none'
  }
})

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'

// 计算旋转后的边界框
const getRotatedBounds = (x: number, y: number, width: number, height: number, rotation: number) => {
  if (rotation === 0) {
    return { left: x, right: x + width, top: y, bottom: y + height }
  }
  const cx = x + width / 2
  const cy = y + height / 2
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const halfW = width / 2
  const halfH = height / 2

  const corners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: -halfW, y: halfH },
    { x: halfW, y: halfH }
  ].map(c => ({
    x: cx + c.x * cos - c.y * sin,
    y: cy + c.x * sin + c.y * cos
  }))

  return {
    left: Math.min(...corners.map(c => c.x)),
    right: Math.max(...corners.map(c => c.x)),
    top: Math.min(...corners.map(c => c.y)),
    bottom: Math.max(...corners.map(c => c.y))
  }
}

// 考虑旋转的位置约束
const constrainPosition = (x: number, y: number, width: number, height: number) => {
  const rotation = props.element.rotation || 0
  const rotatedBounds = getRotatedBounds(x, y, width, height, rotation)

  let newX = x, newY = y

  // 根据旋转后的边界进行限制
  if (rotatedBounds.left < bounds.value.minX) {
    newX = x + (bounds.value.minX - rotatedBounds.left)
  } else if (rotatedBounds.right > bounds.value.maxX) {
    newX = x - (rotatedBounds.right - bounds.value.maxX)
  }

  if (rotatedBounds.top < bounds.value.minY) {
    newY = y + (bounds.value.minY - rotatedBounds.top)
  } else if (rotatedBounds.bottom > bounds.value.maxY) {
    newY = y - (rotatedBounds.bottom - bounds.value.maxY)
  }

  return { x: newX, y: newY }
}

// 缩放约束：固定角不动，只调整尺寸
const constrainResize = (
  x: number, y: number, width: number, height: number,
  direction: ResizeDirection
) => {
  const MIN_SIZE = 20
  let newX = x, newY = y, newW = width, newH = height

  // 根据方向确定固定边/角，只限制尺寸
  if (direction.includes('e')) {
    newW = clamp(width, MIN_SIZE, bounds.value.maxX - x)
  }
  if (direction.includes('w')) {
    const maxW = x + width - bounds.value.minX
    newW = clamp(width, MIN_SIZE, maxW)
    newX = x + width - newW // 右边固定
  }
  if (direction.includes('s')) {
    newH = clamp(height, MIN_SIZE, bounds.value.maxY - y)
  }
  if (direction.includes('n')) {
    const maxH = y + height - bounds.value.minY
    newH = clamp(height, MIN_SIZE, maxH)
    newY = y + height - newH // 下边固定
  }

  return { x: newX, y: newY, width: newW, height: newH }
}

// 拖拽移动
const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0 || props.element.locked) return

  const multiSelect = e.shiftKey || e.ctrlKey || e.metaKey
  emit('select', props.element.id, multiSelect)

  // 组内元素不能单独拖动，只触发选中
  if (props.isInGroup) return

  const startX = e.clientX
  const startY = e.clientY
  // 记录拖拽开始时的初始位置（关键帧模式用预览位置，普通模式用元素位置）
  const kf = props.keyframePreview
  const initialX = kf?.x !== undefined ? kf.x : props.element.x
  const initialY = kf?.y !== undefined ? kf.y : props.element.y

  isDragging.value = true
  showInfo.value = true

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    // 直接用初始位置加偏移计算新位置，不依赖实时 props
    const rawX = initialX + deltaX
    const rawY = initialY + deltaY

    const newPos = constrainPosition(
      rawX,
      rawY,
      props.element.width,
      props.element.height
    )

    emit('update', { x: newPos.x, y: newPos.y })
  }

  const handleMouseUp = () => {
    isDragging.value = false
    showInfo.value = false
    emit('dragend')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 缩放（支持旋转状态下保持对角/对边固定）
const startResize = (e: MouseEvent, direction: ResizeDirection) => {
  e.preventDefault()

  const startMouseX = e.clientX
  const startMouseY = e.clientY
  const initialX = props.element.x
  const initialY = props.element.y
  const initialWidth = props.element.width
  const initialHeight = props.element.height
  const rotation = props.element.rotation || 0
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // 元素中心点（世界坐标）
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

  isResizing.value = true
  showInfo.value = true

  const MIN_SIZE = 20

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startMouseX
    const deltaY = e.clientY - startMouseY

    // 将鼠标移动转换到本地坐标系
    const localDeltaX = deltaX * cos + deltaY * sin
    const localDeltaY = -deltaX * sin + deltaY * cos

    let newWidth = initialWidth
    let newHeight = initialHeight

    // 根据方向计算新尺寸
    if (direction.includes('e')) newWidth = Math.max(MIN_SIZE, initialWidth + localDeltaX)
    if (direction.includes('w')) newWidth = Math.max(MIN_SIZE, initialWidth - localDeltaX)
    if (direction.includes('s')) newHeight = Math.max(MIN_SIZE, initialHeight + localDeltaY)
    if (direction.includes('n')) newHeight = Math.max(MIN_SIZE, initialHeight - localDeltaY)

    // Shift键等比例缩放
    if (e.shiftKey) {
      const ratio = initialWidth / initialHeight
      if (direction === 'e' || direction === 'w') {
        newHeight = newWidth / ratio
      } else if (direction === 'n' || direction === 's') {
        newWidth = newHeight * ratio
      } else {
        const avgScale = (newWidth / initialWidth + newHeight / initialHeight) / 2
        newWidth = initialWidth * avgScale
        newHeight = initialHeight * avgScale
      }
    }

    // 计算新的本地锚点位置（尺寸变化后）
    let newAnchorLocalX = 0, newAnchorLocalY = 0
    if (direction.includes('e')) newAnchorLocalX = -newWidth / 2
    if (direction.includes('w')) newAnchorLocalX = newWidth / 2
    if (direction.includes('s')) newAnchorLocalY = -newHeight / 2
    if (direction.includes('n')) newAnchorLocalY = newHeight / 2

    // 根据固定点计算新中心（保持固定点世界坐标不变）
    const newCenterX = anchorWorldX - (newAnchorLocalX * cos - newAnchorLocalY * sin)
    const newCenterY = anchorWorldY - (newAnchorLocalX * sin + newAnchorLocalY * cos)

    // 计算新的左上角位置
    const newX = newCenterX - newWidth / 2
    const newY = newCenterY - newHeight / 2

    // 旋转状态下使用旋转边界检测
    if (rotation !== 0) {
      const rotatedBounds = getRotatedBounds(newX, newY, newWidth, newHeight, rotation)
      // 检查是否超出边界
      if (rotatedBounds.left < bounds.value.minX || rotatedBounds.right > bounds.value.maxX ||
          rotatedBounds.top < bounds.value.minY || rotatedBounds.bottom > bounds.value.maxY) {
        return // 超出边界，不更新
      }
      // 传递固定点坐标，用于吸附后重新计算位置
      emit('update', {
        x: newX, y: newY, width: newWidth, height: newHeight,
        _resizeDir: direction, _rotation: rotation,
        _anchorX: anchorWorldX, _anchorY: anchorWorldY
      })
    } else {
      const constrained = constrainResize(newX, newY, newWidth, newHeight, direction)
      emit('update', { ...constrained, _resizeDir: direction })
    }
  }

  const handleMouseUp = () => {
    isResizing.value = false
    showInfo.value = false
    emit('dragend')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 检查旋转后是否超出边界
const isRotationInBounds = (rotation: number) => {
  const rotatedBounds = getRotatedBounds(
    props.element.x, props.element.y,
    props.element.width, props.element.height,
    rotation
  )
  return (
    rotatedBounds.left >= bounds.value.minX &&
    rotatedBounds.right <= bounds.value.maxX &&
    rotatedBounds.top >= bounds.value.minY &&
    rotatedBounds.bottom <= bounds.value.maxY
  )
}

// 旋转
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

    // 角度吸附到 45° 的倍数
    const snapAngle = 45
    const snapThreshold = 5
    const remainder = angle % snapAngle
    if (Math.abs(remainder) < snapThreshold) {
      angle = angle - remainder
    } else if (Math.abs(remainder - snapAngle) < snapThreshold) {
      angle = angle + (snapAngle - remainder)
    }

    // 限制角度范围 -720 到 720
    let newRotation = Math.round(angle)
    if (newRotation > 720) newRotation = 720
    if (newRotation < -720) newRotation = -720

    // 边界检测：如果旋转后超出边界，不更新
    if (!isRotationInBounds(newRotation)) {
      return
    }

    emit('update', { rotation: newRotation })
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
.elementWrapper {
  position: absolute;
  cursor: move;
}

.elementWrapper.locked {
  cursor: not-allowed;
}

.elementContent {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.selectionBorder {
  position: absolute;
  inset: -1px;
  border: 2px solid #2563eb;
  pointer-events: none;
}

.dashedBorder {
  position: absolute;
  inset: -1px;
  border: 1px dashed rgba(147, 197, 253, 0.5);
  pointer-events: none;
}

.lockedBorder {
  position: absolute;
  inset: -1px;
  border: 2px solid #f59e0b;
  pointer-events: none;
}

.lockIcon {
  position: absolute;
  top: -20px;
  right: -4px;
  font-size: 14px;
  pointer-events: none;
}

.resizeHandle {
  position: absolute;
  background-color: #2563eb;
  z-index: 10;
}

.resizeHandle.corner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #2563eb;
}

.resizeHandle.edge {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #2563eb;
}

/* 四角 */
.resizeHandle.nw { top: -3px; left: -3px; }
.resizeHandle.ne { top: -3px; right: -3px; }
.resizeHandle.sw { bottom: -3px; left: -3px; }
.resizeHandle.se { bottom: -3px; right: -3px; }

/* 四边 */
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
  background-color: #2563eb;
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
  border: 2px solid #2563eb;
  border-radius: 50%;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>') 12 12, grab;
  z-index: 10;
}

.rotateHandle:hover {
  background-color: rgba(37, 99, 235, 0.2);
}

.rotateHandle:active {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>') 12 12, grabbing;
}

.infoTip {
  position: absolute;
  top: -24px;
  left: 0;
  background-color: rgba(37, 99, 235, 0.9);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
}
</style>
