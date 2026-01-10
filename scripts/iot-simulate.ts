#!/usr/bin/env ts-node

/**
 * IoT Device Simulator
 * Simulates leak detection devices sending events to the API
 */

import * as readline from 'readline';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const DEVICE_ID = process.env.DEVICE_ID || 'sim-device-001';

interface DeviceMetrics {
  flow: number;
  pressure: number;
  temperature: number;
  humidity: number;
}

let isLeaking = false;
let intervalId: NodeJS.Timeout | null = null;

function generateMetrics(): DeviceMetrics {
  if (isLeaking) {
    return {
      flow: 50 + Math.random() * 100, // High flow
      pressure: 20 + Math.random() * 15, // Low pressure
      temperature: 15 + Math.random() * 5,
      humidity: 60 + Math.random() * 20,
    };
  } else {
    return {
      flow: 0.5 + Math.random() * 2, // Normal flow
      pressure: 40 + Math.random() * 10, // Normal pressure
      temperature: 20 + Math.random() * 5,
      humidity: 40 + Math.random() * 20,
    };
  }
}

async function sendEvent() {
  const metrics = generateMetrics();
  const alertType = isLeaking ? 'leak' : null;

  const event = {
    deviceId: DEVICE_ID,
    timestamp: new Date().toISOString(),
    metrics,
    alertType,
    rawPayload: {
      deviceId: DEVICE_ID,
      timestamp: new Date().toISOString(),
      metrics,
      alertType,
    },
  };

  try {
    const response = await fetch(`${API_URL}/api/events/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✓ Event sent: ${alertType || 'normal'} | Flow: ${metrics.flow.toFixed(2)} | Hash: ${result.eventHash.substring(0, 8)}...`);
    } else {
      const error = await response.text();
      console.error(`✗ Failed to send event: ${response.status} - ${error}`);
    }
  } catch (error: any) {
    console.error(`✗ Network error: ${error.message}`);
  }
}

function startSimulation(intervalSeconds: number = 5) {
  if (intervalId) {
    console.log('Simulation already running');
    return;
  }

  console.log(`Starting simulation for device: ${DEVICE_ID}`);
  console.log(`Sending events every ${intervalSeconds} seconds`);
  console.log(`API endpoint: ${API_URL}/api/events/ingest`);
  console.log('');

  intervalId = setInterval(sendEvent, intervalSeconds * 1000);
  sendEvent(); // Send immediately
}

function stopSimulation() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Simulation stopped');
  } else {
    console.log('Simulation not running');
  }
}

function toggleLeak() {
  isLeaking = !isLeaking;
  console.log(`Leak status: ${isLeaking ? '🚨 LEAKING' : '✓ Normal'}`);
}

function showHelp() {
  console.log(`
IoT Device Simulator Commands:
  start [interval]  - Start sending events (default: 5 seconds)
  stop             - Stop sending events
  leak             - Toggle leak detection
  status           - Show current status
  send             - Send single event immediately
  help             - Show this help
  exit             - Exit simulator

Environment Variables:
  API_URL          - API endpoint (default: http://localhost:3000)
  DEVICE_ID        - Device identifier (default: sim-device-001)
  `);
}

function showStatus() {
  console.log(`
Current Status:
  Device ID: ${DEVICE_ID}
  API URL: ${API_URL}
  Simulation: ${intervalId ? 'Running' : 'Stopped'}
  Leak Status: ${isLeaking ? '🚨 LEAKING' : '✓ Normal'}
  `);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  IoT Device Simulator - Premium Plumbing MVP');
  console.log('═══════════════════════════════════════════════════════');
  showStatus();
  showHelp();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'iot-sim> ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const [command, ...args] = line.trim().split(' ');

    switch (command.toLowerCase()) {
      case 'start':
        startSimulation(args[0] ? parseInt(args[0]) : 5);
        break;
      case 'stop':
        stopSimulation();
        break;
      case 'leak':
        toggleLeak();
        break;
      case 'status':
        showStatus();
        break;
      case 'send':
        await sendEvent();
        break;
      case 'help':
        showHelp();
        break;
      case 'exit':
      case 'quit':
        stopSimulation();
        rl.close();
        process.exit(0);
        break;
      default:
        if (command) {
          console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('close', () => {
    stopSimulation();
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  stopSimulation();
  console.log('\nShutting down...');
  process.exit(0);
});

if (require.main === module) {
  main();
}
