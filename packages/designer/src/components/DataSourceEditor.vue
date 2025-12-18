<template>
  <div class="dataSourceEditor">
    <div class="editorHeader">
      <h3 class="title">
        <span v-if="isNew">新增数据源</span>
        <span v-else>编辑数据源</span>
        <span v-if="currentSource" class="sourceType">
          {{ currentSource.type === 'static' ? '静态数据' : '异步数据' }}
        </span>
      </h3>
      <button v-if="!isNew" class="closeBtn" @click="$emit('close')" title="关闭">
        ✕
      </button>
    </div>

    <div class="editorContent">
      <template v-if="currentSource || isNew">
        <!-- 基本信息 -->
        <div class="section">
          <h4 class="sectionTitle">基本信息</h4>
          <div class="formGroup">
            <label>数据源名称 <span class="required">*</span></label>
            <input
              v-model="formData.name"
              type="text"
              class="input"
              placeholder="例如：用户数据、产品列表"
              @input="debounceUpdate"
            />
            <div v-if="errors.name" class="error">{{ errors.name }}</div>
          </div>

          <div class="formGroup">
            <label>数据类型</label>
            <div class="typeSwitch">
              <button
                :class="{ active: formData.type === 'static' }"
                @click="switchType('static')"
              >
                📄 静态数据
              </button>
              <button
                :class="{ active: formData.type === 'async' }"
                @click="switchType('async')"
              >
                🌐 异步请求
              </button>
            </div>
            <div class="typeDesc">
              {{ formData.type === 'static'
                ? '直接输入JSON格式的静态数据'
                : '从API接口获取数据，支持定时刷新'
              }}
            </div>
          </div>
        </div>

        <!-- 静态数据配置 -->
        <div v-if="formData.type === 'static'" class="section">
          <h4 class="sectionTitle">数据内容</h4>
          <div class="formGroup">
            <label>JSON 数据 <span class="required">*</span></label>
            <JsonEditor
              v-model="staticDataStr"
              @update:model-value="parseStaticData"
              placeholder='{
  "users": [
    { "name": "张三", "age": 25 },
    { "name": "李四", "age": 30 }
  ]
}'
            />
            <div v-if="errors.staticData" class="error">{{ errors.staticData }}</div>
            <div class="helpTip">
              💡 支持任意JSON格式，包括对象、数组、字符串、数字等
            </div>
          </div>
        </div>

        <!-- 异步数据配置 -->
        <template v-if="formData.type === 'async'">
          <div class="section">
            <h4 class="sectionTitle">请求配置</h4>

            <div class="formGroup">
              <label>请求地址 <span class="required">*</span></label>
              <input
                v-model="formData.asyncConfig!.url"
                type="url"
                class="input"
                placeholder="https://api.example.com/data"
                @input="debounceUpdate"
              />
              <div v-if="errors.url" class="error">{{ errors.url }}</div>
            </div>

            <div class="formRow">
              <div class="formGroup flex-1">
                <label>请求方法</label>
                <select
                  v-model="formData.asyncConfig!.method"
                  class="select"
                  @change="debounceUpdate"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div class="formGroup flex-1">
                <label>刷新间隔（毫秒）</label>
                <input
                  v-model.number="formData.asyncConfig!.refreshInterval"
                  type="number"
                  class="input"
                  placeholder="0"
                  min="0"
                  @input="debounceUpdate"
                />
                <div class="helpTip">0表示不自动刷新</div>
              </div>
            </div>

            <div class="formGroup">
              <div class="labelWithAction">
                <label>请求头（JSON）</label>
                <button
                  class="actionBtn"
                  @click="showHeadersModal = true"
                  :disabled="!formData.asyncConfig?.headers"
                >
                  <span v-if="formData.asyncConfig?.headers">编辑</span>
                  <span v-else>添加</span>
                </button>
              </div>
              <div v-if="formData.asyncConfig?.headers" class="previewBox">
                {{ Object.keys(formData.asyncConfig.headers).length }} 个请求头
              </div>
            </div>

            <div
              v-if="['POST', 'PUT'].includes(formData.asyncConfig?.method || '')"
              class="formGroup"
            >
              <div class="labelWithAction">
                <label>请求体（JSON）</label>
                <button
                  class="actionBtn"
                  @click="showBodyModal = true"
                  :disabled="!formData.asyncConfig?.body"
                >
                  <span v-if="formData.asyncConfig?.body">编辑</span>
                  <span v-else>添加</span>
                </button>
              </div>
              <div v-if="formData.asyncConfig?.body" class="previewBox">
                {{ typeof formData.asyncConfig.body === 'object'
                  ? `${Object.keys(formData.asyncConfig.body).length} 个字段`
                  : '字符串内容'
                }}
              </div>
            </div>
          </div>

          <div class="section">
            <h4 class="sectionTitle">数据映射</h4>
            <div class="formGroup">
              <label>字段映射（可选）</label>
              <JsonEditor
                v-model="fieldMappingStr"
                @update:model-value="parseFieldMapping"
                placeholder='{
  "userName": "data.name",
  "userAge": "info.age"
}'
                style="height: 100px"
              />
              <div class="helpTip">
                将API返回的字段名映射为更易用的字段名，留空则使用原始字段名
              </div>
            </div>
          </div>

          <div class="section">
            <h4 class="sectionTitle">测试</h4>
            <button
              class="testBtn"
              :disabled="!canTest || testing"
              @click="testConnection"
            >
              <span v-if="testing">⏳ 测试中...</span>
              <span v-else>⚡ 测试连接</span>
            </button>
            <div v-if="testResult" class="testResult" :class="testResult.success ? 'success' : 'error'">
              <div class="resultTitle">
                {{ testResult.success ? '✅ 连接成功' : '❌ 连接失败' }}
              </div>
              <div class="resultMessage">{{ testResult.message }}</div>
              <details v-if="testResult.data" class="resultData">
                <summary>返回数据预览</summary>
                <pre>{{ JSON.stringify(testResult.data, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </template>

        <!-- 使用说明 -->
        <div class="section">
          <h4 class="sectionTitle">使用说明</h4>
          <div class="usageCard">
            <div class="usageTitle">在组件中使用数据：</div>
            <code class="usageCode">{{ usageExample }}</code>
            <div class="usageDesc">
              在文本、图表等组件中，使用双花括号语法插入数据源字段
            </div>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="emptyEditor">
        <div class="emptyIcon">📊</div>
        <div class="emptyText">选择一个数据源进行编辑</div>
        <div class="emptySubText">或创建新的数据源</div>
      </div>
    </div>

    <!-- 模态框 -->
    <EditorModal v-model="showHeadersModal" title="编辑请求头">
      <JsonEditor
        v-model="headersStr"
        @update:model-value="parseHeaders"
        placeholder='{
  "Authorization": "Bearer token",
  "Content-Type": "application/json"
}'
      />
    </EditorModal>

    <EditorModal v-model="showBodyModal" title="编辑请求体">
      <JsonEditor
        v-model="bodyStr"
        @update:model-value="parseBody"
        placeholder='{
  "query": {
    "page": 1,
    "size": 10
  }
}'
      />
    </EditorModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DataSource } from '@year-report/core'
