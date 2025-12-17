<template>
  <div class="section">
    <h4 class="sectionTitle">⏱️ 倒计时</h4>
    <div class="inputGroup">
      <label class="inputLabel">目标时间</label>
      <input
        type="datetime-local"
        :value="formatDatetimeLocal(element.countdownTarget)"
        @input="updateTarget($event.target.value)"
        class="input"
        :disabled="disabled"
      />
    </div>
    <div class="inputGroup">
      <label class="inputLabel">显示格式</label>
      <select v-model="element.countdownFormat" class="select" :disabled="disabled">
        <option value="dhms">天时分秒</option>
        <option value="hms">时分秒</option>
        <option value="ms">分秒</option>
        <option value="s">仅秒</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { H5Element } from '@year-report/core'

const props = defineProps<{
  element: H5Element
  disabled?: boolean
}>()

const formatDatetimeLocal = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toISOString().slice(0, 16)
}

const updateTarget = (val: string) => {
  if (val) {
    props.element.countdownTarget = new Date(val).toISOString()
  }
}
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.input { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.select { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
</style>
