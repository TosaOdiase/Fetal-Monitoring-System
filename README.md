# Fetal Monitoring System

**Senior Capstone Project - Case Western Reserve University**
**Department of Biomedical Engineering**

A real-time fetal cardiac monitoring system designed for high-risk pregnancy surveillance. This web-based application provides continuous EKG monitoring of both maternal and fetal heart activity with intelligent signal processing, automated anomaly detection, and clinical-grade visualization.

---

## 🎯 Project Overview

### Purpose
This system addresses the critical need for continuous, non-invasive fetal cardiac monitoring during high-risk pregnancies. Traditional monitoring methods often lack the sensitivity and real-time analysis capabilities needed to detect subtle cardiac abnormalities that could indicate fetal distress.

### Clinical Applications
- **High-risk pregnancy monitoring** - Continuous surveillance for at-risk pregnancies
- **Fetal cardiac anomaly detection** - Real-time identification of bradycardia, tachycardia, and arrhythmias
- **Maternal health monitoring** - Simultaneous tracking of maternal cardiac health
- **Clinical training** - Development mode allows simulation of various clinical scenarios
- **Research** - Data collection and analysis platform for maternal-fetal cardiac studies

### Key Features
- **Real-time dual EKG monitoring** - Simultaneous maternal and fetal cardiac monitoring at 250 Hz
- **Automated signal processing** - Peak detection and heart rate calculation from raw EKG signals
- **Intelligent alerting system** - Multi-level warnings (Normal, Caution, Critical) with visual and color-coded alerts
- **Multiple visualization modes** - Standard, split-screen, comparison, and high-risk focused views
- **Development mode** - Test 8 different clinical scenarios including normal pregnancy and critical conditions
- **Production mode** - Live Arduino integration for real patient monitoring
- **Interactive controls** - Zoom, pan, and real-time waveform analysis
- **Responsive design** - Adaptive layout for various screen sizes and clinical workflows

---

## 🏥 Clinical Scenarios (Development Mode)

The system can simulate and detect the following conditions:

### Normal Conditions
- **Normal Pregnancy** - Healthy maternal and fetal vitals

### High-Risk Conditions
- **High-Risk Pregnancy** - Borderline fetal heart rate requiring close monitoring

### Critical Fetal Conditions
- **Fetal Bradycardia** - Heart rate < 110 BPM (Critical)
- **Fetal Tachycardia** - Heart rate > 180 BPM (Critical)
- **Fetal Arrhythmia** - Irregular heart rhythm with skipped beats

### Critical Maternal Conditions
- **Maternal Bradycardia** - Heart rate < 50 BPM (Critical)
- **Maternal Tachycardia** - Heart rate > 120 BPM (Critical)
- **Maternal Arrhythmia** - Irregular maternal heart rhythm

All critical conditions trigger visual alerts including screen flashing and color-coded warnings.

---

## 🛠️ Technical Architecture

### Signal Processing Pipeline
1. **Data Acquisition** - 250 Hz sampling from Arduino or simulated source
2. **Peak Detection** - Adaptive threshold QRS complex identification
3. **Heart Rate Calculation** - Beat-to-beat interval analysis
4. **Status Classification** - Medical threshold-based anomaly detection
5. **Real-time Visualization** - Sub-second latency waveform rendering

### Clinical Thresholds
**Maternal Heart Rate:**
- Critical: < 50 or > 120 BPM
- Warning: 50-60 or 110-120 BPM
- Normal: 60-100 BPM

**Fetal Heart Rate:**
- Critical: < 110 or > 180 BPM
- Warning: 110-120 or 170-180 BPM
- Normal: 120-160 BPM

### Technology Stack
- **Frontend:** React 18 with TypeScript
- **Visualization:** Recharts for real-time EKG waveforms
- **Signal Processing:** Custom JavaScript peak detection algorithms
- **Hardware Interface:** Web Serial API for Arduino communication
- **Styling:** CSS3 with responsive container queries

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Modern web browser** with Web Serial API support (Chrome 89+, Edge 89+)
- **Arduino** (optional, for production mode with real sensors)

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Fetal-Monitoring-System.git
   cd Fetal-Monitoring-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - The application will automatically open at `http://localhost:5173`
   - If not, manually navigate to the URL shown in the terminal

