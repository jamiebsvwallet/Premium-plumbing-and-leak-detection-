import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('=== IoT Device Simulator ===\n');

  const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
  const deviceId = await prompt('Enter device ID: ');

  if (!deviceId) {
    console.error('Device ID is required');
    rl.close();
    return;
  }

  console.log(`\nSimulating events for device: ${deviceId}`);
  console.log(`Server: ${serverUrl}`);
  console.log('Sending events every 5 seconds. Press Ctrl+C to stop.\n');

  let eventCount = 0;

  const intervalId = setInterval(async () => {
    eventCount++;

    const eventTypes = ['temperature', 'pressure', 'flow_rate', 'leak_detected', 'vibration'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const payload = generatePayload(eventType);

    try {
      const response = await axios.post(`${serverUrl}/api/events/ingest`, {
        deviceId,
        eventType,
        payload,
      });

      console.log(`[${new Date().toISOString()}] Event #${eventCount}: ${eventType}`);
      console.log(`  Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error(`  Error: ${error.response?.data?.error || error.message}`);
    }
  }, 5000);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\nStopping simulator...');
    clearInterval(intervalId);
    rl.close();
    process.exit(0);
  });
}

function generatePayload(eventType: string): any {
  switch (eventType) {
    case 'temperature':
      return {
        value: (Math.random() * 40 + 10).toFixed(2),
        unit: 'celsius',
        location: 'pipe_section_A',
      };
    case 'pressure':
      return {
        value: (Math.random() * 100 + 50).toFixed(2),
        unit: 'psi',
        location: 'main_line',
      };
    case 'flow_rate':
      return {
        value: (Math.random() * 20 + 5).toFixed(2),
        unit: 'gpm',
        location: 'outlet_1',
      };
    case 'leak_detected':
      return {
        severity: Math.random() > 0.5 ? 'high' : 'low',
        location: `zone_${Math.floor(Math.random() * 5) + 1}`,
        confidence: (Math.random() * 0.5 + 0.5).toFixed(2),
      };
    case 'vibration':
      return {
        value: (Math.random() * 10).toFixed(2),
        unit: 'hz',
        location: 'pump_motor',
      };
    default:
      return { data: 'unknown' };
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});
