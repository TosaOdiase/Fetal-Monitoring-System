/**
 * useRealECGData Hook
 *
 * Loads and plays back real fetal and maternal ECG data from PhysioNet database
 * This provides authentic ECG signals for testing signal separation algorithms
 */

import { useState, useEffect, useRef } from 'react'

export interface ECGDataPoint {
  time: number
  mother: number
  combined: number
  fetus: number
}

export interface ECGMetadata {
  sampling_rate: number
  duration_seconds: number
  num_samples: number
  maternal_hr: number
  fetal_hr: number
  snr_db: number
  fetal_scale: number
  source: string
  description: string
}

interface UseRealECGDataOptions {
  autoLoop?: boolean  // Whether to loop the data when it ends
  playbackSpeed?: number  // Speed multiplier (1.0 = realtime, 2.0 = 2x speed)
}

export function useRealECGData(options: UseRealECGDataOptions = {}) {
  const { autoLoop = true, playbackSpeed = 1.0 } = options

  const [data, setData] = useState<ECGDataPoint[]>([])
  const [metadata, setMetadata] = useState<ECGMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const dataRef = useRef<ECGDataPoint[]>([])
  const currentIndexRef = useRef(0)

  // Load the ECG data (use sample for faster loading, or full for complete dataset)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Load the sample data (10 seconds) for quick loading
        // Change to 'ecg_data_full.json' for full 5-minute dataset
        const response = await fetch('/web_data/ecg_data_sample.json')

        if (!response.ok) {
          throw new Error(`Failed to load ECG data: ${response.statusText}`)
        }

        const jsonData = await response.json()

        setData(jsonData.data)
        setMetadata(jsonData.metadata)
        dataRef.current = jsonData.data
        currentIndexRef.current = 0
        setIsLoaded(true)

        console.log('Real ECG data loaded:', {
          samples: jsonData.data.length,
          duration: jsonData.metadata.duration_seconds,
          maternalHR: jsonData.metadata.maternal_hr,
          fetalHR: jsonData.metadata.fetal_hr
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading ECG data'
        setError(errorMessage)
        console.error('Error loading real ECG data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Get the next sample from the loaded data
  const getSample = (): ECGDataPoint => {
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

    // Advance to next sample
    currentIndexRef.current++

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
