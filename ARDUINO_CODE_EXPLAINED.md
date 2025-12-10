# Arduino Code Explanations

This document explains each Arduino program in simple terms. Each code serves a different purpose for monitoring fetal heart activity.

---

## Overview of All Arduino Codes

| Code | Purpose | When to Use |
|------|---------|-------------|
| **Simple Fetal EKG** | Reads one sensor signal | Testing basic sensor connection |
| **Fetal with Noise** | Reads fetal signal + noise separately | Studying noise effects on fetal monitoring |
| **Combined EKG** | Reads mother + baby + noise | Realistic scenario with both hearts |
| **ECG Simulator** | Generates fake heart signals | Testing without real sensors |

---

## 1. Simple Fetal EKG Monitor

**File:** `arduino/fetal_ekg_arduino/fetal_ekg_arduino.ino`

### What It Does
- Reads ONE sensor connected to pin A2
- Converts the reading to voltage
- Sends voltage values to your computer
- Very simple, just reads raw data

### How It Works
```
Sensor (Pin A2) → Arduino reads value → Converts to voltage → Sends to computer
```

### What It Sends
Just a single number per line:
```
2.45
2.47
2.43
```

### When to Use This
- Testing if your sensor is working
- Learning how to read Arduino data
- Checking electrode connections
- Very basic setup with one sensor

### Hardware Setup
```
Sensor Output → Pin A2
Sensor Ground → Arduino GND
```

### Key Settings
- **Sampling Rate:** 250 Hz (250 readings per second)
- **Voltage Range:** 0-5V (standard Arduino)
- **Baud Rate:** 115200 (how fast data is sent)

---

## 2. Single Fetal EKG with Noise

**File:** `arduino/single_fetal_ekg_with_noise/single_fetal_ekg_with_noise.ino`

### What It Does
- Reads TWO sensors: fetal heart + noise
- Combines them to simulate real-world conditions
- Sends three values: mother (0), combined, and fetal
- Removes DC offset (calibrates automatically)

### How It Works
```
Fetal Sensor (A0) → Read fetal signal
Noise Sensor (A1) → Read noise signal
Arduino → Combines them → Sends to computer
```

### What It Sends
Data format: `M:0.00,C:1.23,F:1.45`
- **M:** Mother signal (always 0 in this mode)
- **C:** Combined = Fetal + 30% Noise
- **F:** Pure fetal signal

### When to Use This
- Studying how noise affects fetal heart monitoring
- Testing noise reduction algorithms
- Simulating real-world noisy conditions
- Research on signal processing

### Hardware Setup
```
Fetal EKG Sensor → Pin A0
Noise Sensor     → Pin A1
All Grounds      → Arduino GND
```

### Key Features
- **Auto-calibration:** Removes DC offset on startup
- **Noise mixing:** Adds 30% noise to combined signal (adjustable)
- **Dual signal output:** Clean fetal + noisy combined
- **Sampling Rate:** 250 Hz

### Adjustable Settings
```cpp
NOISE_MIX_RATIO = 0.3  // 30% noise (change to 0.0-1.0)
FETAL_SCALE = 1.0      // Adjust if signal too small/large
```

---

## 3. Combined Maternal & Fetal EKG with Noise

**File:** `arduino/combined_ekg_with_noise/combined_ekg_with_noise.ino`

