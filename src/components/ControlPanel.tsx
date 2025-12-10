import { ScreenType, ViewMode } from '../App'
import { SignalMapping, SignalType } from '../hooks/useArduinoSerial'
import { RawSignalId } from '../hooks/useRawSignals'
import './ControlPanel.css'

interface ControlPanelProps {
  currentScreen: ScreenType
  onScreenChange: (screen: ScreenType) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  isMonitoring: boolean
  onStartStop: () => void
  onClear: () => void
  dataSource: 'simulated' | 'arduino' | 'real' | 'raw'
  isArduinoConnected: boolean
  onConnectArduino: () => void
  isDevelopmentMode: boolean
  onToggleDevelopmentMode: () => void
  rawSignalSelection: RawSignalId
  onRawSignalChange: (signal: RawSignalId) => void
  signalMapping?: SignalMapping
  onSignalMappingChange?: (mapping: SignalMapping) => void
}

export default function ControlPanel({
  currentScreen,
  onScreenChange,
  viewMode,
  onViewModeChange,
  isMonitoring,
  onStartStop,
  onClear,
  dataSource,
  isArduinoConnected,
  onConnectArduino,
  isDevelopmentMode,
  onToggleDevelopmentMode,
  rawSignalSelection,
  onRawSignalChange,
  signalMapping,
  onSignalMappingChange
}: ControlPanelProps) {
  const getViewModeLabel = (mode: ViewMode) => {
    switch(mode) {
      case 'standard': return 'Standard'
      case 'split': return 'Split View'
      case 'comparison': return 'Compare All'
      case 'focus-fetal': return 'Fetal Monitoring'
    }
  }

  const getRawSignalLabel = (signalId: RawSignalId) => {
    const labels: Record<RawSignalId, string> = {
      'signal01': 'Signal 01',
      'signal02': 'Signal 02',
      'signal03': 'Signal 03',
      'signal04': 'Signal 04',
      'signal05': 'Signal 05',
      'signal06': 'Signal 06',
      'signal07': 'Signal 07',
      'signal08': 'Signal 08'
    }
    return labels[signalId]
  }

  const getSignalDescription = (signalId: RawSignalId) => {
    const descriptions: Record<RawSignalId, string> = {
      'signal01': 'c0 snr06 - Fetal + Maternal',
      'signal02': 'c0 snr06 - Maternal only',
      'signal03': 'c1 snr06 - Fetal + Maternal',
      'signal04': 'c1 snr06 - Maternal only',
      'signal05': 'c1 snr00 - Fetal + Maternal (high noise)',
      'signal06': 'c1 snr00 - Maternal only (high noise)',
      'signal07': 'c1 snr12 - Fetal + Maternal (low noise)',
      'signal08': 'c1 snr12 - Maternal only (low noise)'
    }
    return descriptions[signalId]
  }

  const getSignalLabel = (type: SignalType) => {
    switch(type) {
      case 'maternal': return 'Maternal'
      case 'fetal': return 'Fetal'
      case 'combined': return 'Combined'
      case 'none': return 'None'
    }
  }

  const handleChannelMapping = (channel: 'channel1' | 'channel2' | 'channel3', signalType: SignalType) => {
    if (signalMapping && onSignalMappingChange) {
      onSignalMappingChange({
        ...signalMapping,
        [channel]: signalType
      })
    }
  }

  return (
    <div className="control-panel">
      <div className="control-grid">
        {/* Left Section - View Controls */}
        <div className="control-section view-controls">
          <div className="section-header">
            <h3 className="section-title">View Mode</h3>
            <span className="section-key">V</span>
          </div>
          <div className="button-group">
            <button
              className={`btn btn-view ${viewMode === 'standard' ? 'active' : ''}`}
              onClick={() => onViewModeChange('standard')}
              title="Standard single-screen view"
            >
              <span className="btn-label">Standard</span>
            </button>
            <button
              className={`btn btn-view ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => onViewModeChange('split')}
              title="Side-by-side comparison"
            >
              <span className="btn-label">Split</span>
            </button>
            <button
              className={`btn btn-view ${viewMode === 'comparison' ? 'active' : ''}`}
              onClick={() => onViewModeChange('comparison')}
              title="Compare all signals"
            >
              <span className="btn-label">Compare</span>
            </button>
            <button
              className={`btn btn-view btn-fetal-monitoring ${viewMode === 'focus-fetal' ? 'active' : ''}`}
              onClick={() => onViewModeChange('focus-fetal')}
              title="Focused fetal monitoring"
            >
              <span className="btn-label">Fetal Monitoring</span>
            </button>
          </div>
        </div>

        {/* Center Section - Screen Select (only in standard mode) */}
        {viewMode === 'standard' && (
          <div className="control-section screen-controls">
            <div className="section-header">
              <h3 className="section-title">Signal Select</h3>
              <span className="section-key">1/2/3</span>
            </div>
            <div className="button-group">
              <button
                className={`btn btn-screen btn-mother ${currentScreen === 'mother' ? 'active' : ''}`}
                onClick={() => onScreenChange('mother')}
                title="Maternal EKG only"
              >
                <span className="btn-number">1</span>
                <span className="btn-label">Maternal</span>
              </button>
              <button
                className={`btn btn-screen btn-combined ${currentScreen === 'combined' ? 'active' : ''}`}
                onClick={() => onScreenChange('combined')}
                title="Combined signal"
              >
                <span className="btn-number">2</span>
                <span className="btn-label">Combined</span>
              </button>
              <button
                className={`btn btn-screen btn-fetal ${currentScreen === 'fetal' ? 'active' : ''}`}
                onClick={() => onScreenChange('fetal')}
                title="Fetal EKG only"
              >
                <span className="btn-number">3</span>
                <span className="btn-label">Fetal</span>
              </button>
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="control-section action-controls">
          <div className="section-header">
            <h3 className="section-title">Actions</h3>
          </div>
          <div className="button-group button-group-actions">
            <button
              className={`btn btn-action btn-primary ${isMonitoring ? 'btn-stop' : 'btn-start'}`}
              onClick={onStartStop}
              title="Start/Stop monitoring (SPACE)"
            >
              <span className="btn-label">{isMonitoring ? 'Stop' : 'Start'}</span>
              <span className="btn-key">SPACE</span>
            </button>
            {!isMonitoring && (
              <button
                className="btn btn-action btn-secondary"
                onClick={onClear}
                title="Clear all data (C)"
              >
                <span className="btn-label">Clear</span>
                <span className="btn-key">C</span>
              </button>
            )}
            {!isDevelopmentMode && (
              <button
                className={`btn btn-action btn-arduino ${isArduinoConnected ? 'connected' : ''}`}
                onClick={onConnectArduino}
                title="Connect to Arduino (A)"
              >
                <span className="btn-label">{isArduinoConnected ? 'Connected' : 'Connect'}</span>
                <span className="btn-key">A</span>
              </button>
            )}
          </div>

          {/* Mode Toggle Slider */}
          <div className="mode-toggle-container">
            <span className={`mode-label ${isDevelopmentMode ? 'active' : ''}`}>Development</span>
            <button
              className="mode-toggle-slider"
              onClick={onToggleDevelopmentMode}
              title="Toggle between Development and Production mode (D)"
              role="switch"
              aria-checked={isDevelopmentMode}
            >
              <span className={`slider ${isDevelopmentMode ? 'dev' : 'prod'}`}></span>
            </button>
            <span className={`mode-label ${!isDevelopmentMode ? 'active' : ''}`}>Production</span>
          </div>
        </div>

        {/* Arduino Signal Mapping - Only when Arduino is connected */}
        {!isDevelopmentMode && isArduinoConnected && signalMapping && onSignalMappingChange && (
          <div className="control-section signal-mapping-section">
            <div className="section-header">
              <h3 className="section-title">Arduino Signal Mapping</h3>
            </div>
            <div className="signal-mapping-grid">
              {/* Channel 1 (A0) */}
              <div className="mapping-row">
                <span className="channel-label">Channel 1 (A0):</span>
                <select
                  className="mapping-select"
                  value={signalMapping.channel1}
                  onChange={(e) => handleChannelMapping('channel1', e.target.value as SignalType)}
                  disabled={isMonitoring}
                >
                  <option value="maternal">Maternal</option>
                  <option value="fetal">Fetal</option>
                  <option value="combined">Combined</option>
                  <option value="none">None</option>
                </select>
              </div>
              {/* Channel 2 (A1) */}
              <div className="mapping-row">
                <span className="channel-label">Channel 2 (A1):</span>
                <select
                  className="mapping-select"
                  value={signalMapping.channel2}
                  onChange={(e) => handleChannelMapping('channel2', e.target.value as SignalType)}
                  disabled={isMonitoring}
                >
                  <option value="maternal">Maternal</option>
                  <option value="fetal">Fetal</option>
                  <option value="combined">Combined</option>
                  <option value="none">None</option>
                </select>
              </div>
              {/* Channel 3 (A2) */}
              <div className="mapping-row">
                <span className="channel-label">Channel 3 (A2):</span>
                <select
                  className="mapping-select"
                  value={signalMapping.channel3}
                  onChange={(e) => handleChannelMapping('channel3', e.target.value as SignalType)}
                  disabled={isMonitoring}
                >
                  <option value="maternal">Maternal</option>
                  <option value="fetal">Fetal</option>
                  <option value="combined">Combined</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            <div className="mapping-info">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <circle cx="12" cy="11.9999" r="9" stroke="currentColor" stroke-width="2.5" fill="none"/>
                <rect x="12" y="8" width="0.01" height="0.01" stroke="currentColor" stroke-width="3.75"/>
                <path d="M12 12V16" stroke="currentColor" stroke-width="2.5"/>
              </svg>
              <span>Configure which Arduino input maps to each signal type. Changes take effect on next start.</span>
            </div>
          </div>
        )}

        {/* Raw Signals Section - Only in Development Mode */}
        {isDevelopmentMode && dataSource === 'raw' && (
          <div className="control-section conditions-section">
            <div className="section-header">
              <h3 className="section-title">Raw Signals (01-08)</h3>
            </div>
            <div className="button-group">
              {(['signal01', 'signal02', 'signal03', 'signal04', 'signal05', 'signal06', 'signal07', 'signal08'] as RawSignalId[]).map((signalId) => (
                <button
                  key={signalId}
                  className={`btn btn-condition ${rawSignalSelection === signalId ? 'active' : ''}`}
                  onClick={() => onRawSignalChange(signalId)}
                  title={getSignalDescription(signalId)}
                >
                  <span className="btn-label">{getRawSignalLabel(signalId)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-message">
          {isMonitoring ? (
            <>
              <span className="status-dot"></span>
              <span className="status-text">
                Patient Data Transfer Successful - {isDevelopmentMode ? 'DEVELOPMENT MODE (Simulated High-Risk Scenarios)' : dataSource === 'arduino' ? 'LIVE PATIENT DATA' : 'TEST DATA'}
              </span>
            </>
          ) : (
            <span className="status-text">
              {isDevelopmentMode ? 'Development Mode - Ready to test high-risk scenarios' : 'Production Mode - Press START or SPACE to begin monitoring'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
