import React, { useMemo } from 'react'
import { H5Element, DataSourceManager, CANVAS_WIDTH, CANVAS_HEIGHT } from '@year-report/core'
import { ElementRenderer } from './ElementRenderer'

interface GroupBounds {
  x: number
  y: number
  width: number
  height: number
}

interface GroupRendererProps {
  elements: H5Element[]
  rotation: number
  onElementClick?: (element: H5Element) => void
  dataBindingManager?: DataSourceManager | null
}

export const GroupRenderer: React.FC<GroupRendererProps> = ({
  elements,
  rotation,
  onElementClick,
  dataBindingManager
}) => {
  // 计算分组边界
  const bounds = useMemo((): GroupBounds => {
    if (elements.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    elements.forEach(el => {
      const right = el.x + el.width
      const bottom = el.y + el.height
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, right)
      maxY = Math.max(maxY, bottom)
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }, [elements])

  // 计算缩放后的边界
  const scaledBounds = useMemo(() => {
    const scaleX = window.innerWidth / CANVAS_WIDTH
    const scaleY = window.innerHeight / CANVAS_HEIGHT
    const scale = Math.min(scaleX, scaleY)

    return {
      x: bounds.x * scale,
      y: bounds.y * scale,
      width: bounds.width * scale,
      height: bounds.height * scale
    }
  }, [bounds])

  // 包装器样式
  const wrapperStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    left: `${scaledBounds.x}px`,
    top: `${scaledBounds.y}px`,
    width: `${scaledBounds.width}px`,
    height: `${scaledBounds.height}px`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: 'center center',
    pointerEvents: 'none' as const
  }), [scaledBounds, rotation])

  return (
    <div style={wrapperStyle}>
      {elements.map(element => (
        <ElementRenderer
          key={element.id}
          element={element}
          pageIndex={0} // 分组渲染时 pageIndex 不是必需的
          onElementClick={onElementClick}
          dataBindingManager={dataBindingManager}
        />
      ))}
    </div>
  )
}