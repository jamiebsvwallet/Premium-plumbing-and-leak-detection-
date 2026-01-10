/**
 * IoT Device Simulator
 * 
 * Simulates IoT device events and sends them to the backend API.
 * Usage: npm run simulate
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SimulationConfig {
  serialNumber: string;
  eventTypes: string[];
  intervalMs: number;
}

const DEFAULT_CONFIG: SimulationConfig = {
  serialNumber: 'DEVICE-001',
  eventTypes: ['temperature', 'pressure', 'flow_rate'],
  intervalMs: 3000, // Send event every 3 seconds
};

async function sendEvent(serialNumber: string, eventType: string) {
  try {
    let value: number;
    let metadata: any = {};

    switch (eventType) {
      case 'temperature':
        value = 20 + Math.random() * 30; // 20-50°C
        metadata = { unit: 'celsius', location: 'water_heater' };
        break;
      case 'pressure':
        value = 30 + Math.random() * 40; // 30-70 PSI
        metadata = { unit: 'psi', location: 'main_line' };
        break;
      case 'flow_rate':
        value = Math.random() * 5; // 0-5 GPM
        metadata = { unit: 'gpm', location: 'kitchen_sink' };
        break;
      case 'leak_detected':
        value = Math.random() > 0.9 ? 1 : 0; // 10% chance of leak
        metadata = { severity: value > 0 ? 'high' : 'none' };
        break;
      default:
        value = Math.random() * 100;
    }

    const response = await fetch(`${API_URL}/api/events/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serialNumber,
        eventType,
        value,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(
      `✓ Sent ${eventType} event: ${value.toFixed(2)} (${metadata.unit || ''}) - ID: ${data.id}`
    );
  } catch (error) {
    console.error(`✗ Error sending ${eventType} event:`, error);
  }
}

async function simulate(config: SimulationConfig = DEFAULT_CONFIG) {
  console.log('🔌 IoT Device Simulator Started');
  console.log(`📡 API URL: ${API_URL}`);
  console.log(`🏷️  Serial Number: ${config.serialNumber}`);
  console.log(`⏱️  Interval: ${config.intervalMs}ms`);
  console.log(`📊 Event Types: ${config.eventTypes.join(', ')}`);
  console.log('');

  // Verify device exists
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) {
      console.error('❌ Backend server is not responding. Make sure it is running.');
      process.exit(1);
    }
    console.log('✓ Backend server is running\n');
  } catch (error) {
    console.error('❌ Cannot connect to backend server:', error);
    console.error('Make sure the server is running with: npm run server');
    process.exit(1);
  }

  let eventIndex = 0;

  setInterval(() => {
    const eventType = config.eventTypes[eventIndex % config.eventTypes.length];
    sendEvent(config.serialNumber, eventType);
    eventIndex++;
  }, config.intervalMs);

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Simulator stopped');
    process.exit(0);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const config = { ...DEFAULT_CONFIG };

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--serial' && args[i + 1]) {
    config.serialNumber = args[i + 1];
  } else if (args[i] === '--interval' && args[i + 1]) {
    config.intervalMs = parseInt(args[i + 1], 10);
  }
}

simulate(config);
