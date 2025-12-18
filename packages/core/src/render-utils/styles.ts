import type { H5Element } from '../types'

/**
 * 计算元素基础定位样式
 */
export function computeElementStyle(el: H5Element, scale = 1) {
  return {
    position: 'absolute' as const,
    left: `${el.x * scale}px`,
    top: `${el.y * scale}px`,
    width: `${el.width * scale}px`,
    height: `${el.height * scale}px`,
    zIndex: el.zIndex || 0,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    opacity: el.hidden ? 0 : 1,
    pointerEvents: el.locked ? 'none' as const : 'auto' as const
  }
}

/**
 * 计算图标样式
 */
export function computeIconStyle(el: H5Element) {
  return {
    color: el.iconColor || '#3b82f6',
    fontSize: `${Math.min(el.width, el.height)}px`,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  }
}

/**
 * 计算进度条样式
 */
export function computeProgressStyle(el: H5Element) {
  return {
    track: {
      width: '100%',
      height: '100%',
      backgroundColor: el.style?.backgroundColor || '#262626',
      borderRadius: el.style?.borderRadius,
      overflow: 'hidden' as const,
      position: 'relative' as const
    },
    bar: {
      width: `${el.progressValue || 0}%`,
      height: '100%',
      backgroundColor: el.progressColor || '#3b82f6',
      borderRadius: el.style?.borderRadius,
      transition: 'width 0.3s'
    }
  }
}

/**
 * 计算标签样式
 */
export function computeTagStyle(el: H5Element) {
  const isSolid = el.tagVariant === 'solid'
  return {
    backgroundColor: isSolid ? el.tagColor : 'transparent',
    color: isSolid ? '#fff' : el.tagColor,
    border: el.tagVariant === 'outline' ? `1px solid ${el.tagColor}` : 'none',
    borderRadius: el.style?.borderRadius || '4px',
    fontSize: el.style?.fontSize || '12px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  }
}

/**
 * 计算分割线样式
 */
export function computeDividerStyle(el: H5Element) {
  return {
    width: '100%',
    height: '100%',
    backgroundColor: el.style?.backgroundColor || '#404040',
    borderStyle: el.dividerStyle || 'solid'
  }
}
