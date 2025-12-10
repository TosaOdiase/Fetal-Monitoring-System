# Arduino Setup for Production Mode

## ✅ Your Web App is Ready for Arduino

Your web application is **already configured** to receive data from Arduino in production mode. Here's how it works and how to test it.

## How Arduino Integration Works

### Production Mode Behavior
When you switch to **Production Mode** (toggle Dev Mode OFF):
1. ✅ Only Arduino data source is allowed
2. ✅ Must have active Arduino connection to start monitoring
3. ✅ Automatically uses Arduino data when connected
4. ✅ Shows warning if no Arduino connection

### Data Flow
```
Arduino → Serial Port (115200 baud) → Web Serial API → Your Web App → Display
```

## Arduino Connection Process

### Step 1: Connect Arduino Hardware
1. Plug Arduino into computer via USB
2. In your web app, click **"Connect Arduino"** button (or press **A**)
3. Browser will show serial port selection dialog
4. Select your Arduino's port (usually `/dev/cu.usbmodem...` on Mac)
5. Connection indicator turns green

### Step 2: Start Monitoring
1. Click **"Start Monitoring"** (or press Space)
2. Web app begins receiving data at 250 Hz
3. ECG waveforms display in real-time

## Data Format Expected from Arduino

Your web app expects Arduino to send data in one of these formats:

### Format 1: Channel-Based (Recommended)
```
A0:512,A1:487,A2:503
A0:513,A1:488,A2:504
A0:514,A1:489,A2:505
```

**Benefits:**
- Flexible signal mapping via UI
- Can remap which channel is maternal/fetal/combined
- More robust

### Format 2: Legacy Direct Mapping
```
M:512,C:487,F:503
M:513,C:488,F:504
M:514,C:489,F:505
```

Where:
- `M` = Maternal ECG value
- `C` = Combined ECG value
- `F` = Fetal ECG value

## Test Arduino Sketch

Here's a simple Arduino sketch to test the connection:

```cpp
/**
 * Arduino ECG Simulator for Testing
 * Sends simulated ECG data to web app via serial
 */

const int SAMPLE_RATE_HZ = 250;
const int SAMPLE_INTERVAL_MS = 4;  // 1000ms / 250Hz = 4ms

unsigned long lastSampleTime = 0;
float phase = 0;

void setup() {
  // Initialize serial at 115200 baud (matches web app)
  Serial.begin(115200);

  // Wait for serial connection
  while (!Serial) {
    delay(10);
  }

  Serial.println("Arduino ECG Simulator Ready");
}

void loop() {
  unsigned long currentTime = millis();

  // Send data at 250 Hz (every 4ms)
  if (currentTime - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = currentTime;

    // Generate simulated ECG waveforms
    // Maternal: ~88 bpm (1.47 Hz)
    float maternalPhase = phase * 1.47 * 2 * PI;
    int maternal = 512 + (int)(100 * sin(maternalPhase));

    // Fetal: ~160 bpm (2.67 Hz)
    float fetalPhase = phase * 2.67 * 2 * PI;
    int fetal = 512 + (int)(30 * sin(fetalPhase));  // Smaller amplitude

    // Combined: maternal + fetal + small noise
    int noise = random(-10, 10);
    int combined = maternal + (fetal - 512) + noise;

    // Send in channel format (A0, A1, A2)
    Serial.print("A0:");
    Serial.print(maternal);
    Serial.print(",A1:");
    Serial.print(combined);
    Serial.print(",A2:");
    Serial.println(fetal);

    // Increment phase (wraps at 1.0)
    phase += 0.004;  // 4ms per sample
    if (phase >= 1.0) phase = 0.0;
  }
}
```

### Upload Instructions
1. Open Arduino IDE
2. Paste the code above
3. Select your board (Tools → Board)
4. Select your port (Tools → Port)
5. Click Upload
6. Open Serial Monitor to verify it's sending data

## Testing the Connection

### Test 1: Verify Arduino is Sending Data
1. Upload the test sketch to Arduino
2. Open Arduino IDE Serial Monitor (Tools → Serial Monitor)
3. Set baud rate to **115200**
4. You should see lines like: `A0:512,A1:487,A2:503`

### Test 2: Connect to Web App
1. Close Arduino Serial Monitor (important!)
2. Open your web app in Chrome/Edge/Opera
3. Make sure you're in **Development Mode** first (for testing)
4. Click **"Connect Arduino"** button
5. Select the Arduino port in the browser dialog
6. You should see "Arduino Connected" status

