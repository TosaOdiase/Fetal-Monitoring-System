import './SignalQualityPanel.css'

export type SignalQualityProfile =
  | 'excellent'
  | 'good'
  | 'moderate'
  | 'poor'
  | 'severe-noise'
  | 'baseline-wander'
  | 'motion-artifacts'
  | 'power-line-interference'
  | 'low-amplitude'
  | 'electrode-contact-issue'

interface SignalQualityPanelProps {
  currentProfile: SignalQualityProfile
  onProfileChange: (profile: SignalQualityProfile) => void
  isDevelopmentMode: boolean
}

export default function SignalQualityPanel({
  currentProfile,
  onProfileChange,
  isDevelopmentMode
}: SignalQualityPanelProps) {
  if (!isDevelopmentMode) return null

  const profiles = [
    {
      id: 'excellent' as SignalQualityProfile,
      name: 'Excellent',
      description: 'Ideal conditions: Clean signal, minimal noise',
      icon: '✓',
      category: 'baseline'
    },
    {
      id: 'good' as SignalQualityProfile,
      name: 'Good',
      description: 'Normal clinical conditions: Slight noise',
      icon: '✓',
      category: 'baseline'
    },
    {
      id: 'moderate' as SignalQualityProfile,
      name: 'Moderate',
      description: 'Acceptable signal quality with moderate noise',
      icon: '~',
      category: 'baseline'
    },
    {
      id: 'poor' as SignalQualityProfile,
      name: 'Poor',
      description: 'Challenging conditions: High noise, weak signal',
      icon: '!',
      category: 'baseline'
    },
    {
      id: 'severe-noise' as SignalQualityProfile,
      name: 'Severe Noise',
      description: 'Extreme EMG interference, patient movement',
      icon: '⚠',
      category: 'stress-test'
    },
    {
      id: 'baseline-wander' as SignalQualityProfile,
      name: 'Baseline Wander',
      description: 'Heavy respiratory drift, maternal breathing',
      icon: '~',
      category: 'stress-test'
    },
    {
      id: 'motion-artifacts' as SignalQualityProfile,
      name: 'Motion Artifacts',
      description: 'Sudden spikes from maternal/fetal movement',
      icon: '⚡',
      category: 'stress-test'
    },
    {
      id: 'power-line-interference' as SignalQualityProfile,
      name: '60 Hz Interference',
      description: 'Strong power line contamination',
      icon: '⚡',
      category: 'stress-test'
    },
    {
      id: 'low-amplitude' as SignalQualityProfile,
      name: 'Low Amplitude',
      description: 'Weak fetal signal, poor electrode contact',
      icon: '↓',
      category: 'stress-test'
    },
    {
      id: 'electrode-contact-issue' as SignalQualityProfile,
      name: 'Poor Contact',
      description: 'Intermittent electrode contact loss',
      icon: '⚠',
      category: 'stress-test'
    }
  ]

  const baselineProfiles = profiles.filter(p => p.category === 'baseline')
  const stressTestProfiles = profiles.filter(p => p.category === 'stress-test')

  return (
    <div className="signal-quality-panel">
      <div className="signal-quality-header">
        <div className="header-left">
          <h3 className="panel-title">Signal Quality Testing</h3>
          <span className="panel-subtitle">Demonstrate system robustness across clinical scenarios</span>
        </div>
        <div className="quality-indicator">
          <div className={`quality-badge quality-${currentProfile}`}>
            {profiles.find(p => p.id === currentProfile)?.icon} {profiles.find(p => p.id === currentProfile)?.name}
          </div>
        </div>
      </div>

      <div className="signal-quality-content">
        {/* All Quality Profiles in Single Grid */}
        <div className="quality-grid-unified">
          {profiles.map(profile => (
            <button
              key={profile.id}
              className={`quality-button-compact ${currentProfile === profile.id ? 'active' : ''} ${profile.category === 'baseline' ? 'quality-level-' + profile.id : 'quality-stress-' + profile.id}`}
              onClick={() => onProfileChange(profile.id)}
              title={profile.description}
            >
              <span className="quality-icon-compact">{profile.icon}</span>
              <span className="quality-name-compact">{profile.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
