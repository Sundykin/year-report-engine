<template>
  <template v-if="source">
    <div class="dataSourceConfig">
      <!-- 基本信息 -->
      <div class="section">
        <h4 class="sectionTitle">📋 基本信息</h4>
        <div class="inputGroup">
          <label class="inputLabel">名称</label>
          <input
            :value="source.name"
            @input="updateField('name', ($event.target as HTMLInputElement).value)"
            class="input"
            placeholder="数据源名称"
          />
        </div>
        <div class="inputGroup">
          <label class="inputLabel">类型</label>
          <div class="typeSwitch">
            <button
              :class="{ active: source.type === 'static' }"
              @click="switchType('static')"
            >📄 静态</button>
            <button
              :class="{ active: source.type === 'async' }"
              @click="switchType('async')"
            >🌐 异步</button>
          </div>
        </div>
      </div>

      <!-- 静态数据 -->
      <div v-if="source.type === 'static'" class="section">
        <h4 class="sectionTitle">📝 数据内容</h4>
        <div class="inputGroup">
          <label class="inputLabel">JSON 数据</label>
          <JsonEditor
            :modelValue="staticDataStr"
            @update:modelValue="handleStaticDataChange"
            placeholder='{ "key": "value" }'
          />
          <div v-if="jsonError" class="errorText">{{ jsonError }}</div>
        </div>
      </div>

      <!-- 异步配置 -->
      <template v-if="source.type === 'async'">
        <div class="section">
          <h4 class="sectionTitle">🌐 请求配置</h4>
          <div class="inputGroup">
            <label class="inputLabel">请求地址</label>
            <input
              :value="source.asyncConfig?.url"
              @input="updateAsyncConfig('url', ($event.target as HTMLInputElement).value)"
              class="input"
              placeholder="https://api.example.com/data"
            />
          </div>
          <div class="grid2">
            <div class="inputGroup">
              <label class="inputLabel">方法</label>
              <select
                :value="source.asyncConfig?.method || 'GET'"
                @change="updateAsyncConfig('method', ($event.target as HTMLSelectElement).value)"
                class="select"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div class="inputGroup">
              <label class="inputLabel">刷新间隔(ms)</label>
              <input
                :value="source.asyncConfig?.refreshInterval || 0"
                @input="updateAsyncConfig('refreshInterval', Number(($event.target as HTMLInputElement).value))"
                type="number"
                class="input"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <!-- 数据映射 -->
        <div class="section">
          <h4 class="sectionTitle">🔄 数据映射</h4>
          <div class="inputGroup">
            <label class="inputLabel">映射方式</label>
            <select
              :value="source.asyncConfig?.mappingType || 'none'"
              @change="updateAsyncConfig('mappingType', ($event.target as HTMLSelectElement).value)"
              class="select"
            >
              <option value="none">不映射（原样使用）</option>
              <option value="function">转换函数</option>
              <option value="fieldMap">字段映射</option>
            </select>
          </div>

          <!-- 数据路径（快速提取） -->
          <div class="inputGroup">
            <label class="inputLabel">数据路径</label>
            <input
              :value="source.asyncConfig?.dataPath || ''"
              @input="updateAsyncConfig('dataPath', ($event.target as HTMLInputElement).value)"
              class="input"
              placeholder="data.result.list"
            />
            <div class="helpText">快速提取嵌套数据，如 data.result</div>
          </div>

          <!-- 转换函数 -->
          <div v-if="source.asyncConfig?.mappingType === 'function'" class="inputGroup">
            <div class="labelRow">
              <label class="inputLabel">转换函数</label>
              <button class="expandBtn" @click="$emit('show-transform-modal')" title="放大编辑">⤢</button>
            </div>
            <JsonEditor
              :modelValue="source.asyncConfig?.transform || TRANSFORM_TEMPLATE"
              @update:modelValue="updateAsyncConfig('transform', $event)"
              :placeholder="TRANSFORM_TEMPLATE"
              :height="100"
            />
            <div class="helpText">参数: data（原始响应）, 返回处理后的数据</div>
          </div>

          <!-- 字段映射 -->
          <div v-if="source.asyncConfig?.mappingType === 'fieldMap'" class="fieldMappingSection">
            <div class="mappingHeader">
              <label class="inputLabel">字段映射</label>
              <button class="addMappingBtn" @click="addFieldMapping">+ 添加</button>
            </div>
            <div
              v-for="(item, idx) in (source.asyncConfig?.fieldMapping || [])"
              :key="idx"
              class="mappingItem"
            >
              <input
                :value="item.source"
                @input="updateFieldMapping(idx, 'source', ($event.target as HTMLInputElement).value)"
                class="input mappingInput"
                placeholder="源字段路径"
              />
              <span class="mappingArrow">→</span>
              <input
                :value="item.target"
                @input="updateFieldMapping(idx, 'target', ($event.target as HTMLInputElement).value)"
                class="input mappingInput"
                placeholder="目标字段名"
              />
              <button class="removeMappingBtn" @click="removeFieldMapping(idx)">×</button>
            </div>
            <div v-if="!source.asyncConfig?.fieldMapping?.length" class="emptyMapping">
              暂无映射，点击添加
            </div>
          </div>
        </div>

        <!-- 测试 -->
        <div class="section">
          <button
            class="testBtn"
            :disabled="!canTest || testing"
            @click="$emit('test')"
          >
            <span v-if="testing">⏳ 测试中...</span>
            <span v-else>⚡ 测试连接</span>
          </button>
          <div v-if="testResult" class="testResult" :class="testResult.success ? 'success' : 'error'">
            {{ testResult.message }}
          </div>
        </div>
      </template>

      <!-- 使用说明 -->
      <div class="section">
        <h4 class="sectionTitle">💡 使用说明</h4>
        <div class="usageCode">{{ usageExample }}</div>
        <div class="helpText">在组件中使用双花括号插入数据</div>
      </div>

      <!-- 删除 -->
      <button class="deleteBtn" @click="$emit('delete')">删除此数据源</button>
    </div>
  </template>
  <div v-else class="emptyTip">在数据源列表中选择或添加数据源</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DataSource, FieldMapItem } from '@year-report/core'