import { generateId } from '@year-report/core'
import JsonEditor from './JsonEditor.vue'
import EditorModal from './EditorModal.vue'
import { debounce } from 'lodash-es'

interface Props {
  source?: DataSource | null
  requestAdapter?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [source: DataSource]
  add: [source: DataSource]
  close: []
}>()

// 表单数据
const formData = ref<Partial<DataSource>>({
  name: '',
  type: 'static',
  staticData: {},
  asyncConfig: {
    url: '',
    method: 'GET',
    headers: undefined,
    body: undefined,
    refreshInterval: 0
  }
})

// 编辑器字符串
const staticDataStr = ref('')
const headersStr = ref('')
const bodyStr = ref('')
const fieldMappingStr = ref('')

// 错误信息
const errors = ref<Record<string, string>>({})

// UI状态
const showHeadersModal = ref(false)
const showBodyModal = ref(false)
const testing = ref(false)
const testResult = ref<any>(null)

// 是否新增
const isNew = computed(() => !props.source)

// 当前数据源
const currentSource = computed(() => props.source)

// 使用示例
const usageExample = computed(() => {
  if (!formData.value.name) return ''
  return `{{${formData.value.name}.fieldName}}`
})

// 是否可以测试
const canTest = computed(() => {
  if (formData.value.type !== 'async') return false
  return formData.value.asyncConfig?.url && /^https?:\/\//.test(formData.value.asyncConfig.url)
})

