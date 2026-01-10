import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const DEVICE_ID = process.argv[2] || 'DEVICE-001';

interface DeviceMetrics {
  waterFlow: number;
  pressure: number;
  temperature: number;
  batteryLevel: number;
}

function generateNormalMetrics(): DeviceMetrics {
  return {
    waterFlow: Math.random() * 10 + 5, // 5-15 L/min
    pressure: Math.random() * 20 + 40, // 40-60 PSI
    temperature: Math.random() * 5 + 18, // 18-23°C
    batteryLevel: Math.random() * 10 + 90, // 90-100%
  };
}

function generateLeakMetrics(): DeviceMetrics {
  return {
    waterFlow: Math.random() * 50 + 50, // 50-100 L/min (abnormally high)
    pressure: Math.random() * 10 + 20, // 20-30 PSI (low pressure)
    temperature: Math.random() * 5 + 18,
    batteryLevel: Math.random() * 10 + 90,
  };
}

async function sendEvent(deviceId: string, isLeak: boolean = false) {
  const metrics = isLeak ? generateLeakMetrics() : generateNormalMetrics();
  const alertType = isLeak ? 'leak_detected' : null;

  const event = {
    deviceId,
    timestamp: new Date().toISOString(),
    metrics,
    alertType,
    rawPayload: {
      sensorId: deviceId,
      firmwareVersion: '1.0.0',
      signalStrength: Math.floor(Math.random() * 100),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/events/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✓ Event sent: ${isLeak ? 'LEAK ALERT' : 'Normal'} | Flow: ${metrics.waterFlow.toFixed(2)} L/min | Pressure: ${metrics.pressure.toFixed(2)} PSI`);
      return true;
    } else {
      console.error('✗ Error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('✗ Failed to send event:', error);
    return false;
  }
}

async function startSimulator() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       IoT Device Simulator - Leak Detection MVP          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Device ID: ${DEVICE_ID}`);
  console.log(`API URL: ${API_BASE_URL}`);
  console.log('');
  console.log('Commands:');
  console.log('  n - Send normal event');
  console.log('  l - Send leak event');
  console.log('  a - Auto-send normal events every 5 seconds');
  console.log('  s - Stop auto-send');
  console.log('  q - Quit');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let autoInterval: NodeJS.Timeout | null = null;

  rl.on('line', async (input) => {
    const command = input.trim().toLowerCase();

    switch (command) {
      case 'n':
        await sendEvent(DEVICE_ID, false);
        break;
      case 'l':
        await sendEvent(DEVICE_ID, true);
        break;
      case 'a':
        if (autoInterval) {
          console.log('Auto-send already running');
        } else {
          console.log('Starting auto-send (every 5 seconds)...');
          autoInterval = setInterval(() => {
            sendEvent(DEVICE_ID, false);
          }, 5000);
        }
        break;
      case 's':
        if (autoInterval) {
          clearInterval(autoInterval);
          autoInterval = null;
          console.log('Auto-send stopped');
        } else {
          console.log('Auto-send not running');
        }
        break;
      case 'q':
        if (autoInterval) {
          clearInterval(autoInterval);
        }
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Unknown command. Use n, l, a, s, or q');
    }
  });
}

startSimulator();
