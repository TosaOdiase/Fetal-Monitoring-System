# Collapsible Warning System Update

## Changes Made

### Warning Display - Now Collapsible

The warning messages below BPM vitals are now **collapsible** and **initialize in a collapsed state**.

## Visual Appearance

### Collapsed State (Default)
```
┌─────────────────────────────────┐
│ FETAL HEART RATE     [ALERT]    │
│                                  │
│         185 BPM                  │
│                                  │
│ [🔧 ▶]                           │  ← Collapsed warning indicator
│                                  │
│ [Threshold bar display]          │
└─────────────────────────────────┘
```

### Expanded State (After clicking)
```
┌─────────────────────────────────┐
│ FETAL HEART RATE     [ALERT]    │
│                                  │
│         185 BPM                  │
│                                  │
│ [🔧 ▼] CRITICAL: Tachycardia    │  ← Expanded warning with details
│        detected (185 BPM)        │
│                                  │
│ [Threshold bar display]          │
└─────────────────────────────────┘
```

## Features

### 1. Tool Icon (🔧)
- Uses a wrench/tool icon instead of the warning triangle
- Indicates actionable/expandable content
- More subtle and professional appearance

### 2. Collapse/Expand Toggle
- **▶ Arrow**: Indicates collapsed state (click to expand)
- **▼ Arrow**: Indicates expanded state (click to collapse)
- Smooth animation when toggling

### 3. Initial State
- **Always starts collapsed** when warning appears
- Reduces visual clutter
- User can expand to see details when needed

### 4. Interactive Behavior
- Click the icon/arrow to toggle
- Hover effect: slight scale up (1.1x)
- Active/click effect: slight scale down (0.95x)
- Smooth transitions (0.3s)

### 5. Animation
- Warning text slides in from left when expanded
- Fade-in effect for smooth appearance
- Box adjusts padding automatically

## CSS Classes

**New/Updated Classes:**
- `.hrm-warning.collapsed` - Compact padding (6px 8px)
- `.hrm-warning.expanded` - Full padding (10px 12px)
- `.warning-toggle` - Clickable button for expand/collapse
- `.warning-toggle-text` - Arrow indicator (▶/▼)
- `@keyframes slideIn` - Text slide-in animation

## State Management

**Component State:**
```typescript
const [isWarningExpanded, setIsWarningExpanded] = useState(false)
```

- Starts at `false` (collapsed)
- Toggles when button is clicked
- Independent for each monitor (fetal and maternal)

## User Interaction Flow

1. **Warning Appears**: Heart rate enters warning/critical zone
2. **Initial Display**: Shows only tool icon (🔧) and arrow (▶)
3. **Screen Flashes**: If critical, screen flashes red (still works)
4. **User Clicks**: Clicks on icon/arrow to see details
5. **Details Shown**: Full warning message expands with animation
6. **User Clicks Again**: Collapses back to icon-only view

## Benefits

### Clinical Workflow
- **Less Intrusive**: Collapsed by default doesn't distract from BPM value
- **On-Demand Details**: Clinician can expand when needed
- **Quick Glance**: Icon presence indicates issue without full message
- **Space Efficient**: Takes up minimal space when collapsed

### Visual Design
- **Cleaner Interface**: Less text clutter on screen
- **Professional**: Tool icon is more clinical than warning triangle
- **Clear Action**: Arrow indicates it's interactive/expandable
- **Smooth UX**: Animations provide polished feel

## Technical Implementation

### HeartRateMonitor.tsx (Lines 14, 156-173)
```typescript
const [isWarningExpanded, setIsWarningExpanded] = useState(false)

// In render:
{getWarningMessage() && (
  <div className={`hrm-warning hrm-warning-${status} ${isWarningExpanded ? 'expanded' : 'collapsed'}`}>
    <button
      className="warning-toggle"
      onClick={() => setIsWarningExpanded(!isWarningExpanded)}
    >
      <span className="warning-icon">🔧</span>
      <span className="warning-toggle-text">
        {isWarningExpanded ? '▼' : '▶'}
      </span>
    </button>
    {isWarningExpanded && (
      <span className="warning-text">{getWarningMessage()}</span>
    )}
  </div>
)}
```

### HeartRateMonitor.css (Lines 201-293)
- Collapsible styling with padding transitions
- Button hover/active effects
- Slide-in animation for expanded text
- Maintains pulsing effect for critical warnings

## Accessibility

- **Keyboard Accessible**: Button can be focused and activated with keyboard
- **Title Attribute**: Tooltip shows "Expand warning details" / "Collapse warning"
- **Clear Visual State**: Arrow direction indicates current state
- **Color Contrast**: Maintains warning/critical color coding

## Example Scenarios

### Scenario 1: Normal Monitoring
- Heart rates normal → No warning displayed
- Clean, uncluttered vitals display

### Scenario 2: Warning Appears
- Fetal HR reaches 175 BPM (warning zone)
- Yellow/orange box appears with 🔧 ▶
- Screen does NOT flash (not critical)
- Clinician can continue monitoring or click to see details

### Scenario 3: Critical Alert
- Fetal HR reaches 185 BPM (critical zone)
- Red box appears with 🔧 ▶
- **Screen FLASHES RED** (critical alert active)
- Clinician clicks to see "CRITICAL: Tachycardia detected (185 BPM)"
- Can collapse after reading

### Scenario 4: Reviewing Multiple Warnings
- Both fetal and maternal show warnings
- Both start collapsed
- Clinician can expand one or both as needed
- Each maintains independent state

## Comparison: Before vs After

### Before (Always Expanded)
```
❌ Takes up significant space
❌ Text always visible even if already acknowledged
❌ More visual clutter
✅ Immediately readable
```

### After (Collapsible)
```
✅ Minimal space when collapsed
✅ Can be dismissed after reading
✅ Cleaner interface
✅ Still shows full details when clicked
✅ Tool icon indicates actionable content
```

## Files Modified

1. **src/components/HeartRateMonitor.tsx**
   - Added `isWarningExpanded` state
   - Added collapsible button with toggle
   - Conditional rendering of warning text

2. **src/components/HeartRateMonitor.css**
   - Added `.collapsed` and `.expanded` states
   - Styled `.warning-toggle` button
   - Added `slideIn` animation
   - Hover/active effects

## Testing

To test the collapsible warnings:

1. Start monitoring
2. Wait for heart rate to enter warning/critical zone
3. Observe tool icon (🔧) with arrow (▶) appears
4. Click on icon/arrow
5. Verify warning text expands with slide-in animation
6. Click again to collapse
7. Verify smooth collapse back to icon-only

---

**All changes are live at http://localhost:5173/**
