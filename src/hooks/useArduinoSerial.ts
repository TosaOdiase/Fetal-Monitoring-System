import { useState, useRef, useCallback } from 'react'

export type SignalType = 'maternal' | 'fetal' | 'combined' | 'none'

export interface SignalMapping {
  channel1: SignalType  // Maps Arduino channel 1 (A0)
  channel2: SignalType  // Maps Arduino channel 2 (A1)
  channel3: SignalType  // Maps Arduino channel 3 (A2)
}

interface ArduinoData {
  mother: number
  combined: number
  fetus: number
}

interface RawArduinoData {
  channel1?: number
  channel2?: number
  channel3?: number
}

interface UseArduinoSerialOptions {
  onUnsupportedBrowser?: () => void
  onConnectionError?: () => void
  signalMapping?: SignalMapping
}

export function useArduinoSerial(options?: UseArduinoSerialOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [latestData, setLatestData] = useState<ArduinoData | null>(null)
  const [rawData, setRawData] = useState<RawArduinoData | null>(null)

  const portRef = useRef<SerialPort | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const bufferRef = useRef<string>('')

  // Helper function to map raw Arduino data to signal types
  const mapRawDataToSignals = useCallback((raw: RawArduinoData): ArduinoData => {
    const mapping = options?.signalMapping || {
      channel1: 'maternal',
      channel2: 'combined',
      channel3: 'fetal'
    }

    const result: ArduinoData = {
      mother: 0,
      combined: 0,
      fetus: 0
    }

    // Map channel1
    if (raw.channel1 !== undefined) {
      if (mapping.channel1 === 'maternal') result.mother = raw.channel1
      else if (mapping.channel1 === 'fetal') result.fetus = raw.channel1
      else if (mapping.channel1 === 'combined') result.combined = raw.channel1
    }

    // Map channel2
    if (raw.channel2 !== undefined) {
      if (mapping.channel2 === 'maternal') result.mother = raw.channel2
      else if (mapping.channel2 === 'fetal') result.fetus = raw.channel2
      else if (mapping.channel2 === 'combined') result.combined = raw.channel2
    }

    // Map channel3
    if (raw.channel3 !== undefined) {
      if (mapping.channel3 === 'maternal') result.mother = raw.channel3
      else if (mapping.channel3 === 'fetal') result.fetus = raw.channel3
      else if (mapping.channel3 === 'combined') result.combined = raw.channel3
    }

    return result
  }, [options?.signalMapping])

  const connect = useCallback(async () => {
    try {
      // Check if Web Serial API is available
      if (!('serial' in navigator)) {
        options?.onUnsupportedBrowser?.()
        return false
      }

      // Request serial port
      const port = await (navigator as any).serial.requestPort()
      await port.open({ baudRate: 115200 })

      portRef.current = port
      setIsConnected(true)

      // Start reading data
      const reader = port.readable.getReader()
      readerRef.current = reader

      // Read loop
      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break

            // Convert Uint8Array to string
            const text = new TextDecoder().decode(value)
            bufferRef.current += text

            // Process complete lines
            const lines = bufferRef.current.split('\n')
            bufferRef.current = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || trimmed.startsWith('#')) continue // Skip empty lines and comments

              try {
                // Support three formats:
                // 1. Simple single value: "2.45" (just a voltage number)
                // 2. Legacy: "M:1.23,C:1.45,F:0.34" (direct mapping)
                // 3. Channel-based: "A0:1.23,A1:1.45,A2:0.34" (flexible mapping)

                // Check if it's a simple single number (no colons or commas)
                if (!trimmed.includes(':') && !trimmed.includes(',')) {
                  const numValue = parseFloat(trimmed)
                  if (!isNaN(numValue)) {
                    // Single value format - assume it's the fetal signal from A2
                    setLatestData({
                      mother: 0,
                      combined: 0,
                      fetus: numValue
                    })
                    continue
                  }
                }

                const parts = trimmed.split(',')
                const raw: RawArduinoData = {}
                let isLegacyFormat = false

                for (const part of parts) {
                  const [key, value] = part.split(':')
                  const numValue = parseFloat(value)

                  // Check for legacy format
                  if (key === 'M' || key === 'C' || key === 'F') {
                    isLegacyFormat = true
                    break
                  }

                  // Parse channel-based format
                  if (key === 'A0' || key === 'CH1' || key === '1') raw.channel1 = numValue
                  else if (key === 'A1' || key === 'CH2' || key === '2') raw.channel2 = numValue
                  else if (key === 'A2' || key === 'CH3' || key === '3') raw.channel3 = numValue
                }

                if (isLegacyFormat) {
                  // Use legacy parsing
                  const data: Partial<ArduinoData> = {}
                  for (const part of parts) {
                    const [key, value] = part.split(':')
                    const numValue = parseFloat(value)

                    if (key === 'M') data.mother = numValue
                    else if (key === 'C') data.combined = numValue
                    else if (key === 'F') data.fetus = numValue
                  }

                  if (data.mother !== undefined &&
                      data.combined !== undefined &&
                      data.fetus !== undefined) {
                    setLatestData(data as ArduinoData)
                  }
                } else {
                  // Use new channel-based mapping
                  setRawData(raw)
                  const mappedData = mapRawDataToSignals(raw)
                  setLatestData(mappedData)
                }
              } catch (e) {
                console.warn('Failed to parse Arduino data:', trimmed)
              }
            }
          }
        } catch (error) {
          console.error('Serial read error:', error)
        }
      }

      readLoop()
      return true

    } catch (error) {
      console.error('Failed to connect to Arduino:', error)
      options?.onConnectionError?.()
      return false
    }
  }, [options])

  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel()
        readerRef.current = null
      }

      if (portRef.current) {
        await portRef.current.close()
        portRef.current = null
      }

      setIsConnected(false)
      setLatestData(null)
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }, [])

  return {
    isConnected,
    latestData,
    rawData,
    connect,
    disconnect
  }
}
