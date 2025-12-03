import { useState, useRef, useCallback } from 'react'

interface ArduinoData {
  mother: number
  combined: number
  fetus: number
}

export function useArduinoSerial() {
  const [isConnected, setIsConnected] = useState(false)
  const [latestData, setLatestData] = useState<ArduinoData | null>(null)

  const portRef = useRef<SerialPort | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const bufferRef = useRef<string>('')

  const connect = useCallback(async () => {
    try {
      // Check if Web Serial API is available
      if (!('serial' in navigator)) {
        alert('Web Serial API not supported. Use Chrome, Edge, or Opera.')
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
              if (!trimmed) continue

              try {
                // Expected format: "M:1.23,C:1.45,F:0.34"
                const parts = trimmed.split(',')
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
      alert('Failed to connect to Arduino. Make sure it is plugged in.')
      return false
    }
  }, [])

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
    connect,
    disconnect
  }
}
