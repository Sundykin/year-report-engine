<template>
  <div class="bezierEditor">
    <div class="previewSection">
      <div class="curvePreview" ref="curveRef">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <!-- 网格 -->
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#grid)" />

          <!-- 对角线参考 -->
          <line x1="0" y1="200" x2="200" y2="0" stroke="#444" stroke-width="1" stroke-dasharray="4"/>

          <!-- 控制点连线 -->
          <line :x1="0" :y1="200" :x2="p1.x" :y2="200 - p1.y" stroke="#3b82f6" stroke-width="1"/>
          <line :x1="200" :y1="0" :x2="p2.x" :y2="200 - p2.y" stroke="#3b82f6" stroke-width="1"/>

          <!-- 贝塞尔曲线 -->
          <path :d="curvePath" fill="none" stroke="#10b981" stroke-width="2"/>

          <!-- 控制点 -->
          <circle
            :cx="p1.x" :cy="200 - p1.y" r="8"
            fill="#3b82f6"
            class="controlPoint"
            @mousedown="startDrag($event, 1)"
          />
          <circle
            :cx="p2.x" :cy="200 - p2.y" r="8"
            fill="#3b82f6"
            class="controlPoint"
            @mousedown="startDrag($event, 2)"
          />
        </svg>
      </div>

      <!-- 动画预览 -->
      <div class="animPreview">
        <div class="animTrack">
          <div class="animBall" :style="ballStyle"></div>
        </div>
        <button class="playBtn" @click="playPreview">{{ isPlaying ? '⏹' : '▶' }}</button>
      </div>
    </div>

    <!-- 预设 -->
    <div class="presets">
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="presetBtn"
        :class="{ active: isPresetActive(preset) }"
        @click="applyPreset(preset)"
      >
        {{ preset.name }}
      </button>
    </div>

    <!-- 数值输入 -->
    <div class="valueInputs">
      <div class="inputGroup">
        <label>x1</label>
        <input type="number" v-model.number="p1.x" min="0" max="200" step="1" @input="emitChange" />
      </div>
      <div class="inputGroup">
        <label>y1</label>
        <input type="number" v-model.number="p1.y" min="-50" max="250" step="1" @input="emitChange" />
      </div>
      <div class="inputGroup">
        <label>x2</label>
        <input type="number" v-model.number="p2.x" min="0" max="200" step="1" @input="emitChange" />
      </div>
      <div class="inputGroup">
        <label>y2</label>
        <input type="number" v-model.number="p2.y" min="-50" max="250" step="1" @input="emitChange" />
      </div>
    </div>

    <div class="cssOutput">
      <code>cubic-bezier({{ cssValue }})</code>
      <button class="copyBtn" @click="copyToClipboard">📋</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

interface Props {
  modelValue?: string  // cubic-bezier(x1, y1, x2, y2) 格式
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 控制点 (0-200 坐标系)
const p1 = ref({ x: 50, y: 20 })
const p2 = ref({ x: 50, y: 200 })

// 预设曲线
const presets = [
  { name: 'ease', value: [0.25, 0.1, 0.25, 1] },
  { name: 'ease-in', value: [0.42, 0, 1, 1] },
  { name: 'ease-out', value: [0, 0, 0.58, 1] },
  { name: 'ease-in-out', value: [0.42, 0, 0.58, 1] },
  { name: 'linear', value: [0, 0, 1, 1] },
  { name: 'bounce', value: [0.68, -0.55, 0.265, 1.55] },
  { name: 'elastic', value: [0.68, -0.6, 0.32, 1.6] }
]

// 解析初始值
const parseValue = (value: string) => {
  const match = value.match(/cubic-bezier\(([\d.-]+),\s*([\d.-]+),\s*([\d.-]+),\s*([\d.-]+)\)/)
  if (match) {
    p1.value = { x: parseFloat(match[1]) * 200, y: parseFloat(match[2]) * 200 }
    p2.value = { x: parseFloat(match[3]) * 200, y: parseFloat(match[4]) * 200 }
  }
}

watch(() => props.modelValue, parseValue, { immediate: true })

// CSS 值 (0-1 范围)
const cssValue = computed(() => {
  const x1 = (p1.value.x / 200).toFixed(3)
  const y1 = (p1.value.y / 200).toFixed(3)
  const x2 = (p2.value.x / 200).toFixed(3)
  const y2 = (p2.value.y / 200).toFixed(3)
  return `${x1}, ${y1}, ${x2}, ${y2}`
})

// SVG 路径
const curvePath = computed(() => {
  return `M 0 200 C ${p1.value.x} ${200 - p1.value.y}, ${p2.value.x} ${200 - p2.value.y}, 200 0`
})

// 拖拽控制点
const curveRef = ref<HTMLDivElement | null>(null)
let draggingPoint = 0

const startDrag = (e: MouseEvent, point: number) => {
  draggingPoint = point
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e: MouseEvent) => {
  if (!curveRef.value || !draggingPoint) return

  const rect = curveRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(200, e.clientX - rect.left))
  const y = Math.max(-50, Math.min(250, 200 - (e.clientY - rect.top)))