---

## 📱 How to Use

### Development Mode (Default)

Development mode allows you to test all clinical scenarios without hardware:

1. **Launch the application** - Starts in Development Mode by default
2. **Select a test condition** - Choose from 8 clinical scenarios in the "Test Conditions" panel
3. **Start monitoring** - Press the **START** button or press **SPACE**
4. **Switch views** - Use view mode buttons or press **V** to cycle through visualization modes
5. **Observe alerts** - Critical conditions trigger red screen flashing and color-coded warnings
6. **Monitor heart rates** - Real-time BPM display with threshold indicators

### Production Mode (Arduino Required)

Production mode connects to real Arduino hardware for live patient monitoring:

1. **Toggle to Production Mode** - Use the slider switch at the bottom of the control panel
2. **Connect Arduino** - Click the **Connect** button (or press **A**)
3. **Select serial port** - Choose your Arduino's serial port from the browser prompt
4. **Start monitoring** - Press **START** to begin real-time data acquisition
5. **Monitor vitals** - System processes live EKG signals and calculates heart rates in real-time

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **SPACE** | Start/Stop monitoring |
| **V** | Cycle through view modes |
| **1** | Switch to Maternal EKG (Standard mode) |
| **2** | Switch to Combined EKG (Standard mode) |
| **3** | Switch to Fetal EKG (Standard mode) |
| **C** | Clear all data |
| **D** | Toggle Development/Production mode |
| **A** | Connect to Arduino (Production mode) |

### View Modes

1. **Standard View** - Single full-screen EKG display with signal selection
2. **Split View** - Side-by-side maternal and fetal comparison
3. **Comparison View** - Three-panel view showing maternal, combined, and fetal signals
4. **Fetal Monitoring** - Large fetal display with maternal reference (optimal for high-risk monitoring)

### Interactive Chart Controls

- **Zoom In/Out (X-axis):** Ctrl/Cmd + Scroll or use X+/X- buttons
- **Zoom In/Out (Y-axis):** Shift + Scroll or use Y+/Y- buttons
- **Pan:** Mouse scroll or click and drag
- **Reset:** Click the ↻ button or adjust zoom controls
- **Collapse Controls:** Click the ⊕/× button to show/hide zoom controls

---

## 🔧 Arduino Integration

### Hardware Setup

For production mode, you'll need:
- Arduino board (Uno, Mega, or compatible)
- EKG sensor electrodes and amplifier circuit
- USB connection to computer

### Arduino Code

The Arduino should send data in the following format over serial (250 Hz):
```
maternal_value,combined_value,fetal_value\n
```

Example Arduino sketch structure:
```cpp
void loop() {
  float maternal = readMaternalEKG();
  float combined = readCombinedEKG();
  float fetal = readFetalEKG();

  Serial.print(maternal);
  Serial.print(",");
  Serial.print(combined);
  Serial.print(",");
  Serial.println(fetal);

  delay(4); // 250 Hz sampling rate
}
```

### Serial Configuration
- **Baud Rate:** 115200
- **Data Format:** CSV (comma-separated values)
- **Line Ending:** Newline (\n)
- **Sampling Rate:** 250 Hz (4ms intervals)

---

## 📊 System Features

### Real-Time Monitoring
- **250 Hz sampling rate** for accurate cardiac event detection
- **5-second rolling window** for continuous waveform display
- **Sub-second latency** from signal acquisition to visualization

### Signal Processing
- **Adaptive peak detection** algorithm with local maxima identification
- **QRS complex recognition** for accurate beat detection
- **Beat-to-beat interval calculation** for heart rate determination
- **Arrhythmia detection** through irregular interval analysis

