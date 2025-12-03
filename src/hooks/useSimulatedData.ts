import { useRef } from 'react'

interface SimulatedSample {
  mother: number
  combined: number
  fetus: number
}

export type SimulationCondition =
  | 'normal'
  | 'high-risk'
  | 'fetal-bradycardia'
  | 'fetal-tachycardia'
  | 'fetal-arrhythmia'
  | 'maternal-bradycardia'
  | 'maternal-tachycardia'
  | 'maternal-arrhythmia'

export function useSimulatedData(condition: SimulationCondition = 'normal') {
  const timeRef = useRef(0)
  const dt = 1 / 250 // 250 Hz
  const arrhythmiaSkipRef = useRef(false)

  const generateQRS = (t: number, heartRate: number, amplitude: number, hasArrhythmia: boolean = false): number => {
    // For arrhythmia, randomly skip beats
    if (hasArrhythmia && Math.random() < 0.15) {
      arrhythmiaSkipRef.current = true
      return 0.02 * amplitude * Math.sin(2 * Math.PI * 0.2 * t) // Just baseline wander
    }
    arrhythmiaSkipRef.current = false

    const freq = heartRate / 60
    const phase = (t * freq) % 1
    let signal = 0

    // P wave (0.0 - 0.1)
    if (phase >= 0 && phase < 0.1) {
      signal = 0.15 * amplitude * Math.sin(phase * 10 * Math.PI)
    }
    // QRS complex (0.2 - 0.35)
    else if (phase >= 0.2 && phase < 0.35) {
      const qrsPhase = (phase - 0.2) / 0.15
      if (qrsPhase < 0.3) {
        signal = -0.3 * amplitude * (qrsPhase / 0.3)
      } else if (qrsPhase < 0.5) {
        signal = amplitude * ((qrsPhase - 0.3) / 0.2) * 5
      } else if (qrsPhase < 0.7) {
        signal = amplitude * (1.0 - (qrsPhase - 0.5) / 0.2 * 1.5)
      } else {
        signal = -0.5 * amplitude * ((qrsPhase - 0.7) / 0.3)
      }
    }
    // T wave (0.5 - 0.75)
    else if (phase >= 0.5 && phase < 0.75) {
      const tPhase = (phase - 0.5) / 0.25
      signal = 0.25 * amplitude * Math.sin(tPhase * Math.PI)
    }

    // Baseline wander
    signal += 0.02 * amplitude * Math.sin(2 * Math.PI * 0.2 * t)

    return signal
  }

  const getSample = (): SimulatedSample => {
    const t = timeRef.current

    // Define heart rates and conditions based on simulation condition
    let maternalHR = 75
    let fetalHR = 140
    let maternalArrhythmia = false
    let fetalArrhythmia = false

    switch (condition) {
      case 'normal':
        maternalHR = 75
        fetalHR = 140
        break
      case 'high-risk':
        maternalHR = 75
        fetalHR = 100 // Lower than normal
        break
      case 'fetal-bradycardia':
        maternalHR = 75
        fetalHR = 95 // < 110 bpm (critical)
        break
      case 'fetal-tachycardia':
        maternalHR = 75
        fetalHR = 190 // > 180 bpm (critical)
        break
      case 'fetal-arrhythmia':
        maternalHR = 75
        fetalHR = 140
        fetalArrhythmia = true
        break
      case 'maternal-bradycardia':
        maternalHR = 45 // < 50 bpm (critical)
        fetalHR = 140
        break
      case 'maternal-tachycardia':
        maternalHR = 125 // > 120 bpm (critical)
        fetalHR = 140
        break
      case 'maternal-arrhythmia':
        maternalHR = 75
        fetalHR = 140
        maternalArrhythmia = true
        break
    }

    // Generate maternal EKG
    const motherSignal = generateQRS(t, maternalHR, 1.0, maternalArrhythmia)

    // Generate fetal EKG
    const fetusSignal = generateQRS(t, fetalHR, 0.25, fetalArrhythmia)

    // Combined signal
    const combinedSignal = motherSignal + fetusSignal

    // Add noise
    const noise = (Math.random() - 0.5) * 0.1
    const mother = motherSignal + noise
    const fetus = fetusSignal + noise * 0.5
    const combined = combinedSignal + noise

    timeRef.current += dt

    return { mother, combined, fetus }
  }

  const reset = () => {
    timeRef.current = 0
  }

  return { getSample, reset }
}
