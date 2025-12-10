// ========================================
// ARDUINO CONNECTION DIAGNOSTIC SCRIPT
// ========================================
// Paste this into browser console (F12) to diagnose why data isn't showing
//
// Instructions:
// 1. Press F12 to open console
// 2. Type: allow pasting
// 3. Copy and paste this entire file
// 4. Follow the on-screen instructions

console.clear();
console.log('%c🔍 ARDUINO CONNECTION DIAGNOSTIC', 'background: #00f; color: #fff; font-size: 20px; padding: 10px;');
console.log('');

// Step 1: Check Web Serial API
console.log('%c[STEP 1] Checking Web Serial API...', 'color: #0af; font-weight: bold;');
if ('serial' in navigator) {
  console.log('✅ Web Serial API is available');
} else {
  console.log('❌ Web Serial API NOT available');
  console.log('💡 Solution: Use Chrome, Edge, or Opera browser');
}
console.log('');

// Step 2: Check for authorized ports
console.log('%c[STEP 2] Checking for authorized ports...', 'color: #0af; font-weight: bold;');
navigator.serial.getPorts().then(ports => {
  if (ports.length === 0) {
    console.log('⚠️  No ports authorized yet');
    console.log('💡 Solution: Click "Connect to Arduino" button in the app');
  } else {
    console.log(`✅ ${ports.length} port(s) authorized`);
  }
  console.log('');

  // Step 3: Test connection
  console.log('%c[STEP 3] Testing Arduino connection...', 'color: #0af; font-weight: bold;');
  console.log('📝 Instructions:');
  console.log('   1. Make sure Arduino Serial Monitor is CLOSED');
  console.log('   2. Run the test below');
  console.log('');
  console.log('Click this to run test →');

  // Create clickable test button
  console.log('%cRUN CONNECTION TEST', 'background: #0f0; color: #000; font-size: 16px; padding: 10px; cursor: pointer;');

  // Provide test function
  window.testArduinoConnection = async function() {
    console.clear();
    console.log('%c🧪 RUNNING ARDUINO CONNECTION TEST', 'background: #f80; color: #fff; font-size: 18px; padding: 10px;');
    console.log('');

    try {
      // Request port
      console.log('1️⃣ Requesting port...');
      const port = await navigator.serial.requestPort();
      console.log('✅ Port selected');

      // Open port
      console.log('2️⃣ Opening port at 115200 baud...');
      await port.open({ baudRate: 115200 });
      console.log('✅ Port opened');

      // Read data
      console.log('3️⃣ Reading data from Arduino...');
      console.log('');
      console.log('%c📡 ARDUINO OUTPUT:', 'background: #0f0; color: #000; font-weight: bold;');

      const reader = port.readable.getReader();
      let buffer = '';
      let lineCount = 0;
      const maxLines = 10;
      const startTime = Date.now();

      while (lineCount < maxLines && (Date.now() - startTime) < 10000) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        buffer += text;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            console.log(`   ${trimmed}`);
            lineCount++;

            // Check format
            if (trimmed.startsWith('M:') && trimmed.includes('C:') && trimmed.includes('F:')) {
              console.log('   ✅ Format is CORRECT!');
            } else if (!trimmed.startsWith('#')) {
              console.log('   ⚠️  Format might be wrong - expected M:X,C:Y,F:Z');
            }
          }
        }
      }

      reader.releaseLock();
      await port.close();

      console.log('');
      console.log('%c✅ TEST COMPLETE!', 'background: #0f0; color: #000; font-size: 16px; padding: 10px;');
      console.log('');
      console.log('📋 NEXT STEPS:');
      console.log('   1. If you saw M:X,C:Y,F:Z lines → Arduino is working!');
      console.log('   2. Close this test');
      console.log('   3. Refresh the page (Cmd+R)');
      console.log('   4. Click "Connect to Arduino" in the app');
      console.log('   5. Click "Start Monitoring"');
      console.log('   6. You should see live data!');

    } catch (error) {
      console.log('');
      console.log('%c❌ TEST FAILED', 'background: #f00; color: #fff; font-size: 16px; padding: 10px;');
      console.log('');
      console.log('Error:', error.message);
      console.log('');

      if (error.message.includes('already open')) {
        console.log('💡 SOLUTION: Arduino port is already open');
        console.log('   - Close Arduino IDE Serial Monitor');
        console.log('   - Close other browser tabs using the port');
        console.log('   - Unplug and replug Arduino');
        console.log('   - Try again');
      } else if (error.message.includes('No port selected')) {
        console.log('💡 SOLUTION: You cancelled the port selection');
        console.log('   - Run the test again');
        console.log('   - Select your Arduino port when prompted');
      } else {
        console.log('💡 SOLUTION: Check Arduino connection');
        console.log('   - Make sure Arduino is plugged in');
        console.log('   - Check cable is working (try different cable)');
        console.log('   - Open Arduino IDE and check Tools → Port');
      }
    }
  };

  console.log('');
  console.log('To run test, paste this: testArduinoConnection()');
  console.log('');
});

// Step 4: Check app state
console.log('%c[STEP 4] Checking app state...', 'color: #0af; font-weight: bold;');
console.log('📝 Manual checklist:');
console.log('   [ ] Development Mode is ON (green toggle in Control Panel)');
console.log('   [ ] "Connect to Arduino" button shows "Disconnect from Arduino"');
console.log('   [ ] "Start Monitoring" has been clicked');
console.log('   [ ] Data source shows "arduino" (not "simulated" or "real")');
console.log('');
console.log('If ANY of these are unchecked, fix them first!');
console.log('');

// Step 5: Watch for data
console.log('%c[STEP 5] Watching for incoming data...', 'color: #0af; font-weight: bold;');
console.log('If Arduino is connected and monitoring is started,');
console.log('you should see console messages about data being received.');
console.log('');
console.log('💡 Look for messages like:');
console.log('   - "Arduino data: ..."');
console.log('   - "Latest data: ..."');
console.log('   - Any M:X,C:Y,F:Z patterns');
console.log('');

console.log('%c═══════════════════════════════════════', 'color: #888;');
console.log('');
console.log('%c🎯 QUICK FIX PROCEDURE', 'background: #f80; color: #fff; font-size: 16px; padding: 10px;');
console.log('');
console.log('1. Close Arduino Serial Monitor (if open)');
console.log('2. Refresh this page (Cmd+R or F5)');
console.log('3. Enable Development Mode (toggle in Control Panel)');
console.log('4. Click "Connect to Arduino"');
console.log('5. Select your Arduino port (usbmodem11301)');
console.log('6. Click "Start Monitoring"');
console.log('7. Watch for moving waveforms!');
console.log('');
console.log('If still not working, run: testArduinoConnection()');
console.log('');
