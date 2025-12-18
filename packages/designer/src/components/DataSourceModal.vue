<template>
  <EditorModal
    :modelValue="visible"
    @update:modelValue="emit('update:visible', $event)"
    :title="isEditing ? '编辑数据源' : '新增数据源'"
    width="800px"
    class="dataSourceModal"
  >
    <div class="modalContent">
      <div class="formSection">
        <h3 class="sectionTitle">基本信息</h3>
        <div class="formRow">
          <div class="formGroup">
            <label>数据源名称 <span class="required">*</span></label>
            <input
              v-model="formData.name"
              type="text"
              class="input"
              placeholder="例如：用户数据、产品列表"
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
          </div>
        </div>
      </div>

      <!-- 静态数据配置 -->
      <div v-if="formData.type === 'static'" class="formSection">
        <h3 class="sectionTitle">数据内容</h3>
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
        </div>
      </div>

      <!-- 异步数据配置 -->
      <template v-if="formData.type === 'async'">
        <div class="formSection">
          <h3 class="sectionTitle">请求配置</h3>
          <div class="formRow">
            <div class="formGroup flex-2">
              <label>请求地址 <span class="required">*</span></label>
              <input
                v-model="formData.asyncConfig.url"
                type="url"
                class="input"
                placeholder="https://api.example.com/data"
              />
              <div v-if="errors.url" class="error">{{ errors.url }}</div>
            </div>

            <div class="formGroup flex-1">
              <label>请求方法</label>
              <select v-model="formData.asyncConfig.method" class="select">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          <div class="formRow">
            <div class="formGroup flex-1">
              <label>刷新间隔（毫秒）</label>
              <input
                v-model.number="formData.asyncConfig.refreshInterval"
                type="number"
                class="input"
                placeholder="0"
                min="0"
              />
              <div class="helpText">0表示不自动刷新</div>
            </div>
          </div>
        </div>

        <div class="formSection">
          <h3 class="sectionTitle">测试</h3>
          <button
            class="testBtn"
            :disabled="!canTest || testing"
            @click="testConnection"
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
      <div class="formSection">
        <h3 class="sectionTitle">使用说明</h3>
        <div class="usageInfo">
          <div class="usageTitle">在组件中使用数据：</div>
          <code class="usageCode">{{ usageExample }}</code>
          <div class="usageDesc">
            在文本、图表等组件中，使用双花括号语法插入数据源字段
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modalFooter">
        <button class="cancelBtn" @click="handleCancel">取消</button>
        <button class="confirmBtn" @click="handleConfirm">
          {{ isEditing ? '保存' : '创建' }}
        </button>
      </div>
    </template>
  </EditorModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DataSource, RequestAdapter } from '@year-report/core'
import { generateId } from '@year-report/core'
import JsonEditor from './JsonEditor.vue'
import EditorModal from './EditorModal.vue'

interface Props {
  visible: boolean
  source?: DataSource | null
  requestAdapter?: RequestAdapter
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  update: [source: DataSource]
  add: [source: DataSource]
}>()

// 表单数据
const formData = ref<Partial<DataSource>>({
  name: '',
  type: 'static',
  staticData: {},
  asyncConfig: {
    url: '',
    method: 'GET',
    refreshInterval: 0
  }
})

const staticDataStr = ref('')
const errors = ref<Record<string, string>>({})
const testing = ref(false)
const testResult = ref<any>(null)

// 是否编辑模式
const isEditing = computed(() => !!props.source)

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
  } else {
    formData.value = {
      id: generateId(),
      name: `数据源${Math.floor(Math.random() * 1000)}`,
      type: 'static',
      staticData: {},
      asyncConfig: {
        url: '',
        method: 'GET',
        refreshInterval: 0
      }
    }
    staticDataStr.value = ''
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
        refreshInterval: 0
      }
    }
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

  return Object.keys(errors.value).length === 0
}

// 解析静态数据
const parseStaticData = () => {
  try {
    formData.value.staticData = JSON.parse(staticDataStr.value || '{}')
    errors.value.staticData = ''
  } catch (e) {
    errors.value.staticData = 'JSON格式错误'
  }
}

// 测试连接
const testConnection = async () => {
  if (!canTest.value || !props.requestAdapter) return

  testing.value = true
  testResult.value = null

  try {
    const _response = await props.requestAdapter({
      url: formData.value.asyncConfig!.url!,
      method: formData.value.asyncConfig!.method,
      headers: formData.value.asyncConfig!.headers,
      body: formData.value.asyncConfig!.body
    })

    testResult.value = {
      success: true,
      message: '✅ 连接成功'
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: `❌ 连接失败: ${error.message}`
    }
  } finally {
    testing.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('update:visible', false)
}

// 确认
const handleConfirm = () => {
  if (!validateForm()) return

  const source: DataSource = {
    id: formData.value.id || generateId(),
    name: formData.value.name || '未命名数据源',
    type: formData.value.type,
    staticData: formData.value.staticData,
    asyncConfig: formData.value.asyncConfig
  }

  if (isEditing.value) {
    emit('update', source)
  } else {
    emit('add', source)
  }

  emit('update:visible', false)
}

// 监听visible变化
watch(() => props.visible, (visible) => {
  if (visible) {
    initForm()
  }
})
</script>

<style scoped>
.dataSourceModal {
  --modal-padding: 24px;
}

.modalContent {
  max-height: 70vh;
  overflow-y: auto;
  padding: var(--modal-padding);
}

.formSection {
  margin-bottom: 32px;
}

.sectionTitle {
  font-size: 14px;
  font-weight: 600;
  color: #e5e5e5;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
}

.formRow {
  display: flex;
  gap: 16px;
}

.formGroup {
  flex: 1;
}

.formGroup.flex-1 {
  flex: 1;
}

.formGroup.flex-2 {
  flex: 2;
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
}

.input:focus, .select:focus {
  outline: none;
  border-color: #1890ff;
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

.helpText {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
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
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.testResult.success {
  background: #f6ffed;
  color: #52c41a;
}

.testResult.error {
  background: #fff2f0;
  color: #ff4d4f;
}

.usageInfo {
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

.modalFooter {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #333;
}

.cancelBtn {
  padding: 8px 24px;
  background: transparent;
  border: 1px solid #444;
  border-radius: 6px;
  color: #a3a3a3;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancelBtn:hover {
  background: #1a1a1a;
  color: #e5e5e5;
}

.confirmBtn {
  padding: 8px 24px;
  background: #1890ff;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.confirmBtn:hover {
  background: #40a9ff;
}
</style>