import { useEffect, useState } from 'react'
import './ClearConfirmationModal.css'

interface ClearConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ClearConfirmationModal({
  isOpen,
  onConfirm,
  onCancel
}: ClearConfirmationModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter') {
        handleConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen])

  const handleCancel = () => {
    setIsClosing(true)
    setTimeout(() => {
      onCancel()
    }, 300)
  }

  const handleConfirm = () => {
    setIsClosing(true)
    setTimeout(() => {
      onConfirm()
    }, 300)
  }

  if (!isOpen && !isClosing) return null

  return (
    <div className={`confirm-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleCancel}>
      <div className={`confirm-modal-content ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 20h-17L12 5.5zM11 10v5h2v-5h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </div>
          <h2 className="confirm-modal-title">CLEAR DATA WARNING</h2>
        </div>

        <div className="confirm-modal-body">
          <p className="confirm-modal-text">
            You are about to clear <strong>all recorded EKG data</strong> and <strong>alarm metrics</strong>.
          </p>
          <p className="confirm-modal-warning">
            This action <strong>cannot be undone</strong>.
          </p>
          <p className="confirm-modal-question">
            Do you want to continue?
          </p>
        </div>

        <div className="confirm-modal-actions">
          <button className="confirm-modal-button cancel" onClick={handleCancel}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            <span>Cancel</span>
            <span className="keyboard-hint">ESC</span>
          </button>
          <button className="confirm-modal-button confirm" onClick={handleConfirm}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span>Clear Data</span>
            <span className="keyboard-hint">ENTER</span>
          </button>
        </div>
      </div>
    </div>
  )
}
