import { useState, useEffect, useRef } from 'react'
import ZoomableEKGChart from './components/ZoomableEKGChart'
import ControlPanel from './components/ControlPanel'
import HeartRateMonitor from './components/HeartRateMonitor'
import { useArduinoSerial } from './hooks/useArduinoSerial'
import { useSimulatedData } from './hooks/useSimulatedData'
import { useAlarmSound } from './hooks/useAlarmSound'
import './App.css'

export type ScreenType = 'mother' | 'combined' | 'fetal'
export type ViewMode = 'standard' | 'split' | 'comparison' | 'focus-fetal'

export interface EKGDataPoint {
  time: number
  mother: number
  combined: number
  fetus: number
}

export type SimulationCondition =
  | 'normal'
  | 'high-risk'
  | 'fetal-bradycardia'
  | 'fetal-tachycardia'
  | 'fetal-arrhythmia'
  | 'maternal-bradycardia'
  | 'maternal-tachycardia'
  | 'maternal-arrhythmia'

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('mother')
  const [viewMode, setViewMode] = useState<ViewMode>('standard')
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [dataSource, setDataSource] = useState<'simulated' | 'arduino'>('simulated')
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(true)
  const [simulationCondition, setSimulationCondition] = useState<SimulationCondition>('normal')
  const [ekgData, setEKGData] = useState<EKGDataPoint[]>([])
  const [resetZoomKey, setResetZoomKey] = useState(0) // Key to trigger zoom reset
  const [fetalStatus, setFetalStatus] = useState<'normal' | 'warning' | 'critical'>('normal')
  const [maternalStatus, setMaternalStatus] = useState<'normal' | 'warning' | 'critical'>('normal')
  const [controlPanelHeight, setControlPanelHeight] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  const maxDataPoints = 1250 // 5 seconds at 250 Hz
  const sampleCounter = useRef(0)
  const resizeStartY = useRef(0)
  const resizeStartHeight = useRef(0)

  // Check if any vital is critical for screen flashing
  const isCritical = fetalStatus === 'critical' || maternalStatus === 'critical'

  // Activate alarm sound when critical status detected
  useAlarmSound(isCritical)

  // Arduino serial connection
  const {
    isConnected,
    connect: connectArduino,
    disconnect: disconnectArduino,
    latestData: arduinoData
  } = useArduinoSerial()

  // Simulated data generator
  const simulatedData = useSimulatedData(simulationCondition)

  // Main data acquisition loop
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      let newDataPoint: EKGDataPoint

      if (dataSource === 'arduino' && arduinoData) {
        // Use Arduino data
        newDataPoint = {
          time: sampleCounter.current / 250,
          mother: arduinoData.mother,
          combined: arduinoData.combined,
          fetus: arduinoData.fetus
        }
      } else {
        // Use simulated data
        const simData = simulatedData.getSample()
        newDataPoint = {
          time: sampleCounter.current / 250,
          mother: simData.mother,
          combined: simData.combined,
          fetus: simData.fetus
        }
      }

      setEKGData(prev => {
        const updated = [...prev, newDataPoint]
        return updated.slice(-maxDataPoints) // Keep only last 5 seconds
      })

      sampleCounter.current++
    }, 4) // 250 Hz = 4ms interval

    return () => clearInterval(interval)
  }, [isMonitoring, dataSource, arduinoData, simulatedData])

  const handleStartStop = () => {
    if (!isMonitoring) {
      // Starting monitoring - clear data and reset zoom/pan
      setEKGData([])
      sampleCounter.current = 0
      setResetZoomKey(prev => prev + 1) // Trigger zoom reset
      setIsMonitoring(true)
    } else {
      // Stopping monitoring - reset status to stop alarm
      setIsMonitoring(false)
      setFetalStatus('normal')
      setMaternalStatus('normal')
    }
  }

  const handleClear = () => {
    setEKGData([])
    sampleCounter.current = 0
    simulatedData.reset()
    setResetZoomKey(prev => prev + 1) // Trigger zoom reset
    // Reset status to normal to stop any alarms
    setFetalStatus('normal')
    setMaternalStatus('normal')
  }

  const handleConnectArduino = async () => {
    if (!isDevelopmentMode) {
      // In production mode, actually connect to Arduino
      if (isConnected) {
        disconnectArduino()
        setDataSource('simulated')
      } else {
        const success = await connectArduino()
        if (success) {
          setDataSource('arduino')
        }
      }
    }
  }

  const handleToggleDevelopmentMode = () => {
    if (isConnected && !isDevelopmentMode) {
      // Switching to dev mode while connected - disconnect
      disconnectArduino()
      setDataSource('simulated')
    }
    setIsDevelopmentMode(prev => !prev)
  }

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true)
    resizeStartY.current = e.clientY
    resizeStartHeight.current = controlPanelHeight
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizeStartY.current - e.clientY
      // Min height: 160px (compact but all info visible), Max: 400px
      const newHeight = Math.max(160, Math.min(400, resizeStartHeight.current + delta))
      setControlPanelHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case '1':
          setCurrentScreen('mother')
          break
        case '2':
          setCurrentScreen('combined')
          break
        case '3':
          setCurrentScreen('fetal')
          break
        case ' ':
          e.preventDefault()
          handleStartStop()
          break
        case 'c':
        case 'C':
          handleClear()
          break
        case 'a':
        case 'A':
          handleConnectArduino()
          break
        case 'd':
        case 'D':
          handleToggleDevelopmentMode()
          break
        case 'v':
        case 'V':
          // Cycle through view modes
          setViewMode(prev => {
            const modes: ViewMode[] = ['standard', 'split', 'comparison', 'focus-fetal']
            const currentIndex = modes.indexOf(prev)
            const nextIndex = (currentIndex + 1) % modes.length
            return modes[nextIndex]
          })
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isMonitoring, isDevelopmentMode, isConnected])

  const getViewModeTitle = () => {
    switch(viewMode) {
      case 'standard':
        return 'STANDARD VIEW'
      case 'split':
        return 'SPLIT VIEW - Maternal & Fetal Comparison'
      case 'comparison':
        return 'COMPARISON VIEW - All Signals'
      case 'focus-fetal':
        return 'FETAL MONITORING - Focused View'
      default:
        return 'STANDARD VIEW'
    }
  }

  const getTitleClass = () => {
    if (viewMode === 'standard') {
      switch (currentScreen) {
        case 'mother': return 'title-mother'
        case 'combined': return 'title-combined'
        case 'fetal': return 'title-fetal'
      }
    } else if (viewMode === 'focus-fetal') {
      return 'title-fetal-monitoring'
    }
    return ''
  }

  return (
    <div className={`app ${isCritical ? 'critical-alert' : ''}`}>
      <header className="header">
        <h1>FETAL CARDIAC MONITORING SYSTEM</h1>
        <h2 className={`screen-title ${getTitleClass()}`}>
          {viewMode === 'standard' ? (
            <>
              {currentScreen === 'mother' && 'MOTHER EKG'}
              {currentScreen === 'combined' && 'COMBINED EKG'}
              {currentScreen === 'fetal' && 'FETAL EKG'}
            </>
          ) : (
            getViewModeTitle()
          )}
        </h2>
      </header>

      <main className={`main-content view-mode-${viewMode}`}>
        <div className="vitals-sidebar">
          <HeartRateMonitor data={ekgData} type="fetal" onStatusChange={setFetalStatus} />
          <HeartRateMonitor data={ekgData} type="maternal" onStatusChange={setMaternalStatus} />
        </div>

        <div className="charts-area">
          {viewMode === 'standard' && (
            <ZoomableEKGChart
              key={`standard-${resetZoomKey}`}
              data={ekgData}
              currentScreen={currentScreen}
            />
          )}
          {viewMode === 'split' && (
            <div className="split-view">
              <div className="split-chart">
                <h3 className="chart-label">MATERNAL EKG</h3>
                <ZoomableEKGChart key={`split-mother-${resetZoomKey}`} data={ekgData} currentScreen="mother" />
              </div>
              <div className="split-chart">
                <h3 className="chart-label">FETAL EKG</h3>
                <ZoomableEKGChart key={`split-fetal-${resetZoomKey}`} data={ekgData} currentScreen="fetal" />
              </div>
            </div>
          )}
          {viewMode === 'comparison' && (
            <div className="comparison-view">
              <div className="comparison-chart">
                <h3 className="chart-label">MATERNAL</h3>
                <ZoomableEKGChart key={`comp-mother-${resetZoomKey}`} data={ekgData} currentScreen="mother" />
              </div>
              <div className="comparison-chart">
                <h3 className="chart-label">COMBINED</h3>
                <ZoomableEKGChart key={`comp-combined-${resetZoomKey}`} data={ekgData} currentScreen="combined" />
              </div>
              <div className="comparison-chart">
                <h3 className="chart-label">FETAL</h3>
                <ZoomableEKGChart key={`comp-fetal-${resetZoomKey}`} data={ekgData} currentScreen="fetal" />
              </div>
            </div>
          )}
          {viewMode === 'focus-fetal' && (
            <div className="focus-view">
              <div className="focus-main">
                <h3 className="chart-label focus-label">FETAL EKG - HIGH RISK MONITORING</h3>
                <ZoomableEKGChart key={`focus-fetal-${resetZoomKey}`} data={ekgData} currentScreen="fetal" />
              </div>
              <div className="focus-reference">
                <h3 className="chart-label">MATERNAL REFERENCE</h3>
                <ZoomableEKGChart key={`focus-mother-${resetZoomKey}`} data={ekgData} currentScreen="mother" />
              </div>
            </div>
          )}
        </div>
      </main>

      <div
        className="resize-handle"
        onMouseDown={handleResizeStart}
        style={{ cursor: isResizing ? 'ns-resize' : 'ns-resize' }}
      />

      <div style={{ height: `${controlPanelHeight}px`, flexShrink: 0 }}>
        <ControlPanel
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isMonitoring={isMonitoring}
          onStartStop={handleStartStop}
          onClear={handleClear}
          dataSource={dataSource}
          isArduinoConnected={isConnected}
          onConnectArduino={handleConnectArduino}
          isDevelopmentMode={isDevelopmentMode}
          onToggleDevelopmentMode={handleToggleDevelopmentMode}
          simulationCondition={simulationCondition}
          onConditionChange={setSimulationCondition}
        />
      </div>
    </div>
  )
}

export default App
