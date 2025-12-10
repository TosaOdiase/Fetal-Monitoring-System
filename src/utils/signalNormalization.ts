/**
 * Signal Normalization Utility
 * 
 * Normalizes Arduino ADC values (0-1023) to display range
 * and converts to voltage for consistent display
 */

/**
 * Normalize Arduino ADC value (0-1023) to display range (0-1)
 * Preserves signal characteristics while scaling for visualization
 */
export function normalizeArduinoSignal(adcValue: number, adcMax: number = 1023): number {
  // Clamp to valid range
  const clamped = Math.max(0, Math.min(adcMax, adcValue))
  
  // Normalize to 0-1 range
  return clamped / adcMax
}

/**
 * Normalize signal array to 0-1 range while preserving characteristics
 * Removes DC offset and scales based on signal range
 */
export function normalizeSignalArray(signal: number[]): number[] {
  if (signal.length === 0) return signal
  
  // Remove DC offset
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length
  const centered = signal.map(v => v - mean)
  
  // Find signal range
  const max = Math.max(...centered.map(Math.abs))
  
  if (max === 0) return centered
  
  // Scale to reasonable range (preserve relative amplitudes)
  const scaleFactor = 1.0 / (max * 1.5) // Leave some headroom
  return centered.map(v => v * scaleFactor)
}

/**
 * Convert ADC value to voltage and normalize for display
 */
export function normalizeArduinoToDisplay(adcValue: number, adcMax: number = 1023, refVoltage: number = 5.0): number {
  // Convert to voltage
  const voltage = (adcValue / adcMax) * refVoltage
  
  // Normalize voltage to display range (assuming 0-5V maps to 0-1 display range)
  // This can be adjusted based on your display requirements
  return voltage / refVoltage
}

