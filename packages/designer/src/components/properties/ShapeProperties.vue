<template>
  <div class="section">
    <h4 class="sectionTitle">🔷 形状</h4>
    <div class="inputGroup">
      <label class="inputLabel">形状类型</label>
      <select v-model="element.shapeType" class="select" :disabled="disabled">
        <optgroup label="基础形状">
          <option value="rectangle">矩形</option>
          <option value="circle">圆形</option>
          <option value="triangle">三角形</option>
          <option value="diamond">菱形</option>
          <option value="pentagon">五边形</option>
          <option value="hexagon">六边形</option>
          <option value="octagon">八边形</option>
          <option value="star">五角星</option>
          <option value="heart">爱心</option>
          <option value="cross">十字</option>
        </optgroup>
        <optgroup label="箭头">
          <option value="arrow">右箭头</option>
          <option value="arrowLeft">左箭头</option>
          <option value="arrowUp">上箭头</option>
          <option value="arrowDown">下箭头</option>
        </optgroup>
        <optgroup label="对话框">
          <option value="bubble">对话框(下)</option>
          <option value="bubbleLeft">对话框(左)</option>
        </optgroup>
        <optgroup label="标注">
          <option value="badge">徽章</option>
          <option value="ribbon">丝带</option>
          <option value="parallelogram">平行四边形</option>
        </optgroup>
      </select>
    </div>

    <!-- 填充类型 -->
    <div class="inputGroup">
      <label class="inputLabel">填充类型</label>
      <div class="typeSwitch">
        <button :class="{ active: !useGradient }" @click="useGradient = false" :disabled="disabled">纯色</button>
        <button :class="{ active: useGradient }" @click="useGradient = true" :disabled="disabled">渐变</button>
      </div>
    </div>

    <!-- 纯色填充 -->
    <div v-if="!useGradient" class="inputGroup">
      <label class="inputLabel">背景颜色</label>
      <input v-model="element.style.backgroundColor" type="color" class="colorInput" :disabled="disabled" />
    </div>

    <!-- 渐变填充 -->
    <template v-else>
      <div class="grid2">
        <div class="inputGroup">
          <label class="inputLabel">起始色</label>
          <input v-model="gradientStart" type="color" class="colorInput" @change="updateGradient" :disabled="disabled" />
        </div>
        <div class="inputGroup">
          <label class="inputLabel">结束色</label>
          <input v-model="gradientEnd" type="color" class="colorInput" @change="updateGradient" :disabled="disabled" />
        </div>
      </div>
      <div class="inputGroup">
        <label class="inputLabel">方向</label>
        <select v-model="gradientDirection" class="select" @change="updateGradient" :disabled="disabled">
          <option value="to right">从左到右</option>
          <option value="to left">从右到左</option>
          <option value="to bottom">从上到下</option>
          <option value="to top">从下到上</option>
          <option value="to bottom right">左上到右下</option>
          <option value="to bottom left">右上到左下</option>
          <option value="135deg">对角线</option>
        </select>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { H5Element } from '@year-report/core'

interface Props {
  element: H5Element
  disabled?: boolean
}

const props = defineProps<Props>()

const useGradient = ref(false)
const gradientStart = ref('#3b82f6')
const gradientEnd = ref('#8b5cf6')
const gradientDirection = ref('to right')

// 初始化时检测是否已有渐变
onMounted(() => {
  const bg = props.element.style.backgroundImage
  if (bg?.includes('linear-gradient')) {
    useGradient.value = true
    const match = bg.match(/linear-gradient\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
    if (match) {
      gradientDirection.value = match[1]
      gradientStart.value = match[2].trim()
      gradientEnd.value = match[3].trim()
    }
  }
})

// 切换填充类型时清理
watch(useGradient, (val) => {
  if (!val) {
    props.element.style.backgroundImage = undefined
    if (!props.element.style.backgroundColor) {
      props.element.style.backgroundColor = '#3b82f6'
    }
  } else {
    updateGradient()
  }
})

const updateGradient = () => {
  props.element.style.backgroundImage = `linear-gradient(${gradientDirection.value}, ${gradientStart.value}, ${gradientEnd.value})`
  props.element.style.backgroundColor = undefined
}
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.select { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.select:disabled, .colorInput:disabled { opacity: 0.5; cursor: not-allowed; }
.colorInput { width: 100%; height: 32px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.typeSwitch { display: flex; background: #2a2a2a; border-radius: 4px; padding: 2px; }
.typeSwitch button { flex: 1; background: transparent; border: none; color: #888; padding: 4px 8px; font-size: 11px; cursor: pointer; border-radius: 2px; }
.typeSwitch button.active { background: #3b82f6; color: white; }
.typeSwitch button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
