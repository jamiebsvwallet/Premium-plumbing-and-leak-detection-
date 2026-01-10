#!/usr/bin/env node

/**
 * IoT Device Simulator
 * 
 * Simulates IoT leak detection devices sending events to the API
 * 
 * Usage:
 *   npm run simulate -- --deviceId DEVICE_ID [--interval 5000] [--leak]
 *   npm run simulate -- --help
 */

// Using global fetch available in Node 18+

interface SimulatorOptions {
  deviceId: string;
  apiUrl: string;
  interval: number;
  leak: boolean;
  count?: number;
}

function generateMetrics(hasLeak: boolean) {
  const baseFlowRate = hasLeak ? Math.random() * 5 + 5 : Math.random() * 2 + 0.5; // L/min
  const basePressure = hasLeak ? Math.random() * 20 + 20 : Math.random() * 10 + 40; // PSI
  
  return {
    flowRate: parseFloat(baseFlowRate.toFixed(2)),
    pressure: parseFloat(basePressure.toFixed(2)),
    temperature: parseFloat((Math.random() * 10 + 15).toFixed(2)), // Celsius
    humidity: parseFloat((Math.random() * 20 + 40).toFixed(2)), // Percent
    batteryLevel: parseFloat((Math.random() * 10 + 85).toFixed(2)), // Percent
  };
}

async function sendEvent(options: SimulatorOptions) {
  const metrics = generateMetrics(options.leak);
  const alertType = options.leak ? 'critical' : 
                   metrics.flowRate > 2 ? 'warning' : 'none';
  
  const payload = {
    deviceId: options.deviceId,
    timestamp: new Date().toISOString(),
    metrics,
    alertType,
    rawPayload: {
      deviceId: options.deviceId,
      version: '1.0.0',
      metrics,
      alertType,
    },
  };

  try {
    const response = await fetch(`${options.apiUrl}/api/events/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error sending event:', error);
      return false;
    }

    const result = await response.json();
    console.log(`✅ Event sent: ${alertType.toUpperCase()} | Flow: ${metrics.flowRate} L/min | Pressure: ${metrics.pressure} PSI | Hash: ${result.event.eventHash.substring(0, 8)}...`);
    return true;
  } catch (error: any) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

async function simulate(options: SimulatorOptions) {
  console.log('🔧 IoT Device Simulator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Device ID: ${options.deviceId}`);
  console.log(`API URL: ${options.apiUrl}`);
  console.log(`Interval: ${options.interval}ms`);
  console.log(`Leak Mode: ${options.leak ? 'ENABLED ⚠️' : 'disabled'}`);
  console.log(`Count: ${options.count ? options.count : 'infinite'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let sentCount = 0;
  
  const sendAndSchedule = async () => {
    await sendEvent(options);
    sentCount++;
    
    if (options.count && sentCount >= options.count) {
      console.log(`\n✅ Sent ${sentCount} events. Simulation complete.`);
      process.exit(0);
    }
    
    setTimeout(sendAndSchedule, options.interval);
  };

  await sendAndSchedule();
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: Partial<SimulatorOptions> = {
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    interval: 5000,
    leak: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        console.log(`
IoT Device Simulator

Usage:
  npm run simulate -- --deviceId DEVICE_ID [options]

Options:
  --deviceId <id>      Device ID (required)
  --apiUrl <url>       API URL (default: http://localhost:3000)
  --interval <ms>      Interval between events in ms (default: 5000)
  --leak               Enable leak simulation mode
  --count <n>          Send n events and exit (default: infinite)
  --help, -h           Show this help message

Examples:
  npm run simulate -- --deviceId sensor-001
  npm run simulate -- --deviceId sensor-001 --leak --interval 2000
  npm run simulate -- --deviceId sensor-001 --count 10
        `);
        process.exit(0);
        break;
      
      case '--deviceId':
        options.deviceId = args[++i];
        break;
      
      case '--apiUrl':
        options.apiUrl = args[++i];
        break;
      
      case '--interval':
        options.interval = parseInt(args[++i], 10);
        break;
      
      case '--leak':
        options.leak = true;
        break;
      
      case '--count':
        options.count = parseInt(args[++i], 10);
        break;
    }
  }

  if (!options.deviceId) {
    console.error('❌ Error: --deviceId is required\n');
    console.log('Run with --help for usage information');
    process.exit(1);
  }

  return options as SimulatorOptions;
}

// Main
const options = parseArgs();
simulate(options).catch((error) => {
  console.error('❌ Simulation error:', error);
  process.exit(1);
});