// 初始化表单
const initForm = () => {
  if (props.source) {
    formData.value = { ...props.source }
    staticDataStr.value = props.source.staticData
      ? JSON.stringify(props.source.staticData, null, 2)
      : ''
    headersStr.value = props.source.asyncConfig?.headers
      ? JSON.stringify(props.source.asyncConfig.headers, null, 2)
      : ''
    bodyStr.value = props.source.asyncConfig?.body
      ? JSON.stringify(props.source.asyncConfig.body, null, 2)
      : ''
    fieldMappingStr.value = props.source.asyncConfig?.fieldMapping
      ? JSON.stringify(props.source.asyncConfig.fieldMapping, null, 2)
      : ''
  } else {
    // 新增时的默认值
    formData.value = {
      id: generateId(),
      name: '',
      type: 'static',
      staticData: {},
      asyncConfig: {
        url: '',
        method: 'GET',
        headers: undefined,
        body: undefined,
        refreshInterval: 0
      }
    }
    staticDataStr.value = ''
    headersStr.value = ''
    bodyStr.value = ''
    fieldMappingStr.value = ''
  }
  errors.value = {}
  testResult.value = null
}

// 切换类型
const switchType = (type: 'static' | 'async') => {
  formData.value.type = type
  if (type === 'static') {
    delete formData.value.asyncConfig
  } else {
    if (!formData.value.asyncConfig) {
      formData.value.asyncConfig = {
        url: '',
        method: 'GET',
        headers: undefined,
        body: undefined,
        refreshInterval: 0
      }
    }
  }
  debounceUpdate()
}

// 防抖更新
const debounceUpdate = debounce(() => {
  updateSource()
}, 500)

// 更新数据源
const updateSource = () => {
  validateForm()
  if (Object.keys(errors.value).length > 0) return

  const source: DataSource = {
    id: formData.value.id || generateId(),
    name: formData.value.name || '未命名数据源',
    type: formData.value.type || 'static',
    staticData: formData.value.staticData,
    asyncConfig: formData.value.asyncConfig
  }

  if (isNew.value) {
    emit('add', source)
  } else {
    emit('update', source)
  }
}

// 表单验证
const validateForm = () => {
  errors.value = {}

  if (!formData.value.name?.trim()) {
    errors.value.name = '请输入数据源名称'
  }

  if (formData.value.type === 'static') {
    if (!staticDataStr.value.trim()) {
      errors.value.staticData = '请输入JSON数据'
    } else {
      try {
        JSON.parse(staticDataStr.value)
      } catch (e) {
        errors.value.staticData = 'JSON格式错误'
      }
    }
  } else if (formData.value.type === 'async') {
    if (!formData.value.asyncConfig?.url?.trim()) {
      errors.value.url = '请输入请求地址'
    } else if (!/^https?:\/\/.+/.test(formData.value.asyncConfig.url)) {
      errors.value.url = '请输入有效的URL地址'
    }
  }
}

// 解析静态数据
const parseStaticData = () => {
  try {
    formData.value.staticData = JSON.parse(staticDataStr.value || '{}')
    errors.value.staticData = ''
  } catch (e) {
    errors.value.staticData = 'JSON格式错误'
  }
  updateSource()
}

// 解析请求头
const parseHeaders = () => {
  try {
    if (!formData.value.asyncConfig) return
    formData.value.asyncConfig.headers = headersStr.value
      ? JSON.parse(headersStr.value)
      : undefined
  } catch (e) {
    // 静默处理错误
  }
  updateSource()
}

// 解析请求体
const parseBody = () => {
  try {
    if (!formData.value.asyncConfig) return
    formData.value.asyncConfig.body = bodyStr.value
      ? JSON.parse(bodyStr.value)
      : undefined
  } catch (e) {
    // 静默处理错误
  }
  updateSource()
}

