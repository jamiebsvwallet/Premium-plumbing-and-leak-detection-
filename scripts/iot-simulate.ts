#!/usr/bin/env node

/**
 * IoT Device Simulator for Premium Plumbing & Leak Detection
 * 
 * Usage:
 *   npm run simulate                    # Normal operation mode
 *   npm run simulate -- --leak          # Simulate leak event
 *   npm run simulate -- --device=XYZ    # Use custom device ID
 *   npm run simulate -- --interval=5000 # Custom interval (ms)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const DEVICE_ID = process.argv.find(arg => arg.startsWith('--device='))?.split('=')[1] || 'DEMO-DEVICE-001';
const INTERVAL = parseInt(process.argv.find(arg => arg.startsWith('--interval='))?.split('=')[1] || '10000');
const SIMULATE_LEAK = process.argv.includes('--leak');
const SIMULATE_ANOMALY = process.argv.includes('--anomaly');

interface DeviceMetrics {
  flow: number;
  temperature: number;
  pressure: number;
  humidity?: number;
}

interface EventPayload {
  deviceId: string;
  timestamp: string;
  metrics: DeviceMetrics;
  alertType: string | null;
  rawPayload: any;
}

/**
 * Generate random metrics with optional anomalies
 */
function generateMetrics(): { metrics: DeviceMetrics; alertType: string | null } {
  let alertType: string | null = null;
  
  // Normal operating ranges
  let flow = 2.5 + Math.random() * 1.0; // 2.5-3.5 GPM
  let temperature = 20 + Math.random() * 5; // 20-25°C
  let pressure = 45 + Math.random() * 10; // 45-55 PSI
  let humidity = 40 + Math.random() * 20; // 40-60%

  // Simulate leak condition
  if (SIMULATE_LEAK || Math.random() < 0.05) {
    flow = 0.1 + Math.random() * 0.3; // Very low flow
    pressure = 10 + Math.random() * 10; // Low pressure
    alertType = 'leak';
  }

  // Simulate anomaly
  if (SIMULATE_ANOMALY || Math.random() < 0.1) {
    flow = 5 + Math.random() * 3; // Unusually high flow
    pressure = 70 + Math.random() * 10; // High pressure
    alertType = alertType || 'anomaly';
  }

  return {
    metrics: {
      flow: parseFloat(flow.toFixed(2)),
      temperature: parseFloat(temperature.toFixed(2)),
      pressure: parseFloat(pressure.toFixed(2)),
      humidity: parseFloat(humidity.toFixed(2)),
    },
    alertType,
  };
}

/**
 * Send event to the API
 */
async function sendEvent() {
  const { metrics, alertType } = generateMetrics();
  
  const payload: EventPayload = {
    deviceId: DEVICE_ID,
    timestamp: new Date().toISOString(),
    metrics,
    alertType,
    rawPayload: {
      deviceId: DEVICE_ID,
      sensorVersion: '1.0.0',
      batteryLevel: 85 + Math.random() * 15,
    },
  };

  console.log('\n📡 Sending event:', {
    deviceId: payload.deviceId,
    timestamp: payload.timestamp,
    alertType: payload.alertType || 'normal',
    flow: metrics.flow,
    temperature: metrics.temperature,
    pressure: metrics.pressure,
  });

  try {
    const response = await fetch(`${API_URL}/api/events/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Event sent successfully');
      console.log('   Event ID:', data.event.id);
      console.log('   Data Hash:', data.event.dataHash);
      if (data.event.bsvTxId) {
        console.log('   BSV TX ID:', data.event.bsvTxId);
      }
    } else {
      console.error('❌ Failed to send event:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Main simulator loop
 */
async function main() {
  console.log('🚀 IoT Device Simulator Started');
  console.log('================================');
  console.log('Device ID:', DEVICE_ID);
  console.log('API URL:', API_URL);
  console.log('Interval:', INTERVAL, 'ms');
  console.log('Mode:', SIMULATE_LEAK ? 'LEAK' : SIMULATE_ANOMALY ? 'ANOMALY' : 'NORMAL');
  console.log('================================\n');

  // Send initial event
  await sendEvent();

  // Set up interval for continuous sending
  setInterval(sendEvent, INTERVAL);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Simulator stopped');
    process.exit(0);
  });
}

// Run the simulator
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
