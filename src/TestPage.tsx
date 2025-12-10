import AlarmTestSuite from './components/AlarmTestSuite'
import './App.css'

export default function TestPage() {
  return (
    <div className="app">
      <header className="header">
        <h1>ALARM THRESHOLD VALIDATION SUITE</h1>
        <h2 className="screen-title">Test Environment</h2>
      </header>
      <main style={{ padding: '20px', overflowY: 'auto', height: 'calc(100vh - 120px)' }}>
        <AlarmTestSuite />
      </main>
    </div>
  )
}
