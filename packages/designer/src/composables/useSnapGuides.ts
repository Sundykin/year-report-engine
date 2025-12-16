import { type Ref, ref, computed } from 'vue'
import type { ProjectData, H5Element } from '@year-report/core'

const SNAP_THRESHOLD = 8

// 计算旋转后的关键点（四角 + 中心）
function getSnapPoints(el: { x: number; y: number; width: number; height: number; rotation?: number }) {
  const centerX = el.x + el.width / 2
  const centerY = el.y + el.height / 2
  const rotation = el.rotation || 0

  // 无旋转时直接返回
  if (rotation === 0) {
    return {
      corners: [
        { x: el.x, y: el.y },
        { x: el.x + el.width, y: el.y },
        { x: el.x, y: el.y + el.height },
        { x: el.x + el.width, y: el.y + el.height }
      ],
      center: { x: centerX, y: centerY },
      edges: {
        left: el.x,
        right: el.x + el.width,
        top: el.y,
        bottom: el.y + el.height
      }
    }
  }

  // 有旋转时计算旋转后的角位置
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const halfW = el.width / 2
  const halfH = el.height / 2

  // 相对于中心的四个角
  const relCorners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: -halfW, y: halfH },
    { x: halfW, y: halfH }
  ]

  const corners = relCorners.map(c => ({
    x: centerX + c.x * cos - c.y * sin,
    y: centerY + c.x * sin + c.y * cos
  }))

  // 计算旋转后的边界框
  const xs = corners.map(c => c.x)
  const ys = corners.map(c => c.y)

  return {
    corners,
    center: { x: centerX, y: centerY },
    edges: {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys)
    }
  }
}

