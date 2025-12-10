import ConfirmationModal from './ConfirmationModal'

interface StopConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  dataPointCount: number
}

export default function StopConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  dataPointCount
}: StopConfirmationModalProps) {
  const duration = (dataPointCount / 250).toFixed(1) // Convert samples to seconds

  return (
    <ConfirmationModal
      isOpen={isOpen}
      type="warning"
      title="Stop Monitoring?"
      message={`Stop monitoring and export data? You have collected ${dataPointCount.toLocaleString()} data points (${duration} seconds). An Excel report with BPM and voltage graphs will be generated.`}
      confirmText="Stop & Export"
      cancelText="Continue Monitoring"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

