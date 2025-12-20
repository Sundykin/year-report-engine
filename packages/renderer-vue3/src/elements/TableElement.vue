<template>
  <div class="tableElement" :style="containerStyle">
    <table :style="tableStyle">
      <thead>
        <tr :style="headerStyle">
          <th
            v-for="col in columns"
            :key="col.key"
            :style="getColumnStyle(col)"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in tableData"
          :key="rowIndex"
          :style="getRowStyle(rowIndex)"
        >
          <td v-for="col in columns" :key="col.key">
            {{ getCellValue(row, col.key) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

interface TableColumn {
  key: string
  title: string
  width?: number
}

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

// 默认列配置
const defaultColumns: TableColumn[] = [
  { key: 'col1', title: '列1' },
  { key: 'col2', title: '列2' },
  { key: 'col3', title: '列3' }
]

// 默认数据
const defaultData: Record<string, any>[] = [
  { col1: '数据1', col2: '数据2', col3: '数据3' },
  { col1: '数据4', col2: '数据5', col3: '数据6' }
]

const columns = computed<TableColumn[]>(() =>
  props.element.tableColumns?.length ? props.element.tableColumns : defaultColumns
)

const tableData = computed<Record<string, any>[]>(() =>
  props.element.tableData?.length ? props.element.tableData : defaultData
)

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  overflow: 'auto',
  ...props.element.style
}))

const tableStyle = computed(() => {
  const bordered = props.element.tableBordered !== false
  return {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: props.element.style?.fontSize || '14px',
    color: props.element.style?.color || '#333',
    border: bordered ? '1px solid #e8e8e8' : 'none'
  }
})

const headerStyle = computed(() => ({
  backgroundColor: props.element.tableHeaderBg || '#fafafa',
  color: props.element.tableHeaderColor || '#333',
  fontWeight: 600
}))

const getColumnStyle = (col: TableColumn) => ({
  width: col.width ? col.width + 'px' : 'auto'
})

const getRowStyle = (index: number) => {
  const striped = props.element.tableStriped !== false
  const bordered = props.element.tableBordered !== false
  return {
    backgroundColor: striped && index % 2 === 1 ? '#fafafa' : 'transparent',
    borderBottom: bordered ? '1px solid #e8e8e8' : 'none'
  }
}

const getCellValue = (row: Record<string, any>, key: string) => {
  return row[key] ?? ''
}
</script>

<style scoped>
.tableElement {
  font-family: inherit;
}

table {
  table-layout: auto;
}

th, td {
  padding: 8px 12px;
  text-align: left;
  border: inherit;
}

th {
  white-space: nowrap;
}

td {
  word-break: break-word;
}
</style>
