<template>
  <div class="dataSourcePanel">
    <DataSourceSidebar
      :data-sources="dataSources"
      :selected-id="selectedId"
      @select="handleSelect"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @duplicate="handleDuplicate"
      @test="handleTest"
    />

    <!-- 编辑模态框 -->
    <DataSourceModal
      v-model:visible="showModal"
      :source="editingSource"
      :request-adapter="requestAdapter"
      @update="handleUpdate"
      @add="handleAddNew"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DataSource, RequestAdapter } from '@year-report/core'
import { generateId } from '@year-report/core'
import DataSourceSidebar from './DataSourceSidebar.vue'
import DataSourceModal from './DataSourceModal.vue'

interface Props {
  dataSources: DataSource[]
  requestAdapter?: RequestAdapter
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [sources: DataSource[]]
}>()

// 选中的数据源ID
const selectedId = ref<string | null>(null)

// 模态框显示状态
const showModal = ref(false)

// 正在编辑的数据源
const editingSource = ref<DataSource | null>(null)

// 处理新增
const handleAdd = () => {
  editingSource.value = null
  showModal.value = true
}

// 处理新增（从模态框）
const handleAddNew = (source: DataSource) => {
  emit('update', [...props.dataSources, source])
  selectedId.value = source.id
}

// 处理编辑
const handleEdit = (id: string) => {
  editingSource.value = props.dataSources.find(s => s.id === id) || null
  showModal.value = true
}

// 处理更新
const handleUpdate = (source: DataSource) => {
  const index = props.dataSources.findIndex(s => s.id === source.id)
  if (index !== -1) {
    const newSources = [...props.dataSources]
    newSources[index] = source
    emit('update', newSources)
  }
}

// 处理选择
const handleSelect = (id: string) => {
  selectedId.value = id
}

// 处理删除
const handleDelete = (id: string) => {
  if (confirm('确定要删除这个数据源吗？')) {
    const newSources = props.dataSources.filter(s => s.id !== id)
    emit('update', newSources)

    if (selectedId.value === id) {
      selectedId.value = null
    }
  }
}

// 处理复制
const handleDuplicate = (id: string) => {
  const source = props.dataSources.find(s => s.id === id)
  if (source) {
    const newSource: DataSource = {
      ...source,
      id: generateId(),
      name: `${source.name} (副本)`
    }
    emit('update', [...props.dataSources, newSource])
    selectedId.value = newSource.id
  }
}

// 处理测试
const handleTest = async (id: string) => {
  const source = props.dataSources.find(s => s.id === id)
  if (source && source.type === 'async' && source.asyncConfig?.url && props.requestAdapter) {
    try {
      await props.requestAdapter({
        url: source.asyncConfig.url,
        method: source.asyncConfig.method || 'GET',
        headers: source.asyncConfig.headers,
        body: source.asyncConfig.body
      })
      // console.log('测试成功:', response)
      // 这里可以显示成功提示
      // alert('连接测试成功！')
    } catch (error: any) {
      // console.error('测试失败:', error)
      // 这里可以显示错误提示
      // alert(`连接测试失败: ${error.message}`)
    }
  }
}
</script>

<style scoped>
.dataSourcePanel {
  display: flex;
  flex-direction: column;
  height: 50%;
  min-height: 200px;
  background: #0a0a0a;
}

.dataSourcePanel :deep(.dataSourceSidebar) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>