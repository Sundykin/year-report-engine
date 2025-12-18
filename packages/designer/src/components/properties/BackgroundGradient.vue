<template>
  <div class="gradientConfig">
    <!-- 渐变类型 -->
    <div class="inputGroup">
      <label class="inputLabel">渐变类型</label>
      <select v-model="gradientType" class="select">
        <option value="linear">线性渐变</option>
        <option value="radial">径向渐变</option>
      </select>
    </div>

    <!-- 渐变方向（仅线性渐变） -->
    <div v-if="gradientType === 'linear'" class="inputGroup">
      <label class="inputLabel">渐变方向</label>
      <select v-model="gradientDirection" class="select">
        <option value="to right">向右 →</option>
        <option value="to left">向左 ←</option>
        <option value="to bottom">向下 ↓</option>
        <option value="to top">向上 ↑</option>
        <option value="to bottom right">右下 ↘</option>
        <option value="to bottom left">左下 ↙</option>
        <option value="to top right">右上 ↗</option>
        <option value="to top left">左上 ↖</option>
      </select>
    </div>

    <!-- 颜色列表 -->
    <div class="colorList">
      <div class="sectionSubtitle">渐变颜色</div>
      <div
        v-for="(color, index) in gradient.colors"
        :key="index"
        class="colorItem"
      >
        <input
          type="color"
          :value="color.color"
          @input="updateColor(index, ($event.target as HTMLInputElement).value)"
          class="colorInput"
        />
        <input
          type="text"
          :value="color.color"
          @input="updateColor(index, ($event.target as HTMLInputElement).value)"
          class="colorText"
          placeholder="#000000"
        />
        <input
          type="text"
          :value="color.position || ''"
          @input="updatePosition(index, ($event.target as HTMLInputElement).value)"
          class="positionInput"
          placeholder="0%"
        />
        <button
          v-if="gradient.colors.length > 2"
          @click="removeColor(index)"
          class="removeBtn"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button
        v-if="gradient.colors.length < 5"
        @click="addColor"
        class="addBtn"
      >
        + 添加颜色
      </button>
    </div>

    <!-- 预览 -->
    <div class="preview">
      <div class="previewBox" :style="{ background: gradientStyle }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { H5Page } from '@year-report/core'

interface Props {
  page: H5Page
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:page': [updates: Partial<H5Page>]
}>()

// 渐变数据
const gradientType = computed({
  get: () => props.page.backgroundGradient?.type || 'linear',
  set: (value) => {
    updateGradient({ type: value })
  }
})

const gradientDirection = computed({
  get: () => props.page.backgroundGradient?.direction || 'to bottom',
  set: (value) => {
    updateGradient({ direction: value })
  }
})

const gradient = computed(() => {
  return props.page.backgroundGradient || {
    type: 'linear',
    direction: 'to bottom',
    colors: [
      { color: '#000000', position: '0%' },
      { color: '#ffffff', position: '100%' }
    ]
  }
})

// 生成CSS样式
const gradientStyle = computed(() => {
  const { type, direction, colors } = gradient.value
  const colorStops = colors.map(c => `${c.color} ${c.position || ''}`).join(', ')

  if (type === 'linear') {
    return `linear-gradient(${direction}, ${colorStops})`
  } else {
    return `radial-gradient(circle, ${colorStops})`
  }
})

// 更新渐变
const updateGradient = (updates: any) => {
  const newGradient = {
    ...gradient.value,
    ...updates
  }
  emit('update:page', { backgroundGradient: newGradient })
}

// 更新颜色
const updateColor = (index: number, color: string) => {
  const newColors = [...gradient.value.colors]
  newColors[index] = { ...newColors[index], color }
  updateGradient({ colors: newColors })
}

// 更新位置
const updatePosition = (index: number, position: string) => {
  const newColors = [...gradient.value.colors]
  newColors[index] = { ...newColors[index], position }
  updateGradient({ colors: newColors })
}

// 添加颜色
const addColor = () => {
  const newColors = [...gradient.value.colors]
  const lastColor = newColors[newColors.length - 1]
  const lastPosition = parseInt(lastColor.position || '100')

  newColors.push({
    color: '#ffffff',
    position: `${Math.min(lastPosition + 10, 100)}%`
  })

  updateGradient({ colors: newColors })
}

// 删除颜色
const removeColor = (index: number) => {
  const newColors = gradient.value.colors.filter((_, i) => i !== index)
  updateGradient({ colors: newColors })
}
</script>

<style scoped>
.gradientConfig {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inputLabel {
  font-size: 10px;
  color: #737373;
  text-transform: uppercase;
}

.select {
  width: 100%;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: #1890ff;
}

.sectionSubtitle {
  font-size: 11px;
  color: #a3a3a3;
  margin-bottom: 8px;
}

.colorList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.colorItem {
  display: flex;
  gap: 8px;
  align-items: center;
}

.colorInput {
  width: 40px;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.colorText {
  flex: 1;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.positionInput {
  width: 50px;
  background: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.removeBtn {
  width: 24px;
  height: 24px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.removeBtn:hover {
  background: #ff7875;
}

.actions {
  display: flex;
  gap: 8px;
}

.addBtn {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.addBtn:hover {
  background: #40a9ff;
}

.preview {
  margin-top: 12px;
}

.previewBox {
  width: 100%;
  height: 60px;
  border-radius: 4px;
  border: 1px solid #444;
}
</style>