### Alert System
- **Three-tier warning levels** (Normal, Caution, Critical)
- **Visual alerts** with screen flashing for critical conditions
- **Color-coded indicators** (Green, Orange, Red)
- **Threshold visualization** with live heart rate position markers
- **Expandable warning messages** with clinical context

### Data Visualization
- **Interactive zoom and pan** controls
- **Multiple time scales** from sub-second to 5-second views
- **Amplitude scaling** for detailed waveform analysis
- **Resizable panels** for customizable workspace layout

---

## 🎓 Academic Context

### Course Information
- **Institution:** Case Western Reserve University
- **Department:** Biomedical Engineering
- **Project Type:** Senior Capstone
- **Focus Area:** Medical Device Design, Signal Processing, Clinical Monitoring

### Design Considerations
- **Clinical safety** - Multi-level alerts and fail-safe monitoring
- **Usability** - Intuitive interface for rapid clinical decision-making
- **Accuracy** - Medical-grade signal processing algorithms
- **Reliability** - Robust error handling and data validation
- **Scalability** - Modular architecture for feature expansion

### Future Enhancements
- Cloud data storage and remote monitoring
- Machine learning for predictive analytics
- Multi-patient monitoring dashboard
- EMR/EHR system integration
- Mobile application for clinician alerts
- Advanced arrhythmia classification

---

## 📁 Project Structure

```
fetal-ekg-monitor-web/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Global styles and layout
│   ├── components/
│   │   ├── ControlPanel.tsx    # Control interface and mode switching
│   │   ├── ControlPanel.css    # Control panel styling
│   │   ├── HeartRateMonitor.tsx # Real-time heart rate display and alerts
│   │   ├── HeartRateMonitor.css # Heart rate monitor styling
│   │   ├── ZoomableEKGChart.tsx # Interactive EKG visualization
│   │   └── ZoomableEKGChart.css # Chart styling
│   └── hooks/
│       ├── useSimulatedData.ts  # Signal simulation for development mode
│       └── useArduinoSerial.ts  # Arduino communication interface
├── arduino/
│   └── fetal_ekg_arduino.ino   # Arduino sensor interface code
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

---

## 🤝 Contributing

This is an academic capstone project. For questions or collaboration inquiries, please contact through Case Western Reserve University's Biomedical Engineering Department.

---

## 📄 License

This project is developed as part of academic coursework at Case Western Reserve University. All rights reserved.

---

## 👤 Author

**Case Western Reserve University**
Department of Biomedical Engineering
Senior Capstone Project

---

## 🙏 Acknowledgments

- Case Western Reserve University Biomedical Engineering Department
- Faculty advisors and clinical consultants
- Medical professionals who provided domain expertise
- Open-source community for development tools and libraries

---

## 📞 Support

For technical issues or questions about this project:
- **Academic Support:** Contact CWRU Biomedical Engineering Department
- **Technical Issues:** Review the troubleshooting section below

### Troubleshooting

**Issue: Arduino not connecting**
- Solution: Ensure Chrome/Edge browser is being used (Web Serial API required)
- Check that Arduino is properly connected via USB
- Verify correct serial port is selected

**Issue: No data displaying**
- Solution: Press START button or SPACE key
- Verify Development/Production mode is correctly set
- Check browser console for error messages

**Issue: Heart rate showing as 0 or --**
- Solution: Ensure sufficient data has been collected (minimum 100 samples)
- Verify signal amplitude is adequate for peak detection
- Check that monitoring has been started

**Issue: Charts not displaying properly**
- Solution: Refresh the browser
- Check browser zoom level (should be 100%)
- Ensure window is large enough for responsive layout

---

## 🔬 Research & Development

This system serves as a platform for ongoing research in:
- Non-invasive fetal cardiac monitoring techniques
- Real-time signal processing for clinical applications
- Human-computer interaction in medical device design
- Predictive analytics for pregnancy complications

For research collaboration opportunities, contact Case Western Reserve University's Biomedical Engineering Department.

---

**Built with ❤️ for improving maternal and fetal healthcare outcomes**
