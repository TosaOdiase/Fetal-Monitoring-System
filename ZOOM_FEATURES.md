# EKG Zoom Features Guide

Your fetal cardiac monitoring system now includes comprehensive zoom and pan capabilities for detailed signal analysis.

## Zoom Controls

### Mouse/Trackpad Controls

| Action | How To | Range |
|--------|--------|-------|
| **X-axis Zoom** (Time) | `Ctrl` + Mouse Wheel (or `Cmd` on Mac) | 0.5x to 10x |
| **Y-axis Zoom** (Amplitude) | `Shift` + Mouse Wheel | 0.5x to 5x |
| **Pan Left/Right** | Mouse Wheel (no modifier keys) | -10s to +10s offset |
| **Pan with Drag** | Click and drag on chart | Smooth panning |
| **Reset All** | Click Reset button (↺) | Returns to 1x zoom |

### On-Screen Buttons

The zoom control overlay in the top-right corner provides:
- `🔍+` - Zoom in on X-axis (time)
- `🔍-` - Zoom out on X-axis (time)
- `↕️+` - Zoom in on Y-axis (amplitude)
- `↕️-` - Zoom out on Y-axis (amplitude)
- `↺` - Reset to default view

### Zoom Info Display

The overlay shows current zoom levels in real-time:
```
X: 2.0x | Y: 1.5x | Pan: 1.2s
```

## Use Cases

### 1. Detailed QRS Complex Analysis
- Use `Ctrl + Scroll Up` to zoom in on X-axis (time)
- Examine individual peaks and valleys of the EKG waveform
- Ideal zoom: **2-5x** for detailed wave morphology

### 2. Amplitude Analysis
- Use `Shift + Scroll Up` to zoom in on Y-axis (amplitude)
- Measure exact voltage values of P, Q, R, S, T waves
- Ideal zoom: **1.5-3x** for amplitude measurements

### 3. Fetal Heart Rate Variability
- Zoom to **3-4x** on X-axis to see beat-to-beat intervals
- Essential for high-risk fetal monitoring

### 4. Comparing Multiple Timepoints
- Pan backward with regular scroll (scroll down)
- Review historical data within the 5-second buffer
- Useful for comparing consecutive heartbeats

## View Mode Specific Features

### Standard View
Full zoom controls with instructions at bottom of screen

### Split View (Maternal & Fetal)
Independent zoom controls for each chart
- Left chart (Maternal): Zoom independently
- Right chart (Fetal): Zoom independently

### Comparison View (All 3 Signals)
Compact zoom controls for space efficiency
- All three charts have independent zoom
- Instructions hidden to save space

### Focus Mode (High-Risk Fetal)
- Main fetal chart: Full zoom controls
- Reference maternal chart: Full zoom controls
- Both can be zoomed independently for comparison

## Keyboard Shortcuts (Main App)

| Key | Action |
|-----|--------|
| `1` | Switch to Maternal EKG |
| `2` | Switch to Combined EKG |
| `3` | Switch to Fetal EKG |
| `V` | Cycle through view modes |
| `SPACE` | Start/Stop monitoring |
| `C` | Clear data |
| `A` | Connect Arduino |

## Clinical Tips

### For Standard Monitoring
- Keep at **1x zoom** for continuous monitoring
- Use pan to review recent events

### For Abnormality Investigation
1. **Suspected Arrhythmia**: Zoom X-axis to 3-4x
2. **Low Amplitude Signal**: Zoom Y-axis to 2-3x
3. **QRS Complex Analysis**: Zoom both axes to 2x

### For Documentation
- Zoom to desired detail level
- Take screenshot (OS screenshot tools)
- Reset zoom to continue monitoring

## Technical Specifications

- **Time Resolution**: Adjusts tick marks based on zoom level
  - 10x zoom: 0.1s intervals
  - 5x zoom: 0.2s intervals
  - 1x zoom: 0.5s intervals
- **Smooth Rendering**: No animation lag, immediate response
- **Data Buffering**: Always maintains 5 seconds of data
- **Independent State**: Each chart maintains its own zoom state

## Browser Requirements

- Chrome, Edge, or Opera (for Web Serial API support)
- Mouse with scroll wheel or trackpad
- Modern system with GPU acceleration recommended

## Performance Notes

- Zooming does not affect data acquisition (still 250 Hz)
- Display refreshes at 25 Hz regardless of zoom level
- No performance impact on monitoring accuracy

---

**Questions or Issues?**
- Zoom not responding: Check if browser supports scroll events
- Controls not visible: Try maximizing window or switching to Standard view
- Unexpected behavior: Click Reset (↺) button to restore defaults
