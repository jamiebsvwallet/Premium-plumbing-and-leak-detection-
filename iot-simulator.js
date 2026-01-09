#!/usr/bin/env node

/**
 * IoT Device Simulator
 * Simulates IoT leak detection devices sending data to the platform
 * 
 * Usage:
 *   node iot-simulator.js <AUTH_TOKEN> <DEVICE_ID>
 * 
 * Example:
 *   node iot-simulator.js eyJhbGc... 507f1f77bcf86cd799439011
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.argv[2];
const DEVICE_ID = process.argv[3];

if (!AUTH_TOKEN || !DEVICE_ID) {
  console.error('Usage: node iot-simulator.js <AUTH_TOKEN> <DEVICE_ID>');
  process.exit(1);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
});

// Simulate different types of readings
const generateReading = (type) => {
  const readings = {
    'leak-sensor': {
      value: Math.random() > 0.95 ? 1 : 0, // 5% chance of leak detection
      unit: 'boolean',
      type: 'leak_detected'
    },
    'flow-meter': {
      value: Math.random() * 10, // 0-10 liters/min
      unit: 'liters/min',
      type: 'flow_rate'
    },
    'pressure-sensor': {
      value: 40 + Math.random() * 20, // 40-60 PSI
      unit: 'PSI',
      type: 'pressure'
    },
    'temperature-sensor': {
      value: 15 + Math.random() * 15, // 15-30°C
      unit: '°C',
      type: 'temperature'
    }
  };

  const deviceType = type || 'flow-meter';
  return readings[deviceType] || readings['flow-meter'];
};

const sendData = async (deviceType) => {
  try {
    const reading = generateReading(deviceType);
    const alert = reading.type === 'leak_detected' && reading.value === 1;
    const alertMessage = alert ? 'LEAK DETECTED!' : null;

    const data = {
      deviceId: DEVICE_ID,
      reading,
      alert,
      alertMessage
    };

    console.log(`[${new Date().toISOString()}] Sending data:`, JSON.stringify(data, null, 2));

    const response = await api.post('/iot/data', data);
    
    console.log('✓ Data recorded successfully');
    console.log('  Transaction ID:', response.data.bsvTransaction?.transactionId);
    console.log('  Shared with:', response.data.sharedWith?.join(', ') || 'none');
    
    if (alert) {
      console.log('⚠️  ALERT:', alertMessage);
    }
    
    console.log('---');
  } catch (error) {
    console.error('✗ Error sending data:', error.response?.data || error.message);
  }
};

// Get device info first
const getDeviceInfo = async () => {
  try {
    const response = await api.get('/iot/my-devices');
    const device = response.data.find(d => d._id === DEVICE_ID);
    return device;
  } catch (error) {
    console.error('Failed to get device info:', error.response?.data || error.message);
    return null;
  }
};

// Main simulation loop
const startSimulation = async () => {
  console.log('=== IoT Device Simulator ===');
  console.log('API URL:', API_URL);
  console.log('Device ID:', DEVICE_ID);
  console.log('Starting simulation...\n');

  const device = await getDeviceInfo();
  if (!device) {
    console.error('Device not found or authentication failed');
    process.exit(1);
  }

  console.log('Device Info:');
  console.log('  Name:', device.deviceName);
  console.log('  Type:', device.deviceType);
  console.log('  Status:', device.status);
  console.log('  Location:', device.location?.room || 'Not specified');
  console.log('\nSending data every 5 seconds (Ctrl+C to stop)...\n');

  // Send data every 5 seconds
  setInterval(() => {
    sendData(device.deviceType);
  }, 5000);

  // Send first reading immediately
  sendData(device.deviceType);
};

startSimulation().catch(error => {
  console.error('Simulation error:', error);
  process.exit(1);
});
