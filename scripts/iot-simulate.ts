#!/usr/bin/env tsx

/**
 * IoT Event Simulator
 * 
 * Simulates IoT device events by sending data to the server /api/events/ingest endpoint
 * 
 * Usage:
 *   npm run simulate <deviceId>
 *   tsx scripts/iot-simulate.ts <deviceId>
 * 
 * Example:
 *   npm run simulate clxxxx123456
 */

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001'

interface SimulatedEvent {
  deviceId: string
  timestamp: string
  metrics: {
    temperature: number
    pressure: number
    flow: number
    humidity: number
  }
  alertType?: string
  rawPayload?: any
}

function generateRandomEvent(deviceId: string): SimulatedEvent {
  const temperature = 15 + Math.random() * 20 // 15-35°C
  const pressure = 3 + Math.random() * 2 // 3-5 bar
  const flow = Math.random() * 10 // 0-10 L/min
  const humidity = 40 + Math.random() * 40 // 40-80%

  let alertType: string | undefined

  // Generate alerts based on thresholds
  if (pressure > 4.5) {
    alertType = 'HIGH_PRESSURE'
  } else if (pressure < 3.2) {
    alertType = 'LOW_PRESSURE'
  } else if (flow > 8) {
    alertType = 'HIGH_FLOW'
  } else if (temperature > 30) {
    alertType = 'HIGH_TEMPERATURE'
  } else if (humidity > 75) {
    alertType = 'HIGH_HUMIDITY'
  }

  return {
    deviceId,
    timestamp: new Date().toISOString(),
    metrics: {
      temperature: Math.round(temperature * 100) / 100,
      pressure: Math.round(pressure * 100) / 100,
      flow: Math.round(flow * 100) / 100,
      humidity: Math.round(humidity * 100) / 100,
    },
    alertType,
    rawPayload: {
      sensorId: `sensor-${Math.floor(Math.random() * 100)}`,
      batteryLevel: 80 + Math.random() * 20,
    },
  }
}

async function sendEvent(event: SimulatedEvent) {
  try {
    const response = await fetch(`${SERVER_URL}/api/events/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error sending event:', error)
      return
    }

    const result = await response.json()
    console.log('Event sent successfully:', {
      id: result.id,
      sha256: result.sha256,
      anchorStatus: result.anchorStatus,
      alert: event.alertType || 'none',
    })
  } catch (error) {
    console.error('Failed to send event:', error)
  }
}

async function main() {
  const deviceId = process.argv[2]

  if (!deviceId) {
    console.error('Usage: npm run simulate <deviceId>')
    process.exit(1)
  }

  console.log(`Starting IoT simulator for device: ${deviceId}`)
  console.log(`Server URL: ${SERVER_URL}`)
  console.log('Sending event every 5 seconds. Press Ctrl+C to stop.\n')

  // Send initial event
  const event = generateRandomEvent(deviceId)
  await sendEvent(event)

  // Send events every 5 seconds
  setInterval(async () => {
    const event = generateRandomEvent(deviceId)
    await sendEvent(event)
  }, 5000)
}

main().catch(console.error)
