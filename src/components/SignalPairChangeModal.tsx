import ConfirmationModal from './ConfirmationModal'
import { RawSignalPair } from '../hooks/useRawSignals'

interface SignalPairChangeModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  currentPair: RawSignalPair
  newPair: RawSignalPair
  isMonitoring: boolean
  dataPointCount: number
}

const pairNames: Record<RawSignalPair, string> = {
  'pair01': 'Pair 01 (sub01 c0 snr06)',
  'pair02': 'Pair 02 (sub01 c1 snr06)',
  'pair03': 'Pair 03 (sub01 c1 snr00)',
  'pair04': 'Pair 04 (sub01 c1 snr12)',
  'pair06': 'Fetal B... (Bradycardia Alarm)'
}

export default function SignalPairChangeModal({
  isOpen,
  onConfirm,
  onCancel,
  currentPair,
  newPair,
  isMonitoring
}: SignalPairChangeModalProps) {
  const message = isMonitoring
    ? `Switch from ${pairNames[currentPair]} to ${pairNames[newPair]}? Monitoring will be stopped and all data will be cleared.`
    : `Switch from ${pairNames[currentPair]} to ${pairNames[newPair]}? All current data will be cleared.`

  return (
    <ConfirmationModal
      isOpen={isOpen}
      type="warning"
      title="Change Signal Pair?"
      message={message}
      confirmText="Switch & Clear"
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

