# Fetal EKG Monitor - View Modes Guide

## Overview
The Fetal EKG Monitor includes four specialized viewing modes designed to help clinicians monitor and avoid high-risk pregnancy complications. Each mode provides different perspectives on maternal and fetal cardiac data.

---

## View Modes

### 1. **STANDARD VIEW** (Default)
- **Purpose**: Single-signal focus for detailed analysis
- **Layout**: One full-screen EKG chart
- **Best For**:
  - Initial assessment
  - Detailed waveform analysis
  - General monitoring
- **Screens Available**:
  - Mother EKG (Key: 1)
  - Combined EKG (Key: 2)
  - Fetal EKG (Key: 3)

---

### 2. **SPLIT VIEW** - Maternal & Fetal Comparison
- **Purpose**: Side-by-side comparison of maternal and fetal signals
- **Layout**: Two charts side-by-side (50/50 split)
  - Left: Maternal EKG
  - Right: Fetal EKG
- **Best For**:
  - Comparing maternal vs fetal heart rates
  - Identifying timing relationships
  - Detecting fetal distress relative to maternal status
  - Monitoring during contractions

**Clinical Use Cases**:
- Assessing fetal response to maternal stress
- Detecting bradycardia or tachycardia patterns
- Monitoring twin pregnancies (when dual sensors available)

---

### 3. **COMPARISON VIEW** - All Signals
- **Purpose**: Simultaneous viewing of all three signal types
- **Layout**: Three charts in a row
  - Maternal | Combined | Fetal
- **Best For**:
  - Comprehensive signal quality assessment
  - Troubleshooting sensor placement
  - Teaching/demonstration purposes
  - Complete documentation capture
  - Verifying signal separation algorithms

**Clinical Use Cases**:
- Quality control checks
- Signal validation
- Research data collection
- Training healthcare providers

---

### 4. **FOCUS MODE** - High-Risk Fetal Monitoring
- **Purpose**: Prioritize fetal monitoring with maternal reference
- **Layout**: Two charts (66/33 split)
  - Top (Large): Fetal EKG - HIGH RISK MONITORING
  - Bottom (Small): Maternal Reference
- **Best For**:
  - High-risk pregnancy monitoring
  - Known fetal cardiac abnormalities
  - Post-intervention monitoring
  - Critical care situations
  - Suspected fetal distress

**Clinical Use Cases**:
- Intrauterine growth restriction (IUGR)
- Preeclampsia monitoring
- Post-external cephalic version
- Maternal diabetes
- Previous stillbirth cases
- Reduced fetal movement reports
- Abnormal Doppler findings

**Special Features**:
- Purple border indicates high-risk mode
- Larger fetal waveform for detailed analysis
- Maternal waveform kept visible for context
- Optimized for extended monitoring sessions

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **V** | Cycle through view modes |
| **1** | Mother EKG (Standard View only) |
| **2** | Combined EKG (Standard View only) |
| **3** | Fetal EKG (Standard View only) |
| **SPACE** | Start/Stop monitoring |
| **C** | Clear data |
| **A** | Connect/Disconnect Arduino |

---

## Clinical Workflow Recommendations

### Initial Assessment
1. Start in **Standard View**
2. Check each signal individually (Keys 1, 2, 3)
3. Verify signal quality

### Routine Monitoring
1. Use **Split View** for continuous observation
2. Monitor both maternal and fetal simultaneously
3. Watch for pattern changes

### High-Risk Situations
1. Switch to **Focus Mode** immediately
2. Maintain continuous fetal monitoring
3. Use maternal reference to contextualize findings
4. Document any concerning patterns

### Quality Control
1. Use **Comparison View** to verify all signals
2. Check signal separation quality
3. Ensure proper sensor placement

---

## Status Indicators

### Data Transfer Status
When monitoring is active, the status bar shows:
- 🟢 **Glowing Green Dot**: Data transfer successful
- **TEST DATA**: Using simulated data for training/testing
- **LIVE PATIENT DATA**: Connected to Arduino with real patient data

### Safety Features
- **No Red Colors**: Red is reserved exclusively for emergency alerts
- **High-Risk Identification**: Purple borders indicate focus mode
- **Clear Labeling**: All charts labeled with signal type
- **Keyboard Navigation**: Fast mode switching without mouse

---

## Technical Specifications

### Sampling Rate
- 250 Hz (4ms intervals)
- 5-second rolling window
- Real-time display updates

### Display Optimization
- Black chart backgrounds for reduced eye strain
- Hospital-grade gray UI for professional aesthetics
- Glowing indicators for active monitoring status
- Compact controls for efficient workflow

---

## Safety Notes

⚠️ **Medical Device Usage**
- This system is designed to assist in monitoring high-risk pregnancies
- Always follow hospital protocols and clinical guidelines
- Use in conjunction with standard fetal monitoring practices
- Document all observations according to institutional policy

⚠️ **Emergency Situations**
- Red colors are reserved for emergency alerts only
- If abnormal patterns detected, follow emergency protocols
- Do not rely solely on visual assessment
- Consult with obstetric care team immediately

---

## Version Information
- Monitor Version: 1.0
- View Modes: 4 specialized layouts
- Keyboard Shortcuts: 7 quick-access keys
- Data Sources: Simulated + Arduino (Live)