### Test 3: View Data in Web App
1. Click **"Start Monitoring"**
2. You should see ECG waveforms appear
3. Verify heart rate monitors show values (~88 bpm maternal, ~160 bpm fetal)

### Test 4: Production Mode
1. Toggle **Development Mode OFF**
2. The app should now ONLY allow Arduino data
3. Try to start monitoring - it should require Arduino connection
4. Connect Arduino and start monitoring
5. Verify it works in production mode

## Real ECG Sensor Setup

For actual ECG sensing, you'll need:

### Hardware
- **Arduino Board**: Uno, Mega, or similar
- **ECG Sensor Module**: AD8232 or similar
- **Electrodes**: Standard ECG electrodes (3-lead minimum)
- **Cables**: Electrode connector cables

### AD8232 Wiring Example
```
AD8232 → Arduino
-----------------
GND    → GND
3.3V   → 3.3V
OUTPUT → A0 (maternal channel)
LO+    → D10 (lead-off detection)
LO-    → D11 (lead-off detection)
```

### Real ECG Arduino Code Template
```cpp
const int ECG_PIN = A0;
const int LO_PLUS = 10;
const int LO_MINUS = 11;

void setup() {
  Serial.begin(115200);
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
}

void loop() {
  // Check if electrodes are connected
  if ((digitalRead(LO_PLUS) == 1) || (digitalRead(LO_MINUS) == 1)) {
    // Leads off - send zero
    Serial.println("A0:0,A1:0,A2:0");
  } else {
    // Read ECG signal
    int ecgValue = analogRead(ECG_PIN);

    // For now, send same value to all channels
    // Later, add actual fetal extraction algorithm
    Serial.print("A0:");
    Serial.print(ecgValue);
    Serial.print(",A1:");
    Serial.print(ecgValue);
    Serial.print(",A2:");
    Serial.println(ecgValue);
  }

  delay(4);  // 250 Hz sampling
}
```

## Troubleshooting

### Issue: "Web Serial API not supported"
**Solution**: Use Chrome, Edge, or Opera browser (not Firefox or Safari)

### Issue: "No port appears in dialog"
**Solution**:
- Ensure Arduino is plugged in
- Check Arduino shows up in Arduino IDE (Tools → Port)
- Try different USB cable
- Restart browser

### Issue: "Connection failed"
**Solution**:
- Close Arduino IDE Serial Monitor
- Unplug and replug Arduino
- Try a different USB port
- Check Arduino is sending data (verify with Serial Monitor first)

### Issue: "No data appearing in web app"
**Solution**:
- Verify Arduino is sending at 115200 baud
- Check data format matches expected format
- Open browser console (F12) and look for errors
- Verify you clicked "Start Monitoring"

### Issue: "Production mode won't start"
**Solution**:
- Ensure Arduino is connected (green indicator)
- Check dataSource is set to 'arduino'
- Verify you're not in Development Mode
- Ensure Arduino is actively sending data

## Production Mode Checklist

Before deploying in production mode:

- [ ] Arduino is programmed with correct firmware
- [ ] ECG sensors are properly connected
- [ ] Baud rate is set to 115200
- [ ] Data format matches web app expectations
- [ ] Connection works reliably in test mode
- [ ] Sample rate is 250 Hz (4ms intervals)
- [ ] All three channels send valid data
- [ ] Lead-off detection is implemented (optional)
- [ ] Development Mode is turned OFF
- [ ] Arduino connection button works
- [ ] Monitoring starts successfully
- [ ] ECG waveforms display correctly

## Web App Arduino Settings

### Current Configuration
```typescript
// In App.tsx:
- Baud rate: 115200
- Sample rate: 250 Hz (4ms interval)
- Data format: Channel-based or legacy
- Connection method: Web Serial API
```

### Signal Mapping (Configurable via UI)
```typescript
Default mapping:
- Channel 1 (A0) → Maternal ECG
- Channel 2 (A1) → Combined ECG
- Channel 3 (A2) → Fetal ECG
```

You can change this mapping in the web app UI if your Arduino sends channels in a different order.

## Next Steps

1. **Test with Simulator**: Upload the test sketch and verify connection
2. **Build Hardware**: Connect AD8232 sensor to Arduino
3. **Test with Real Sensors**: Use electrodes to capture real ECG
4. **Implement Separation**: Add fetal ECG extraction algorithm to Arduino
5. **Production Deployment**: Switch to production mode and go live!

---

Your web app is **ready to receive Arduino data**. Just upload the test sketch and connect! 🚀
