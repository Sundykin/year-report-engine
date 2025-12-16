<template>
  <div class="section">
    <h4 class="sectionTitle">📊 图表</h4>
    <div class="inputGroup">
      <label class="inputLabel">图表类型</label>
      <select v-model="element.chartType" class="select" :disabled="disabled">
        <option value="bar">柱状图</option>
        <option value="line">折线图</option>
        <option value="pie">饼图</option>
      </select>
    </div>

    <div class="inputGroup">
      <label class="inputLabel">数据源</label>
      <select
        multiple
        :value="element.dataBinding?.sourceIds || []"
        @change="$emit('update-data-sources', $event)"
        class="multiSelectDropdown"
        size="4"
        :disabled="disabled"
      >
        <option v-for="ds in dataSources" :key="ds.id" :value="ds.id">
          {{ ds.name }}
        </option>
      </select>
      <div class="hint">按住Ctrl/Cmd多选</div>
    </div>

    <div v-if="element.dataBinding?.sourceIds?.length" class="inputGroup">
      <div class="labelWithBtn">
        <label class="inputLabel">转换函数</label>
        <button @click="$emit('show-transform-modal')" class="expandBtn" :disabled="disabled">🔍</button>
      </div>
      <CodeEditor v-model="element.dataBinding.transform" style="height: 100px;" :disabled="disabled" />
      <div class="hint">函数签名: (ds1, ds2, ...) => chartData[]</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { H5Element, DataSource } from '@year-report/core'
import CodeEditor from '../CodeEditor.vue'

interface Props {
  element: H5Element
  dataSources: DataSource[]
  disabled?: boolean
}

defineProps<Props>()
defineEmits<{
  'update-data-sources': [event: Event]
  'show-transform-modal': []
}>()
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.select { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.select:disabled, .multiSelectDropdown:disabled { opacity: 0.5; cursor: not-allowed; }
.multiSelectDropdown { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 4px; border-radius: 4px; font-size: 12px; }
.multiSelectDropdown option { padding: 4px; }
.multiSelectDropdown option:checked { background: #3b82f6; }
.labelWithBtn { display: flex; align-items: center; justify-content: space-between; }
.expandBtn { background: #262626; border: 1px solid #404040; color: #a3a3a3; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; }
.expandBtn:hover { background: #404040; color: white; }
.hint { font-size: 10px; color: #737373; font-style: italic; margin-top: 4px; }
</style>