// 解析字段映射
const parseFieldMapping = () => {
  try {
    if (!formData.value.asyncConfig) return
    formData.value.asyncConfig.fieldMapping = fieldMappingStr.value
      ? JSON.parse(fieldMappingStr.value)
      : undefined
  } catch (e) {
    // 静默处理错误
  }
  updateSource()
}

// 测试连接
const testConnection = async () => {
  if (!canTest.value || !props.requestAdapter) return

  testing.value = true
  testResult.value = null

  try {
    const config = {
      url: formData.value.asyncConfig!.url!,
      method: formData.value.asyncConfig!.method,
      headers: formData.value.asyncConfig!.headers,
      body: formData.value.asyncConfig!.body
    }

    const response = await props.requestAdapter(config)

    testResult.value = {
      success: true,
      message: '成功获取数据',
      data: response
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: error.message || '请求失败',
      data: null
    }
  } finally {
    testing.value = false
  }
}

// 监听props变化
watch(() => props.source, initForm, { immediate: true })
</script>

<style scoped>
.dataSourceEditor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f0f0f;
}

.editorHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #262626;
  background: #0a0a0a;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #e5e5e5;
  margin: 0;
}

.sourceType {
  font-size: 12px;
  color: #1890ff;
  background: #1890ff20;
  padding: 2px 8px;
  border-radius: 4px;
}

.closeBtn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.closeBtn:hover {
  background: #262626;
  color: #e5e5e5;
}

.editorContent {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.section {
  margin-bottom: 32px;
}

.sectionTitle {
  font-size: 14px;
  font-weight: 600;
  color: #e5e5e5;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sectionTitle::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #1890ff;
  border-radius: 2px;
}

.formGroup {
  margin-bottom: 16px;
}

.formRow {
  display: flex;
  gap: 16px;
}

.formRow .formGroup {
  flex: 1;
  margin-bottom: 0;
}

.formGroup label {
  display: block;
  font-size: 12px;
  color: #a3a3a3;
  margin-bottom: 6px;
}

.required {
  color: #ff4d4f;
}

.input, .select {
  width: 100%;
  height: 36px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 0 12px;
  color: #e5e5e5;
  font-size: 13px;
  transition: all 0.2s;
}

.input:focus, .select:focus {
  outline: none;
  border-color: #1890ff;
  background: #1f1f1f;
}

.typeSwitch {
  display: flex;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 2px;
}

.typeSwitch button {
  flex: 1;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s;
}

.typeSwitch button.active {
  background: #1890ff;
  color: white;
}

.typeDesc {
  font-size: 11px;
  color: #666;
  margin-top: 6px;
}

.labelWithAction {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.actionBtn {
  padding: 4px 12px;
  background: #262626;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #a3a3a3;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.actionBtn:hover {
  background: #404040;
  color: #e5e5e5;
}

.previewBox {
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  font-size: 12px;
  color: #a3a3a3;
}

.helpTip {
  font-size: 11px;
  color: #666;
  margin-top: 6px;
  line-height: 1.5;
}

.testBtn {
  padding: 10px 24px;
  background: #52c41a;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.testBtn:hover:not(:disabled) {
  background: #73d13d;
}

.testBtn:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.testResult {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
}

.testResult.success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.testResult.error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.resultTitle {
  font-weight: 600;
  margin-bottom: 4px;
}

.resultMessage {
  color: #666;
}

.resultData {
  margin-top: 12px;
}

.resultData summary {
  cursor: pointer;
  color: #1890ff;
  margin-bottom: 8px;
}

.resultData pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 11px;
}

.usageCard {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
}

.usageTitle {
  font-size: 12px;
  color: #a3a3a3;
  margin-bottom: 8px;
}

.usageCode {
  display: block;
  background: #262626;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #f59e0b;
  margin: 8px 0;
}

.usageDesc {
  font-size: 11px;
  color: #666;
  line-height: 1.5;
}

.error {
  color: #ff4d4f;
  font-size: 11px;
  margin-top: 4px;
}

.emptyEditor {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.emptyIcon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.emptyText {
  font-size: 16px;
  margin-bottom: 4px;
}

.emptySubText {
  font-size: 12px;
}
</style>