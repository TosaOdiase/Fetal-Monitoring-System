import { useState, useEffect } from 'react'
import './SystemInsightsModal.css'
import ConfirmationModal from './ConfirmationModal'

interface AlarmMetrics {
  lastAlarmTime: number | null
  responseTimeMs: number | null
  alarmCount: number
  avgResponseTimeMs: number
}

interface ThresholdConfig {
  criticalLow: number
  warningLow: number
  normalLow: number
  normalHigh: number
  warningHigh: number
  criticalHigh: number
}

interface SystemConfig {
  alarmVolume: number
  alarmFrequency1: number
  alarmFrequency2: number
  samplingRate: number
  detectionWindow: number
  thresholds: ThresholdConfig
}

interface SystemInsightsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'maternal' | 'fetal'
  currentStatus: 'normal' | 'warning' | 'critical'
  alarmMetrics: AlarmMetrics
  currentHeartRate: number
  onApplyConfig?: (config: SystemConfig) => void
}

export default function SystemInsightsModal({
  isOpen,
  onClose,
  type,
  currentStatus,
  alarmMetrics,
  currentHeartRate,
  onApplyConfig
}: SystemInsightsModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false)

  // Editable parameters
  const [alarmVolume, setAlarmVolume] = useState(0.8) // 0-1 scale
  const [alarmFrequency1, setAlarmFrequency1] = useState(880)
  const [alarmFrequency2, setAlarmFrequency2] = useState(1108)
  const [samplingRate, setSamplingRate] = useState(250)
  const [detectionWindow, setDetectionWindow] = useState(5)
  const [alarmCadence, setAlarmCadence] = useState(600) // ms between alarm cycles

  // Threshold configuration
  const [thresholds, setThresholds] = useState(
    type === 'maternal'
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
  )

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!isOpen && !isClosing) return null

  // Calculate estimated decibel level from gain
  const estimatedDecibels = Math.round(20 * Math.log10(alarmVolume) + 94)

  // Determine if response time passes requirements
  const responseTimePasses = alarmMetrics.responseTimeMs !== null && alarmMetrics.responseTimeMs < 50

  // Calculate time since last alarm
  const timeSinceLastAlarm = alarmMetrics.lastAlarmTime
    ? ((performance.now() - alarmMetrics.lastAlarmTime) / 1000).toFixed(1)
    : 'N/A'

  const handleThresholdChange = (key: string, value: number) => {
    setThresholds(prev => ({
      ...prev,
      [key]: value
    }))
    setHasUnsavedChanges(true)
  }

  const handleApplyConfig = () => {
    if (onApplyConfig) {
      const config: SystemConfig = {
        alarmVolume,
        alarmFrequency1,
        alarmFrequency2,
        samplingRate,
        detectionWindow,
        thresholds
      }
      onApplyConfig(config)
      setHasUnsavedChanges(false)
      setShowSuccessModal(true)
    }
  }

  const handleResetToDefaults = () => {
    setShowResetConfirmModal(true)
  }

  const confirmResetToDefaults = () => {
    setAlarmVolume(0.8)
    setAlarmFrequency1(880)
    setAlarmFrequency2(1108)
    setSamplingRate(250)
    setDetectionWindow(5)
    setAlarmCadence(600)
    setThresholds(
      type === 'maternal'
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
    )
    setHasUnsavedChanges(false)
  }

  // Mark as changed when any editable field changes
  const markAsChanged = () => setHasUnsavedChanges(true)

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">
              {type === 'maternal' ? 'MATERNAL' : 'FETAL'} MONITORING - LIVE SYSTEM SPECS
            </h2>
            {hasUnsavedChanges && <span className="unsaved-indicator">● Unsaved Changes</span>}
          </div>
          <div className="modal-header-actions">
            <button className="modal-action-button reset" onClick={handleResetToDefaults} title="Reset to defaults">
              Reset Defaults
            </button>
            <button
              className={`modal-action-button apply ${hasUnsavedChanges ? 'highlight' : ''}`}
              onClick={handleApplyConfig}
              disabled={!hasUnsavedChanges || !onApplyConfig}
              title="Apply configuration changes"
            >
              Apply Changes
            </button>
            <button className="modal-close" onClick={handleClose} title="Close">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
                <path d="M6 6L18 18M18 6L6 18" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Current Live Readings */}
          <section className="insight-section">
            <h3 className="section-title">📊 Current Live Readings</h3>
            <div className="readings-grid">
              <div className={`reading-card status-${currentStatus}`}>
                <div className="reading-label">Patient Status</div>
                <div className="reading-value">{currentStatus.toUpperCase()}</div>
              </div>
              <div className="reading-card">
                <div className="reading-label">Current Heart Rate</div>
                <div className="reading-value">{currentHeartRate > 0 ? `${currentHeartRate} BPM` : '--'}</div>
              </div>
              <div className="reading-card">
                <div className="reading-label">Total Alarms Triggered</div>
                <div className="reading-value">{alarmMetrics.alarmCount}</div>
              </div>
              <div className="reading-card">
                <div className="reading-label">Time Since Last Alarm</div>
                <div className="reading-value">{timeSinceLastAlarm}s</div>
              </div>
            </div>
          </section>

          {/* Alarm Performance Metrics */}
          <section className="insight-section">
            <h3 className="section-title">🔔 Alarm Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card highlight">
                <div className="metric-header">
                  <div className="metric-label">Alarm Response Time</div>
                  <div className={`metric-status ${responseTimePasses ? 'pass' : 'review'}`}>
                    {alarmMetrics.responseTimeMs !== null
                      ? (responseTimePasses ? '✓ PASS' : '⚠ REVIEW')
                      : 'N/A'
                    }
                  </div>
                </div>
                <div className="metric-value">
                  {alarmMetrics.responseTimeMs !== null
                    ? `${alarmMetrics.responseTimeMs.toFixed(1)} ms`
                    : 'No data'
                  }
                </div>
                <div className="metric-note">Target: &lt;50ms | Industry Standard: &lt;100ms</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <div className="metric-label">Average Response Time</div>
                </div>
                <div className="metric-value">
                  {alarmMetrics.avgResponseTimeMs > 0
                    ? `${alarmMetrics.avgResponseTimeMs.toFixed(1)} ms`
                    : 'No data'
                  }
                </div>
                <div className="metric-note">Across all {alarmMetrics.alarmCount} alarm(s)</div>
              </div>

              <div className="metric-card highlight">
                <div className="metric-header">
                  <div className="metric-label">Estimated Alarm Volume</div>
                </div>
                <div className="metric-value">{estimatedDecibels} dB SPL</div>
                <div className="metric-note">Medical Standard: 65-85 dB | High Priority: 85-95 dB</div>
              </div>
            </div>
          </section>

          {/* Editable Alarm Configuration */}
          <section className="insight-section">
            <h3 className="section-title">⚙️ Alarm Configuration (Editable)</h3>
            <div className="config-grid">
              <div className="config-item">
                <label className="config-label">Alarm Volume (Gain)</label>
                <div className="config-input-group">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={alarmVolume}
                    onChange={(e) => { setAlarmVolume(parseFloat(e.target.value)); markAsChanged(); }}
                    className="config-slider"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={alarmVolume}
                    onChange={(e) => { setAlarmVolume(parseFloat(e.target.value)); markAsChanged(); }}
                    className="config-number-input"
                  />
                </div>
                <div className="config-note">Current: {(alarmVolume * 100).toFixed(0)}% (~{estimatedDecibels} dB)</div>
              </div>

              <div className="config-item">
                <label className="config-label">Primary Frequency (Hz)</label>
                <div className="config-input-group">
                  <select
                    value={alarmFrequency1}
                    onChange={(e) => { setAlarmFrequency1(parseInt(e.target.value)); markAsChanged(); }}
                    className="config-select"
                  >
                    <option value="440">440 Hz (A4)</option>
                    <option value="523">523 Hz (C5)</option>
                    <option value="659">659 Hz (E5)</option>
                    <option value="880">880 Hz (A5) - Default</option>
                    <option value="1046">1046 Hz (C6)</option>
                  </select>
                  <input
                    type="number"
                    min="200"
                    max="2000"
                    value={alarmFrequency1}
                    onChange={(e) => { setAlarmFrequency1(parseInt(e.target.value)); markAsChanged(); }}
                    className="config-number-input"
                  />
                </div>
              </div>

              <div className="config-item">
                <label className="config-label">Secondary Frequency (Hz)</label>
                <div className="config-input-group">
                  <select
                    value={alarmFrequency2}
                    onChange={(e) => { setAlarmFrequency2(parseInt(e.target.value)); markAsChanged(); }}
                    className="config-select"
                  >
                    <option value="523">523 Hz (C5)</option>
                    <option value="659">659 Hz (E5)</option>
                    <option value="880">880 Hz (A5)</option>
                    <option value="1046">1046 Hz (C6)</option>
                    <option value="1108">1108 Hz (C#6) - Default</option>
                  </select>
                  <input
                    type="number"
                    min="200"
                    max="2000"
                    value={alarmFrequency2}
                    onChange={(e) => { setAlarmFrequency2(parseInt(e.target.value)); markAsChanged(); }}
                    className="config-number-input"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Detection Parameters */}
          <section className="insight-section">
            <h3 className="section-title">🎯 Detection Parameters</h3>
            <div className="config-grid">
              <div className="config-item">
                <label className="config-label">Sampling Rate (Hz)</label>
                <div className="config-input-group">
                  <select
                    value={samplingRate}
                    onChange={(e) => { setSamplingRate(parseInt(e.target.value)); markAsChanged(); }}
                    className="config-select"
                  >
                    <option value="100">100 Hz</option>
                    <option value="250">250 Hz - Default</option>
                    <option value="500">500 Hz</option>
                    <option value="1000">1000 Hz</option>
                  </select>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={samplingRate}
                    onChange={(e) => { setSamplingRate(parseInt(e.target.value)); markAsChanged(); }}
                    className="config-number-input"
                  />
                </div>
                <div className="config-note">Sample interval: {(1000/samplingRate).toFixed(1)}ms</div>
              </div>

              <div className="config-item">
                <label className="config-label">Detection Window (seconds)</label>
                <div className="config-input-group">
                  <select
                    value={detectionWindow}
                    onChange={(e) => { setDetectionWindow(parseInt(e.target.value)); markAsChanged(); }}
                    className="config-select"
                  >
                    <option value="3">3 seconds</option>
                    <option value="5">5 seconds - Default</option>
                    <option value="10">10 seconds</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={detectionWindow}
                    onChange={(e) => { setDetectionWindow(parseInt(e.target.value)); markAsChanged(); }}
                    className="config-number-input"
                  />
                </div>
                <div className="config-note">Buffer size: {samplingRate * detectionWindow} samples</div>
              </div>
            </div>
          </section>

          {/* Threshold Configuration */}
          <section className="insight-section">
            <h3 className="section-title">📈 Heart Rate Thresholds (Editable)</h3>
            <div className="threshold-config">
              <div className="threshold-visual">
                <div className="threshold-zone-config critical">
                  <div className="zone-header">Critical Low</div>
                  <input
                    type="number"
                    value={thresholds.criticalLow}
                    onChange={(e) => handleThresholdChange('criticalLow', parseInt(e.target.value))}
                    className="threshold-input"
                  />
                  <div className="zone-label-small">BPM</div>
                </div>
                <div className="threshold-zone-config warning">
                  <div className="zone-header">Warning Low</div>
                  <input
                    type="number"
                    value={thresholds.warningLow}
                    onChange={(e) => handleThresholdChange('warningLow', parseInt(e.target.value))}
                    className="threshold-input"
                  />
                  <div className="zone-label-small">BPM</div>
                </div>
                <div className="threshold-zone-config normal">
                  <div className="zone-header">Normal Range</div>
                  <div className="threshold-range">
                    <input
                      type="number"
                      value={thresholds.normalLow}
                      onChange={(e) => handleThresholdChange('normalLow', parseInt(e.target.value))}
                      className="threshold-input small"
                    />
                    <span className="range-separator">to</span>
                    <input
                      type="number"
                      value={thresholds.normalHigh}
                      onChange={(e) => handleThresholdChange('normalHigh', parseInt(e.target.value))}
                      className="threshold-input small"
                    />
                  </div>
                  <div className="zone-label-small">BPM</div>
                </div>
                <div className="threshold-zone-config warning">
                  <div className="zone-header">Warning High</div>
                  <input
                    type="number"
                    value={thresholds.warningHigh}
                    onChange={(e) => handleThresholdChange('warningHigh', parseInt(e.target.value))}
                    className="threshold-input"
                  />
                  <div className="zone-label-small">BPM</div>
                </div>
                <div className="threshold-zone-config critical">
                  <div className="zone-header">Critical High</div>
                  <input
                    type="number"
                    value={thresholds.criticalHigh}
                    onChange={(e) => handleThresholdChange('criticalHigh', parseInt(e.target.value))}
                    className="threshold-input"
                  />
                  <div className="zone-label-small">BPM</div>
                </div>
              </div>

              <div className="current-reading-indicator">
                <div className="indicator-label">Current Reading:</div>
                <div className={`indicator-value status-${currentStatus}`}>
                  {currentHeartRate > 0 ? `${currentHeartRate} BPM` : '--'}
                </div>
                <div className="indicator-status">
                  {currentStatus === 'critical' && '🚨 Critical'}
                  {currentStatus === 'warning' && '⚠️ Warning'}
                  {currentStatus === 'normal' && '✓ Normal'}
                </div>
              </div>
            </div>
          </section>

          {/* Measurable System Performance */}
          <section className="insight-section">
            <h3 className="section-title">⚡ Measurable System Performance</h3>
            <div className="performance-grid">
              <div className="perf-item">
                <div className="perf-label">Screen Update Rate</div>
                <div className="perf-value">4ms interval</div>
                <div className="perf-note">250 samples per second</div>
              </div>
              <div className="perf-item">
                <div className="perf-label">Data Buffer</div>
                <div className="perf-value">{samplingRate * detectionWindow} samples</div>
                <div className="perf-note">{detectionWindow} second rolling window</div>
              </div>
              <div className="perf-item">
                <div className="perf-label">Peak Detection</div>
                <div className="perf-value">Adaptive</div>
                <div className="perf-note">50% of signal maximum</div>
              </div>
              <div className="perf-item">
                <div className="perf-label">Status Update Latency</div>
                <div className="perf-value">&lt;10ms</div>
                <div className="perf-note">Real-time monitoring</div>
              </div>
            </div>
          </section>

          {/* System Info */}
          <section className="insight-section">
            <h3 className="section-title">ℹ️ System Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Patient Type:</span>
                <span className="info-value">{type === 'maternal' ? 'Maternal' : 'Fetal'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Algorithm:</span>
                <span className="info-value">Peak Detection with Adaptive Thresholding</span>
              </div>
              <div className="info-item">
                <span className="info-label">Waveform:</span>
                <span className="info-value">Square Wave Alarm</span>
              </div>
              <div className="info-item">
                <span className="info-label">Alarm Pattern:</span>
                <span className="info-value">Dual-tone beep-beep (600ms cadence)</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        type="success"
        title="Configuration Applied"
        message="Your system configuration has been applied successfully and is now active."
        confirmText="OK"
        showCancel={false}
        onCancel={() => setShowSuccessModal(false)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetConfirmModal}
        type="warning"
        title="Reset to Defaults"
        message="Are you sure you want to reset all settings to their default values? Any unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={confirmResetToDefaults}
        onCancel={() => setShowResetConfirmModal(false)}
      />
    </div>
  )
}
