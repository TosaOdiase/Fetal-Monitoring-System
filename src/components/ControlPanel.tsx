import { ScreenType, ViewMode } from '../App'
import { SignalMapping, SignalType } from '../hooks/useArduinoSerial'
import { RawSignalPair } from '../hooks/useRawSignals'
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
  rawSignalSelection: RawSignalPair
  onRawSignalChange: (signal: RawSignalPair) => void
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

  const getRawSignalLabel = (signalPair: RawSignalPair) => {
    const labels: Record<RawSignalPair, string> = {
      'pair01': 'Pair 01',
      'pair02': 'Pair 02',
      'pair03': 'Pair 03',
      'pair04': 'Pair 04',
      'pair06': 'Fetal B...'
    }
    return labels[signalPair]
  }

  const getSignalDescription = (signalPair: RawSignalPair) => {
    const descriptions: Record<RawSignalPair, string> = {
      'pair01': 'sub01 c0 snr06 - Extract fetal via subtraction',
      'pair02': 'sub01 c1 snr06 - Extract fetal via subtraction',
      'pair03': 'sub01 c1 snr00 - Extract fetal via subtraction (high noise)',
      'pair04': 'sub01 c1 snr12 - Extract fetal via subtraction (low noise)',
      'pair06': 'Fetal Bradycardia - Alarm condition'
    }
    return descriptions[signalPair]
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

        {/* Raw Signal Pairs Section - Only in Development Mode */}
        {isDevelopmentMode && dataSource === 'raw' && (
          <div className="control-section conditions-section">
            <div className="section-header">
              <h3 className="section-title">Signal Pairs (Subtraction Processing)</h3>
              <span className="section-info">Fetal = Combined - Maternal</span>
            </div>
            <div className="button-group">
              {(['pair01', 'pair02', 'pair03', 'pair04'] as RawSignalPair[]).map((signalPair) => (
                <button
                  key={signalPair}
                  className={`btn btn-condition ${rawSignalSelection === signalPair ? 'active' : ''}`}
                  onClick={() => onRawSignalChange(signalPair)}
                  title={getSignalDescription(signalPair)}
                >
                  <span className="btn-label">{getRawSignalLabel(signalPair)}</span>
                </button>
              ))}
              {/* Fetal Bradycardia Alarm - Red styling */}
              <button
                key="pair06"
                className={`btn btn-condition btn-bradycardia ${rawSignalSelection === 'pair06' ? 'active' : ''}`}
                onClick={() => onRawSignalChange('pair06')}
                title={getSignalDescription('pair06')}
              >
                <span className="btn-label">{getRawSignalLabel('pair06')}</span>
              </button>
            </div>
            <div className="signal-pair-info">
              <p><strong>Pair 01:</strong> sub01 c0 snr06 - Fetal extracted via subtraction</p>
              <p><strong>Pair 02:</strong> sub01 c1 snr06 - Fetal extracted via subtraction</p>
              <p><strong>Pair 03:</strong> sub01 c1 snr00 - Fetal extracted via subtraction (high noise)</p>
              <p><strong>Pair 04:</strong> sub01 c1 snr12 - Fetal extracted via subtraction (low noise)</p>
              <p className="bradycardia-alarm"><strong>Fetal B...:</strong> Fetal Bradycardia - Alarm condition</p>
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
