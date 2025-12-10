import { useState, useEffect, useRef } from 'react'
import ZoomableEKGChart from './components/ZoomableEKGChart'
import ControlPanel from './components/ControlPanel'
import HeartRateMonitor from './components/HeartRateMonitor'
import ClearConfirmationModal from './components/ClearConfirmationModal'
import ConfirmationModal from './components/ConfirmationModal'
import { useArduinoSerial, SignalMapping } from './hooks/useArduinoSerial'
import { useSimulatedData } from './hooks/useSimulatedData'
import { useRealECGData } from './hooks/useRealECGData'
import { useRawSignals, RawSignalPair } from './hooks/useRawSignals'
import { useAlarmSound } from './hooks/useAlarmSound'
import { createEKGSignalProcessor } from './utils/signalProcessor'
import { storeDataPoint, getAllData, clearAllData, calculateBPM, signalToVoltage } from './utils/dataStorage'
import { exportToExcel } from './utils/excelExport'
import { normalizeArduinoSignal } from './utils/signalNormalization'
import StopConfirmationModal from './components/StopConfirmationModal'
import SignalPairChangeModal from './components/SignalPairChangeModal'
import './App.css'

export type ScreenType = 'mother' | 'combined' | 'fetal'
export type ViewMode = 'standard' | 'split' | 'comparison' | 'focus-fetal'

export interface EKGDataPoint {
  time: number
  mother: number
  combined: number
  fetus: number
}

