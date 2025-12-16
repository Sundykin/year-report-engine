<template>
  <div class="section">
    <h4 class="sectionTitle">🔷 形状</h4>
    <div class="inputGroup">
      <label class="inputLabel">形状类型</label>
      <select v-model="element.shapeType" class="select" :disabled="disabled">
        <option value="rectangle">矩形</option>
        <option value="circle">圆形</option>
        <option value="triangle">三角形</option>
        <option value="parallelogram">平行四边形</option>
        <option value="diamond">菱形</option>
        <option value="star">五角星</option>
        <option value="hexagon">六边形</option>
      </select>
    </div>
    <div class="inputGroup">
      <label class="inputLabel">背景颜色</label>
      <input v-model="element.style.backgroundColor" type="color" class="colorInput" :disabled="disabled" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { H5Element } from '@year-report/core'

interface Props {
  element: H5Element
  disabled?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.select { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.select:disabled, .colorInput:disabled { opacity: 0.5; cursor: not-allowed; }
.colorInput { width: 100%; height: 32px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer; }
</style>
