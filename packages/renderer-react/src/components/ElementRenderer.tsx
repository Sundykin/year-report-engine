import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import ReactECharts from 'echarts-for-react'
import { H5Element, DataBindingManager, CANVAS_WIDTH, CANVAS_HEIGHT } from '@year-report/core'

// 注册ECharts组件
echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer])

interface ElementRendererProps {
  element: H5Element
  pageIndex: number
  onElementClick?: (element: H5Element) => void
  dataBindingManager?: DataBindingManager | null
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  pageIndex,
  onElementClick,
  dataBindingManager
}) => {
  const elementRef = useRef<HTMLDivElement>(null)

  // 解析文本内容中的数据绑定
  const resolvedContent = useMemo(() => {
    if (!element.content) return ''
    if (!dataBindingManager) return element.content
    return dataBindingManager.resolve(element.content)
  }, [element.content, dataBindingManager])

  // 解析渲染函数生成的HTML
  const resolvedHtml = useMemo(() => {
    if (!element.renderFunction) return ''
    if (!dataBindingManager || !element.dataBinding?.sourceIds?.length) {
      return '<div>请配置数据源</div>'
    }

    const sourceIds = element.dataBinding.sourceIds
    const dataSources = sourceIds.map(id => dataBindingManager.getData(id)).filter(v => v !== undefined)

    if (!dataSources.length) return '<div>数据源未找到</div>'

    try {
      const paramNames = dataSources.map((_, i) => `ds${i + 1}`).join(', ')
      const renderFn = new Function(paramNames, `return (${element.renderFunction})(${paramNames})`)
      const result = renderFn(...dataSources)
      return typeof result === 'string' ? result : '<div>渲染函数必须返回字符串</div>'
    } catch (e) {
      console.error('渲染函数执行失败:', e)
      return `<div style="color: red;">渲染错误: ${e instanceof Error ? e.message : '未知错误'}</div>`
    }
  }, [element.renderFunction, element.dataBinding, dataBindingManager])

  // 解析富文本中的插值语法
  const resolvedRichText = useMemo(() => {
    if (!element.content) return ''
    if (!dataBindingManager) return element.content
    return dataBindingManager.resolve(element.content)
  }, [element.content, dataBindingManager])

  // 处理点击事件
  const handleClick = useCallback(() => {
    if (element.locked) return
    onElementClick?.(element)
  }, [element.locked, onElementClick, element])

  // 计算缩放和位置
  const { scaledX, scaledY, scaledWidth, scaledHeight } = useMemo(() => {
    const scaleX = window.innerWidth / CANVAS_WIDTH
    const scaleY = window.innerHeight / CANVAS_HEIGHT
    const scale = Math.min(scaleX, scaleY)

    return {
      scaledX: element.x * scale,
      scaledY: element.y * scale,
      scaledWidth: element.width * scale,
      scaledHeight: element.height * scale
    }
  }, [element])

  // 元素样式
  const elementStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    left: `${scaledX}px`,
    top: `${scaledY}px`,
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    zIndex: element.zIndex || 0,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    cursor: element.locked ? 'not-allowed' : 'pointer',
    display: element.visible === false ? 'none' : 'block'
  }), [scaledX, scaledY, scaledWidth, scaledHeight, element])

  // 内容样式
  const contentStyle: React.CSSProperties = useMemo(() => ({
    width: '100%',
    height: '100%',
    ...element.style
  }), [element.style])

  // ECharts配置
  const chartOption = useMemo(() => {
    if (element.type !== 'chart' || !element.chartData) return null

    const baseOption = {
      tooltip: {
        trigger: 'item'
      },
      title: {
        text: '',
        left: 'center'
      }
    }

    switch (element.chartType) {
      case 'bar':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: element.chartData.map(item => item.name)
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            type: 'bar',
            data: element.chartData.map(item => item.value)
          }]
        }

      case 'line':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: element.chartData.map(item => item.name)
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            type: 'line',
            data: element.chartData.map(item => item.value)
          }]
        }

      case 'pie':
        return {
          ...baseOption,
          series: [{
            type: 'pie',
            radius: '50%',
            data: element.chartData.map(item => ({
              name: item.name,
              value: item.value
            }))
          }]
        }

      default:
        return null
    }
  }, [element])

  // 渲染形状
  const renderShape = useCallback(() => {
    const shapeStyles: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: element.style.backgroundColor || '#000'
    }

    switch (element.shapeType) {
      case 'circle':
        shapeStyles.borderRadius = '50%'
        break
      case 'triangle':
        shapeStyles.width = 0
        shapeStyles.height = 0
        shapeStyles.backgroundColor = 'transparent'
        shapeStyles.borderLeft = `${scaledWidth / 2}px solid transparent`
        shapeStyles.borderRight = `${scaledWidth / 2}px solid transparent`
        shapeStyles.borderBottom = `${scaledHeight}px solid ${element.style.backgroundColor || '#000'}`
        break
      default:
        shapeStyles.borderRadius = element.style.borderRadius || '0'
    }

    return <div style={shapeStyles} />
  }, [element.shapeType, element.style, scaledWidth, scaledHeight])

  return (
    <div
      ref={elementRef}
      style={elementStyle}
      onClick={handleClick}
    >
      {/* 文本 */}
      {element.type === 'text' && (
        <div
          style={{
            ...contentStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.2
          }}
        >
          {element.renderFunction ? (
            <div
              dangerouslySetInnerHTML={{ __html: resolvedHtml }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <span>{resolvedContent}</span>
          )}
        </div>
      )}

      {/* 图片 */}
      {element.type === 'image' && (
        <img
          src={element.src}
          alt="asset"
          style={{
            ...contentStyle,
            objectFit: 'cover'
          }}
          draggable={false}
        />
      )}

      {/* 形状 */}
      {element.type === 'shape' && renderShape()}

      {/* 视频 */}
      {element.type === 'video' && (
        <video
          src={element.src}
          style={{
            ...contentStyle,
            objectFit: 'cover'
          }}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      {/* 富文本 */}
      {element.type === 'richtext' && (
        <div
          dangerouslySetInnerHTML={{ __html: resolvedRichText }}
          style={{
            ...contentStyle,
            overflow: 'auto'
          }}
          className="richtext-content"
        />
      )}

      {/* 图表 */}
      {element.type === 'chart' && chartOption && (
        <ReactECharts
          option={chartOption}
          style={{
            width: '100%',
            height: '100%'
          }}
          renderer="canvas"
        />
      )}
    </div>
  )
}