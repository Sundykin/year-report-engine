<template>
  <div class="section">
    <h4 class="sectionTitle">🔢 计数器</h4>
    <div class="inputGroup">
      <label class="inputLabel">目标值</label>
      <input v-model.number="element.counterValue" type="number" class="input" :disabled="disabled" />
    </div>
    <div class="grid2">
      <div class="inputGroup">
        <label class="inputLabel">前缀</label>
        <input v-model="element.counterPrefix" type="text" class="input" placeholder="¥" :disabled="disabled" />
      </div>
      <div class="inputGroup">
        <label class="inputLabel">后缀</label>
        <input v-model="element.counterSuffix" type="text" class="input" placeholder="元" :disabled="disabled" />
      </div>
    </div>
    <div class="grid2">
      <div class="inputGroup">
        <label class="inputLabel">小数位</label>
        <input v-model.number="element.counterDecimals" type="number" min="0" max="4" class="input" :disabled="disabled" />
      </div>
      <div class="inputGroup">
        <label class="inputLabel">动画时长(秒)</label>
        <input v-model.number="element.counterDuration" type="number" min="0.5" max="10" step="0.5" class="input" :disabled="disabled" />
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
.input { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
</style>