export type RawSignalSelection = RawSignalPair

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('fetal')
  const [viewMode, setViewMode] = useState<ViewMode>('standard')
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [dataSource, setDataSource] = useState<'simulated' | 'real' | 'arduino' | 'raw'>('raw')
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(true)
  const [rawSignalSelection, setRawSignalSelection] = useState<RawSignalSelection>('pair01')
  const [ekgData, setEKGData] = useState<EKGDataPoint[]>([])
  const [resetZoomKey, setResetZoomKey] = useState(0) // Key to trigger zoom reset
  const [fetalStatus, setFetalStatus] = useState<'normal' | 'warning' | 'critical'>('normal')
  const [maternalStatus, setMaternalStatus] = useState<'normal' | 'warning' | 'critical'>('normal')
  const [controlPanelHeight, setControlPanelHeight] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [isAlarmSilenced, setIsAlarmSilenced] = useState(false)
  const [heartbeatBeepEnabled, setHeartbeatBeepEnabled] = useState(true)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [showStopConfirmation, setShowStopConfirmation] = useState(false)
  const [showSignalPairChangeConfirmation, setShowSignalPairChangeConfirmation] = useState(false)
  const [pendingSignalPair, setPendingSignalPair] = useState<RawSignalPair | null>(null)
  const [showBrowserErrorModal, setShowBrowserErrorModal] = useState(false)
  const [showConnectionErrorModal, setShowConnectionErrorModal] = useState(false)
  
  // Data storage for Excel export
  const storedDataRef = useRef<EKGDataPoint[]>([])
  const bpmCalculationWindow = useRef<{ maternal: number[], fetal: number[] }>({ maternal: [], fetal: [] })
  const [signalMapping, setSignalMapping] = useState<SignalMapping>({
    channel1: 'maternal',
    channel2: 'combined',
    channel3: 'fetal'
  })

  // Alarm metrics tracking
  const [fetalAlarmMetrics, setFetalAlarmMetrics] = useState({
    lastAlarmTime: null as number | null,
    responseTimeMs: null as number | null,
    alarmCount: 0,
    avgResponseTimeMs: 0
  })
  const [maternalAlarmMetrics, setMaternalAlarmMetrics] = useState({
    lastAlarmTime: null as number | null,
    responseTimeMs: null as number | null,
    alarmCount: 0,
    avgResponseTimeMs: 0
  })
  const criticalDetectionTimeRef = useRef<number | null>(null)
  const responseTimes = useRef<number[]>([])

  const maxDataPoints = 1250 // 5 seconds at 250 Hz
  const sampleCounter = useRef(0)
  const resizeStartY = useRef(0)
  const resizeStartHeight = useRef(0)

  // Signal processor for noise removal (combined signal only)
  const signalProcessorRef = useRef(createEKGSignalProcessor(250))

  // Check if any vital is critical for screen flashing
  const isCritical = fetalStatus === 'critical' || maternalStatus === 'critical'

  // Note: Alarm silence is now a persistent toggle, not auto-reset

  // Track alarm metrics when critical status changes
  useEffect(() => {
    if (isCritical && !criticalDetectionTimeRef.current) {
      // Critical status just triggered
      criticalDetectionTimeRef.current = performance.now()
    } else if (!isCritical && criticalDetectionTimeRef.current) {
      // Reset when status returns to normal
      criticalDetectionTimeRef.current = null
    }
  }, [isCritical])

  // Update alarm metrics based on status changes
  useEffect(() => {
    if (fetalStatus === 'critical' && criticalDetectionTimeRef.current) {
      const alarmActivationTime = performance.now()
      const responseTime = alarmActivationTime - criticalDetectionTimeRef.current

      // Track response time
      responseTimes.current.push(responseTime)
      const avgResponseTime = responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length

      setFetalAlarmMetrics(prev => ({
        lastAlarmTime: alarmActivationTime,
        responseTimeMs: responseTime,
        alarmCount: prev.alarmCount + 1,
        avgResponseTimeMs: avgResponseTime
      }))
    }
  }, [fetalStatus])

  useEffect(() => {
    if (maternalStatus === 'critical' && criticalDetectionTimeRef.current) {
      const alarmActivationTime = performance.now()
      const responseTime = alarmActivationTime - criticalDetectionTimeRef.current

      // Track response time
      responseTimes.current.push(responseTime)
      const avgResponseTime = responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length

      setMaternalAlarmMetrics(prev => ({
        lastAlarmTime: alarmActivationTime,
        responseTimeMs: responseTime,
        alarmCount: prev.alarmCount + 1,
        avgResponseTimeMs: avgResponseTime
      }))
    }
  }, [maternalStatus])

  // Activate alarm sound when critical status detected and not silenced
  const shouldPlayAlarm = isCritical && !isAlarmSilenced
  useAlarmSound(shouldPlayAlarm)

  // Debug logging
  useEffect(() => {
    console.log('Alarm status:', {
      isCritical,
      isAlarmSilenced,
      shouldPlayAlarm,
      fetalStatus,
      maternalStatus
    })
  }, [isCritical, isAlarmSilenced, shouldPlayAlarm, fetalStatus, maternalStatus])

  // Arduino serial connection
  const {
    isConnected,
    connect: connectArduino,
    disconnect: disconnectArduino,
    getQueuedData,
    hasQueuedData
  } = useArduinoSerial({
    onUnsupportedBrowser: () => setShowBrowserErrorModal(true),
    onConnectionError: () => setShowConnectionErrorModal(true),
    signalMapping: signalMapping
  })

  // Simulated data generator
  const simulatedData = useSimulatedData('normal')

  // Real ECG data loader (PhysioNet data)
  const realECGData = useRealECGData({ autoLoop: true })

  // Raw signals loader (signal pairs with subtraction processing)
  const rawSignalsData = useRawSignals({ 
    signalPair: rawSignalSelection, 
    autoLoop: true 
  })

  // Handle signal pair change with confirmation
  const handleSignalPairChange = (newPair: RawSignalPair) => {
    // If monitoring or has data, show confirmation
    if (isMonitoring || ekgData.length > 0 || storedDataRef.current.length > 0) {
      setPendingSignalPair(newPair)
      setShowSignalPairChangeConfirmation(true)
    } else {
      // No data, just switch
      setRawSignalSelection(newPair)
    }
  }

  const handleSignalPairChangeConfirm = () => {
    // Stop monitoring if running
    if (isMonitoring) {
      setIsMonitoring(false)
      setFetalStatus('normal')
      setMaternalStatus('normal')
    }

    // Clear all data
    setEKGData([])
    storedDataRef.current = []
    bpmCalculationWindow.current = { maternal: [], fetal: [] }
    sampleCounter.current = 0
    signalProcessorRef.current.reset()
    setResetZoomKey(prev => prev + 1)
    
    // Clear stored data
    clearAllData().catch(err => console.error('Error clearing stored data:', err))
    
    // Reset data sources
    simulatedData.reset()
    realECGData.reset()
    rawSignalsData.reset()
    
    // Switch to new pair
    if (pendingSignalPair) {
      setRawSignalSelection(pendingSignalPair)
    }
    
    // Close modal
    setShowSignalPairChangeConfirmation(false)
    setPendingSignalPair(null)
  }

  const handleSignalPairChangeCancel = () => {
    setShowSignalPairChangeConfirmation(false)
    setPendingSignalPair(null)
  }

  // Reset raw signals when signal selection changes (after confirmation)
  useEffect(() => {
    if (dataSource === 'raw') {
      rawSignalsData.reset()
    }
  }, [rawSignalSelection, dataSource])

  // Main data acquisition loop
  useEffect(() => {
    if (!isMonitoring) return

    // PRODUCTION MODE: Only allow Arduino data
    if (!isDevelopmentMode && dataSource !== 'arduino') {
      console.warn('Production mode requires Arduino connection')
      return
    }

    // PRODUCTION MODE: Require active Arduino connection
    if (!isDevelopmentMode && !isConnected) {
      console.warn('Production mode requires active Arduino connection')
      return
    }

    const interval = setInterval(() => {
      const newDataPoints: EKGDataPoint[] = []

      // PRODUCTION MODE: ONLY use Arduino data
      if (!isDevelopmentMode) {
        // Process ALL queued Arduino data points (prevents data loss)
        if (hasQueuedData()) {
          const queuedData = getQueuedData()
          for (const arduinoSample of queuedData) {
            // Normalize Arduino ADC values (0-1023) to display range
            const normalizedMother = normalizeArduinoSignal(arduinoSample.mother)
            const normalizedFetus = normalizeArduinoSignal(arduinoSample.fetus)
            const normalizedCombined = normalizeArduinoSignal(arduinoSample.combined)
            
            // Apply noise removal to combined signal ONLY
            const cleanedCombined = signalProcessorRef.current.processSample(normalizedCombined)

            newDataPoints.push({
              time: sampleCounter.current / 250,
              mother: normalizedMother,
              combined: cleanedCombined, // ← FILTERED COMBINED SIGNAL
              fetus: normalizedFetus
            })
            sampleCounter.current++
          }
        } else {
          return // Skip if no Arduino data available
        }
      } else {
        // DEVELOPMENT MODE: Allow simulated, real, or Arduino data
        if (dataSource === 'arduino') {
          // Process ALL queued Arduino data points
          if (hasQueuedData()) {
            const queuedData = getQueuedData()
            for (const arduinoSample of queuedData) {
              // Normalize Arduino ADC values (0-1023) to display range
              const normalizedMother = normalizeArduinoSignal(arduinoSample.mother)
              const normalizedFetus = normalizeArduinoSignal(arduinoSample.fetus)
              const normalizedCombined = normalizeArduinoSignal(arduinoSample.combined)
              
              const cleanedCombined = signalProcessorRef.current.processSample(normalizedCombined)

              newDataPoints.push({
                time: sampleCounter.current / 250,
                mother: normalizedMother,
                combined: cleanedCombined, // ← FILTERED COMBINED SIGNAL
                fetus: normalizedFetus
              })
              sampleCounter.current++
            }
          }
        } else if (dataSource === 'raw') {
          // Use raw signal files (01-08) - apply noise removal to combined signal
          const rawData = rawSignalsData.getSample()
          const cleanedCombined = signalProcessorRef.current.processSample(rawData.combined)

          newDataPoints.push({
            time: sampleCounter.current / 250,
            mother: rawData.mother,
            combined: cleanedCombined, // ← FILTERED COMBINED SIGNAL
            fetus: rawData.fetus
          })
          sampleCounter.current++
        } else if (dataSource === 'real') {
          // Use real PhysioNet ECG data - apply noise removal to combined signal
          const realData = realECGData.getSample()
          const cleanedCombined = signalProcessorRef.current.processSample(realData.combined)

          newDataPoints.push({
            time: sampleCounter.current / 250,
            mother: realData.mother,
            combined: cleanedCombined, // ← FILTERED COMBINED SIGNAL
            fetus: realData.fetus
          })
          sampleCounter.current++
        } else {
          // Use simulated data - apply noise removal to combined signal
          const simData = simulatedData.getSample()
          const cleanedCombined = signalProcessorRef.current.processSample(simData.combined)

          newDataPoints.push({
            time: sampleCounter.current / 250,
            mother: simData.mother,
            combined: cleanedCombined, // ← FILTERED COMBINED SIGNAL
            fetus: simData.fetus
          })
          sampleCounter.current++
        }
      }

      // Add all new data points to the chart and store for Excel export
      if (newDataPoints.length > 0) {
        setEKGData(prev => {
          const updated = [...prev, ...newDataPoints]
          const displayData = updated.slice(-maxDataPoints) // Keep only last 5 seconds for display
          
          // Store all data for Excel export (keep in memory)
          storedDataRef.current = [...storedDataRef.current, ...newDataPoints]
          
          // Update BPM calculation windows
          newDataPoints.forEach(point => {
            bpmCalculationWindow.current.maternal.push(point.mother)
            bpmCalculationWindow.current.fetal.push(point.fetus)
            
            // Keep only last 5 seconds for BPM calculation (1250 samples at 250 Hz)
            if (bpmCalculationWindow.current.maternal.length > 1250) {
              bpmCalculationWindow.current.maternal.shift()
            }
            if (bpmCalculationWindow.current.fetal.length > 1250) {
              bpmCalculationWindow.current.fetal.shift()
            }
          })
          
          // Store data points with BPM and voltage calculations (async, don't block)
          newDataPoints.forEach(point => {
            const maternalBPM = calculateBPM(bpmCalculationWindow.current.maternal, 250)
            const fetalBPM = calculateBPM(bpmCalculationWindow.current.fetal, 250)
            
            storeDataPoint({
              time: point.time,
              timestamp: Date.now(),
              maternalVoltage: signalToVoltage(point.mother),
              fetalVoltage: signalToVoltage(point.fetus),
              combinedVoltage: signalToVoltage(point.combined),
              maternalBPM,
              fetalBPM
            }).catch(err => console.error('Error storing data point:', err))
          })
          
          return displayData
        })
      }
    }, 4) // 250 Hz = 4ms interval

    return () => clearInterval(interval)
  }, [isMonitoring, dataSource, getQueuedData, hasQueuedData, simulatedData, realECGData, isDevelopmentMode, isConnected])

  const handleStartStop = () => {
    if (!isMonitoring) {
      // GUARDRAIL: Auto-clear when restarting after stop to prevent signal mixing
      if (ekgData.length > 0) {
        console.warn('Auto-clearing previous data to prevent signal mixing')
        // Clear all data and metrics
        setEKGData([])
        storedDataRef.current = []
        bpmCalculationWindow.current = { maternal: [], fetal: [] }
        sampleCounter.current = 0
        simulatedData.reset()
        realECGData.reset()
        rawSignalsData.reset()
        signalProcessorRef.current.reset() // Reset signal processor filters
        setResetZoomKey(prev => prev + 1)
        setFetalAlarmMetrics({
          lastAlarmTime: null,
          responseTimeMs: null,
          alarmCount: 0,
          avgResponseTimeMs: 0
        })
        setMaternalAlarmMetrics({
          lastAlarmTime: null,
          responseTimeMs: null,
          alarmCount: 0,
          avgResponseTimeMs: 0
        })
        criticalDetectionTimeRef.current = null
        responseTimes.current = []
        clearAllData().catch(err => console.error('Error clearing stored data:', err))
      }

      // Starting monitoring - clear data and reset zoom/pan
      setEKGData([])
      storedDataRef.current = []
      bpmCalculationWindow.current = { maternal: [], fetal: [] }
      sampleCounter.current = 0
      signalProcessorRef.current.reset() // Reset signal processor filters
      setResetZoomKey(prev => prev + 1) // Trigger zoom reset
      clearAllData().catch(err => console.error('Error clearing stored data:', err))
      setIsMonitoring(true)
    } else {
      // Stopping monitoring - show confirmation modal
      if (storedDataRef.current.length > 0) {
        setShowStopConfirmation(true)
      } else {
        // No data collected, just stop
        setIsMonitoring(false)
        setFetalStatus('normal')
        setMaternalStatus('normal')
      }
    }
  }

  const handleStopConfirm = async () => {
    setIsMonitoring(false)
    setFetalStatus('normal')
    setMaternalStatus('normal')
    setShowStopConfirmation(false)

    try {
      // Get all stored data
      const allStoredData = await getAllData()
      
      if (allStoredData.length > 0) {
        // Export to Excel
        await exportToExcel(allStoredData)
        console.log(`Exported ${allStoredData.length} data points to Excel`)
      }
      
      // Clear stored data after export
      storedDataRef.current = []
      bpmCalculationWindow.current = { maternal: [], fetal: [] }
      await clearAllData()
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error exporting data to Excel. Please try again.')
    }
  }

  const handleStopCancel = () => {
    setShowStopConfirmation(false)
    // Continue monitoring
  }

  const handleClear = () => {
    // GUARDRAIL: Show confirmation modal before clearing if data exists
    if (ekgData.length > 0) {
      setShowClearConfirmation(true)
    } else {
      // No data to clear, just reset everything
      performClear()
    }
  }

  const performClear = () => {
    // Clear all data and metrics
    setEKGData([])
    sampleCounter.current = 0
      simulatedData.reset()
      realECGData.reset()
      rawSignalsData.reset()
      signalProcessorRef.current.reset() // Reset signal processor filters
    setResetZoomKey(prev => prev + 1) // Trigger zoom reset
    // Reset status to normal to stop any alarms
    setFetalStatus('normal')
    setMaternalStatus('normal')
    // Reset alarm metrics
    setFetalAlarmMetrics({
      lastAlarmTime: null,
      responseTimeMs: null,
      alarmCount: 0,
      avgResponseTimeMs: 0
    })
    setMaternalAlarmMetrics({
      lastAlarmTime: null,
      responseTimeMs: null,
      alarmCount: 0,
      avgResponseTimeMs: 0
    })
    criticalDetectionTimeRef.current = null
    responseTimes.current = []
    setShowClearConfirmation(false)
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
          <HeartRateMonitor
            data={ekgData}
            type="fetal"
            onStatusChange={setFetalStatus}
            alarmMetrics={fetalAlarmMetrics}
            heartbeatBeepEnabled={heartbeatBeepEnabled}
          />
          <HeartRateMonitor
            data={ekgData}
            type="maternal"
            onStatusChange={setMaternalStatus}
            alarmMetrics={maternalAlarmMetrics}
            heartbeatBeepEnabled={false}
          />

          {/* Alarm Silence Toggle - Always visible, toggles alarm on/off */}
          <button
            className={`alarm-toggle-button ${isAlarmSilenced ? 'silenced' : 'active'}`}
            onClick={() => setIsAlarmSilenced(!isAlarmSilenced)}
            title={isAlarmSilenced ? "Enable alarm sounds" : "Silence alarm sounds"}
          >
            {isAlarmSilenced ? (
              <>
                <svg className="silence-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
                <span className="toggle-text">ALARM SILENCED</span>
              </>
            ) : (
              <>
                <svg className="alarm-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>
                <span className="toggle-text">ALARM ACTIVE</span>
              </>
            )}
          </button>

          {/* Heartbeat Beep Toggle - Enable/disable QRS beep sounds */}
          <button
            className={`alarm-toggle-button ${heartbeatBeepEnabled ? 'active' : 'silenced'}`}
            onClick={() => setHeartbeatBeepEnabled(!heartbeatBeepEnabled)}
            title={heartbeatBeepEnabled ? "Disable heartbeat beeps" : "Enable heartbeat beeps"}
          >
            {heartbeatBeepEnabled ? (
              <>
                <svg className="heartbeat-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="toggle-text">HEARTBEAT BEEPS ON</span>
              </>
            ) : (
              <>
                <svg className="silence-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM4.27 3L3 4.27l18 18 1.73-1.73z"/>
                </svg>
                <span className="toggle-text">HEARTBEAT BEEPS OFF</span>
              </>
            )}
          </button>
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
        {/* Control Panel */}
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
          rawSignalSelection={rawSignalSelection}
          onRawSignalChange={handleSignalPairChange}
          signalMapping={signalMapping}
          onSignalMappingChange={setSignalMapping}
        />
      </div>

      {/* Clear Confirmation Modal */}
      <ClearConfirmationModal
        isOpen={showClearConfirmation}
        onConfirm={performClear}
        onCancel={() => setShowClearConfirmation(false)}
      />

      {/* Stop Confirmation Modal */}
      <StopConfirmationModal
        isOpen={showStopConfirmation}
        onConfirm={handleStopConfirm}
        onCancel={handleStopCancel}
        dataPointCount={storedDataRef.current.length}
      />

      {/* Signal Pair Change Confirmation Modal */}
      <SignalPairChangeModal
        isOpen={showSignalPairChangeConfirmation}
        onConfirm={handleSignalPairChangeConfirm}
        onCancel={handleSignalPairChangeCancel}
        currentPair={rawSignalSelection}
        newPair={pendingSignalPair || rawSignalSelection}
        isMonitoring={isMonitoring}
        dataPointCount={storedDataRef.current.length}
      />

      {/* Browser Unsupported Modal */}
      <ConfirmationModal
        isOpen={showBrowserErrorModal}
        type="error"
        title="Browser Not Supported"
        message="Web Serial API is not supported in your browser. Please use Chrome, Edge, or Opera to connect to Arduino devices."
        confirmText="OK"
        showCancel={false}
        onCancel={() => setShowBrowserErrorModal(false)}
      />

      {/* Arduino Connection Error Modal */}
      <ConfirmationModal
        isOpen={showConnectionErrorModal}
        type="error"
        title="Connection Failed"
        message="Failed to connect to Arduino. Please ensure the device is properly plugged in and try again."
        confirmText="OK"
        showCancel={false}
        onCancel={() => setShowConnectionErrorModal(false)}
      />
    </div>
  )
}

export default App