import JsonEditor from './JsonEditor.vue'

// 转换函数模板
const TRANSFORM_TEMPLATE = `// data 是原始响应数据
// 返回处理后的数据
return data.result`

interface Props {
  source?: DataSource | null
  testing?: boolean
  testResult?: { success: boolean; message: string } | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [source: DataSource]
  test: []
  delete: []
  'show-transform-modal': []
}>()

const staticDataStr = ref('')
const jsonError = ref('')

// 初始化静态数据字符串
watch(() => props.source, (source) => {
  if (source?.type === 'static' && source.staticData) {
    staticDataStr.value = JSON.stringify(source.staticData, null, 2)
  } else {
    staticDataStr.value = ''
  }
  jsonError.value = ''
}, { immediate: true })

// 是否可测试
const canTest = computed(() => {
  if (!props.source || props.source.type !== 'async') return false
  return props.source.asyncConfig?.url && /^https?:\/\//.test(props.source.asyncConfig.url)
})

// 使用示例
const usageExample = computed(() => {
  if (!props.source?.name) return '{{数据源名.字段名}}'
  return `{{${props.source.name}.fieldName}}`
})

// 更新字段
const updateField = (field: keyof DataSource, value: any) => {
  if (!props.source) return
  emit('update', { ...props.source, [field]: value })
}

// 切换类型
const switchType = (type: 'static' | 'async') => {
  if (!props.source) return
  const updated: DataSource = { ...props.source, type }
  if (type === 'async' && !updated.asyncConfig) {
    updated.asyncConfig = {
      url: '',
      method: 'GET',
      refreshInterval: 0,
      mappingType: 'none'
    }
  }
  emit('update', updated)
}

// 更新异步配置
const updateAsyncConfig = (field: string, value: any) => {
  if (!props.source) return
  emit('update', {
    ...props.source,
    asyncConfig: {
      ...props.source.asyncConfig!,
      [field]: value
    }
  })
}

