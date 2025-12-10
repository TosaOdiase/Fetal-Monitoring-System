/**
 * useRawSignals Hook
 *
 * Loads and plays back raw signal files (01-08) from RAF files
 * These are the actual processed signals from the signalAddition.py script
 */

import { useState, useEffect, useRef } from 'react'
import { EKGDataPoint } from '../App'

export type RawSignalId = 
  | 'signal01'
  | 'signal02'
  | 'signal03'
  | 'signal04'
  | 'signal05'
  | 'signal06'
  | 'signal07'
  | 'signal08'

export interface RawSignalMetadata {
  signal_id: RawSignalId
  name: string
  description: string
  sampling_rate: number
  duration_seconds: number
  num_samples: number
  has_fetal: boolean
  has_maternal: boolean
  snr: string
  channel: string
  source: string
}

interface UseRawSignalsOptions {
  signalId: RawSignalId
  autoLoop?: boolean
  playbackSpeed?: number
}

export function useRawSignals(options: UseRawSignalsOptions) {
  const { signalId, autoLoop = true, playbackSpeed = 1.0 } = options

  const [data, setData] = useState<EKGDataPoint[]>([])
  const [metadata, setMetadata] = useState<RawSignalMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const dataRef = useRef<EKGDataPoint[]>([])
  const currentIndexRef = useRef(0)

  // Load the signal data when signalId changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      setIsLoaded(false)

      try {
        const response = await fetch(`/raw_signals/${signalId}.json`)

        if (!response.ok) {
          throw new Error(`Failed to load signal data: ${response.statusText}`)
        }

        const jsonData = await response.json()

        // Convert to EKGDataPoint format
        const ekgData: EKGDataPoint[] = jsonData.data.map((point: any) => ({
          time: point.time,
          mother: point.mother,
          combined: point.combined,
          fetus: point.fetus
        }))

        setData(ekgData)
        setMetadata(jsonData.metadata)
        dataRef.current = ekgData
        currentIndexRef.current = 0
        setIsLoaded(true)

        console.log('Raw signal loaded:', {
          signalId,
          samples: ekgData.length,
          duration: jsonData.metadata.duration_seconds,
          description: jsonData.metadata.description
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading signal data'
        setError(errorMessage)
        console.error('Error loading raw signal:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [signalId])

  // Get the next sample from the loaded data
  const getSample = (): EKGDataPoint => {
    if (!isLoaded || dataRef.current.length === 0) {
      // Return zero data if not loaded
      return {
        time: 0,
        mother: 0,
        combined: 0,
        fetus: 0
      }
    }

    const sample = dataRef.current[currentIndexRef.current]

    // Advance to next sample (accounting for playback speed)
    const step = Math.max(1, Math.floor(playbackSpeed))
    currentIndexRef.current += step

    // Handle end of data
    if (currentIndexRef.current >= dataRef.current.length) {
      if (autoLoop) {
        currentIndexRef.current = 0  // Loop back to start
      } else {
        currentIndexRef.current = dataRef.current.length - 1  // Stay at last sample
      }
    }

    return sample
  }

  // Reset playback to beginning
  const reset = () => {
    currentIndexRef.current = 0
  }

  // Get current playback position
  const getCurrentPosition = () => {
    return {
      index: currentIndexRef.current,
      time: isLoaded && dataRef.current[currentIndexRef.current]
        ? dataRef.current[currentIndexRef.current].time
        : 0,
      progress: isLoaded && dataRef.current.length > 0
        ? currentIndexRef.current / dataRef.current.length
        : 0
    }
  }

  return {
    getSample,
    reset,
    getCurrentPosition,
    metadata,
    isLoading,
    isLoaded,
    error,
    totalSamples: data.length
  }
}

