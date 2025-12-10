/**
 * Signal Processor for EKG Noise Removal
 *
 * Removes various types of noise from combined EKG signal:
 * - Powerline interference (50/60 Hz)
 * - High-frequency noise (muscle artifacts, EMG)
 * - Baseline wander (motion artifacts, respiration)
 * - Random noise
 */

export class SignalProcessor {
  private sampleRate: number
  private buffer: number[] = []
  private baselineBuffer: number[] = []
  private notchFilterState: NotchFilterState
  private lowpassFilterState: LowpassFilterState
  private highpassFilterState: HighpassFilterState

  constructor(sampleRate: number = 250) {
    this.sampleRate = sampleRate
    this.notchFilterState = this.initNotchFilter(60) // 60 Hz powerline noise
    this.lowpassFilterState = this.initLowpassFilter(40) // Remove high-freq noise
    this.highpassFilterState = this.initHighpassFilter(0.5) // Remove baseline wander
  }

  /**
   * Process a single sample through all noise removal filters
   */
  processSample(sample: number): number {
    // Step 1: Remove powerline interference (60 Hz notch filter)
    let filtered = this.applyNotchFilter(sample, this.notchFilterState)

    // Step 2: Remove high-frequency noise (lowpass filter at 40 Hz)
    filtered = this.applyLowpassFilter(filtered, this.lowpassFilterState)

    // Step 3: Remove baseline wander (highpass filter at 0.5 Hz)
    filtered = this.applyHighpassFilter(filtered, this.highpassFilterState)

    // Step 4: Remove remaining random noise (median filter)
    filtered = this.applyMedianFilter(filtered)

    return filtered
  }

  /**
   * Initialize 60 Hz notch filter (removes powerline interference)
   * Using IIR notch filter: H(z) = (1 - 2cos(w0)z^-1 + z^-2) / (1 - 2r*cos(w0)z^-1 + r^2*z^-2)
   */
  private initNotchFilter(frequency: number): NotchFilterState {
    const w0 = (2 * Math.PI * frequency) / this.sampleRate
    const r = 0.99 // Notch bandwidth control (0.99 = narrow notch)

    return {
      // Feedforward coefficients
      b0: 1.0,
      b1: -2.0 * Math.cos(w0),
      b2: 1.0,
      // Feedback coefficients
      a1: -2.0 * r * Math.cos(w0),
      a2: r * r,
      // State variables
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0
    }
  }

  /**
   * Apply notch filter to remove powerline interference
   */
  private applyNotchFilter(x: number, state: NotchFilterState): number {
    // Direct Form II Transposed implementation
    const y = state.b0 * x + state.b1 * state.x1 + state.b2 * state.x2
              - state.a1 * state.y1 - state.a2 * state.y2

    // Update state
    state.x2 = state.x1
    state.x1 = x
    state.y2 = state.y1
    state.y1 = y

    return y
  }

  /**
   * Initialize lowpass filter (removes high-frequency noise)
   * Using 2nd order Butterworth filter
   */
  private initLowpassFilter(cutoffFreq: number): LowpassFilterState {
    const omega = (2 * Math.PI * cutoffFreq) / this.sampleRate
    const sin_omega = Math.sin(omega)
    const cos_omega = Math.cos(omega)
    const alpha = sin_omega / (2 * 0.707) // Q = 0.707 for Butterworth

    const b0 = (1 - cos_omega) / 2
    const b1 = 1 - cos_omega
    const b2 = (1 - cos_omega) / 2
    const a0 = 1 + alpha
    const a1 = -2 * cos_omega
    const a2 = 1 - alpha

    return {
      b0: b0 / a0,
      b1: b1 / a0,
      b2: b2 / a0,
      a1: a1 / a0,
      a2: a2 / a0,
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0
    }
  }

  /**
   * Apply lowpass filter to remove high-frequency noise
   */
  private applyLowpassFilter(x: number, state: LowpassFilterState): number {
    const y = state.b0 * x + state.b1 * state.x1 + state.b2 * state.x2
              - state.a1 * state.y1 - state.a2 * state.y2

    // Update state
    state.x2 = state.x1
    state.x1 = x
    state.y2 = state.y1
    state.y1 = y

    return y
  }

  /**
   * Initialize highpass filter (removes baseline wander)
   * Using 2nd order Butterworth filter
   */
  private initHighpassFilter(cutoffFreq: number): HighpassFilterState {
    const omega = (2 * Math.PI * cutoffFreq) / this.sampleRate
    const sin_omega = Math.sin(omega)
    const cos_omega = Math.cos(omega)
    const alpha = sin_omega / (2 * 0.707) // Q = 0.707 for Butterworth

    const b0 = (1 + cos_omega) / 2
    const b1 = -(1 + cos_omega)
    const b2 = (1 + cos_omega) / 2
    const a0 = 1 + alpha
    const a1 = -2 * cos_omega
    const a2 = 1 - alpha

    return {
      b0: b0 / a0,
      b1: b1 / a0,
      b2: b2 / a0,
      a1: a1 / a0,
      a2: a2 / a0,
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0
    }
  }

  /**
   * Apply highpass filter to remove baseline wander
   */
  private applyHighpassFilter(x: number, state: HighpassFilterState): number {
    const y = state.b0 * x + state.b1 * state.x1 + state.b2 * state.x2
              - state.a1 * state.y1 - state.a2 * state.y2

    // Update state
    state.x2 = state.x1
    state.x1 = x
    state.y2 = state.y1
    state.y1 = y

    return y
  }

  /**
   * Apply median filter to remove random impulse noise
   * Uses 5-sample sliding window
   */
  private applyMedianFilter(sample: number): number {
    // Add sample to buffer
    this.buffer.push(sample)

    // Keep buffer size at 5 samples
    if (this.buffer.length > 5) {
      this.buffer.shift()
    }

    // Need at least 5 samples for median filter
    if (this.buffer.length < 5) {
      return sample
    }

    // Calculate median
    const sorted = [...this.buffer].sort((a, b) => a - b)
    return sorted[2] // Middle value of 5 samples
  }

  /**
   * Reset all filter states (call when starting new monitoring session)
   */
  reset(): void {
    this.buffer = []
    this.baselineBuffer = []

    // Reset notch filter state
    this.notchFilterState.x1 = 0
    this.notchFilterState.x2 = 0
    this.notchFilterState.y1 = 0
    this.notchFilterState.y2 = 0

    // Reset lowpass filter state
    this.lowpassFilterState.x1 = 0
    this.lowpassFilterState.x2 = 0
    this.lowpassFilterState.y1 = 0
    this.lowpassFilterState.y2 = 0

    // Reset highpass filter state
    this.highpassFilterState.x1 = 0
    this.highpassFilterState.x2 = 0
    this.highpassFilterState.y1 = 0
    this.highpassFilterState.y2 = 0
  }
}

// Filter state interfaces
interface NotchFilterState {
  b0: number
  b1: number
  b2: number
  a1: number
  a2: number
  x1: number
  x2: number
  y1: number
  y2: number
}

interface LowpassFilterState {
  b0: number
  b1: number
  b2: number
  a1: number
  a2: number
  x1: number
  x2: number
  y1: number
  y2: number
}

interface HighpassFilterState {
  b0: number
  b1: number
  b2: number
  a1: number
  a2: number
  x1: number
  x2: number
  y1: number
  y2: number
}

/**
 * Create a pre-configured signal processor for EKG data
 */
export function createEKGSignalProcessor(sampleRate: number = 250): SignalProcessor {
  return new SignalProcessor(sampleRate)
}