// 处理静态数据变更
const handleStaticDataChange = (value: string) => {
  staticDataStr.value = value
  try {
    const parsed = JSON.parse(value || '{}')
    jsonError.value = ''
    if (props.source) {
      emit('update', { ...props.source, staticData: parsed })
    }
  } catch (e) {
    jsonError.value = 'JSON 格式错误'
  }
}

// 添加字段映射
const addFieldMapping = () => {
  if (!props.source?.asyncConfig) return
  const mapping = props.source.asyncConfig.fieldMapping || []
  updateAsyncConfig('fieldMapping', [...mapping, { source: '', target: '' }])
}

// 更新字段映射
const updateFieldMapping = (idx: number, field: keyof FieldMapItem, value: string) => {
  if (!props.source?.asyncConfig?.fieldMapping) return
  const mapping = [...props.source.asyncConfig.fieldMapping]
  mapping[idx] = { ...mapping[idx], [field]: value }
  updateAsyncConfig('fieldMapping', mapping)
}

// 删除字段映射
const removeFieldMapping = (idx: number) => {
  if (!props.source?.asyncConfig?.fieldMapping) return
  const mapping = props.source.asyncConfig.fieldMapping.filter((_, i) => i !== idx)
  updateAsyncConfig('fieldMapping', mapping)
}
</script>

<style scoped>
.dataSourceConfig {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sectionTitle {
  font-size: 11px;
  color: #60a5fa;
  text-transform: uppercase;
  font-weight: bold;
  margin: 0;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.labelRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inputLabel {
  font-size: 10px;
  color: #737373;
  text-transform: uppercase;
}

.expandBtn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #333;
  background: #1a1a1a;
  color: #737373;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expandBtn:hover {
  background: #262626;
  color: #e5e5e5;
  border-color: #3b82f6;
}

.input, .select {
  width: 100%;
  background: #171717;
  border: 1px solid #262626;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  color: white;
  outline: none;
}

.input:focus, .select:focus {
  border-color: #3b82f6;
}

.grid2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.typeSwitch {
  display: flex;
  background: #171717;
  border: 1px solid #262626;
  border-radius: 4px;
  padding: 2px;
}

.typeSwitch button {
  flex: 1;
  padding: 6px 8px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  border-radius: 3px;
  font-size: 11px;
  transition: all 0.15s;
}

.typeSwitch button.active {
  background: #3b82f6;
  color: white;
}

.helpText {
  font-size: 10px;
  color: #525252;
}

.errorText {
  font-size: 10px;
  color: #ef4444;
}

.fieldMappingSection {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mappingHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.addMappingBtn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
}

.mappingItem {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #171717;
  padding: 6px;
  border-radius: 4px;
}

.mappingInput {
  flex: 1;
  min-width: 0;
}

.mappingArrow {
  color: #525252;
  font-size: 12px;
  flex-shrink: 0;
}

.removeMappingBtn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  flex-shrink: 0;
}

.removeMappingBtn:hover {
  background: #dc2626;
  color: white;
}

.emptyMapping {
  color: #525252;
  font-size: 11px;
  text-align: center;
  padding: 12px;
  background: #171717;
  border-radius: 4px;
}

.testBtn {
  width: 100%;
  padding: 8px;
  background: #059669;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.testBtn:hover:not(:disabled) {
  background: #10b981;
}

.testBtn:disabled {
  background: #262626;
  color: #525252;
  cursor: not-allowed;
}

.testResult {
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  margin-top: 6px;
}

.testResult.success {
  background: #052e16;
  color: #22c55e;
}

.testResult.error {
  background: #450a0a;
  color: #ef4444;
}

.usageCode {
  background: #171717;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #f59e0b;
}

.deleteBtn {
  width: 100%;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  margin-top: 8px;
}

.deleteBtn:hover {
  background: rgba(220, 38, 38, 0.2);
}

.emptyTip {
  color: #737373;
  text-align: center;
  padding: 40px 20px;
}
</style>
