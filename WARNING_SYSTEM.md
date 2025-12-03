# Warning System and Fetal Monitoring Updates

## Changes Summary

### 1. Renamed "High-Risk" to "Fetal Monitoring"

**Updated Locations:**
- Control Panel button label (ControlPanel.tsx:74)
- View mode title (App.tsx:163)
- CSS class names (ControlPanel.css:145-164)
- Title color class (App.css:64, App.tsx:177)

**New Text:**
- Button: "⚠️ Fetal Monitoring"
- Title: "FETAL MONITORING - Focused View"

### 2. Warning Message System

**Location:** Below BPM display in HeartRateMonitor component

**Features:**
- Displays when vitals are outside normal range
- Shows specific condition and current BPM value
- Different styling for warning vs. critical states
- Pulses for critical conditions

**Warning Messages:**

| Status | Condition | Message Example |
|--------|-----------|-----------------|
| Warning (Low) | BPM below normal range | "CAUTION: Low heart rate (115 BPM)" |
| Warning (High) | BPM above normal range | "CAUTION: Elevated heart rate (175 BPM)" |
| Critical (Low) | BPM critically low | "CRITICAL: Bradycardia detected (105 BPM)" |
| Critical (High) | BPM critically high | "CRITICAL: Tachycardia detected (185 BPM)" |

**Medical Thresholds:**

Maternal Heart Rate:
- Critical Low: < 50 BPM
- Warning Low: 50-60 BPM
- Normal: 60-100 BPM
- Warning High: 100-110 BPM
- Critical High: > 110 BPM

Fetal Heart Rate:
- Critical Low: < 110 BPM
- Warning Low: 110-120 BPM
- Normal: 120-160 BPM
- Warning High: 160-170 BPM
- Critical High: > 170 BPM

### 3. Red Screen Flash Alert

**Trigger:** ANY vital (maternal or fetal) enters critical status

**Visual Effect:**
- Entire application background flashes red
- 1.5-second animation cycle
- Background alternates between normal dark gray and red tint
- Continues flashing until vital returns to normal/warning status

**Implementation:**
```css
@keyframes flash-red {
  0%, 100% {
    background-color: #3a3a3a;  /* Normal */
  }
  50% {
    background-color: rgba(255, 0, 0, 0.2);  /* Red tint */
  }
}
```

**Behavior:**
- Activates when `fetalStatus === 'critical'` OR `maternalStatus === 'critical'`
- Deactivates automatically when both vitals improve
- No manual dismissal needed
- Works across all view modes

## Component Updates

### HeartRateMonitor.tsx
**New Features:**
- `onStatusChange` callback prop (HeartRateMonitor.tsx:8)
- `getWarningMessage()` function (HeartRateMonitor.tsx:107-128)
- Warning message display (HeartRateMonitor.tsx:155-161)
- Status is now exported to parent component

**CSS Additions:**
- `.hrm-warning` - Warning message container
- `.hrm-warning-warning` - Yellow/orange styling for caution
- `.hrm-warning-critical` - Red styling with pulsing animation
- `@keyframes pulse-warning` - Pulsing border/shadow effect

### App.tsx
**New State:**
- `fetalStatus` - Tracks fetal heart rate status
- `maternalStatus` - Tracks maternal heart rate status
- `isCritical` - Boolean derived from both statuses

**New Behavior:**
- Status callbacks passed to HeartRateMonitor components (App.tsx:201-202)
- Critical class applied to app div (App.tsx:183)
- Screen flashes red when either vital is critical

### App.css
**New Animations:**
- `.critical-alert` - Applied to app when critical
- `@keyframes flash-red` - Red background flash animation

## Usage Example

### Normal Operation
```
┌─────────────────────────────────┐
│ FETAL HEART RATE      [NORMAL]  │
│                                  │
│         145 BPM                  │
│                                  │
│ [Normal threshold bar display]  │
└─────────────────────────────────┘
```

### Warning State
```
┌─────────────────────────────────┐
│ FETAL HEART RATE     [CAUTION]  │
│                                  │
│         175 BPM                  │
│                                  │
│ ⚠️ CAUTION: Elevated heart rate │
│    (175 BPM)                     │
│                                  │
│ [Warning threshold bar display]  │
└─────────────────────────────────┘
```

### Critical State (with screen flash)
```
🔴 SCREEN FLASHING RED 🔴

┌─────────────────────────────────┐
│ FETAL HEART RATE      [ALERT]   │
│                                  │
│         185 BPM                  │
│                                  │
│ ⚠️ CRITICAL: Tachycardia         │
│    detected (185 BPM)            │
│                                  │
│ [Critical threshold bar display] │
└─────────────────────────────────┘

🔴 SCREEN FLASHING RED 🔴
```

## Clinical Benefits

1. **Immediate Recognition**: Warning messages provide instant context about the issue
2. **Medical Terminology**: Uses proper clinical terms (bradycardia, tachycardia)
3. **Impossible to Miss**: Red screen flash ensures critical alerts are noticed
4. **Specific Values**: Shows exact BPM that triggered the alert
5. **Persistent Notification**: Flash continues until condition improves
6. **Multi-Vital Monitoring**: Tracks both maternal and fetal simultaneously
7. **No False Dismissal**: Can't be accidentally closed or ignored

## Testing Scenarios

### Test 1: Fetal Tachycardia
1. Start monitoring with simulated data
2. Wait for fetal heart rate to exceed 180 BPM
3. Verify:
   - Warning message appears below fetal BPM
   - Message says "CRITICAL: Tachycardia detected"
   - Screen flashes red
   - Fetal monitor shows red ALERT badge

### Test 2: Maternal Bradycardia
1. Start monitoring
2. Wait for maternal heart rate to drop below 50 BPM
3. Verify:
   - Warning message appears below maternal BPM
   - Message says "CRITICAL: Bradycardia detected"
   - Screen flashes red
   - Maternal monitor shows red ALERT badge

### Test 3: Warning State (Not Critical)
1. Monitor until fetal HR reaches 165 BPM (warning, not critical)
2. Verify:
   - Warning message shows "CAUTION: Elevated heart rate"
   - Screen does NOT flash red
   - Monitor shows orange CAUTION badge

### Test 4: Recovery
1. Trigger critical alert
2. Wait for heart rate to return to normal range
3. Verify:
   - Warning message disappears
   - Screen flash stops
   - Monitor shows green NORMAL badge

## File Changes

**Modified Files:**
1. src/components/HeartRateMonitor.tsx
2. src/components/HeartRateMonitor.css
3. src/components/ControlPanel.tsx
4. src/components/ControlPanel.css
5. src/App.tsx
6. src/App.css

**New CSS Classes:**
- `.hrm-warning`
- `.hrm-warning-warning`
- `.hrm-warning-critical`
- `.warning-icon`
- `.warning-text`
- `.critical-alert`
- `.title-fetal-monitoring`
- `.btn-fetal-monitoring`

**New Functions:**
- `getWarningMessage()` in HeartRateMonitor
- Status tracking and callback system in App

---

**All changes are live at http://localhost:5173/**
