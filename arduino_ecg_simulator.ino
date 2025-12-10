/**
 * Arduino ECG Simulator for Web App Testing
 *
 * This sketch generates simulated ECG signals and sends them to the
 * fetal ECG monitoring web application via serial connection.
 *
 * Features:
 * - Maternal ECG: ~88 bpm (normal adult heart rate)
 * - Fetal ECG: ~160 bpm (normal fetal heart rate)
 * - Combined signal: maternal + fetal + noise
 * - 250 Hz sampling rate (medical standard)
 * - Web Serial API compatible
 *
 * Upload this to your Arduino to test the web app connection!
 */

// Serial configuration (must match web app)
const long BAUD_RATE = 115200;
const int SAMPLE_RATE_HZ = 250;
const int SAMPLE_INTERVAL_MS = 4;  // 1000ms / 250Hz = 4ms

// Timing
unsigned long lastSampleTime = 0;
float timeSeconds = 0.0;

// Waveform parameters
const float MATERNAL_HR = 88.0;      // beats per minute
const float FETAL_HR = 160.0;        // beats per minute
const float MATERNAL_FREQ = MATERNAL_HR / 60.0;  // Hz
const float FETAL_FREQ = FETAL_HR / 60.0;        // Hz

// Baseline values (centered at Arduino's mid-range)
const int BASELINE = 512;

void setup() {
  // Initialize serial communication
  Serial.begin(BAUD_RATE);

  // Wait for serial port to connect
  while (!Serial) {
    delay(10);
  }

  // Startup message
  Serial.println("# Arduino ECG Simulator Ready");
  Serial.println("# Maternal HR: 88 bpm");
  Serial.println("# Fetal HR: 160 bpm");
  Serial.println("# Sample Rate: 250 Hz");
  Serial.println("# Format: A0:maternal,A1:combined,A2:fetal");
  Serial.println("# Starting data transmission...");

  // Initialize timing
  lastSampleTime = millis();
  timeSeconds = 0.0;
}

void loop() {
  unsigned long currentTime = millis();

  // Send data at exactly 250 Hz (every 4ms)
  if (currentTime - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = currentTime;

    // Generate maternal ECG waveform
    int maternal = generateMaternalECG(timeSeconds);

    // Generate fetal ECG waveform (smaller amplitude)
    int fetal = generateFetalECG(timeSeconds);

    // Generate combined signal (maternal + fetal + noise)
    int combined = generateCombinedSignal(maternal, fetal);

    // Send data to web app
    // Format: A0:value,A1:value,A2:value
    Serial.print("A0:");
    Serial.print(maternal);
    Serial.print(",A1:");
    Serial.print(combined);
    Serial.print(",A2:");
    Serial.println(fetal);

    // Increment time
    timeSeconds += 0.004;  // 4ms = 0.004 seconds

    // Reset time after 60 seconds to prevent float overflow
    if (timeSeconds >= 60.0) {
      timeSeconds = 0.0;
    }
  }
}

/**
 * Generate realistic maternal ECG waveform
 * Based on typical adult ECG morphology
 */
int generateMaternalECG(float t) {
  float phase = fmod(t * MATERNAL_FREQ, 1.0);  // 0.0 to 1.0 per heartbeat

  int value = BASELINE;

  // P wave (atrial depolarization) - around phase 0.1
  if (phase >= 0.05 && phase < 0.15) {
    float pPhase = (phase - 0.05) / 0.1;
    value += 15 * sin(pPhase * PI);
  }

  // QRS complex (ventricular depolarization) - around phase 0.2-0.3
  if (phase >= 0.18 && phase < 0.32) {
    float qrsPhase = (phase - 0.18) / 0.14;

    // Q wave (small negative)
    if (qrsPhase < 0.2) {
      value -= 10 * sin(qrsPhase * 5 * PI);
    }
    // R wave (large positive)
    else if (qrsPhase < 0.6) {
      value += 120 * sin((qrsPhase - 0.2) * 2.5 * PI);
    }
    // S wave (negative)
    else {
      value -= 20 * sin((qrsPhase - 0.6) * 2.5 * PI);
    }
  }

  // T wave (ventricular repolarization) - around phase 0.45
  if (phase >= 0.38 && phase < 0.58) {
    float tPhase = (phase - 0.38) / 0.2;
    value += 25 * sin(tPhase * PI);
  }

  // Add small noise
  value += random(-3, 4);

  return constrain(value, 0, 1023);
}

/**
 * Generate realistic fetal ECG waveform
 * Similar morphology but faster rate and smaller amplitude
 */
int generateFetalECG(float t) {
  float phase = fmod(t * FETAL_FREQ, 1.0);  // 0.0 to 1.0 per heartbeat

  int value = BASELINE;

  // Simplified fetal ECG (less complex than maternal)
  // P wave
  if (phase >= 0.05 && phase < 0.15) {
    float pPhase = (phase - 0.05) / 0.1;
    value += 8 * sin(pPhase * PI);
  }

  // QRS complex (smaller than maternal)
  if (phase >= 0.18 && phase < 0.32) {
    float qrsPhase = (phase - 0.18) / 0.14;

    if (qrsPhase < 0.2) {
      value -= 5 * sin(qrsPhase * 5 * PI);
    }
    else if (qrsPhase < 0.6) {
      value += 35 * sin((qrsPhase - 0.2) * 2.5 * PI);  // 30% of maternal amplitude
    }
    else {
      value -= 8 * sin((qrsPhase - 0.6) * 2.5 * PI);
    }
  }

  // T wave
  if (phase >= 0.38 && phase < 0.58) {
    float tPhase = (phase - 0.38) / 0.2;
    value += 12 * sin(tPhase * PI);
  }

  // Add small noise
  value += random(-2, 3);

  return constrain(value, 0, 1023);
}

/**
 * Generate combined signal (maternal + fetal + noise)
 * This simulates the raw signal from a sensor on the mother's abdomen
 */
int generateCombinedSignal(int maternal, int fetal) {
  // Remove baseline from fetal to avoid doubling baseline
  int fetalComponent = (fetal - BASELINE);

  // Scale fetal component to 30% (realistic amplitude ratio)
  fetalComponent = fetalComponent * 0.3;

  // Combine signals
  int combined = maternal + fetalComponent;

  // Add realistic muscle artifact noise (~6dB SNR)
  int noise = random(-15, 16);
  combined += noise;

  // Add low-frequency drift (muscle artifact)
  float drift = 8 * sin(timeSeconds * 0.5);
  combined += (int)drift;

  return constrain(combined, 0, 1023);
}