  if (draggingPoint === 1) {
    p1.value = { x, y }
  } else {
    p2.value = { x, y }
  }
  emitChange()
}

const stopDrag = () => {
  draggingPoint = 0
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})

const emitChange = () => {
  emit('update:modelValue', `cubic-bezier(${cssValue.value})`)
}

// 预设
const applyPreset = (preset: { name: string; value: number[] }) => {
  p1.value = { x: preset.value[0] * 200, y: preset.value[1] * 200 }
  p2.value = { x: preset.value[2] * 200, y: preset.value[3] * 200 }
  emitChange()
}

const isPresetActive = (preset: { value: number[] }) => {
  const tolerance = 0.01
  return (
    Math.abs(p1.value.x / 200 - preset.value[0]) < tolerance &&
    Math.abs(p1.value.y / 200 - preset.value[1]) < tolerance &&
    Math.abs(p2.value.x / 200 - preset.value[2]) < tolerance &&
    Math.abs(p2.value.y / 200 - preset.value[3]) < tolerance
  )
}

// 动画预览
const isPlaying = ref(false)
const progress = ref(0)
let animationId: number | null = null

const ballStyle = computed(() => ({
  left: `${progress.value * 100}%`,
  transition: isPlaying.value ? 'none' : `left 1s cubic-bezier(${cssValue.value})`
}))

const playPreview = () => {
  if (isPlaying.value) {
    if (animationId) cancelAnimationFrame(animationId)
    isPlaying.value = false
    progress.value = 0
    return
  }

  isPlaying.value = true
  const startTime = performance.now()
  const duration = 1000

  const animate = (time: number) => {
    const elapsed = time - startTime
    const t = Math.min(elapsed / duration, 1)
    progress.value = bezierAt(t, p1.value.x / 200, p1.value.y / 200, p2.value.x / 200, p2.value.y / 200)

    if (t < 1) {
      animationId = requestAnimationFrame(animate)
    } else {
      isPlaying.value = false
      setTimeout(() => { progress.value = 0 }, 300)
    }
  }

  animationId = requestAnimationFrame(animate)
}

// 计算贝塞尔曲线上的点
const bezierAt = (t: number, x1: number, y1: number, x2: number, y2: number): number => {
  // 简化的贝塞尔计算，查找对应 t 的 y 值
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  // 使用牛顿迭代法找到对应 t 的 x 值
  let currentT = t
  for (let i = 0; i < 5; i++) {
    const currentX = ((ax * currentT + bx) * currentT + cx) * currentT
    const derivative = (3 * ax * currentT + 2 * bx) * currentT + cx
    if (Math.abs(derivative) < 1e-6) break
    currentT -= (currentX - t) / derivative
  }

  return ((ay * currentT + by) * currentT + cy) * currentT
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(`cubic-bezier(${cssValue.value})`)
}
</script>

<style scoped>
.bezierEditor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #1a1a1a;
  border-radius: 8px;
}

.previewSection {
  display: flex;
  gap: 12px;
}

.curvePreview {
  background: #0a0a0a;
  border-radius: 4px;
  overflow: hidden;
}

.controlPoint {
  cursor: grab;
  transition: r 0.1s;
}

.controlPoint:hover {
  r: 10;
}

.controlPoint:active {
  cursor: grabbing;
}

.animPreview {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animTrack {
  flex: 1;
  background: #262626;
  border-radius: 4px;
  position: relative;
  min-height: 40px;
}

.animBall {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: #10b981;
  border-radius: 50%;
}

.playBtn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.presetBtn {
  background: #262626;
  color: #a3a3a3;
  border: 1px solid #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}

.presetBtn:hover {
  background: #333;
  color: white;
}

.presetBtn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.valueInputs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inputGroup label {
  font-size: 10px;
  color: #666;
}

.inputGroup input {
  background: #262626;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 4px 6px;
  color: white;
  font-size: 12px;
  width: 100%;
}

.cssOutput {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #262626;
  padding: 8px 12px;
  border-radius: 4px;
}

.cssOutput code {
  flex: 1;
  font-size: 11px;
  color: #10b981;
}

.copyBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
</style>
