import { useEffect, useState } from 'react'
import './ConfirmationModal.css'

export type ModalType = 'warning' | 'info' | 'error' | 'success' | 'question'

interface ConfirmationModalProps {
  isOpen: boolean
  type?: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel: () => void
  showCancel?: boolean
}

export default function ConfirmationModal({
  isOpen,
  type = 'question',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true
}: ConfirmationModalProps) {
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
      } else if (e.key === 'Enter' && onConfirm) {
        handleConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, onConfirm])

  const handleCancel = () => {
    setIsClosing(true)
    setTimeout(() => {
      onCancel()
    }, 300)
  }

  const handleConfirm = () => {
    if (!onConfirm) {
      handleCancel()
      return
    }
    setIsClosing(true)
    setTimeout(() => {
      onConfirm()
    }, 300)
  }

  if (!isOpen && !isClosing) return null

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 20h-17L12 5.5zM11 10v5h2v-5h-2zm0 6v2h2v-2h-2z"/>
          </svg>
        )
      case 'error':
        return (
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        )
      case 'success':
        return (
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      case 'info':
        return (
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        )
      case 'question':
      default:
        return (
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        )
    }
  }

  const getColorClass = () => {
    switch (type) {
      case 'warning': return 'warning'
      case 'error': return 'error'
      case 'success': return 'success'
      case 'info': return 'info'
      case 'question':
      default: return 'question'
    }
  }

  return (
    <div className={`confirm-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleCancel}>
      <div className={`confirm-modal-content ${getColorClass()} ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
        <div className={`confirm-modal-header ${getColorClass()}`}>
          <div className={`confirm-modal-icon ${getColorClass()}`}>
            {getIcon()}
          </div>
          <h2 className="confirm-modal-title">{title}</h2>
        </div>

        <div className="confirm-modal-body">
          <p className="confirm-modal-text">{message}</p>
        </div>

        <div className="confirm-modal-actions">
          {showCancel && (
            <button className="confirm-modal-button cancel" onClick={handleCancel}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              <span>{cancelText}</span>
              {onConfirm && <span className="keyboard-hint">ESC</span>}
            </button>
          )}
          <button
            className={`confirm-modal-button confirm ${getColorClass()}`}
            onClick={handleConfirm}
            style={!showCancel ? { flex: 1 } : {}}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span>{confirmText}</span>
            {onConfirm && <span className="keyboard-hint">ENTER</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
