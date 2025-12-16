<template>
  <div class="section">
    <h4 class="sectionTitle">✏️ 文本</h4>

    <div class="inputGroup">
      <label class="inputLabel">渲染模式</label>
      <div class="typeSwitch">
        <button
          :class="{ active: !element.renderFunction }"
          @click="element.renderFunction = undefined"
          :disabled="disabled"
        >文本内容</button>
        <button
          :class="{ active: !!element.renderFunction }"
          @click="$emit('init-render-function')"
          :disabled="disabled"
        >渲染函数</button>
      </div>
    </div>

    <!-- 文本内容模式 -->
    <template v-if="!element.renderFunction">
      <textarea v-model="element.content" class="textarea" :disabled="disabled" />
    </template>

    <!-- 渲染函数模式 -->
    <template v-else>
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

      <div class="inputGroup">
        <div class="labelWithBtn">
          <label class="inputLabel">渲染函数</label>
          <button @click="$emit('show-render-modal')" class="expandBtn" :disabled="disabled">🔍</button>
        </div>
        <CodeEditor v-model="element.renderFunction" style="height: 100px;" :disabled="disabled" />
        <div class="hint">函数签名: (ds1, ds2, ...) => htmlString</div>
      </div>
    </template>

    <div class="grid2">
      <div class="inputGroup">
        <label class="inputLabel">颜色</label>
        <input v-model="element.style.color" type="color" class="colorInput" :disabled="disabled" />
      </div>
      <div class="inputGroup">
        <label class="inputLabel">字号</label>
        <input
          :value="parseInt(element.style.fontSize || '16')"
          @input="element.style.fontSize = ($event.target as HTMLInputElement).value + 'px'"
          type="number"
          class="inputSmall"
          :disabled="disabled"
        />
      </div>
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
  'init-render-function': []
  'update-data-sources': [event: Event]
  'show-render-modal': []
}>()
</script>

<style scoped>
.section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #262626; }
.sectionTitle { font-size: 12px; font-weight: 600; margin: 0 0 12px 0; color: #a3a3a3; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.inputGroup { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.inputLabel { font-size: 10px; color: #737373; text-transform: uppercase; }
.inputSmall { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 4px 6px; border-radius: 4px; font-size: 12px; }
.colorInput { width: 100%; height: 32px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer; }
.textarea { width: 100%; min-height: 80px; background: #2a2a2a; border: 1px solid #444; color: white; padding: 8px; border-radius: 4px; font-size: 12px; resize: vertical; font-family: inherit; }
.textarea:disabled { opacity: 0.5; cursor: not-allowed; }
.typeSwitch { display: flex; background: #2a2a2a; border-radius: 4px; padding: 2px; margin-bottom: 8px; }
.typeSwitch button { flex: 1; background: transparent; border: none; color: #888; padding: 4px 8px; font-size: 11px; cursor: pointer; border-radius: 2px; }
.typeSwitch button.active { background: #3b82f6; color: white; }
.typeSwitch button:disabled { opacity: 0.5; cursor: not-allowed; }
.multiSelectDropdown { width: 100%; background: #2a2a2a; border: 1px solid #444; color: white; padding: 4px; border-radius: 4px; font-size: 12px; }
.multiSelectDropdown option { padding: 4px; }
.multiSelectDropdown option:checked { background: #3b82f6; }
.labelWithBtn { display: flex; align-items: center; justify-content: space-between; }
.expandBtn { background: #262626; border: 1px solid #404040; color: #a3a3a3; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; }
.expandBtn:hover { background: #404040; color: white; }
.hint { font-size: 10px; color: #737373; font-style: italic; margin-top: 4px; }
</style>
