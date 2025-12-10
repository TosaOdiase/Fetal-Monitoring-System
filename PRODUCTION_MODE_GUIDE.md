# Production Mode Quick Guide

## What is Production Mode?

**Production Mode** is a safety feature that ensures your web app **only** uses real hardware data (Arduino) and not simulated data. This is critical for actual clinical use.

## Development vs Production Mode

| Feature | Development Mode | Production Mode |
|---------|-----------------|-----------------|
| **Data Sources** | Simulated, Real ECG, Arduino | **Arduino ONLY** |
| **Can Start Without Arduino?** | ✅ Yes | ❌ No - requires connection |
| **Signal Quality Panel** | ✅ Visible | ❌ Hidden |
| **Scenario Testing** | ✅ Available | ❌ Not available |
| **Use Case** | Testing, development, demos | **Real patient monitoring** |

## How to Switch Modes

### In the Web App UI
1. Look for the **"Development Mode"** toggle button
2. Click it to switch between modes
3. **Green = Development**, **Red = Production**

### Keyboard Shortcut
Press **D** key to toggle Development Mode on/off

## Current Status: Development Mode is ON

Your app starts in **Development Mode** by default, which is perfect for:
- Testing the web app
- Using real PhysioNet ECG data
- Using simulated scenarios
- Developing without Arduino hardware

## How to Use Production Mode

### Step 1: Prepare Arduino
1. Upload `arduino_ecg_simulator.ino` to your Arduino
2. Verify it's sending data (check Serial Monitor at 115200 baud)
3. Close Arduino IDE Serial Monitor
4. Keep Arduino plugged into computer

### Step 2: Switch to Production Mode
1. In web app, click **Development Mode** button (or press **D**)
2. Button should turn **red** and say "PRODUCTION MODE"
3. Signal Quality Panel disappears
4. Only Arduino connection option available

### Step 3: Connect Arduino
1. Click **"Connect Arduino"** button (or press **A**)
2. Browser shows port selection dialog
3. Select your Arduino port (e.g., `/dev/cu.usbmodem...`)
4. Wait for "Connected" status

### Step 4: Start Monitoring
1. Click **"Start Monitoring"** (or press **Space**)
2. ECG waveforms should appear
3. Heart rate monitors show real values from Arduino

## Production Mode Safety Features

When Production Mode is active:

✅ **REQUIRES Arduino connection** - Won't start monitoring without it
✅ **No simulated data** - Can't accidentally use fake data
✅ **No signal quality controls** - Prevents artificial quality adjustment
✅ **Real data only** - Guarantees authentic hardware signals
✅ **Clear visual indicator** - Red "PRODUCTION MODE" label

## Testing Production Mode

### Test 1: Verify Production Mode Enforcement
1. Switch to Production Mode
2. Try to click "Start Monitoring" without Arduino
3. **Expected**: Nothing happens or warning shown
4. **Reason**: Production mode requires Arduino connection

### Test 2: Verify Arduino Connection Required
1. Stay in Production Mode
2. Connect Arduino
3. Now try "Start Monitoring"
4. **Expected**: Monitoring starts successfully
5. **Reason**: Arduino is connected and sending data

### Test 3: Verify No Simulated Data Available
1. In Production Mode
2. Look for scenario selection controls
3. **Expected**: Controls are hidden/disabled
4. **Reason**: Production mode doesn't allow simulated scenarios

## When to Use Each Mode

### Use Development Mode When:
- 🧪 Testing the web application
- 📊 Using real PhysioNet ECG data for algorithm development
- 🎯 Testing different clinical scenarios (bradycardia, tachycardia, etc.)
- 🔧 Developing without Arduino hardware
- 📚 Training or demonstration purposes

### Use Production Mode When:
- 🏥 Actual patient monitoring
- ✅ Clinical validation testing
- 🎓 Final project demonstrations
- 📋 Hardware system testing
- 🚨 Any real-world application

## Arduino Connection Checklist

Before switching to Production Mode:

- [ ] Arduino is programmed with correct sketch
- [ ] Arduino is plugged into computer via USB
- [ ] Arduino Serial Monitor is **closed** (important!)
- [ ] Arduino is sending data at 115200 baud
- [ ] Data format matches: `A0:xxx,A1:xxx,A2:xxx`
- [ ] Using Chrome, Edge, or Opera browser
- [ ] Web app is running (`npm run dev`)

## Troubleshooting Production Mode

### Issue: Can't start monitoring in Production Mode
**Check:**
1. Is Arduino connected? (Green indicator)
2. Is Development Mode OFF? (Should show "PRODUCTION MODE" in red)
3. Did you click "Connect Arduino" and select port?

### Issue: Production Mode button doesn't work
**Solution:**
- Refresh the web app
- Check browser console for errors (F12)
- Ensure you're running latest code

### Issue: Arduino disconnects when switching modes
**Expected Behavior**: In the current implementation, toggling Development Mode while connected will disconnect Arduino. This is a safety feature.

### Issue: Want to test scenarios but stuck in Production Mode
**Solution**:
- Switch back to Development Mode (click button or press D)
- Now you can access all testing features

## Code Implementation

Your production mode logic (in App.tsx):

```typescript
// Lines 167-177
if (!isDevelopmentMode && dataSource !== 'arduino') {
  console.warn('Production mode requires Arduino connection')
  return
}

if (!isDevelopmentMode && !isConnected) {
  console.warn('Production mode requires active Arduino connection')
  return
}
```

This ensures production mode **only** accepts Arduino data!

## Best Practices

### For Development
1. ✅ Keep Development Mode ON
2. ✅ Use real PhysioNet data for algorithm testing
3. ✅ Test different scenarios with simulated data
4. ✅ Switch to Arduino occasionally to test hardware integration

### For Production Deployment
1. ⚠️ Switch to Production Mode
2. ⚠️ Verify Arduino connection before starting
3. ⚠️ Never use simulated data
4. ⚠️ Monitor for disconnections
5. ⚠️ Have backup monitoring available

### For Demonstrations
**Option A - Show Algorithm (Development Mode):**
- Use real PhysioNet data
- Demonstrate signal separation
- Show different scenarios

**Option B - Show Hardware (Production Mode):**
- Use Arduino with sensors
- Demonstrate real-time acquisition
- Show production-ready system

## Safety Notes

🚨 **IMPORTANT**: This web app is for **educational purposes** only. It is **NOT** approved for actual clinical use.

For real clinical applications:
- Medical device regulatory approval required (FDA, CE, etc.)
- Clinical validation studies needed
- Proper safety and security certifications
- Backup monitoring systems
- Trained medical personnel supervision

## Summary

- **Development Mode** = Flexible, all features, for testing
- **Production Mode** = Restricted, Arduino only, for real use
- Toggle with button or **D** key
- Arduino connection required for production mode
- Safety features prevent accidental simulated data use

---

Your web app is properly configured for both development and production use! 🎯
