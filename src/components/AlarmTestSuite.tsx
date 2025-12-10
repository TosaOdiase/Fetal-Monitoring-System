/**
 * AlarmTestSuite Component
 *
 * Manual testing interface for validating alarm threshold timing:
 * - Critical alarms should trigger after 5 seconds sustained
 * - Warning alarms should trigger after 3 seconds sustained
 * - Normal heart rates should never trigger alarms
 */

import { useState, useEffect } from 'react'
import { EKGDataPoint } from '../App'
import HeartRateMonitor from './HeartRateMonitor'
import './AlarmTestSuite.css'

type TestScenario =
  | 'normal-fetal'          // 110-160 BPM - should stay green
  | 'borderline-low'        // 110 BPM - should stay green/yellow
  | 'critical-low'          // 95 BPM - should go critical after 5s
  | 'critical-high'         // 185 BPM - should go critical after 5s
  | 'warning-low'           // 105 BPM - should go warning after 3s
  | 'warning-high'          // 165 BPM - should go warning after 3s
  | 'intermittent-spike'    // Alternating normal/critical - should NOT alarm

interface TestResult {
  scenario: string
  expectedStatus: string
  actualStatus: string
  timeToTrigger: number | null
  passed: boolean
}

export default function AlarmTestSuite() {
  const [activeScenario, setActiveScenario] = useState<TestScenario>('normal-fetal')
  const [isRunning, setIsRunning] = useState(false)
  const [testData, setTestData] = useState<EKGDataPoint[]>([])
  const [currentStatus, setCurrentStatus] = useState<'normal' | 'warning' | 'critical'>('normal')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testStartTime, setTestStartTime] = useState<number | null>(null)
  const [statusChangeTime, setStatusChangeTime] = useState<number | null>(null)

  // Generate synthetic ECG data for testing
  const generateTestData = (scenario: TestScenario, time: number): EKGDataPoint => {
    const samplingRate = 250 // Hz
    const t = time / samplingRate

    // Base ECG waveform parameters
    let baseHeartRate: number
    let amplitude = 1.0

    switch (scenario) {
      case 'normal-fetal':
        baseHeartRate = 135 // Middle of normal range (110-160)
        break
      case 'borderline-low':
        baseHeartRate = 110 // At lower threshold
        break
      case 'critical-low':
        baseHeartRate = 95 // Below 100 - should trigger critical after 5s
        break
      case 'critical-high':
        baseHeartRate = 185 // Above 180 - should trigger critical after 5s
        break
      case 'warning-low':
        baseHeartRate = 105 // Between 100-110 - should trigger warning after 3s
        break
      case 'warning-high':
        baseHeartRate = 165 // Between 160-180 - should trigger warning after 3s
        break
      case 'intermittent-spike':
        // Alternate between normal and critical every 2 seconds
        // Should NOT trigger alarm because it's not sustained
        baseHeartRate = Math.floor(time / 500) % 2 === 0 ? 135 : 185
        break
      default:
        baseHeartRate = 135
    }

    // Generate QRS complex
    const beatPeriod = 60 / baseHeartRate
    const phase = (t % beatPeriod) / beatPeriod

    let ecgValue = 0
    if (phase < 0.1) {
      // P wave
      ecgValue = 0.2 * Math.sin(phase * 20 * Math.PI)
    } else if (phase < 0.2) {
      // PR segment
      ecgValue = 0
    } else if (phase < 0.25) {
      // QRS complex
      ecgValue = amplitude * Math.sin((phase - 0.2) * 40 * Math.PI)
    } else if (phase < 0.4) {
      // T wave
      ecgValue = 0.3 * Math.sin((phase - 0.25) * 13.3 * Math.PI)
    }

    // Add small noise
    ecgValue += (Math.random() - 0.5) * 0.05

    return {
      time: t,
      mother: 0.5 + (Math.random() - 0.5) * 0.1,
      combined: ecgValue + 0.5 + (Math.random() - 0.5) * 0.1,
      fetus: ecgValue
    }
  }

  // Run test scenario
  useEffect(() => {
    if (!isRunning) return

    let sampleCount = 0
    const interval = setInterval(() => {
      const newPoint = generateTestData(activeScenario, sampleCount)
      setTestData(prev => [...prev, newPoint].slice(-1250)) // Keep last 5 seconds
      sampleCount++
    }, 4) // 250 Hz = 4ms interval

    return () => clearInterval(interval)
  }, [isRunning, activeScenario])

  // Track status changes
  useEffect(() => {
    if (currentStatus !== 'normal' && !statusChangeTime && testStartTime) {
      setStatusChangeTime(Date.now())
    }
  }, [currentStatus, statusChangeTime, testStartTime])

  const startTest = (scenario: TestScenario) => {
    setActiveScenario(scenario)
    setTestData([])
    setCurrentStatus('normal')
    setTestStartTime(Date.now())
    setStatusChangeTime(null)
    setIsRunning(true)
  }

  const stopTest = () => {
    setIsRunning(false)

    // Record test result
    if (testStartTime) {
      const timeToTrigger = statusChangeTime ? statusChangeTime - testStartTime : null

      let expectedStatus: string
      let expectedTime: string
      let passed = false

      switch (activeScenario) {
        case 'normal-fetal':
        case 'borderline-low':
          expectedStatus = 'normal'
          expectedTime = 'never'
          passed = currentStatus === 'normal'
          break
        case 'critical-low':
        case 'critical-high':
          expectedStatus = 'critical'
          expectedTime = '~5000ms'
          passed = currentStatus === 'critical' && timeToTrigger !== null && timeToTrigger >= 4500 && timeToTrigger <= 6000
          break
        case 'warning-low':
        case 'warning-high':
          expectedStatus = 'warning'
          expectedTime = '~3000ms'
          passed = (currentStatus === 'warning' || currentStatus === 'critical') && timeToTrigger !== null && timeToTrigger >= 2500 && timeToTrigger <= 4000
          break
        case 'intermittent-spike':
          expectedStatus = 'normal'
          expectedTime = 'never (not sustained)'
          passed = currentStatus === 'normal'
          break
        default:
          expectedStatus = 'unknown'
          expectedTime = 'unknown'
      }

      const result: TestResult = {
        scenario: activeScenario,
        expectedStatus: `${expectedStatus} (${expectedTime})`,
        actualStatus: `${currentStatus} (${timeToTrigger ? timeToTrigger + 'ms' : 'never'})`,
        timeToTrigger,
        passed
      }

      setTestResults(prev => [...prev, result])
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="alarm-test-suite">
      <div className="test-header">
        <h2>⚕️ Alarm Threshold Test Suite</h2>
        <p>Validates sustained alarm detection (Critical: 5s, Warning: 3s)</p>
      </div>

      <div className="test-controls">
        <h3>Test Scenarios</h3>
        <div className="scenario-buttons">
          <button onClick={() => startTest('normal-fetal')} disabled={isRunning}>
            Normal (135 BPM)
          </button>
          <button onClick={() => startTest('borderline-low')} disabled={isRunning}>
            Borderline Low (110 BPM)
          </button>
          <button onClick={() => startTest('warning-low')} disabled={isRunning}>
            Warning Low (105 BPM)
          </button>
          <button onClick={() => startTest('critical-low')} disabled={isRunning}>
            Critical Low (95 BPM)
          </button>
          <button onClick={() => startTest('warning-high')} disabled={isRunning}>
            Warning High (165 BPM)
          </button>
          <button onClick={() => startTest('critical-high')} disabled={isRunning}>
            Critical High (185 BPM)
          </button>
          <button onClick={() => startTest('intermittent-spike')} disabled={isRunning}>
            Intermittent Spikes
          </button>
        </div>

        {isRunning && (
          <div className="test-status">
            <p><strong>Running:</strong> {activeScenario}</p>
            <p><strong>Time Elapsed:</strong> {testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 0}s</p>
            <p><strong>Current Status:</strong> <span className={`status-${currentStatus}`}>{currentStatus.toUpperCase()}</span></p>
            {statusChangeTime && (
              <p><strong>Time to Trigger:</strong> {statusChangeTime - testStartTime!}ms</p>
            )}
            <button onClick={stopTest} className="stop-button">Stop Test</button>
          </div>
        )}
      </div>

      <div className="test-monitor">
        <HeartRateMonitor
          data={testData}
          type="fetal"
          onStatusChange={setCurrentStatus}
          heartbeatBeepEnabled={false}
        />
      </div>

      <div className="test-results">
        <div className="results-header">
          <h3>Test Results</h3>
          <button onClick={clearResults}>Clear Results</button>
        </div>
        {testResults.length === 0 ? (
          <p className="no-results">No test results yet. Run a test scenario above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, idx) => (
                <tr key={idx} className={result.passed ? 'pass' : 'fail'}>
                  <td>{result.scenario}</td>
                  <td>{result.expectedStatus}</td>
                  <td>{result.actualStatus}</td>
                  <td>{result.passed ? '✅ PASS' : '❌ FAIL'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="test-guide">
        <h3>📋 Testing Guide</h3>
        <ul>
          <li><strong>Normal (135 BPM):</strong> Should remain GREEN - never trigger alarms</li>
          <li><strong>Borderline Low (110 BPM):</strong> Should remain GREEN - at threshold but normal</li>
          <li><strong>Warning Low (105 BPM):</strong> Should turn YELLOW after ~3 seconds</li>
          <li><strong>Critical Low (95 BPM):</strong> Should turn RED after ~5 seconds</li>
          <li><strong>Warning High (165 BPM):</strong> Should turn YELLOW after ~3 seconds</li>
          <li><strong>Critical High (185 BPM):</strong> Should turn RED after ~5 seconds</li>
          <li><strong>Intermittent Spikes:</strong> Should remain GREEN - not sustained</li>
        </ul>
      </div>
    </div>
  )
}
