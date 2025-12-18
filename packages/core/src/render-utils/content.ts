import type { H5Element, DataSource } from '../types'
import { resolveInterpolation } from '../dataBinding'

/**
 * 解析元素内容（支持插值语法和渲染函数）
 * @param element 元素
 * @param content 原始内容
 * @param dataSources 数据源列表
 * @param dataCache 数据缓存
 * @returns 解析后的内容
 */
export function resolveContent(
  element: H5Element,
  content: string,
  dataSources: DataSource[],
  dataCache: Map<string, any>
): string {
  // 优先使用渲染函数
  if (element.renderFunction) {
    try {
      const result = executeRenderFunction(element.renderFunction, dataSources, dataCache)
      if (result !== undefined && result !== null) {
        return String(result)
      }
    } catch (e) {
      console.error('渲染函数执行失败:', e)
    }
  }

  // 使用插值语法解析
  return resolveInterpolation(content, dataSources, dataCache)
}

/**
 * 执行渲染函数
 * @param fnBody 函数体字符串
 * @param dataSources 数据源列表
 * @param dataCache 数据缓存
 * @returns 渲染结果
 */
export function executeRenderFunction(
  fnBody: string,
  dataSources: DataSource[],
  dataCache: Map<string, any>
): any {
  // 构建数据上下文：{ 数据源名: 数据 }
  const context: Record<string, any> = {}
  dataSources.forEach(source => {
    const data = dataCache.get(source.id) ?? source.staticData
    if (data !== undefined) {
      context[source.name] = data
    }
  })

  // 创建函数并执行
  // eslint-disable-next-line no-new-func
  const fn = new Function('data', `with(data) { ${fnBody} }`)
  return fn(context)
}
