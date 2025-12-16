import React, { useState, useEffect, useRef, useCallback } from 'react'
import 'animate.css'
import { ElementRenderer } from './ElementRenderer'
import { GroupRenderer } from './GroupRenderer'
import { ProjectData, H5Page, H5Element, AnimationPlayer, AnimateCssScheduler, DataBindingManager } from '@year-report/core'

interface YearReportRendererProps {
  data: ProjectData
  onPageChange?: (pageIndex: number) => void
  onElementClick?: (element: H5Element) => void
}

export const YearReportRenderer: React.FC<YearReportRendererProps> = ({
  data,
  onPageChange,
  onElementClick
}) => {
  // 状态管理
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [mouseStart, setMouseStart] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  // 引用
  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 动画管理器
  const animationPlayers = useRef<Map<number, AnimationPlayer[]>>(new Map())
  const animateScheduler = useRef<AnimateCssScheduler | null>(null)
  const dataBindingManager = useRef<DataBindingManager | null>(null)

  // 初始化数据绑定
  useEffect(() => {
    if (data.dataSources) {
      dataBindingManager.current = new DataBindingManager(data.dataSources)
      dataBindingManager.current.init().catch(console.error)
    }
  }, [data.dataSources])

  // 处理背景音乐
  useEffect(() => {
    if (data.backgroundMusic && audioRef.current) {
      audioRef.current.volume = 0.3
    }
  }, [data.backgroundMusic])

  // 切换背景音乐
  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  // 获取未分组元素
  const getUngroupedElements = useCallback((page: H5Page) => {
    return page.elements.filter(el => !el.groupId)
  }, [])

  // 获取分组
  const getGroups = useCallback((page: H5Page) => {
    const groups: { [groupId: string]: H5Element[] } = {}
    page.elements.forEach(el => {
      if (el.groupId) {
        if (!groups[el.groupId]) {
          groups[el.groupId] = []
        }
        groups[el.groupId].push(el)
      }
    })
    return groups
  }, [])

  // 播放页面动画
  const playPageAnimations = useCallback(async (pageIndex: number) => {
    const page = data.pages[pageIndex]
    if (!page) return

    // 停止前一页动画
    if (animationPlayers.current.has(pageIndex - 1)) {
      const prevPlayers = animationPlayers.current.get(pageIndex - 1) || []
      prevPlayers.forEach(player => player.stop())
    }

    // 播放当前页动画
    const players: AnimationPlayer[] = []
    const scheduler = animateScheduler.current = new AnimateCssScheduler()

    // 收集所有动画
    page.elements.forEach(element => {
      if (element.animation) {
        players.push(new AnimationPlayer(element, element.animation))
      }
      if (element.animations) {
        element.animations.forEach(anim => {
          players.push(new AnimationPlayer(element, anim))
        })
      }
    })

    // 根据触发时机排序并播放
    const onEnterAnimations = players.filter(p =>
      p.config.trigger === 'onEnter' || !p.config.trigger
    )

    for (const player of onEnterAnimations) {
      const delay = player.config.delay || 0
      scheduler.add(() => {
        player.play()
      }, delay * 1000)
    }

    scheduler.start()
    animationPlayers.current.set(pageIndex, players)
  }, [data.pages])

  // 切换页面
  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= data.pages.length) return

    setCurrentPageIndex(index)
    onPageChange?.(index)
    playPageAnimations(index)
  }, [data.pages.length, onPageChange, playPageAnimations])

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
    setIsSwiping(true)
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return

    const touchEnd = e.changedTouches[0].clientY
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToPage(currentPageIndex + 1)
      } else {
        goToPage(currentPageIndex - 1)
      }
    }

    setIsSwiping(false)
  }, [touchStart, isSwiping, currentPageIndex, goToPage])

  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setMouseStart(e.clientY)
    setIsSwiping(true)
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isSwiping) return

    const mouseEnd = e.clientY
    const diff = mouseStart - mouseEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToPage(currentPageIndex + 1)
      } else {
        goToPage(currentPageIndex - 1)
      }
    }

    setIsSwiping(false)
  }, [mouseStart, isSwiping, currentPageIndex, goToPage])

  // 获取页面样式（支持渐变）
  const getPageStyle = useCallback((page: H5Page) => {
    const style: any = {}

    if (page.backgroundType === 'color') {
      style.backgroundColor = page.backgroundColor || '#ffffff'
    } else if (page.backgroundType === 'gradient' && page.backgroundGradient) {
      const { type, direction, colors } = page.backgroundGradient
      const colorStops = colors.map(c => `${c.color} ${c.position || ''}`).join(', ')
      if (type === 'linear') {
        style.background = `linear-gradient(${direction || 'to bottom'}, ${colorStops})`
      } else {
        style.background = `radial-gradient(circle, ${colorStops})`
      }
    } else if (page.backgroundType === 'image' && page.backgroundImage) {
      style.backgroundImage = `url(${page.backgroundImage})`
      style.backgroundSize = 'cover'
      style.backgroundColor = page.backgroundColor || '#ffffff'
    } else {
      style.backgroundColor = page.backgroundColor || '#ffffff'
    }

    return style
  }, [])

  // 元素点击处理
  const handleElementClick = useCallback((element: H5Element) => {
    // 触发点击动画
    if (element.animations) {
      const clickAnimations = element.animations.filter(anim =>
        anim.trigger === 'onClick'
      )
      clickAnimations.forEach(anim => {
        const player = new AnimationPlayer(element, anim)
        player.play()
      })
    }

    onElementClick?.(element)
  }, [onElementClick])

  // 初始化第一页动画
  useEffect(() => {
    if (data.pages.length > 0) {
      playPageAnimations(0)
    }
  }, [data.pages.length, playPageAnimations])

  return (
    <div className="fixedContainer" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* 背景音乐 */}
      {data.backgroundMusic && (
        <audio
          ref={audioRef}
          src={data.backgroundMusic}
          loop
        />
      )}
      {data.backgroundMusic && (
        <button
          onClick={toggleMusic}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? '🔊' : '🔇'}
        </button>
      )}

      {/* 移动端容器 */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: isSwiping ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* 页面容器 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transition: 'transform 0.5s ease-in-out',
            transform: `translateY(-${currentPageIndex * 100}%)`
          }}
        >
          {data.pages.map((page, index) => {
            const groups = getGroups(page)
            return (
              <div
                key={page.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  ...getPageStyle(page),
                  transform: `translateY(${index * 100}%)`
                }}
              >
                {/* 背景视频 */}
                {page.backgroundType === 'video' && page.backgroundVideo && (
                  <video
                    src={page.backgroundVideo}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 0
                    }}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}

                {/* 分组元素 */}
                {Object.entries(groups).map(([groupId, elements]) => (
                  <GroupRenderer
                    key={groupId}
                    elements={elements}
                    rotation={page.groupRotations?.[groupId] || 0}
                    onElementClick={handleElementClick}
                    dataBindingManager={dataBindingManager.current}
                  />
                ))}

                {/* 未分组元素 */}
                {getUngroupedElements(page).map(element => (
                  <ElementRenderer
                    key={element.id}
                    element={element}
                    pageIndex={index}
                    onElementClick={handleElementClick}
                    dataBindingManager={dataBindingManager.current}
                  />
                ))}
              </div>
            )
          })}
        </div>

        {/* 页面指示器 */}
        <div
          style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {data.pages.map((_, index) => (
            <div
              key={index}
              onClick={() => goToPage(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: index === currentPageIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}