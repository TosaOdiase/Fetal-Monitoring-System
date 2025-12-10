/**
 * Data Storage Utility
 * 
 * Stores monitoring data in IndexedDB for persistence and Excel export
 */

import { EKGDataPoint } from '../App'

export interface MonitoringDataPoint {
  time: number
  maternalVoltage: number
  fetalVoltage: number
  combinedVoltage: number
  maternalBPM: number
  fetalBPM: number
  timestamp: number
}

const DB_NAME = 'FetalEKGMonitorDB'
const DB_VERSION = 1
const STORE_NAME = 'monitoringData'

let dbInstance: IDBDatabase | null = null

export async function initDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'timestamp', autoIncrement: true })
        objectStore.createIndex('time', 'time', { unique: false })
      }
    }
  })
}

export async function storeDataPoint(dataPoint: MonitoringDataPoint): Promise<void> {
  const db = await initDatabase()
  const transaction = db.transaction([STORE_NAME], 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  await store.add(dataPoint)
}

export async function getAllData(): Promise<MonitoringDataPoint[]> {
  const db = await initDatabase()
  const transaction = db.transaction([STORE_NAME], 'readonly')
  const store = transaction.objectStore(STORE_NAME)
  
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllData(): Promise<void> {
  const db = await initDatabase()
  const transaction = db.transaction([STORE_NAME], 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  
  return new Promise((resolve, reject) => {
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Calculate BPM from ECG signal using peak detection
 */
export function calculateBPM(signal: number[], samplingRate: number = 250): number {
  if (signal.length < 100) return 0

  // Find peaks (QRS complexes)
  const peaks: number[] = []
  const threshold = Math.max(...signal) * 0.5

  for (let i = 10; i < signal.length - 10; i++) {
    if (signal[i] > threshold &&
        signal[i] > signal[i - 1] &&
        signal[i] > signal[i + 1]) {
      // Check if it's a local maximum
      const isLocalMax = signal.slice(i - 10, i + 10).every((v, idx) =>
        idx === 10 || v <= signal[i]
      )
      if (isLocalMax) {
        peaks.push(i)
      }
    }
  }

  if (peaks.length < 2) return 0

  // Calculate average interval between peaks
  const intervals: number[] = []
  for (let i = 1; i < peaks.length; i++) {
    const interval = (peaks[i] - peaks[i - 1]) / samplingRate // Convert to seconds
    if (interval > 0.2 && interval < 2.0) { // Filter noise (30-300 BPM range)
      intervals.push(interval)
    }
  }

  if (intervals.length === 0) return 0

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const bpm = 60 / avgInterval

  return Math.round(bpm)
}

/**
 * Convert signal value to voltage
 * Handles both raw ADC values (0-1023) and normalized values (0-1)
 * If value is <= 1, assumes normalized; otherwise assumes raw ADC
 */
export function signalToVoltage(signalValue: number, adcMax: number = 1023, refVoltage: number = 5.0): number {
  // If value is normalized (0-1 range), convert directly to voltage
  if (signalValue <= 1.0 && signalValue >= 0.0) {
    return signalValue * refVoltage
  }
  // Otherwise, assume raw ADC value and convert
  return (signalValue / adcMax) * refVoltage
}

