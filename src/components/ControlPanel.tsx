import { ScreenType, ViewMode, SimulationCondition } from '../App'
import './ControlPanel.css'

interface ControlPanelProps {
  currentScreen: ScreenType
  onScreenChange: (screen: ScreenType) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  isMonitoring: boolean
  onStartStop: () => void
  onClear: () => void
  dataSource: 'simulated' | 'arduino'
  isArduinoConnected: boolean
  onConnectArduino: () => void
  isDevelopmentMode: boolean
  onToggleDevelopmentMode: () => void
  simulationCondition: SimulationCondition
  onConditionChange: (condition: SimulationCondition) => void
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
  simulationCondition,
  onConditionChange
}: ControlPanelProps) {
  const getViewModeLabel = (mode: ViewMode) => {
    switch(mode) {
      case 'standard': return 'Standard'
      case 'split': return 'Split View'
      case 'comparison': return 'Compare All'
      case 'focus-fetal': return 'Fetal Monitoring'
    }
  }

  const getConditionLabel = (condition: SimulationCondition) => {
    switch(condition) {
      case 'normal': return 'Normal Pregnancy'
      case 'high-risk': return 'High-Risk Pregnancy'
      case 'fetal-bradycardia': return 'Fetal Bradycardia'
      case 'fetal-tachycardia': return 'Fetal Tachycardia'
      case 'fetal-arrhythmia': return 'Fetal Arrhythmia'
      case 'maternal-bradycardia': return 'Maternal Bradycardia'
      case 'maternal-tachycardia': return 'Maternal Tachycardia'
      case 'maternal-arrhythmia': return 'Maternal Arrhythmia'
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
            <button
              className="btn btn-action btn-secondary"
              onClick={onClear}
              title="Clear all data (C)"
            >
              <span className="btn-label">Clear</span>
              <span className="btn-key">C</span>
            </button>
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

        {/* Conditions Section - Only in Development Mode */}
        {isDevelopmentMode && (
          <div className="control-section conditions-section">
            <div className="section-header">
              <h3 className="section-title">Test Conditions</h3>
            </div>
            <div className="button-group">
              <button
                className={`btn btn-condition ${simulationCondition === 'normal' ? 'active' : ''}`}
                onClick={() => onConditionChange('normal')}
                title="Normal pregnancy with healthy vitals"
              >
                <span className="btn-label">Normal</span>
              </button>
              <button
                className={`btn btn-condition btn-high-risk ${simulationCondition === 'high-risk' ? 'active' : ''}`}
                onClick={() => onConditionChange('high-risk')}
                title="High-risk pregnancy with borderline fetal heart rate"
              >
                <span className="btn-label">High-Risk</span>
              </button>
              <button
                className={`btn btn-condition btn-critical ${simulationCondition === 'fetal-bradycardia' ? 'active' : ''}`}
                onClick={() => onConditionChange('fetal-bradycardia')}
                title="Fetal heart rate < 110 bpm (Critical)"
              >
                <span className="btn-label">Fetal Bradycardia</span>
              </button>
              <button
                className={`btn btn-condition btn-critical ${simulationCondition === 'fetal-tachycardia' ? 'active' : ''}`}
                onClick={() => onConditionChange('fetal-tachycardia')}
                title="Fetal heart rate > 180 bpm (Critical)"
              >
                <span className="btn-label">Fetal Tachycardia</span>
              </button>
              <button
                className={`btn btn-condition btn-critical ${simulationCondition === 'fetal-arrhythmia' ? 'active' : ''}`}
                onClick={() => onConditionChange('fetal-arrhythmia')}
                title="Irregular fetal heart rhythm"
              >
                <span className="btn-label">Fetal Arrhythmia</span>
              </button>
              <button
                className={`btn btn-condition btn-maternal ${simulationCondition === 'maternal-bradycardia' ? 'active' : ''}`}
                onClick={() => onConditionChange('maternal-bradycardia')}
                title="Maternal heart rate < 50 bpm (Critical)"
              >
                <span className="btn-label">Maternal Bradycardia</span>
              </button>
              <button
                className={`btn btn-condition btn-maternal ${simulationCondition === 'maternal-tachycardia' ? 'active' : ''}`}
                onClick={() => onConditionChange('maternal-tachycardia')}
                title="Maternal heart rate > 120 bpm (Critical)"
              >
                <span className="btn-label">Maternal Tachycardia</span>
              </button>
              <button
                className={`btn btn-condition btn-maternal ${simulationCondition === 'maternal-arrhythmia' ? 'active' : ''}`}
                onClick={() => onConditionChange('maternal-arrhythmia')}
                title="Irregular maternal heart rhythm"
              >
                <span className="btn-label">Maternal Arrhythmia</span>
              </button>
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