export function useSnapGuides(
  project: Ref<ProjectData>,
  activePageId: Ref<string>,
  canvasWidth: number,
  canvasHeight: number
) {
  const guides = ref<{ type: 'h' | 'v'; pos: number }[]>([])

  const activePage = computed(() => project.value.pages.find(p => p.id === activePageId.value)!)

  const calcGuides = (el: H5Element, newX: number, newY: number) => {
    const others = activePage.value.elements.filter(e => e.id !== el.id)
    const elPoints = getSnapPoints({ ...el, x: newX, y: newY })

    const result: { type: 'h' | 'v'; pos: number }[] = []

    // 目标线：画布边界 + 中心
    const vTargets = [0, canvasWidth / 2, canvasWidth]
    const hTargets = [0, canvasHeight / 2, canvasHeight]

    // 添加其他元素的边界
    others.forEach(other => {
      const otherPoints = getSnapPoints(other)
      vTargets.push(otherPoints.edges.left, otherPoints.edges.right, otherPoints.center.x)
      hTargets.push(otherPoints.edges.top, otherPoints.edges.bottom, otherPoints.center.y)
    })

    // 检查垂直吸附线（x方向）
    let bestV: { pos: number; dist: number } | null = null
    const elVPoints = [elPoints.edges.left, elPoints.edges.right, elPoints.center.x]

    for (const elV of elVPoints) {
      for (const target of vTargets) {
        const dist = Math.abs(elV - target)
        if (dist < SNAP_THRESHOLD && (!bestV || dist < bestV.dist)) {
          bestV = { pos: target, dist }
        }
      }
    }

    // 检查水平吸附线（y方向）
    let bestH: { pos: number; dist: number } | null = null
    const elHPoints = [elPoints.edges.top, elPoints.edges.bottom, elPoints.center.y]

    for (const elH of elHPoints) {
      for (const target of hTargets) {
        const dist = Math.abs(elH - target)
        if (dist < SNAP_THRESHOLD && (!bestH || dist < bestH.dist)) {
          bestH = { pos: target, dist }
        }
      }
    }

    if (bestV) result.push({ type: 'v', pos: bestV.pos })
    if (bestH) result.push({ type: 'h', pos: bestH.pos })

    guides.value = result
  }

  const snapPosition = (el: H5Element, x: number, y: number) => {
    const others = activePage.value.elements.filter(e => e.id !== el.id)
    const elPoints = getSnapPoints({ ...el, x, y })

    let snappedX = x
    let snappedY = y

    // 目标线
    const vTargets = [0, canvasWidth / 2, canvasWidth]
    const hTargets = [0, canvasHeight / 2, canvasHeight]

    others.forEach(other => {
      const otherPoints = getSnapPoints(other)
      vTargets.push(otherPoints.edges.left, otherPoints.edges.right, otherPoints.center.x)
      hTargets.push(otherPoints.edges.top, otherPoints.edges.bottom, otherPoints.center.y)
    })

    // X方向吸附
    let bestSnapX: { offset: number; dist: number } | null = null
    const elVPoints = [
      { val: elPoints.edges.left, offset: 0 },
      { val: elPoints.edges.right, offset: 0 },
      { val: elPoints.center.x, offset: 0 }
    ]

    for (const elV of elVPoints) {
      for (const target of vTargets) {
        const dist = Math.abs(elV.val - target)
        if (dist < SNAP_THRESHOLD && (!bestSnapX || dist < bestSnapX.dist)) {
          bestSnapX = { offset: target - elV.val, dist }
        }
      }
    }

    // Y方向吸附
    let bestSnapY: { offset: number; dist: number } | null = null
    const elHPoints = [
      { val: elPoints.edges.top, offset: 0 },
      { val: elPoints.edges.bottom, offset: 0 },
      { val: elPoints.center.y, offset: 0 }
    ]

    for (const elH of elHPoints) {
      for (const target of hTargets) {
        const dist = Math.abs(elH.val - target)
        if (dist < SNAP_THRESHOLD && (!bestSnapY || dist < bestSnapY.dist)) {
          bestSnapY = { offset: target - elH.val, dist }
        }
      }
    }

    if (bestSnapX) snappedX = x + bestSnapX.offset
    if (bestSnapY) snappedY = y + bestSnapY.offset

    return { x: snappedX, y: snappedY }
  }

  const clearGuides = () => {
    guides.value = []
  }

  // 缩放时只计算吸附线，不改变位置
  const snapSize = (el: H5Element, width: number, height: number, direction: string, rotation?: number) => {
    const others = activePage.value.elements.filter(e => e.id !== el.id)
    const result: { type: 'h' | 'v'; pos: number }[] = []

    // 目标线
    const vTargets = [0, canvasWidth / 2, canvasWidth]
    const hTargets = [0, canvasHeight / 2, canvasHeight]

    others.forEach(other => {
      const otherPoints = getSnapPoints(other)
      vTargets.push(otherPoints.edges.left, otherPoints.edges.right, otherPoints.center.x)
      hTargets.push(otherPoints.edges.top, otherPoints.edges.bottom, otherPoints.center.y)
    })

    let snappedW = width, snappedH = height
    const rot = rotation || el.rotation || 0

    // 旋转状态下只显示吸附线，不自动调整尺寸（因为旋转后边界框与实际尺寸关系复杂）
    if (rot !== 0) {
      // 计算当前尺寸下旋转后的边界框
      const elPoints = getSnapPoints({ x: el.x, y: el.y, width, height, rotation: rot })

      // 只显示吸附线，不修改尺寸
      if (direction.includes('e') || direction.includes('w')) {
        for (const target of vTargets) {
          if (Math.abs(elPoints.edges.right - target) < SNAP_THRESHOLD) {
            result.push({ type: 'v', pos: target })
            break
          }
          if (Math.abs(elPoints.edges.left - target) < SNAP_THRESHOLD) {
            result.push({ type: 'v', pos: target })
            break
          }
        }
      }
      if (direction.includes('s') || direction.includes('n')) {
        for (const target of hTargets) {
          if (Math.abs(elPoints.edges.bottom - target) < SNAP_THRESHOLD) {
            result.push({ type: 'h', pos: target })
            break
          }
          if (Math.abs(elPoints.edges.top - target) < SNAP_THRESHOLD) {
            result.push({ type: 'h', pos: target })
            break
          }
        }
      }
    } else {
      // 非旋转状态：原有逻辑
      if (direction.includes('e')) {
        const right = el.x + width
        for (const target of vTargets) {
          if (Math.abs(right - target) < SNAP_THRESHOLD) {
            snappedW = target - el.x
            result.push({ type: 'v', pos: target })
            break
          }
        }
      }
      if (direction.includes('w')) {
        const left = el.x + el.width - width
        for (const target of vTargets) {
          if (Math.abs(left - target) < SNAP_THRESHOLD) {
            snappedW = el.x + el.width - target
            result.push({ type: 'v', pos: target })
            break
          }
        }
      }
      if (direction.includes('s')) {
        const bottom = el.y + height
        for (const target of hTargets) {
          if (Math.abs(bottom - target) < SNAP_THRESHOLD) {
            snappedH = target - el.y
            result.push({ type: 'h', pos: target })
            break
          }
        }
      }
      if (direction.includes('n')) {
        const top = el.y + el.height - height
        for (const target of hTargets) {
          if (Math.abs(top - target) < SNAP_THRESHOLD) {
            snappedH = el.y + el.height - target
            result.push({ type: 'h', pos: target })
            break
          }
        }
      }
    }

    guides.value = result
    return { width: snappedW, height: snappedH }
  }

  // 分组吸附（基于旋转后的实际边界）
  const snapGroupPosition = (
    groupBounds: { x: number; y: number; width: number; height: number },
    groupElementIds: string[],
    newX: number,
    newY: number,
    rotation: number = 0
  ) => {
    const others = activePage.value.elements.filter(e => !groupElementIds.includes(e.id))

    // 使用 getSnapPoints 计算旋转后的边界
    const groupPoints = getSnapPoints({ x: newX, y: newY, width: groupBounds.width, height: groupBounds.height, rotation })

    let snappedX = newX
    let snappedY = newY

    // 目标线
    const vTargets = [0, canvasWidth / 2, canvasWidth]
    const hTargets = [0, canvasHeight / 2, canvasHeight]

    others.forEach(other => {
      const otherPoints = getSnapPoints(other)
      vTargets.push(otherPoints.edges.left, otherPoints.edges.right, otherPoints.center.x)
      hTargets.push(otherPoints.edges.top, otherPoints.edges.bottom, otherPoints.center.y)
    })

    // X方向吸附（使用旋转后的边界）
    let bestSnapX: { offset: number; dist: number } | null = null
    const groupVPoints = [groupPoints.edges.left, groupPoints.edges.right, groupPoints.center.x]

    for (const gv of groupVPoints) {
      for (const target of vTargets) {
        const dist = Math.abs(gv - target)
        if (dist < SNAP_THRESHOLD && (!bestSnapX || dist < bestSnapX.dist)) {
          bestSnapX = { offset: target - gv, dist }
        }
      }
    }

    // Y方向吸附（使用旋转后的边界）
    let bestSnapY: { offset: number; dist: number } | null = null
    const groupHPoints = [groupPoints.edges.top, groupPoints.edges.bottom, groupPoints.center.y]

    for (const gh of groupHPoints) {
      for (const target of hTargets) {
        const dist = Math.abs(gh - target)
        if (dist < SNAP_THRESHOLD && (!bestSnapY || dist < bestSnapY.dist)) {
          bestSnapY = { offset: target - gh, dist }
        }
      }
    }

    if (bestSnapX) snappedX = newX + bestSnapX.offset
    if (bestSnapY) snappedY = newY + bestSnapY.offset

    return { x: snappedX, y: snappedY }
  }

  // 计算分组吸附线（基于旋转后的实际边界）
  const calcGroupGuides = (
    groupBounds: { x: number; y: number; width: number; height: number },
    groupElementIds: string[],
    newX: number,
    newY: number,
    rotation: number = 0
  ) => {
    const others = activePage.value.elements.filter(e => !groupElementIds.includes(e.id))

    // 使用 getSnapPoints 计算旋转后的边界
    const groupPoints = getSnapPoints({ x: newX, y: newY, width: groupBounds.width, height: groupBounds.height, rotation })

    const result: { type: 'h' | 'v'; pos: number }[] = []

    const vTargets = [0, canvasWidth / 2, canvasWidth]
    const hTargets = [0, canvasHeight / 2, canvasHeight]

    others.forEach(other => {
      const otherPoints = getSnapPoints(other)
      vTargets.push(otherPoints.edges.left, otherPoints.edges.right, otherPoints.center.x)
      hTargets.push(otherPoints.edges.top, otherPoints.edges.bottom, otherPoints.center.y)
    })

    // 检查垂直吸附线（使用旋转后的边界）
    let bestV: { pos: number; dist: number } | null = null
    for (const gv of [groupPoints.edges.left, groupPoints.edges.right, groupPoints.center.x]) {
      for (const target of vTargets) {
        const dist = Math.abs(gv - target)
        if (dist < SNAP_THRESHOLD && (!bestV || dist < bestV.dist)) {
          bestV = { pos: target, dist }
        }
      }
    }

    // 检查水平吸附线（使用旋转后的边界）
    let bestH: { pos: number; dist: number } | null = null
    for (const gh of [groupPoints.edges.top, groupPoints.edges.bottom, groupPoints.center.y]) {
      for (const target of hTargets) {
        const dist = Math.abs(gh - target)
        if (dist < SNAP_THRESHOLD && (!bestH || dist < bestH.dist)) {
          bestH = { pos: target, dist }
        }
      }
    }

    if (bestV) result.push({ type: 'v', pos: bestV.pos })
    if (bestH) result.push({ type: 'h', pos: bestH.pos })

    guides.value = result
  }

  // 分组缩放吸附
  const snapGroupSize = (
    groupBounds: { x: number; y: number; width: number; height: number },
    groupElementIds: string[],
    newWidth: number,
    newHeight: number,
    anchorX: number,
    anchorY: number,
    rotation: number = 0
  ) => {
    const others = activePage.value.elements.filter(e => !groupElementIds.includes(e.id))
    const result: { type: 'h' | 'v'; pos: number }[] = []

    const vTargets = [0, canvasWidth / 2, canvasWidth]
    const hTargets = [0, canvasHeight / 2, canvasHeight]

    others.forEach(other => {
      const otherPoints = getSnapPoints(other)
      vTargets.push(otherPoints.edges.left, otherPoints.edges.right, otherPoints.center.x)
      hTargets.push(otherPoints.edges.top, otherPoints.edges.bottom, otherPoints.center.y)
    })

    let snappedW = newWidth, snappedH = newHeight

    if (rotation !== 0) {
      // 旋转状态：只显示吸附线，不自动调整尺寸（因为旋转后边界框与实际尺寸关系复杂）
      const scaleX = newWidth / groupBounds.width
      const scaleY = newHeight / groupBounds.height

      const rad = rotation * Math.PI / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)

      const oldCenterX = groupBounds.x + groupBounds.width / 2
      const oldCenterY = groupBounds.y + groupBounds.height / 2

      const anchorRelX = anchorX - oldCenterX
      const anchorRelY = anchorY - oldCenterY
      const anchorLocalX = anchorRelX * cos + anchorRelY * sin
      const anchorLocalY = -anchorRelX * sin + anchorRelY * cos

      const newAnchorLocalX = anchorLocalX * scaleX
      const newAnchorLocalY = anchorLocalY * scaleY

      const newCenterX = anchorX - (newAnchorLocalX * cos - newAnchorLocalY * sin)
      const newCenterY = anchorY - (newAnchorLocalX * sin + newAnchorLocalY * cos)

      // 计算旋转后的边界框，只用于显示吸附线
      const groupPoints = getSnapPoints({
        x: newCenterX - newWidth / 2,
        y: newCenterY - newHeight / 2,
        width: newWidth,
        height: newHeight,
        rotation
      })

      // 只显示吸附线，不修改尺寸
      for (const target of vTargets) {
        if (Math.abs(groupPoints.edges.right - target) < SNAP_THRESHOLD) {
          result.push({ type: 'v', pos: target })
          break
        }
        if (Math.abs(groupPoints.edges.left - target) < SNAP_THRESHOLD) {
          result.push({ type: 'v', pos: target })
          break
        }
      }

      for (const target of hTargets) {
        if (Math.abs(groupPoints.edges.bottom - target) < SNAP_THRESHOLD) {
          result.push({ type: 'h', pos: target })
          break
        }
        if (Math.abs(groupPoints.edges.top - target) < SNAP_THRESHOLD) {
          result.push({ type: 'h', pos: target })
          break
        }
      }
    } else {
      // 非旋转状态：原有逻辑
      const scaleX = newWidth / groupBounds.width
      const scaleY = newHeight / groupBounds.height
      const newX = anchorX + (groupBounds.x - anchorX) * scaleX
      const newRight = anchorX + (groupBounds.x + groupBounds.width - anchorX) * scaleX
      const newY = anchorY + (groupBounds.y - anchorY) * scaleY
      const newBottom = anchorY + (groupBounds.y + groupBounds.height - anchorY) * scaleY

      const rightDivisor = (groupBounds.x + groupBounds.width - anchorX) / groupBounds.width
      const leftDivisor = (anchorX - groupBounds.x) / groupBounds.width
      const bottomDivisor = (groupBounds.y + groupBounds.height - anchorY) / groupBounds.height
      const topDivisor = (anchorY - groupBounds.y) / groupBounds.height

      if (Math.abs(rightDivisor) > 0.001) {
        for (const target of vTargets) {
          if (Math.abs(newRight - target) < SNAP_THRESHOLD) {
            snappedW = (target - anchorX) / rightDivisor
            result.push({ type: 'v', pos: target })
            break
          }
        }
      }

      if (Math.abs(leftDivisor) > 0.001) {
        for (const target of vTargets) {
          if (Math.abs(newX - target) < SNAP_THRESHOLD) {
            snappedW = (anchorX - target) / leftDivisor
            result.push({ type: 'v', pos: target })
            break
          }
        }
      }

      if (Math.abs(bottomDivisor) > 0.001) {
        for (const target of hTargets) {
          if (Math.abs(newBottom - target) < SNAP_THRESHOLD) {
            snappedH = (target - anchorY) / bottomDivisor
            result.push({ type: 'h', pos: target })
            break
          }
        }
      }

      if (Math.abs(topDivisor) > 0.001) {
        for (const target of hTargets) {
          if (Math.abs(newY - target) < SNAP_THRESHOLD) {
            snappedH = (anchorY - target) / topDivisor
            result.push({ type: 'h', pos: target })
            break
          }
        }
      }
    }

    guides.value = result
    return { width: snappedW, height: snappedH }
  }

  return {
    guides,
    calcGuides,
    snapPosition,
    snapSize,
    snapGroupPosition,
    calcGroupGuides,
    snapGroupSize,
    clearGuides,
    getSnapPoints
  }
}
