/**
 * useRawSignals Hook
 *
 * Loads and plays back raw signal files (01-08) from RAF files
 * Supports signal pair subtraction to extract fetal ECG:
 * - Combined signal (fecg + mecg) - Maternal signal (mecg) = Fetal signal (fecg)
 */

import { useState, useEffect, useRef } from 'react'
import { EKGDataPoint } from '../App'

export type RawSignalPair = 
  | 'pair01'  // Signal 9-10: sub01 c0 snr06
  | 'pair02'  // Signal 3-4: c1 snr06
  | 'pair03'  // Signal 5-6: c1 snr00
  | 'pair04'  // Signal 7-8: c1 snr12
  | 'pair06'  // Fetal Bradycardia alarm

export interface RawSignalMetadata {
  signal_pair: RawSignalPair
  name: string
  description: string
  sampling_rate: number
  duration_seconds: number
  num_samples: number
  snr: string
  channel: string
  source: string
}

interface UseRawSignalsOptions {
  signalPair: RawSignalPair
  autoLoop?: boolean
  playbackSpeed?: number
}

// Signal pair definitions
const SIGNAL_PAIRS: Record<RawSignalPair, { combined: string, maternal: string, name: string, description: string, snr: string, channel: string }> = {
  'pair01': {
    combined: 'signal09',  // fecg + mecg (sub01 c0 snr06)
    maternal: 'signal10',  // mecg (sub01 c0 snr06)
    name: 'Pair 01',
    description: 'sub01 c0 snr06 - Extract fetal via subtraction',
    snr: '06dB',
    channel: 'c0'
  },
  'pair02': {
    combined: 'signal03',  // fecg + mecg (c1 snr06)
    maternal: 'signal04',  // mecg (c1 snr06)
    name: 'Pair 02',
    description: 'c1 snr06 - Extract fetal via subtraction',
    snr: '06dB',
    channel: 'c1'
  },
  'pair03': {
    combined: 'signal05',  // fecg + mecg (c1 snr00)
    maternal: 'signal06',  // mecg (c1 snr00)
    name: 'Pair 03',
    description: 'c1 snr00 - Extract fetal via subtraction (high noise)',
    snr: '00dB',
    channel: 'c1'
  },
  'pair04': {
    combined: 'signal07',  // fecg + mecg (c1 snr12)
    maternal: 'signal08',  // mecg (c1 snr12)
    name: 'Pair 04',
    description: 'c1 snr12 - Extract fetal via subtraction (low noise)',
    snr: '12dB',
    channel: 'c1'
  },
  'pair06': {
    combined: 'signal01',  // fecg + mecg (using signal01 for bradycardia demo)
    maternal: 'signal02',  // mecg (using signal02 for bradycardia demo)
    name: 'Fetal B...',
    description: 'Fetal Bradycardia - Alarm condition',
    snr: '06dB',
    channel: 'c0'
  }
}

export function useRawSignals(options: UseRawSignalsOptions) {
  const { signalPair, autoLoop = true, playbackSpeed = 1.0 } = options

  const [data, setData] = useState<EKGDataPoint[]>([])
  const [metadata, setMetadata] = useState<RawSignalMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const dataRef = useRef<EKGDataPoint[]>([])
  const currentIndexRef = useRef(0)

  // Load the signal pair data when signalPair changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      setIsLoaded(false)

      try {
        const pairInfo = SIGNAL_PAIRS[signalPair]
        
        // Load both signals
        const [combinedResponse, maternalResponse] = await Promise.all([
          fetch(`/raw_signals/${pairInfo.combined}.json`),
          fetch(`/raw_signals/${pairInfo.maternal}.json`)
        ])

        if (!combinedResponse.ok || !maternalResponse.ok) {
          throw new Error(`Failed to load signal data: ${combinedResponse.statusText || maternalResponse.statusText}`)
        }

        const combinedData = await combinedResponse.json()
        const maternalData = await maternalResponse.json()

        // Extract fetal signal via subtraction: fecg = (fecg + mecg) - mecg
        const minLength = Math.min(
          combinedData.data.length,
          maternalData.data.length
        )

        const ekgData: EKGDataPoint[] = []
        
        for (let i = 0; i < minLength; i++) {
          const combinedPoint = combinedData.data[i]
          const maternalPoint = maternalData.data[i]
          
          // Perform subtraction: fetal = combined - maternal
          const fetalValue = combinedPoint.combined - maternalPoint.mother
          
          ekgData.push({
            time: combinedPoint.time,
            mother: maternalPoint.mother,  // Maternal signal
            combined: combinedPoint.combined,  // Combined signal (fecg + mecg)
            fetus: fetalValue  // Extracted fetal signal
          })
        }

        setData(ekgData)
        setMetadata({
          signal_pair: signalPair,
          name: pairInfo.name,
          description: pairInfo.description,
          sampling_rate: combinedData.metadata.sampling_rate,
          duration_seconds: combinedData.metadata.duration_seconds,
          num_samples: minLength,
          snr: pairInfo.snr,
          channel: pairInfo.channel,
          source: 'WFDB files (subtraction processing)'
        })
        dataRef.current = ekgData
        currentIndexRef.current = 0
        setIsLoaded(true)

        console.log('Raw signal pair loaded:', {
          signalPair,
          samples: ekgData.length,
          duration: combinedData.metadata.duration_seconds,
          description: pairInfo.description,
          'fetal_extracted': true
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading signal data'
        setError(errorMessage)
        console.error('Error loading raw signal pair:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [signalPair])

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
