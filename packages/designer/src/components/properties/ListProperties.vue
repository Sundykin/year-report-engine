<template>
  <div class="section">
    <h4 class="sectionTitle">📋 列表</h4>
    <div class="inputGroup">
      <label class="inputLabel">列表类型</label>
      <select v-model="element.listType" class="select" :disabled="disabled">
        <option value="unordered">无序列表</option>
        <option value="ordered">有序列表</option>
        <option value="checklist">清单</option>
      </select>
    </div>
    <div v-if="element.listType === 'checklist'" class="inputGroup">
      <label class="inputLabel">图标颜色</label>
      <input v-model="element.listIconColor" type="color" class="colorInput" :disabled="disabled" />
    </div>
    <div class="inputGroup">
      <label class="inputLabel">列表项 (每行一项)</label>
      <textarea
        :value="(element.listItems || []).join('\n')"
        @input="updateItems($event.target.value)"
        class="textarea"
        rows="5"
        placeholder="项目1&#10;项目2&#10;项目3"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { H5Element } from '@year-report/core'

const props = defineProps<{
  element: H5Element
  disabled?: boolean
}>()

const updateItems = (val: string) => {
  props.element.listItems = val.split('\n').filter(s => s.trim())
}
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.select { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
.colorInput { width: 100%; height: 32px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer; }
.textarea { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 6px 8px; border-radius: 4px; font-size: 12px; resize: vertical; font-family: inherit; }
</style>
