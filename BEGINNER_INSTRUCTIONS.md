# Beginner's Guide - Fetal EKG Monitor

## Running the Web Page

### Step 1: Install Node.js
1. Go to https://nodejs.org
2. Download and install the LTS version (left button)
3. Restart your computer

### Step 2: Install Dependencies
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to the project folder:
   ```
   cd "fetal-ekg-monitor-web"
   ```
3. Install required packages:
   ```
   npm install
   ```

### Step 3: Start the Web App
1. Run this command:
   ```
   npm run dev
   ```
2. Open your browser and go to: `http://localhost:5173`
3. The web page should now be running!

---

## Running Arduino Code

### Option 1: Fetal Heart Only
**File:** `arduino/single_fetal_ekg_with_noise/single_fetal_ekg_with_noise.ino`

1. Open Arduino IDE
2. Go to **File → Open**
3. Select the file above
4. Click the **Upload** button (right arrow icon)
5. Connect Arduino to computer via USB
6. Select your board: **Tools → Board → Arduino Uno** (or your board)
7. Select your port: **Tools → Port → /dev/cu.usbmodem...** (or COM port on Windows)
8. Click **Upload** again

### Option 2: Combined Maternal + Fetal Hearts
**File:** `arduino/combined_ekg_with_noise/combined_ekg_with_noise.ino`

Follow the same steps as Option 1, but open this file instead.

---

## Connecting Arduino to Web App

1. Upload Arduino code first
2. **IMPORTANT:** Close Arduino Serial Monitor if it's open
3. Start the web app with `npm run dev`
4. In the web app, click **"Connect to Arduino"**
5. Select your Arduino port from the popup
6. Click **Connect**
7. Click **"Start Monitoring"** to see live data stream!

**For detailed real-time streaming information, see:** `REAL_TIME_STREAMING_GUIDE.md`

---

## Troubleshooting

**Web app won't start?**
- Make sure you ran `npm install` first
- Check that Node.js is installed: `node --version`

**Arduino won't upload?**
- Check USB cable is connected
- Make sure the correct board is selected in Tools → Board
- Make sure the correct port is selected in Tools → Port

**Can't connect to Arduino in web app?**
- Make sure Arduino code is uploaded first
- Try refreshing the web page
- Check that the Arduino is still plugged in

---

## Quick Reference

| Task | Command |
|------|---------|
| Start web app | `npm run dev` |
| Stop web app | Press `Ctrl + C` in terminal |
| Web app URL | `http://localhost:5173` |
| Fetal only Arduino | `arduino/single_fetal_ekg_with_noise/` |
| Combined Arduino | `arduino/combined_ekg_with_noise/` |
