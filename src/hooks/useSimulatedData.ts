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

export function useSimulatedData(
  condition: SimulationCondition = 'normal'
) {
  const timeRef = useRef(0)
  const dt = 1 / 250 // 250 Hz sampling rate

  // Arrhythmia tracking
  const lastBeatTimeRef = useRef({ maternal: 0, fetal: 0 })
  const irregularIntervalRef = useRef({ maternal: 1.0, fetal: 1.0 })

  // Heart rate variability
  const hrvPhaseRef = useRef({ maternal: 0, fetal: 0 })

  /**
   * Generate realistic PQRST complex for EKG waveform
   * Based on actual cardiac electrophysiology
   */
  const generatePQRST = (
    t: number,
    heartRate: number,
    amplitude: number,
    hasArrhythmia: boolean = false,
    beatType: 'maternal' | 'fetal' = 'maternal'
  ): number => {
    const freq = heartRate / 60 // Convert BPM to Hz
    const beatPeriod = 1 / freq

    // Handle arrhythmia: irregular R-R intervals
    if (hasArrhythmia) {
      const timeSinceLastBeat = t - lastBeatTimeRef.current[beatType]
      const expectedInterval = beatPeriod * irregularIntervalRef.current[beatType]

      if (timeSinceLastBeat >= expectedInterval) {
        lastBeatTimeRef.current[beatType] = t
        // Randomly vary next interval by ±30%
        irregularIntervalRef.current[beatType] = 0.7 + Math.random() * 0.6
      }

      // Calculate phase based on irregular intervals
      const phase = (timeSinceLastBeat / expectedInterval) % 1
      return generateComplexWaveform(phase, amplitude, beatType === 'fetal')
    }

    // Normal rhythm with heart rate variability (HRV)
    // Simulate respiratory sinus arrhythmia (RSA)
    hrvPhaseRef.current[beatType] += dt * 0.25 // Breathing rate ~15 breaths/min
    const hrvModulation = 1.0 + 0.05 * Math.sin(2 * Math.PI * hrvPhaseRef.current[beatType])
    const modulatedPeriod = beatPeriod / hrvModulation

    const phase = (t * freq * hrvModulation) % 1
    return generateComplexWaveform(phase, amplitude, beatType === 'fetal')
  }

  /**
   * Generate the actual PQRST waveform complex
   * P wave: Atrial depolarization (small, rounded)
   * Q wave: Initial ventricular depolarization (small negative)
   * R wave: Main ventricular depolarization (large positive spike)
   * S wave: Late ventricular depolarization (negative)
   * T wave: Ventricular repolarization (broad, positive)
   */
  const generateComplexWaveform = (phase: number, amplitude: number, isFetal: boolean): number => {
    let signal = 0

    // Fetal EKG has less defined P and T waves
    const pAmplitude = isFetal ? 0.05 : 0.15
    const tAmplitude = isFetal ? 0.15 : 0.30

    // P wave: 0.00 - 0.12 (atrial depolarization, ~80-100ms)
    if (phase >= 0.00 && phase < 0.12) {
      const pPhase = (phase - 0.00) / 0.12
      signal = pAmplitude * amplitude * Math.sin(pPhase * Math.PI)
    }
    // PR segment: 0.12 - 0.20 (isoelectric, AV node delay)
    else if (phase >= 0.12 && phase < 0.20) {
      signal = 0
    }
    // QRS complex: 0.20 - 0.30 (ventricular depolarization, ~80-100ms)
    else if (phase >= 0.20 && phase < 0.30) {
      const qrsPhase = (phase - 0.20) / 0.10

      // Q wave: small negative deflection
      if (qrsPhase < 0.15) {
        signal = -0.15 * amplitude * (qrsPhase / 0.15)
      }
      // R wave: large positive spike
      else if (qrsPhase < 0.50) {
        const rPhase = (qrsPhase - 0.15) / 0.35
        signal = amplitude * Math.sin(rPhase * Math.PI) * 1.2
      }
      // S wave: negative deflection
      else if (qrsPhase < 0.75) {
        const sPhase = (qrsPhase - 0.50) / 0.25
        signal = -0.25 * amplitude * Math.sin(sPhase * Math.PI)
      }
      // Return to baseline
      else {
        const returnPhase = (qrsPhase - 0.75) / 0.25
        signal = -0.25 * amplitude * (1 - returnPhase) * Math.sin(Math.PI)
      }
    }
    // ST segment: 0.30 - 0.42 (isoelectric, early repolarization)
    else if (phase >= 0.30 && phase < 0.42) {
      signal = 0
    }
    // T wave: 0.42 - 0.70 (ventricular repolarization, ~160-200ms)
    else if (phase >= 0.42 && phase < 0.70) {
      const tPhase = (phase - 0.42) / 0.28
      signal = tAmplitude * amplitude * Math.sin(tPhase * Math.PI)
    }
    // Rest period: 0.70 - 1.00 (diastole)
    else {
      signal = 0
    }

    return signal
  }

  /**
   * Add realistic physiological noise and artifacts
   */
  const addPhysiologicalNoise = (signal: number, t: number, baseNoiseLevel: number): number => {
    // Standard noise profile (good quality)
    const emgMultiplier = 0.5
    const baselineMultiplier = 0.4
    const powerLineMultiplier = 0.2
    const spikeMultiplier = 0.3
    const spikeProbability = 0.0005
    const signalAttenuation = 1.0

    // 1. High-frequency muscle noise (EMG artifact) - 40-150 Hz
    const emgNoise = (Math.random() - 0.5) * baseNoiseLevel * 0.3 * emgMultiplier

    // 2. Baseline wander (respiratory and body movement) - 0.15-0.3 Hz
    const baselineWander = Math.sin(2 * Math.PI * 0.2 * t) * baseNoiseLevel * 0.5 * baselineMultiplier
    const movementArtifact = Math.sin(2 * Math.PI * 0.15 * t) * baseNoiseLevel * 0.3 * baselineMultiplier

    // 3. 60 Hz power line interference
    const powerLineNoise = Math.sin(2 * Math.PI * 60 * t) * baseNoiseLevel * 0.1 * powerLineMultiplier

    // 4. Random spikes (motion artifacts)
    const spikeArtifact = Math.random() < spikeProbability
      ? (Math.random() - 0.5) * baseNoiseLevel * 2.0 * spikeMultiplier
      : 0

    // Apply signal attenuation and add noise
    return (signal * signalAttenuation) + emgNoise + baselineWander + movementArtifact + powerLineNoise + spikeArtifact
  }

  const getSample = (): SimulatedSample => {
    const t = timeRef.current

    // Define heart rates and conditions based on simulation condition
    let maternalHR = 75
    let fetalHR = 140
    let maternalArrhythmia = false
    let fetalArrhythmia = false
    let maternalAmplitude = 1.0
    let fetalAmplitude = 0.3 // Fetal signals are weaker
    let noiseLevel = 0.05
    let useLoopedTime = false
    let loopedTime = t

    switch (condition) {
      case 'normal':
        // Normal pregnancy: maternal 60-100 bpm, fetal 120-160 bpm
        // Ideal signal conditions for development/demonstration
        // Loop a perfect 10-second sequence to prevent alarm triggers
        maternalHR = 75 // Stable maternal heart rate
        fetalHR = 140 // Stable fetal heart rate
        maternalAmplitude = 1.0 // Clear maternal signal
        fetalAmplitude = 0.4 // Strong, clear fetal signal
        noiseLevel = 0.02 // Minimal noise for ideal signal quality
        useLoopedTime = true
        loopedTime = t % 10.0 // Loop every 10 seconds
        break

      case 'high-risk':
        // High-risk: fetal bradycardia (borderline), increased noise
        maternalHR = 78 + Math.sin(t * 0.1) * 4
        fetalHR = 115 + Math.sin(t * 0.2) * 3 // Near critical threshold
        fetalAmplitude = 0.25 // Weaker fetal signal
        noiseLevel = 0.08 // More noise/artifacts
        break

      case 'fetal-bradycardia':
        // Critical: fetal HR < 110 bpm
        maternalHR = 75 + Math.sin(t * 0.1) * 2
        fetalHR = 95 + Math.sin(t * 0.25) * 4 // Unstable low HR
        fetalAmplitude = 0.22 // Weakened signal
        noiseLevel = 0.10 // Higher noise
        break

      case 'fetal-tachycardia':
        // Critical: fetal HR > 180 bpm
        maternalHR = 75 + Math.sin(t * 0.1) * 2
        fetalHR = 195 + Math.sin(t * 0.3) * 8 // Rapid, unstable
        fetalAmplitude = 0.35 // Stronger during tachycardia
        noiseLevel = 0.09
        break

      case 'fetal-arrhythmia':
        // Irregular fetal rhythm
        maternalHR = 75 + Math.sin(t * 0.1) * 2
        fetalHR = 140
        fetalArrhythmia = true
        fetalAmplitude = 0.28
        noiseLevel = 0.07
        break

      case 'maternal-bradycardia':
        // Critical: maternal HR < 50 bpm
        maternalHR = 42 + Math.sin(t * 0.12) * 3
        fetalHR = 145 + Math.sin(t * 0.15) * 5
        maternalAmplitude = 0.85 // Weaker maternal signal
        noiseLevel = 0.08
        break

      case 'maternal-tachycardia':
        // Critical: maternal HR > 120 bpm
        maternalHR = 128 + Math.sin(t * 0.2) * 5
        fetalHR = 145 + Math.sin(t * 0.15) * 5
        maternalAmplitude = 1.1 // Stronger during tachycardia
        noiseLevel = 0.09
        break

      case 'maternal-arrhythmia':
        // Irregular maternal rhythm (e.g., atrial fibrillation)
        maternalHR = 75
        fetalHR = 145 + Math.sin(t * 0.15) * 5
        maternalArrhythmia = true
        maternalAmplitude = 0.95
        noiseLevel = 0.07
        break
    }

    // Use looped time for normal mode to create perfect repeating sequence
    const signalTime = useLoopedTime ? loopedTime : t

    // Generate maternal EKG with realistic PQRST complex
    const motherSignal = generatePQRST(signalTime, maternalHR, maternalAmplitude, maternalArrhythmia, 'maternal')

    // Generate fetal EKG (less defined P and T waves, faster rate)
    const fetusSignal = generatePQRST(signalTime, fetalHR, fetalAmplitude, fetalArrhythmia, 'fetal')

    // Combined signal (what would be measured on mother's abdomen)
    // Fetal signal is attenuated in combined signal
    const combinedSignal = motherSignal + fetusSignal * 0.85

    // Add realistic physiological noise
    const mother = addPhysiologicalNoise(motherSignal, signalTime, noiseLevel)
    const fetus = addPhysiologicalNoise(fetusSignal, signalTime, noiseLevel * 0.6) // Less noise on isolated fetal
    const combined = addPhysiologicalNoise(combinedSignal, signalTime, noiseLevel * 1.2) // More noise on combined

    timeRef.current += dt

    return { mother, combined, fetus }
  }

  const reset = () => {
    timeRef.current = 0
    lastBeatTimeRef.current = { maternal: 0, fetal: 0 }
    irregularIntervalRef.current = { maternal: 1.0, fetal: 1.0 }
    hrvPhaseRef.current = { maternal: 0, fetal: 0 }
  }

  return { getSample, reset }
}
