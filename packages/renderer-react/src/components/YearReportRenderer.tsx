import React, { useState, useEffect, useRef, useCallback } from 'react'
import 'animate.css'
import { ElementRenderer } from './ElementRenderer'
import { GroupRenderer } from './GroupRenderer'
import { ProjectData, H5Page, H5Element, DataSourceManager } from '@year-report/core'

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
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [mouseStart, setMouseStart] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dataSourceManager = useRef<DataSourceManager | null>(null)

  // 初始化数据源
  useEffect(() => {
    if (data.dataSources?.length) {
      dataSourceManager.current = new DataSourceManager()
      dataSourceManager.current.setDataSources(data.dataSources)
    }
    return () => {
      dataSourceManager.current?.destroy()
    }
  }, [data.dataSources])

  // 处理背景音乐
  useEffect(() => {
    if (data.backgroundMusic && audioRef.current) {
      audioRef.current.volume = 0.3
    }
  }, [data.backgroundMusic])

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const getUngroupedElements = useCallback((page: H5Page) => {
    return page.elements.filter(el => !el.groupId)
  }, [])

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

  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= data.pages.length) return
    setCurrentPageIndex(index)
    onPageChange?.(index)
  }, [data.pages.length, onPageChange])

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

  const getPageStyle = useCallback((page: H5Page) => {
    const style: React.CSSProperties = {}
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

  const handleElementClick = useCallback((element: H5Element) => {
    onElementClick?.(element)
  }, [onElementClick])

  return (
    <div className="fixedContainer" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {data.backgroundMusic && (
        <audio ref={audioRef} src={data.backgroundMusic} loop />
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

                {Object.entries(groups).map(([groupId, elements]) => (
                  <GroupRenderer
                    key={groupId}
                    elements={elements}
                    rotation={page.groupRotations?.[groupId] || 0}
                    onElementClick={handleElementClick}
                    dataBindingManager={dataSourceManager.current}
                  />
                ))}

                {getUngroupedElements(page).map(element => (
                  <ElementRenderer
                    key={element.id}
                    element={element}
                    pageIndex={index}
                    onElementClick={handleElementClick}
                    dataBindingManager={dataSourceManager.current}
                  />
                ))}
              </div>
            )
          })}
        </div>

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
