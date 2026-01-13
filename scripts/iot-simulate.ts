import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

interface SimulatedEvent {
  deviceId: string;
  eventType: string;
  data: any;
}

/**
 * IoT Device Simulator
 * Sends simulated events to the server's IoT ingestion endpoint
 */
async function simulateEvent(event: SimulatedEvent) {
  try {
    const response = await axios.post(`${SERVER_URL}/api/events/ingest`, event);
    console.log('✓ Event sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('✗ Error sending event:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Generate random sensor reading
 */
function generateReading(deviceId: string) {
  const eventTypes = ['reading', 'alert', 'diagnostic'];
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

  const data: any = {
    temperature: (20 + Math.random() * 10).toFixed(2),
    pressure: (100 + Math.random() * 50).toFixed(2),
    flow: (5 + Math.random() * 10).toFixed(2),
    timestamp: new Date().toISOString(),
  };

  if (eventType === 'alert') {
    data.alertType = Math.random() > 0.5 ? 'leak_detected' : 'pressure_high';
    data.severity = Math.random() > 0.5 ? 'high' : 'medium';
  }

  return {
    deviceId,
    eventType,
    data,
  };
}

/**
 * Main simulation function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: npm run simulate <deviceId> [interval_ms]');
    console.error('Example: npm run simulate abc-123-def 5000');
    console.error('  deviceId: ID of the device to simulate');
    console.error('  interval_ms: (optional) Interval between events in milliseconds, default 5000');
    process.exit(1);
  }

  const deviceId = args[0];
  const interval = parseInt(args[1] || '5000', 10);

  console.log(`Starting IoT simulator for device: ${deviceId}`);
  console.log(`Interval: ${interval}ms`);
  console.log(`Server: ${SERVER_URL}`);
  console.log('Press Ctrl+C to stop\n');

  // Send initial event immediately
  const initialEvent = generateReading(deviceId);
  await simulateEvent(initialEvent);

  // Then send events at regular intervals
  setInterval(async () => {
    const event = generateReading(deviceId);
    await simulateEvent(event);
  }, interval);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
