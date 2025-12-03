import { useEffect, useState } from 'react'
import { EKGDataPoint } from '../App'
import './HeartRateMonitor.css'

interface HeartRateMonitorProps {
  data: EKGDataPoint[]
  type: 'maternal' | 'fetal'
  onStatusChange?: (status: 'normal' | 'warning' | 'critical') => void
}

export default function HeartRateMonitor({ data, type, onStatusChange }: HeartRateMonitorProps) {
  const [heartRate, setHeartRate] = useState<number>(0)
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('normal')
  const [isWarningExpanded, setIsWarningExpanded] = useState(false)

  // Define thresholds based on type
  const thresholds = type === 'maternal'
    ? {
        criticalLow: 50,
        warningLow: 60,
        normalLow: 60,
        normalHigh: 100,
        warningHigh: 110,
        criticalHigh: 120
      }
    : {
        criticalLow: 110,
        warningLow: 120,
        normalLow: 120,
        normalHigh: 160,
        warningHigh: 170,
        criticalHigh: 180
      }

  useEffect(() => {
    if (data.length < 100) return // Need enough data for reliable calculation

    // Calculate heart rate from peaks in the last 5 seconds
    const recentData = data.slice(-1250) // Last 5 seconds at 250 Hz
    const signal = type === 'maternal'
      ? recentData.map(d => d.mother)
      : recentData.map(d => d.fetus)

    // Find peaks (simplified peak detection)
    const peaks: number[] = []
    const threshold = Math.max(...signal) * 0.5

    for (let i = 10; i < signal.length - 10; i++) {
      if (signal[i] > threshold &&
          signal[i] > signal[i - 1] &&
          signal[i] > signal[i + 1]) {
        // Check if it's a local maximum
        const isLocalMax = signal.slice(i - 10, i + 10).every((v, idx) =>
          idx === 10 || v <= signal[i]
        )
        if (isLocalMax) {
          peaks.push(i)
        }
      }
    }

    // Calculate heart rate from peak intervals
    if (peaks.length >= 2) {
      const intervals = []
      for (let i = 1; i < peaks.length; i++) {
        intervals.push(peaks[i] - peaks[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const samplesPerSecond = 250
      const secondsPerBeat = avgInterval / samplesPerSecond
      const beatsPerMinute = 60 / secondsPerBeat

      setHeartRate(Math.round(beatsPerMinute))

      // Determine status based on thresholds
      let newStatus: 'normal' | 'warning' | 'critical'
      if (beatsPerMinute < thresholds.criticalLow || beatsPerMinute > thresholds.criticalHigh) {
        newStatus = 'critical'
      } else if (beatsPerMinute < thresholds.warningLow || beatsPerMinute > thresholds.warningHigh) {
        newStatus = 'warning'
      } else {
        newStatus = 'normal'
      }

      setStatus(newStatus)
      if (onStatusChange) {
        onStatusChange(newStatus)
      }
    }
  }, [data, type, thresholds, onStatusChange])

  const getStatusColor = () => {
    switch (status) {
      case 'normal': return '#00ff41'
      case 'warning': return '#ffaa00'
      case 'critical': return '#ff0000'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'normal': return 'NORMAL'
      case 'warning': return 'CAUTION'
      case 'critical': return 'ALERT'
    }
  }

  const getWarningMessage = () => {
    if (status === 'normal') return null

    const isTooLow = heartRate < thresholds.normalLow
    const isTooHigh = heartRate > thresholds.normalHigh

    if (status === 'critical') {
      if (isTooLow) {
        return `CRITICAL: Bradycardia detected (${heartRate} BPM)`
      } else if (isTooHigh) {
        return `CRITICAL: Tachycardia detected (${heartRate} BPM)`
      }
    } else if (status === 'warning') {
      if (isTooLow) {
        return `CAUTION: Low heart rate (${heartRate} BPM)`
      } else if (isTooHigh) {
        return `CAUTION: Elevated heart rate (${heartRate} BPM)`
      }
    }

    return null
  }

  const getBarPosition = () => {
    const { criticalLow, criticalHigh } = thresholds
    const range = criticalHigh - criticalLow
    const position = ((heartRate - criticalLow) / range) * 100
    return Math.max(0, Math.min(100, position))
  }

  return (
    <div className="heart-rate-monitor">
      <div className="hrm-header">
        <h3 className="hrm-title">
          {type === 'maternal' ? 'MATERNAL' : 'FETAL'} HEART RATE
        </h3>
        <div className={`hrm-status status-${status}`}>
          {getStatusText()}
        </div>
      </div>

      <div className="hrm-display">
        <div className="hrm-value" style={{ color: getStatusColor() }}>
          {heartRate > 0 ? heartRate : '--'}
        </div>
        <div className="hrm-unit">BPM</div>
      </div>

      {/* Warning Message - Collapsible */}
      {getWarningMessage() && (
        <div className={`hrm-warning hrm-warning-${status} ${isWarningExpanded ? 'expanded' : 'collapsed'}`}>
          <button
            className="warning-toggle"
            onClick={() => setIsWarningExpanded(!isWarningExpanded)}
            title={isWarningExpanded ? "Collapse warning" : "Expand warning details"}
          >
            <svg className="warning-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
            </svg>
            <span className="warning-toggle-text">
              {isWarningExpanded ? '▼' : '▶'}
            </span>
          </button>
          {isWarningExpanded && (
            <span className="warning-text">{getWarningMessage()}</span>
          )}
        </div>
      )}

      <div className="hrm-threshold-bar">
        <div className="threshold-labels">
          <span className="threshold-label-left">{thresholds.criticalLow}</span>
          <span className="threshold-label-center">
            {thresholds.normalLow}-{thresholds.normalHigh}
          </span>
          <span className="threshold-label-right">{thresholds.criticalHigh}</span>
        </div>

        <div className="threshold-bar">
          {/* Critical Low Zone */}
          <div
            className="threshold-zone zone-critical-low"
            style={{
              width: `${((thresholds.warningLow - thresholds.criticalLow) / (thresholds.criticalHigh - thresholds.criticalLow)) * 100}%`
            }}
          />
          {/* Warning Low Zone */}
          <div
            className="threshold-zone zone-warning-low"
            style={{
              width: `${((thresholds.normalLow - thresholds.warningLow) / (thresholds.criticalHigh - thresholds.criticalLow)) * 100}%`
            }}
          />
          {/* Normal Zone */}
          <div
            className="threshold-zone zone-normal"
            style={{
              width: `${((thresholds.normalHigh - thresholds.normalLow) / (thresholds.criticalHigh - thresholds.criticalLow)) * 100}%`
            }}
          />
          {/* Warning High Zone */}
          <div
            className="threshold-zone zone-warning-high"
            style={{
              width: `${((thresholds.warningHigh - thresholds.normalHigh) / (thresholds.criticalHigh - thresholds.criticalLow)) * 100}%`
            }}
          />
          {/* Critical High Zone */}
          <div
            className="threshold-zone zone-critical-high"
            style={{
              width: `${((thresholds.criticalHigh - thresholds.warningHigh) / (thresholds.criticalHigh - thresholds.criticalLow)) * 100}%`
            }}
          />

          {/* Current value indicator */}
          {heartRate > 0 && (
            <div
              className="threshold-indicator"
              style={{
                left: `${getBarPosition()}%`,
                backgroundColor: getStatusColor()
              }}
            />
          )}
        </div>
      </div>

      <div className="hrm-zones-legend">
        <div className="zone-legend">
          <span className="zone-dot zone-dot-critical"></span>
          <span className="zone-text">Critical</span>
        </div>
        <div className="zone-legend">
          <span className="zone-dot zone-dot-warning"></span>
          <span className="zone-text">Caution</span>
        </div>
        <div className="zone-legend">
          <span className="zone-dot zone-dot-normal"></span>
          <span className="zone-text">Normal</span>
        </div>
      </div>
    </div>
  )
}
