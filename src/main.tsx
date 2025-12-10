import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import TestPage from './TestPage'
import './index.css'

// Simple routing: check URL path
const isTestMode = window.location.pathname === '/test' || window.location.search.includes('test')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isTestMode ? <TestPage /> : <App />}
  </React.StrictMode>,
)