### What It Does
- Reads THREE sensors: maternal, fetal, and noise
- Creates realistic combined signal (what you'd measure on belly)
- Mimics real clinical monitoring scenario
- Most realistic simulation

### How It Works
```
Maternal Sensor (A0) → Mother's heart from chest
Fetal Sensor (A1)    → Baby's heart
Noise Sensor (A2)    → Environmental noise
                        ↓
Arduino combines them with realistic ratios
                        ↓
Sends: Mother, Combined (belly reading), Fetal
```

### What It Sends
Data format: `M:1.23,C:1.45,F:0.67`
- **M:** Mother's heart (clean, from chest)
- **C:** Combined = 70% Mother + 25% Fetal + 20% Noise
- **F:** Baby's heart (clean or processed)

### When to Use This
- Realistic fetal monitoring simulation
- Testing signal separation algorithms
- Demonstrating clinical scenario
- Training on maternal-fetal signal processing

### Hardware Setup
```
Maternal EKG (chest)     → Pin A0
Fetal EKG (abdominal)    → Pin A1
Noise Pickup             → Pin A2
All Grounds              → Arduino GND
```

### Why These Ratios?
- **70% Maternal:** Mother's heart is closer, stronger signal
- **25% Fetal:** Baby's signal is weaker (deep in body, attenuated)
- **20% Noise:** Realistic hospital noise level

### Key Features
- **Auto-calibration:** Removes DC offset from all 3 channels
- **Realistic mixing:** Mimics actual abdominal electrode reading
- **Triple output:** Mother, combined, and fetal signals
- **Sampling Rate:** 250 Hz (medical standard)

### Adjustable Settings
```cpp
MATERNAL_MIX = 0.70    // 70% mother in combined
FETAL_MIX = 0.25       // 25% fetal in combined
NOISE_MIX = 0.20       // 20% noise in combined
```

### Clinical Realism
This setup simulates what happens in real fetal monitoring:
- **Chest electrode (M):** Clean maternal EKG
- **Abdominal electrode (C):** Mixed signal with both hearts + noise
- **Extracted fetal (F):** What you get after signal processing

---

## 4. Arduino ECG Simulator

**File:** `fetal-ekg-monitor-web/arduino_ecg_simulator.ino`

### What It Does
- **NO SENSORS NEEDED!**
- Generates fake but realistic heart signals using math
- Creates mother's heart (88 bpm) and baby's heart (160 bpm)
- Perfect for testing without hardware

### How It Works
```
Arduino generates signals using sine waves
    ↓
Creates realistic EKG waveforms (P, QRS, T waves)
    ↓
Sends fake data that looks like real hearts
```

### What It Sends
Data format: `A0:512,A1:530,A2:515`
- **A0:** Simulated maternal EKG (88 bpm)
- **A1:** Simulated combined signal (both hearts + noise)
- **A2:** Simulated fetal EKG (160 bpm)

### When to Use This
- Testing web app without sensors
- Demonstrating the system to others
- Learning signal processing algorithms
- No EKG hardware available
- Presentations and demos

### Hardware Setup
**None! Just upload to Arduino and connect USB.**

### Signal Characteristics
- **Maternal HR:** 88 bpm (normal adult)
- **Fetal HR:** 160 bpm (normal fetal)
- **Realistic waveforms:** P, QRS, T waves included
- **Added noise:** Simulates real-world interference
- **Muscle artifact:** Low-frequency drift added

### Why It's Useful
- No need to wear electrodes
- Consistent, repeatable signals
- Perfect for software testing
- Great for classroom demonstrations
- Safe and simple

---

## Comparison Table

| Feature | Simple Fetal | Fetal + Noise | Combined | Simulator |
|---------|--------------|---------------|----------|-----------|
| **Sensors Needed** | 1 | 2 | 3 | 0 |
| **Pins Used** | A2 | A0, A1 | A0, A1, A2 | None |
| **Maternal Signal** | No | No | Yes | Yes |
| **Fetal Signal** | Yes | Yes | Yes | Yes |
| **Noise Input** | No | Yes | Yes | Yes (generated) |
| **Calibration** | No | Yes | Yes | No |
| **Realism** | Low | Medium | High | Medium |
| **Use Case** | Testing | Noise study | Clinical sim | No hardware |

---

## Common Features in All Codes

### 1. Sampling Rate
All codes sample at **250 Hz** (250 readings per second)
- This is medical standard for EKG monitoring
- Fast enough to capture heart details
- 4 milliseconds between samples

### 2. Serial Communication
All codes use **115200 baud rate**
- This is how fast data is sent to computer
- Web app expects this speed
- Must match in Arduino and web app

### 3. Data Format
Most codes send: `M:1.23,C:1.45,F:0.67`
- **M:** Maternal (mother)
- **C:** Combined (mixed signal)
- **F:** Fetal (baby)
- Numbers are in millivolts (mV)

### 4. Arduino Compatibility
All codes work with:
- Arduino Uno
- Arduino Nano
- Arduino Mega
- ESP32 (may need voltage adjustment)

---

## Which Code Should You Use?

### For Beginners
Start with: **Arduino ECG Simulator**
- No sensors needed
- Just upload and test
- See how the system works

### For Basic Testing
Use: **Simple Fetal EKG**
- Test one sensor connection
- Learn basic Arduino reading
- Check electrode placement

### For Noise Study
Use: **Fetal + Noise**
- Study noise effects
- Test filtering algorithms
- Two-sensor setup

### For Realistic Simulation
Use: **Combined EKG**
- Most realistic scenario
- Both mother and baby hearts
- Clinical-like conditions
- Three-sensor setup

---

## How to Upload Arduino Code

1. Open Arduino IDE
2. Go to **File → Open**
3. Select the .ino file you want
4. Connect Arduino via USB
5. Select **Tools → Board** → Your Arduino type
6. Select **Tools → Port** → Your USB port
7. Click **Upload** button (→)
8. Wait for "Done uploading" message

---

## Troubleshooting

### "No data appearing"
- Check baud rate is 115200
- Verify USB cable is connected
- Open Serial Monitor to see if data is sending

### "Signal is all zeros"
- Check sensor connections
- Verify electrodes are attached
- Try recalibrating (reset Arduino)

### "Signal too noisy"
- Reduce NOISE_MIX_RATIO
- Check electrode contact
- Minimize movement

### "Can't upload code"
- Check correct board selected
- Check correct port selected
- Try different USB cable
- Close Serial Monitor before uploading

---

## Technical Specifications

### Voltage Ranges
- **Standard Arduino:** 0-5V
- **ESP32:** 0-3.3V (adjust ADC_REF_VOLTAGE)

### ADC Resolution
- **10-bit:** 0-1023 (most Arduinos)
- **12-bit:** 0-4095 (ESP32, some advanced boards)

### Pin Types
- **Analog Pins (A0-A5):** Read sensors
- **Digital GND:** Common ground for all sensors

### Timing Precision
- Uses `micros()` for precise timing
- 4000 microseconds = 4ms = 250 Hz
- Maintains consistent sampling rate

---

## Summary

You have 4 Arduino codes, each for different purposes:

1. **Simple** - One sensor, basic testing
2. **Fetal + Noise** - Two sensors, noise studies
3. **Combined** - Three sensors, realistic clinical simulation
4. **Simulator** - No sensors, generates fake data for testing

Choose based on what you're trying to do and what hardware you have available.
