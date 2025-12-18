// 数据绑定工具函数
import type { DataSource, RequestAdapter } from './types'

// 插值语法正则: {{数据源名.字段路径}}
const INTERPOLATION_REGEX = /\{\{([^}]+)\}\}/g

// 获取嵌套对象的值
export const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined
  return path.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined
    // 支持数组索引 如 items[0]
    const match = key.match(/^(\w+)\[(\d+)\]$/)
    if (match) {
      return acc[match[1]]?.[parseInt(match[2])]
    }
    return acc[key]
  }, obj)
}

// 解析插值语法，返回绑定的数据源名和字段路径
export const parseInterpolation = (text: string): { sourceName: string; fieldPath: string }[] => {
  const bindings: { sourceName: string; fieldPath: string }[] = []
  let match
  while ((match = INTERPOLATION_REGEX.exec(text)) !== null) {
    const [, expr] = match
    const dotIndex = expr.indexOf('.')
    if (dotIndex > 0) {
      bindings.push({
        sourceName: expr.substring(0, dotIndex).trim(),
        fieldPath: expr.substring(dotIndex + 1).trim()
      })
    }
  }
  return bindings
}

// 替换文本中的插值语法
export const resolveInterpolation = (
  text: string,
  dataSources: DataSource[],
  dataCache: Map<string, any>
): string => {
  return text.replace(INTERPOLATION_REGEX, (match, expr) => {
    const dotIndex = expr.indexOf('.')
    if (dotIndex <= 0) return match

    const sourceName = expr.substring(0, dotIndex).trim()
    const fieldPath = expr.substring(dotIndex + 1).trim()

    const source = dataSources.find(s => s.name === sourceName)
    if (!source) return match

    // 从缓存获取数据
    const data = dataCache.get(source.id) ?? source.staticData
    if (!data) return match

    const value = getNestedValue(data, fieldPath)
    return value !== undefined ? String(value) : match
  })
}

// 数据源管理器
export class DataSourceManager {
  private dataSources: DataSource[] = []
  private dataCache = new Map<string, any>()
  private refreshTimers = new Map<string, number>()
  private requestAdapter: RequestAdapter
  private listeners: Set<() => void> = new Set()

  constructor(requestAdapter?: RequestAdapter) {
    this.requestAdapter = requestAdapter || defaultRequestAdapter
  }

  // 设置数据源列表
  setDataSources(sources: DataSource[]) {
    // 清理旧的定时器
    this.refreshTimers.forEach(timer => clearInterval(timer))
    this.refreshTimers.clear()

    this.dataSources = sources

    // 初始化静态数据
    sources.forEach(source => {
      if (source.type === 'static' && source.staticData) {
        this.dataCache.set(source.id, source.staticData)
      }
    })

    // 加载异步数据
    sources.filter(s => s.type === 'async').forEach(source => {
      this.fetchAsyncData(source)
      // 设置刷新定时器
      if (source.asyncConfig?.refreshInterval && source.asyncConfig.refreshInterval > 0) {
        const timer = window.setInterval(() => {
          this.fetchAsyncData(source)
        }, source.asyncConfig.refreshInterval)
        this.refreshTimers.set(source.id, timer)
      }
    })

    // 通知更新（静态数据也需要触发）
    this.notifyListeners()
  }

  // 获取异步数据
  private async fetchAsyncData(source: DataSource) {
    if (!source.asyncConfig?.url) return

    try {
      const data = await this.requestAdapter({
        url: source.asyncConfig.url,
        method: source.asyncConfig.method || 'GET',
        headers: source.asyncConfig.headers,
        body: source.asyncConfig.body
      })
      this.dataCache.set(source.id, data)
      this.notifyListeners()
    } catch (error) {
      console.error(`Failed to fetch data source: ${source.name}`, error)
    }
  }

  // 解析文本中的插值
  resolve(text: string): string {
    return resolveInterpolation(text, this.dataSources, this.dataCache)
  }

  // 获取指定数据源的数据
  getData(sourceId: string): any {
    return this.dataCache.get(sourceId)
  }

  // 获取所有数据源
  getDataSources(): DataSource[] {
    return this.dataSources
  }

  // 获取数据缓存
  getDataCache(): Map<string, any> {
    return this.dataCache
  }

  // 监听数据变化
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn())
  }

  // 销毁
  destroy() {
    this.refreshTimers.forEach(timer => clearInterval(timer))
    this.refreshTimers.clear()
    this.listeners.clear()
  }
}

// 默认请求适配器 (使用fetch)
const defaultRequestAdapter: RequestAdapter = async (config) => {
  const response = await fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: config.body ? JSON.stringify(config.body) : undefined
  })
  return response.json()
}
