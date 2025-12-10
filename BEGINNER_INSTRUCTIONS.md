# Complete Setup Guide - Fetal EKG Monitor

Simple step-by-step instructions to get everything running from scratch.

---

## Part 1: Install Software

### Step 1: Install VS Code
1. Go to https://code.visualstudio.com
2. Click **Download** for your operating system (Windows/Mac/Linux)
3. Install and open VS Code

### Step 2: Install Git
1. Go to https://git-scm.com/downloads
2. Download and install Git for your operating system
3. Restart your computer

### Step 3: Install Node.js
1. Go to https://nodejs.org
2. Download and install the **LTS version** (left button)
3. Restart your computer

---

## Part 2: Download the Project

### Step 4: Clone the Repository

**Option A: Using VS Code (Easiest)**
1. Open VS Code
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "Git: Clone" and press Enter
4. Paste this URL: `https://github.com/TosaOdiase/Fetal-Monitoring-System.git`
5. Choose where to save the project
6. Click **Open** when prompted

**Option B: Using Terminal/Command Prompt**
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to where you want the project:
   ```bash
   cd Desktop
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/TosaOdiase/Fetal-Monitoring-System.git
   ```
4. Open the folder in VS Code:
   ```bash
   cd Fetal-Monitoring-System
   code .
   ```

---

## Part 3: Run the Web Application

### Step 5: Install Dependencies
1. In VS Code, open the Terminal: **View → Terminal** (or press `` Ctrl+` ``)
2. Install packages:
   ```bash
   npm install
   ```
3. Wait for installation to complete (1-2 minutes)

### Step 6: Start the Web App
1. Run this command:
   ```bash
   npm run dev
   ```
2. You should see: `Local: http://localhost:5173`
3. Open your browser and go to: **http://localhost:5173**
4. The web app is now running!

---

## Part 4: Upload Arduino Code (Optional)

### Step 7: Install Arduino IDE
1. Go to https://www.arduino.cc/en/software
2. Download and install Arduino IDE

### Step 8: Upload Code to Arduino

**Choose one:**
- **Fetal only:** Go to `arduino/single_fetal_ekg_with_noise/single_fetal_ekg_with_noise.ino`
- **Mother + Fetal:** Go to `arduino/combined_ekg_with_noise/combined_ekg_with_noise.ino`
- **Simulator (no sensors):** Use `arduino_ecg_simulator.ino`

**Upload steps:**
1. Open the `.ino` file in Arduino IDE
2. Connect Arduino via USB
3. Select **Tools → Board** → Your Arduino (e.g., Arduino Uno)
4. Select **Tools → Port** → Your USB port
5. Click **Upload** button (→)
6. Wait for "Done uploading"

---

## Part 5: Connect Arduino to Web App

### Step 9: Connect and Monitor
1. **Close Arduino Serial Monitor** (if open)
2. In the web app, click **"CONNECT ARDUINO"**
3. Select your Arduino port from popup
4. Click **"Connect"**
5. Click **"START MONITORING"** (or press Spacebar)
6. You should see live data streaming!

---

## Quick Commands

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start web app | `npm run dev` |
| Stop web app | Press `Ctrl + C` |
| Open in browser | `http://localhost:5173` |

---

## Troubleshooting

**"npm not found" error?**
- Restart your computer after installing Node.js
- Check installation: `node --version`

**"git not found" error?**
- Restart your computer after installing Git
- Check installation: `git --version`

**Web app won't start?**
- Make sure you ran `npm install` first
- Make sure you're in the correct folder
- Try deleting `node_modules` folder and run `npm install` again

**Can't clone repository?**
- Make sure Git is installed
- Check internet connection
- Try using HTTPS URL: `https://github.com/TosaOdiase/Fetal-Monitoring-System.git`

**Arduino won't connect?**
- Close Arduino Serial Monitor
- Unplug and replug Arduino USB cable
- Use Chrome or Edge browser (Web Serial API required)
- Verify Arduino code is uploaded

---

## File Locations

After cloning, your project structure looks like:

```
Fetal-Monitoring-System/
├── src/                           ← Web app source code
├── public/                        ← Data files
├── arduino/                       ← Arduino code folder
│   ├── single_fetal_ekg_with_noise/
│   └── combined_ekg_with_noise/
├── arduino_ecg_simulator.ino      ← Simulator (no sensors)
├── package.json                   ← Project dependencies
└── README.md                      ← Project info
```

---

## Need More Help?

- **Real-time streaming:** See `REAL_TIME_STREAMING_GUIDE.md`
- **Arduino code details:** See `ARDUINO_CODE_EXPLAINED.md`
- **GitHub repository:** https://github.com/TosaOdiase/Fetal-Monitoring-System
