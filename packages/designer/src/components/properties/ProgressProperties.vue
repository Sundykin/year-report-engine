<template>
  <div class="section">
    <h4 class="sectionTitle">📶 进度条</h4>
    <div class="inputGroup">
      <label class="inputLabel">类型</label>
      <select v-model="element.progressType" class="select" :disabled="disabled">
        <option value="line">条形</option>
        <option value="circle">环形</option>
        <option value="semicircle">半圆</option>
      </select>
    </div>
    <div class="inputGroup">
      <label class="inputLabel">进度值 ({{ element.progressValue || 0 }}%)</label>
      <input
        type="range"
        min="0"
        max="100"
        :value="element.progressValue || 0"
        @input="element.progressValue = Number(($event.target as HTMLInputElement).value)"
        :disabled="disabled"
      />
    </div>
    <div class="grid2">
      <div class="inputGroup">
        <label class="inputLabel">进度颜色</label>
        <input v-model="element.progressColor" type="color" class="colorInput" :disabled="disabled" />
      </div>
      <div class="inputGroup">
        <label class="inputLabel">轨道颜色</label>
        <input v-model="element.style.backgroundColor" type="color" class="colorInput" :disabled="disabled" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { H5Element } from '@year-report/core'

defineProps<{
  element: H5Element
  disabled?: boolean
}>()
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.select { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.colorInput { width: 100%; height: 32px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
input[type="range"] { width: 100%; }
</style>
