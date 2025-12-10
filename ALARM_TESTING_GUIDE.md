# Alarm Threshold Testing Guide

## Overview

This guide explains how to test and validate the alarm threshold system to ensure:
- ✅ **Critical alarms trigger after 5 seconds** of sustained abnormal readings
- ✅ **Warning alarms trigger after 3 seconds** of sustained abnormal readings
- ✅ **Normal heart rates (110-160 BPM) never trigger alarms**
- ✅ **Intermittent spikes don't trigger false alarms** (not sustained)

---

## 🧪 Automated Test Suite

### Accessing the Test Suite

**Option 1:** Navigate to test URL
```
http://localhost:5174/?test
```

**Option 2:** Navigate to test path
```
http://localhost:5174/test
```

### Test Scenarios

The test suite includes 7 automated scenarios:

#### 1. **Normal (135 BPM)** ✅
- **Expected:** Remains GREEN (normal status)
- **Duration:** Should never trigger alarms
- **Validates:** Normal heart rates don't cause false alarms

#### 2. **Borderline Low (110 BPM)** ✅
- **Expected:** Remains GREEN (normal status)
- **Duration:** Should never trigger alarms
- **Validates:** Lower threshold boundary (110 BPM is still normal)

#### 3. **Warning Low (105 BPM)** ⚠️
- **Expected:** Turns YELLOW after ~3 seconds
- **Duration:** 3000ms ± 500ms
- **Validates:** Warning threshold triggers correctly

#### 4. **Critical Low (95 BPM)** 🚨
- **Expected:** Turns RED after ~5 seconds
- **Duration:** 5000ms ± 500ms
- **Validates:** Critical bradycardia detection with sustained threshold

#### 5. **Warning High (165 BPM)** ⚠️
- **Expected:** Turns YELLOW after ~3 seconds
- **Duration:** 3000ms ± 500ms
- **Validates:** Warning tachycardia threshold

#### 6. **Critical High (185 BPM)** 🚨
- **Expected:** Turns RED after ~5 seconds
- **Duration:** 5000ms ± 500ms
- **Validates:** Critical tachycardia detection with sustained threshold

#### 7. **Intermittent Spikes** ✅
- **Expected:** Remains GREEN (normal status)
- **Pattern:** Alternates between 135 BPM and 185 BPM every 2 seconds
- **Validates:** Non-sustained abnormalities don't trigger alarms (prevents false alarms)

---

## 📊 How to Run Tests

### Step-by-Step Testing Process

1. **Open the test suite**
   ```
   http://localhost:5174/?test
   ```

2. **Select a test scenario** (click one of the buttons)

3. **Observe the monitor**
   - Watch the heart rate monitor display in real-time
   - Note when the status changes color:
     - 🟢 GREEN = Normal
     - 🟡 YELLOW = Warning
     - 🔴 RED = Critical

4. **Check timing**
   - The test displays "Time Elapsed" and "Time to Trigger"
   - Critical should trigger at ~5000ms
   - Warning should trigger at ~3000ms
   - Normal/Intermittent should never trigger

5. **Stop the test** (click "Stop Test" button)

6. **Review results**
   - Test results table shows:
     - Expected status and timing
     - Actual status and timing
     - ✅ PASS or ❌ FAIL

7. **Repeat for all scenarios**
   - Run all 7 scenarios to validate complete system behavior

---

## 🎯 Expected Results Summary

| Scenario | Heart Rate | Expected Status | Time to Trigger | Pass Criteria |
|----------|-----------|----------------|----------------|---------------|
| Normal | 135 BPM | 🟢 Normal | Never | Stays green |
| Borderline Low | 110 BPM | 🟢 Normal | Never | Stays green |
| Warning Low | 105 BPM | 🟡 Warning | ~3s | 2.5-4.0s |
| Critical Low | 95 BPM | 🔴 Critical | ~5s | 4.5-6.0s |
| Warning High | 165 BPM | 🟡 Warning | ~3s | 2.5-4.0s |
| Critical High | 185 BPM | 🔴 Critical | ~5s | 4.5-6.0s |
| Intermittent | 135↔185 BPM | 🟢 Normal | Never | Stays green |

---

## 🔬 Clinical Validation

### ACOG/NICHD Thresholds (Implemented)

**Fetal Heart Rate:**
- Normal baseline: **110-160 BPM**
- Bradycardia: **<110 BPM**
- Severe bradycardia (critical): **<100 BPM**
- Tachycardia: **>160 BPM**
- Severe tachycardia (critical): **>180 BPM**

**Maternal Heart Rate:**
- Normal: **60-100 BPM**
- Bradycardia (warning): **<60 BPM**
- Severe bradycardia (critical): **<40 BPM**
- Tachycardia (warning): **>120 BPM**
- Severe tachycardia (critical): **>140 BPM**

### Sustained Alarm Logic

Per hospital best practices to reduce false alarms by ~80%:

- **Critical alarms:** Require **5 seconds** of sustained critical readings
  - Prevents false alarms from transient artifacts
  - Based on RANZCOG guideline: "FHR <100 bpm for more than 5 minutes"
  - Adapted to 5 seconds for real-time monitoring sensitivity

- **Warning alarms:** Require **3 seconds** of sustained borderline readings
  - Early warning system before critical threshold
  - Gives clinicians time to assess situation

- **Normal ranges:** Never trigger alarms
  - 110-160 BPM for fetal (ACOG standard)
  - 60-100 BPM for maternal

---

## 🐛 Troubleshooting

### Test Failures

**If Critical Low/High tests fail:**
- Check if alarm triggers too early (<4.5s) or too late (>6s)
- Review HeartRateMonitor.tsx lines 137-150 for sustained detection logic
- Ensure abnormalStatusHistory is being properly maintained

**If Warning tests fail:**
- Check if alarm triggers too early (<2.5s) or too late (>4s)
- Review HeartRateMonitor.tsx lines 151-159

**If Intermittent Spikes test fails:**
- Should remain GREEN despite brief critical spikes
- Validates that non-sustained abnormalities don't trigger alarms
- If it triggers, the sustained detection window may be too short

### Real Patient Data Testing

For testing with actual patient data:
1. Use the main app: `http://localhost:5174/`
2. Load real ECG data or connect Arduino
3. Observe alarm behavior over 30+ seconds
4. Verify false alarm rate is low (<20% of alarms)

---

## 📚 References

- ACOG Clinical Practice Guideline No. 10 (2025): Intrapartum Fetal Heart Rate Monitoring
- RANZCOG Intrapartum Fetal Surveillance Guideline (2014)
- False Alarm Reduction in Cardiac Monitoring (NCBI/PMC)
- Hospital ICU Alarm Management Best Practices

---

## ✅ Acceptance Criteria

The alarm system passes validation if:

- ✅ All 7 test scenarios pass
- ✅ Critical alarms trigger between 4.5-6.0 seconds
- ✅ Warning alarms trigger between 2.5-4.0 seconds
- ✅ Normal heart rates never trigger alarms
- ✅ Intermittent spikes don't trigger alarms
- ✅ Real patient data shows <20% false alarm rate
- ✅ Heartbeat beeps sync with actual detected heart rate

---

## 🚀 Quick Start

```bash
# Start the dev server
npm run dev

# Access test suite
open http://localhost:5174/?test

# Run all 7 test scenarios
# Click each button and observe results

# Check that all tests PASS ✅
```

**Expected result:** All tests should show ✅ PASS in the results table.
