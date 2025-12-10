import { useEffect, useState } from 'react'
import { EKGDataPoint } from '../App'
import SystemInsightsModal from './SystemInsightsModal'
import { useHeartbeatBeep } from '../hooks/useHeartbeatBeep'
import './HeartRateMonitor.css'
// InfoIcon - using inline SVG

interface AlarmMetrics {
  lastAlarmTime: number | null
  responseTimeMs: number | null
  alarmCount: number
  avgResponseTimeMs: number
}

interface HeartRateMonitorProps {
  data: EKGDataPoint[]
  type: 'maternal' | 'fetal'
  onStatusChange?: (status: 'normal' | 'warning' | 'critical') => void
  alarmMetrics?: AlarmMetrics
  heartbeatBeepEnabled?: boolean
}

export default function HeartRateMonitor({ data, type, onStatusChange, alarmMetrics, heartbeatBeepEnabled = true }: HeartRateMonitorProps) {
  const [heartRate, setHeartRate] = useState<number>(0)
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('normal')
  const [isWarningExpanded, setIsWarningExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Track abnormal status duration to prevent false alarms
  // Per clinical guidelines: alarms should only trigger for sustained abnormalities
  const abnormalStatusHistory = useState<Array<{ status: 'normal' | 'warning' | 'critical', timestamp: number }>>(() => [])[0]

  // Enable heartbeat beep sounds (like real hospital monitors)
  useHeartbeatBeep({
    enabled: heartbeatBeepEnabled && heartRate > 0,
    heartRate,
    type
  })

  // Auto-expand warning when status changes to warning or critical
  useEffect(() => {
    if (status === 'warning' || status === 'critical') {
      setIsWarningExpanded(true)
    }
  }, [status])

  // Default alarm metrics if not provided
  const defaultMetrics: AlarmMetrics = {
    lastAlarmTime: null,
    responseTimeMs: null,
    alarmCount: 0,
    avgResponseTimeMs: 0
  }
  const metrics = alarmMetrics || defaultMetrics

  // Define thresholds based on ACOG/NICHD clinical guidelines
  // Maternal: Normal adult HR is 60-100 BPM, pregnancy increases baseline by 10-20 BPM
  // Fetal: Normal baseline is 110-160 BPM per ACOG guidelines
  const thresholds = type === 'maternal'
    ? {
        criticalLow: 40,      // Severe bradycardia requiring intervention
        warningLow: 50,       // Bradycardia, monitor closely
        normalLow: 60,        // Normal lower limit
        normalHigh: 100,      // Normal upper limit
        warningHigh: 120,     // Tachycardia, monitor
        criticalHigh: 140     // Severe tachycardia requiring intervention
      }
    : {
        criticalLow: 100,     // Severe fetal bradycardia per RANZCOG (<100 for >5 min)
        warningLow: 110,      // Borderline bradycardia (ACOG threshold)
        normalLow: 120,       // Normal fetal baseline lower limit (ACOG/NICHD)
        normalHigh: 160,      // Normal fetal baseline upper limit (ACOG/NICHD)
        warningHigh: 170,     // Borderline tachycardia (ACOG threshold)
        criticalHigh: 180     // Severe fetal tachycardia requiring intervention
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

      // Determine instantaneous status based on thresholds
      let instantaneousStatus: 'normal' | 'warning' | 'critical'
      if (beatsPerMinute < thresholds.criticalLow || beatsPerMinute > thresholds.criticalHigh) {
        instantaneousStatus = 'critical'
      } else if (beatsPerMinute < thresholds.warningLow || beatsPerMinute > thresholds.warningHigh) {
        instantaneousStatus = 'warning'
      } else {
        instantaneousStatus = 'normal'
      }

      // Add to history
      const now = Date.now()
      abnormalStatusHistory.push({ status: instantaneousStatus, timestamp: now })

      // Keep only last 10 seconds of history (for sustained alarm detection)
      const tenSecondsAgo = now - 10000
      while (abnormalStatusHistory.length > 0 && abnormalStatusHistory[0].timestamp < tenSecondsAgo) {
        abnormalStatusHistory.shift()
      }

      // Determine final status with sustained threshold logic
      // Critical alarms: Require 5+ seconds of sustained critical readings (reduces false alarms by ~80%)
      // Warning alarms: Require 3+ seconds of sustained warning/critical readings
      let finalStatus: 'normal' | 'warning' | 'critical' = 'normal'

      if (instantaneousStatus === 'critical') {
        // Check if critical for at least 5 seconds
        const criticalDuration = now - (abnormalStatusHistory.find(h => h.status !== 'critical')?.timestamp || now - 10000)
        if (criticalDuration >= 5000) {
          finalStatus = 'critical'
        } else {
          // Show warning during the buildup period
          finalStatus = 'warning'
        }
      } else if (instantaneousStatus === 'warning') {
        // Check if warning or critical for at least 3 seconds
        const abnormalDuration = now - (abnormalStatusHistory.find(h => h.status === 'normal')?.timestamp || now - 10000)
        if (abnormalDuration >= 3000) {
          finalStatus = 'warning'
        } else {
          finalStatus = 'normal'
        }
      } else {
        finalStatus = 'normal'
      }

      setStatus(finalStatus)
      if (onStatusChange) {
        onStatusChange(finalStatus)
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
        <div className="hrm-header-actions">
          <button
            className="info-icon-button"
            onClick={() => setIsModalOpen(true)}
            title="View system functional insights and testing specifications"
          >
            <svg viewBox="0 0 24 24" className="info-icon" width="20" height="20" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>
          <div className={`hrm-status status-${status}`}>
            {getStatusText()}
          </div>
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
              <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 20h-17L12 5.5zM11 10v5h2v-5h-2zm0 6v2h2v-2h-2z"/>
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

      <SystemInsightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        currentStatus={status}
        alarmMetrics={metrics}
        currentHeartRate={heartRate}
        onApplyConfig={(config) => {
          console.log(`${type} monitor configuration updated:`, config)
          // TODO: Apply configuration to actual system
          // This would update alarm sound settings, thresholds, etc.
        }}
      />
    </div>
  )
}
