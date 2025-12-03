# Quick Start Guide - Fetal EKG Monitor (TypeScript)

## ✅ Server is Running!

Your development server is now live at:

**🌐 http://localhost:5173/**

---

## 📱 How to Use

### 1. Open in Browser

Open **Chrome**, **Edge**, or **Opera** (Web Serial API required):
```
http://localhost:5173/
```

❌ **Don't use Firefox or Safari** - they don't support Web Serial API for Arduino

---

### 2. Test with Simulated Data (No Arduino Required)

1. Click the big green **"START MONITORING"** button
2. You should immediately see EKG waveforms scrolling!
3. Press **1**, **2**, or **3** to toggle between views:
   - **1** = Mother EKG (Cyan)
   - **2** = Combined EKG (Orange)
   - **3** = Fetal EKG (Red)

**Keyboard shortcuts:**
- `1` = Mother view
- `2` = Combined view
- `3` = Fetal view
- `SPACE` = Start/Stop monitoring

---

### 3. Connect Arduino (Optional)

If you have Arduino with EKG sensors:

1. Upload the Arduino sketch:
   - Open Arduino IDE
   - Load `/arduino/fetal_ekg_arduino/fetal_ekg_arduino.ino`
   - Upload to your Arduino

2. In the web browser:
   - Click **"CONNECT ARDUINO"** button
   - Select your Arduino's serial port from popup
   - Click **"START MONITORING"**
   - Live Arduino data will appear!

**Arduino wiring:**
- Pin A0 → Mother's EKG sensor
- Pin A1 → Combined EKG sensor
- Pin A2 → Fetal EKG sensor
- GND → Common ground

---

## 🎮 Controls

### Big Buttons at Bottom:

**Screen Selection (Left side):**
- 🔵 **MOTHER (1)** - Shows maternal EKG in cyan
- 🟠 **COMBINED (2)** - Shows combined signal in orange
- 🔴 **FETAL (3)** - Shows fetal EKG in red

**Control Buttons (Right side):**
- 🟢 **START MONITORING** - Begin data acquisition
- 🔴 **STOP MONITORING** - Pause acquisition
- 🗑️ **CLEAR** - Clear all data
- 🔌 **CONNECT ARDUINO** - Connect to Arduino via USB

---

## 📊 What You Should See

### Mother's EKG (Press 1)
- **Color**: Cyan (#4ecdc4)
- **Heart Rate**: ~75 bpm
- **Amplitude**: ~1.0 mV
- **Waveform**: Clear P-QRS-T complexes

### Combined EKG (Press 2)
- **Color**: Orange (#ffaa00)
- **Heart Rate**: Both maternal and fetal
- **Amplitude**: Sum of both signals
- **Waveform**: Maternal peaks with small fetal peaks in between

### Fetal EKG (Press 3)
- **Color**: Red (#ff6b6b)
- **Heart Rate**: ~140 bpm
- **Amplitude**: ~0.25 mV (smaller)
- **Waveform**: Faster, smaller QRS complexes

---

## 🔧 Troubleshooting

### Problem: Page won't load

**Solution:**
```bash
# Stop the server
cd /Users/tosaodiase/Documents/EBME\ 370/fetal-ekg-monitor-web
# Kill any running processes
pkill -f "vite"
# Restart
npm run dev
```

### Problem: No waveform showing

**Check:**
1. Did you click **START MONITORING**?
2. Open browser console (F12) - any errors?
3. Try refreshing the page (Cmd+R)

### Problem: Arduino button doesn't work

**Reasons:**
- Using Firefox/Safari (not supported)
- Arduino not plugged in
- Arduino Serial Monitor is open (close it first)
- Need to use Chrome/Edge/Opera

### Problem: Waveform is choppy

**Solutions:**
- Close other browser tabs
- Check CPU usage
- Reduce sampling rate in code if needed

---

## 🛑 Stop the Server

When you're done:

```bash
# Press Ctrl+C in the terminal where server is running
# OR
pkill -f "vite"
```

---

## 📦 Build for Production

When ready to deploy:

```bash
npm run build
npm run preview
```

This creates optimized production build in `dist/` folder.

---

## 🐛 Development Tips

### View Console Logs

Press **F12** in browser to see:
- Connection status
- Data samples
- Error messages
- Performance info

### Hot Reload

The server has hot reload - just edit the code and save:
- Changes appear instantly
- No need to refresh browser

### File Structure

```
src/
├── components/
│   ├── EKGChart.tsx       ← Graph display
│   └── ControlPanel.tsx   ← Buttons and controls
├── hooks/
│   ├── useArduinoSerial.ts   ← Arduino connection
│   └── useSimulatedData.ts   ← Simulated EKG generator
└── App.tsx                ← Main app
```

---

## ✨ Features Working

- ✅ Three-screen toggle (Mother/Combined/Fetal)
- ✅ Real-time 250 Hz sampling
- ✅ Smooth scrolling waveforms
- ✅ Keyboard shortcuts
- ✅ Simulated data mode
- ✅ Arduino plug-and-play (Web Serial API)
- ✅ Color-coded signals
- ✅ Auto-scaling Y-axis

---

## 📞 Need Help?

Check browser console (F12) for error messages.

Common fixes:
1. Refresh page (Cmd+R)
2. Clear browser cache
3. Restart dev server
4. Check terminal for errors

---

## 🎯 Next Steps

Once you verify it's working:
1. Test all three screens (1, 2, 3)
2. Test start/stop button
3. Test keyboard shortcuts
4. Try connecting Arduino (if you have one)

Then we'll implement the clinical security features! 🔒

---

**Enjoy testing!** 🎉
