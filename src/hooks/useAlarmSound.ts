import { useEffect, useRef } from 'react'

export function useAlarmSound(isActive: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('AudioContext initialized:', audioContextRef.current.state)
      } catch (error) {
        console.error('Failed to create AudioContext:', error)
      }
    }
  }

  useEffect(() => {
    const playAlarmSound = async () => {
      // Initialize context if needed
      initAudioContext()

      if (!audioContextRef.current) {
        console.error('AudioContext not available')
        return
      }

      const ctx = audioContextRef.current

      // Resume context if suspended (required by browser autoplay policies)
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume()
          console.log('AudioContext resumed')
        } catch (error) {
          console.error('Failed to resume AudioContext:', error)
          return
        }
      }

      // Stop any existing oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
        oscillatorRef.current.disconnect()
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect()
      }

      // Create oscillator for the alarm sound
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      // Configure alarm sound - alternating high-pitched beeps
      oscillator.type = 'square' // Square wave for harsh, attention-grabbing sound
      oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5 note - high pitched

      // Set up volume with envelope for beep effect - MUCH LOUDER
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.01) // Quick attack - LOUDER
      gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.15) // Hold - LOUDER
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2) // Quick release

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Play the sound
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.2)

      oscillatorRef.current = oscillator
      gainNodeRef.current = gainNode

      // Add frequency modulation for the second beep in the pattern
      setTimeout(() => {
        if (!audioContextRef.current) return

        const ctx = audioContextRef.current
        const oscillator2 = ctx.createOscillator()
        const gainNode2 = ctx.createGain()

        oscillator2.type = 'square'
        oscillator2.frequency.setValueAtTime(1108, ctx.currentTime) // C#6 note - even higher

        gainNode2.gain.setValueAtTime(0, ctx.currentTime)
        gainNode2.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.01) // LOUDER
        gainNode2.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.15) // LOUDER
        gainNode2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)

        oscillator2.connect(gainNode2)
        gainNode2.connect(ctx.destination)

        oscillator2.start(ctx.currentTime)
        oscillator2.stop(ctx.currentTime + 0.2)
      }, 250) // Second beep after 250ms
    }

    if (isActive) {
      // Play initial alarm immediately
      playAlarmSound()

      // Then repeat every 600ms (creates a rapid beep-beep pattern)
      intervalRef.current = setInterval(playAlarmSound, 600)
    } else {
      // Stop alarm when not active - IMMEDIATELY
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Immediately silence any playing oscillators
      if (audioContextRef.current && gainNodeRef.current) {
        try {
          const ctx = audioContextRef.current
          // Immediately ramp down the volume to silence
          gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime)
          gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime)
          gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.01)
        } catch (e) {
          // Ignore if gain node is already disconnected
        }
      }

      // Stop and disconnect oscillators
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop()
          oscillatorRef.current.disconnect()
        } catch (e) {
          // Oscillator may already be stopped
        }
        oscillatorRef.current = null
      }
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect()
        } catch (e) {
          // Already disconnected
        }
        gainNodeRef.current = null
      }
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop()
          oscillatorRef.current.disconnect()
        } catch (e) {
          // Ignore - oscillator may already be stopped
        }
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect()
      }
    }
  }, [isActive])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])
}
