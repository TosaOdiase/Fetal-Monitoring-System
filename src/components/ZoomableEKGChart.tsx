import { useState, useRef, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ScreenType, EKGDataPoint } from '../App'
import './ZoomableEKGChart.css'

interface ZoomableEKGChartProps {
  data: EKGDataPoint[]
  currentScreen: ScreenType
}

export default function ZoomableEKGChart({ data, currentScreen }: ZoomableEKGChartProps) {
  const [zoomLevel, setZoomLevel] = useState(1) // 1 = normal, 2 = 2x zoom, etc.
  const [yZoomLevel, setYZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState(0)
  const [isControlsExpanded, setIsControlsExpanded] = useState(true)
  const chartRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastMouseX = useRef(0)

  const getChartConfig = () => {
    switch (currentScreen) {
      case 'mother':
        return {
          dataKey: 'mother',
          stroke: '#4ecdc4',
          label: 'Maternal EKG (mV)',
          yDomain: [-3, 6]
        }
      case 'combined':
        return {
          dataKey: 'combined',
          stroke: '#ffaa00',
          label: 'Combined EKG (mV)',
          yDomain: [-3, 6]
        }
      case 'fetal':
        return {
          dataKey: 'fetus',
          stroke: '#9b59ff',
          label: 'Fetal EKG (mV)',
          yDomain: [-1, 2]
        }
    }
  }

  const config = getChartConfig()

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()

    if (e.shiftKey) {
      // Shift + Wheel = Y-axis zoom
      setYZoomLevel(prev => {
        const newZoom = prev + (e.deltaY > 0 ? -0.1 : 0.1)
        return Math.max(0.5, Math.min(5, newZoom))
      })
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + Wheel = X-axis zoom
      setZoomLevel(prev => {
        const newZoom = prev + (e.deltaY > 0 ? -0.2 : 0.2)
        return Math.max(0.5, Math.min(10, newZoom))
      })
    } else {
      // Regular wheel = pan
      setPanOffset(prev => {
        const newOffset = prev + (e.deltaY > 0 ? 0.5 : -0.5)
        return Math.max(-10, Math.min(10, newOffset))
      })
    }
  }, [])

  // Handle mouse drag to pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    lastMouseX.current = e.clientX
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const delta = e.clientX - lastMouseX.current
      setPanOffset(prev => {
        const newOffset = prev - (delta * 0.01 * zoomLevel)
        return Math.max(-10, Math.min(10, newOffset))
      })
      lastMouseX.current = e.clientX
    }
  }, [zoomLevel])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Reset zoom
  const handleReset = useCallback(() => {
    setZoomLevel(1)
    setYZoomLevel(1)
    setPanOffset(0)
  }, [])

  // Calculate visible data with zoom and pan
  let visibleData: EKGDataPoint[] = []
  let xDomain: [number, number] = [0, 5]
  let yDomain: [number, number] = config.yDomain as [number, number]

  if (data.length > 0) {
    const latestTime = data[data.length - 1].time
    const baseWindowSize = 5 // 5 seconds
    const zoomedWindowSize = baseWindowSize / zoomLevel

    const centerTime = latestTime - (baseWindowSize / 2) + panOffset
    const startTime = centerTime - (zoomedWindowSize / 2)
    const endTime = centerTime + (zoomedWindowSize / 2)

    visibleData = data.filter(d => d.time >= startTime && d.time <= endTime)
    xDomain = [startTime, endTime]

    // Apply Y-axis zoom
    const yMid = (yDomain[0] + yDomain[1]) / 2
    const yRange = yDomain[1] - yDomain[0]
    const zoomedYRange = yRange / yZoomLevel
    yDomain = [yMid - zoomedYRange / 2, yMid + zoomedYRange / 2]
  }

  // Generate ticks based on zoom level
  const generateTicks = () => {
    if (data.length === 0) return [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

    const startTime = xDomain[0]
    const endTime = xDomain[1]
    const duration = endTime - startTime

    // Adjust tick interval based on zoom
    let interval = 0.5
    if (duration < 2) interval = 0.2
    else if (duration < 1) interval = 0.1
    else if (duration > 10) interval = 1

    const ticks = []
    let currentTick = Math.ceil(startTime / interval) * interval

    while (currentTick <= endTime) {
      ticks.push(currentTick)
      currentTick += interval
    }

    return ticks
  }

  const formatTick = (value: number) => {
    const duration = xDomain[1] - xDomain[0]
    if (duration < 1) return value.toFixed(2)
    else if (duration < 5) return value.toFixed(1)
    else return value.toFixed(0)
  }

  return (
    <div className="zoomable-ekg-chart" ref={chartRef}>
      {/* Collapse Button */}
      <button
        className="zoom-collapse-trigger"
        onClick={() => setIsControlsExpanded(prev => !prev)}
        title={isControlsExpanded ? "Hide Zoom Controls" : "Show Zoom Controls"}
      >
        {isControlsExpanded ? '×' : '⊕'}
      </button>

      {/* Zoom Controls */}
      {isControlsExpanded && (
        <div className="zoom-controls">
          <div className="zoom-instructions">
            <span>Ctrl+Scroll: X-Zoom | Shift+Scroll: Y-Zoom | Scroll: Pan | Drag: Pan</span>
          </div>
          <div className="zoom-info">
            <span className="zoom-label">
              X: {zoomLevel.toFixed(1)}x | Y: {yZoomLevel.toFixed(1)}x
              {panOffset !== 0 && ` | Pan: ${panOffset.toFixed(1)}s`}
            </span>
          </div>
          <div className="zoom-buttons">
            <button
              className="zoom-btn"
              onClick={() => setZoomLevel(prev => Math.min(10, prev + 0.5))}
              title="Zoom In (Ctrl + Scroll)"
            >
              X+
            </button>
            <button
              className="zoom-btn"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.5))}
              title="Zoom Out (Ctrl + Scroll)"
            >
              X-
            </button>
            <button
              className="zoom-btn"
              onClick={() => setYZoomLevel(prev => Math.min(5, prev + 0.5))}
              title="Y-Zoom In (Shift + Scroll)"
            >
              Y+
            </button>
            <button
              className="zoom-btn"
              onClick={() => setYZoomLevel(prev => Math.max(0.5, prev - 0.5))}
              title="Y-Zoom Out (Shift + Scroll)"
            >
              Y-
            </button>
            <button
              className="zoom-btn zoom-btn-reset"
              onClick={handleReset}
              title="Reset Zoom"
            >
              ↻
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div
        className="chart-container"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleData}
            margin={{ top: 10, right: 30, left: 50, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#00ff41" opacity={0.3} />
            <XAxis
              dataKey="time"
              type="number"
              stroke="#ffffff"
              label={{
                value: 'Time (seconds)',
                position: 'insideBottom',
                offset: -10,
                fill: '#ffffff',
                fontSize: 12
              }}
              domain={xDomain}
              ticks={generateTicks()}
              tickFormatter={formatTick}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke={config.stroke}
              label={{
                value: config.label,
                angle: -90,
                position: 'insideLeft',
                fill: config.stroke,
                style: { fontWeight: 'bold', fontSize: 13 }
              }}
              domain={yDomain}
              tick={{ fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.stroke}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
