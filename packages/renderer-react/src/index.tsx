import React, { useState, useEffect, useRef, CSSProperties } from 'react'
import {
  ProjectData,
  H5Element,
  ANIMATION_KEYFRAMES
} from '@year-report/core'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface RendererProps {
  data: ProjectData
  onClose?: () => void
}

// 获取动画样式
const getAnimationStyles = (el: H5Element, isActive: boolean): CSSProperties => {
  if (!isActive || !el.animation || el.animation.type === 'none') return {}

  const { type, duration, delay } = el.animation

  const base: CSSProperties = {
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    animationFillMode: 'both',
  }

  return { ...base, animationName: type }
}

// 元素渲染组件
const RenderElement: React.FC<{ element: H5Element; isActivePage: boolean }> = ({ element, isActivePage }) => {
  const commonStyle: CSSProperties = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    zIndex: element.zIndex || 1,
    ...element.style,
    ...getAnimationStyles(element, isActivePage),
  }

  if (element.type === 'text') {
    return (
      <div style={commonStyle} className="flex items-center justify-center whitespace-pre-wrap leading-tight">
        {element.content}
      </div>
    )
  }

  if (element.type === 'image') {
    return <img src={element.src} alt="asset" style={{ ...commonStyle, objectFit: 'cover' }} draggable={false} />
  }

  if (element.type === 'shape') {
    return <div style={commonStyle} />
  }

  if (element.type === 'video') {
    return <video src={element.src} style={{ ...commonStyle, objectFit: 'cover' }} autoPlay loop muted playsInline />
  }

  if (element.type === 'chart') {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
    return (
      <div style={commonStyle}>
        <ResponsiveContainer width="100%" height="100%">
          {element.chartType === 'line' ? (
            <LineChart data={element.chartData}>
              <XAxis dataKey="name" stroke="#888" fontSize={10} />
              <YAxis hide />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} dot={false} />
            </LineChart>
          ) : element.chartType === 'pie' ? (
            <PieChart>
              <Pie data={element.chartData} dataKey="value" outerRadius="80%" fill="#8884d8">
                {element.chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={element.chartData}>
              <XAxis dataKey="name" stroke="#888" fontSize={10} />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}

// 主渲染器组件
export const YearReportRenderer: React.FC<RendererProps> = ({ data, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartY = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // 注入动画样式
  useEffect(() => {
    const styleSheet = document.createElement('style')
    styleSheet.innerText = ANIMATION_KEYFRAMES
    document.head.appendChild(styleSheet)
    return () => { document.head.removeChild(styleSheet) }
  }, [])

  // 自动播放背景音乐
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }, [])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < data.pages.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    }
    touchStartY.current = null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">

      {data.backgroundMusic && (
        <>
          <audio ref={audioRef} src={data.backgroundMusic} loop />
          <button
            onClick={toggleMusic}
            className="fixed top-4 right-16 z-[60] bg-white/20 text-white p-2 rounded-full backdrop-blur-md"
          >
            {isPlaying ? '🔊' : '🔇'}
          </button>
        </>
      )}

      <div
        className="relative w-full h-full md:w-[375px] md:h-[667px] overflow-hidden bg-white md:rounded-xl shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => { touchStartY.current = e.clientY }}
        onMouseUp={(e) => {
          if (touchStartY.current === null) return
          const diff = touchStartY.current - e.clientY
          if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < data.pages.length - 1) setCurrentIndex(p => p + 1)
            else if (diff < 0 && currentIndex > 0) setCurrentIndex(p => p - 1)
          }
          touchStartY.current = null
        }}
      >
        <div
          className="absolute w-full h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {data.pages.map((page, index) => (
            <div
              key={page.id}
              className="relative w-full h-full overflow-hidden"
              style={{
                backgroundColor: page.backgroundColor,
                backgroundImage: page.backgroundType === 'image' && page.backgroundImage ? `url(${page.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                top: `${index * 100}%`,
                position: 'absolute'
              }}
            >
              {page.backgroundType === 'video' && page.backgroundVideo && (
                <video
                  src={page.backgroundVideo}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  autoPlay loop muted playsInline
                />
              )}

              {page.elements.map(el => (
                <RenderElement key={el.id} element={el} isActivePage={index === currentIndex} />
              ))}
            </div>
          ))}
        </div>

        {currentIndex < data.pages.length - 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center animate-bounce pointer-events-none z-20">
            <svg className="text-white/50 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition z-50"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default YearReportRenderer
