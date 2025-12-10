import { useEffect, useRef } from 'react'

/**
 * useHeartbeatBeep Hook
 *
 * Plays a beep sound on each detected heartbeat (QRS complex)
 * Similar to hospital cardiac monitors
 */

interface UseHeartbeatBeepOptions {
  enabled: boolean
  heartRate: number
  type: 'maternal' | 'fetal'
}

export function useHeartbeatBeep({ enabled, heartRate, type }: UseHeartbeatBeepOptions) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastBeepTimeRef = useRef<number>(0)
  const scheduledBeepRef = useRef<number | null>(null)

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.error('Failed to create AudioContext for heartbeat beep:', error)
      }
    }
  }

  const playBeep = async () => {
    initAudioContext()

    if (!audioContextRef.current) {
      return
    }

    const ctx = audioContextRef.current

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch (error) {
        console.error('Failed to resume AudioContext:', error)
        return
      }
    }

    // Create oscillator for the beep
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Different pitch for maternal vs fetal to distinguish them
    // Fetal: Higher pitch (like baby's higher voice)
    // Maternal: Lower pitch
    const frequency = type === 'fetal' ? 880 : 660 // A5 for fetal, E5 for maternal

    oscillator.type = 'sine' // Smooth sine wave for pleasant beep
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    // Create a short, gentle beep envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005) // Quick attack
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.03) // Hold
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06) // Quick release

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Play the sound
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.06)

    lastBeepTimeRef.current = performance.now()
  }

  useEffect(() => {
    if (!enabled || heartRate <= 0) {
      // Clear any scheduled beeps
      if (scheduledBeepRef.current) {
        window.clearInterval(scheduledBeepRef.current)
        scheduledBeepRef.current = null
      }
      return
    }

    // Calculate interval between beeps based on heart rate
    // Heart rate is in BPM (beats per minute)
    // Convert to milliseconds between beats
    const beatsPerSecond = heartRate / 60
    const msPerBeat = 1000 / beatsPerSecond

    // Schedule beeps at the heart rate interval
    const scheduleBeep = () => {
      const now = performance.now()
      const timeSinceLastBeep = now - lastBeepTimeRef.current

      // Only play if enough time has passed
      if (timeSinceLastBeep >= msPerBeat * 0.9) {
        playBeep()
      }
    }

    // Initial beep
    playBeep()

    // Schedule subsequent beeps
    scheduledBeepRef.current = window.setInterval(scheduleBeep, msPerBeat)

    return () => {
      if (scheduledBeepRef.current) {
        window.clearInterval(scheduledBeepRef.current)
        scheduledBeepRef.current = null
      }
    }
  }, [enabled, heartRate, type])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])
}
