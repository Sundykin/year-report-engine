<template>
  <div class="section">
    <h4 class="sectionTitle">📄 富文本</h4>
    <div class="inputGroup">
      <label class="inputLabel">内容</label>
      <RichTextEditor v-model="element.content" style="height: 400px;" :disabled="disabled" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { H5Element } from '@year-report/core'
import RichTextEditor from '../RichTextEditor.vue'

interface Props {
  element: H5Element
  disabled?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.labelWithBtn { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.expandBtn { background: #262626; border: 1px solid #404040; color: #a3a3a3; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; }
.expandBtn:hover { background: #404040; color: white; }
</style>
