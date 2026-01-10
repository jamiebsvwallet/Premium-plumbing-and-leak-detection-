#!/usr/bin/env tsx

/**
 * IoT Device Simulator
 * 
 * Simulates IoT device events and sends them to the server ingestion endpoint
 * 
 * Usage:
 *   npm run simulate -- <deviceId>
 *   npm run simulate -- <deviceId> --interval 5000
 *   npm run simulate -- <deviceId> --count 10
 */

const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

interface SimulatedMetrics {
  temperature: number
  pressure: number
  flowRate: number
  humidity: number
  vibration: number
}

function generateRandomMetrics(): SimulatedMetrics {
  return {
    temperature: Math.round((20 + Math.random() * 10) * 10) / 10, // 20-30°C
    pressure: Math.round((2 + Math.random() * 2) * 10) / 10, // 2-4 bar
    flowRate: Math.round((5 + Math.random() * 15) * 10) / 10, // 5-20 L/min
    humidity: Math.round((30 + Math.random() * 40)), // 30-70%
    vibration: Math.round(Math.random() * 100) / 10, // 0-10 mm/s
  }
}

function detectAlert(metrics: SimulatedMetrics): string | null {
  if (metrics.pressure > 3.5) return 'HIGH_PRESSURE'
  if (metrics.pressure < 2.2) return 'LOW_PRESSURE'
  if (metrics.temperature > 28) return 'HIGH_TEMPERATURE'
  if (metrics.flowRate > 18) return 'HIGH_FLOW'
  if (metrics.vibration > 8) return 'HIGH_VIBRATION'
  return null
}

async function sendEvent(deviceId: string) {
  const metrics = generateRandomMetrics()
  const alertType = detectAlert(metrics)

  const payload = {
    deviceId,
    timestamp: new Date().toISOString(),
    metrics,
    alertType,
    rawPayload: {
      batteryLevel: Math.round(70 + Math.random() * 30), // 70-100%
      signalStrength: Math.round(-80 + Math.random() * 30), // -80 to -50 dBm
    },
  }

  try {
    const response = await fetch(`${SERVER_URL}/api/events/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error:', error)
      return false
    }

    const result = await response.json()
    console.log(`✓ Event sent: ${result.event.id} [${alertType || 'NORMAL'}]`)
    console.log(`  SHA256: ${result.event.sha256.substring(0, 16)}...`)
    console.log(`  Metrics:`, metrics)
    return true
  } catch (error) {
    console.error('❌ Network error:', error)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('IoT Device Simulator')
    console.log('')
    console.log('Usage:')
    console.log('  npm run simulate -- <deviceId>')
    console.log('  npm run simulate -- <deviceId> --interval 5000')
    console.log('  npm run simulate -- <deviceId> --count 10')
    console.log('')
    console.log('Options:')
    console.log('  --interval <ms>  Time between events (default: 10000)')
    console.log('  --count <n>      Number of events to send (default: infinite)')
    process.exit(0)
  }

  const deviceId = args[0]
  const intervalIndex = args.indexOf('--interval')
  const countIndex = args.indexOf('--count')

  const interval = intervalIndex !== -1 ? parseInt(args[intervalIndex + 1]) : 10000
  const maxCount = countIndex !== -1 ? parseInt(args[countIndex + 1]) : Infinity

  console.log('IoT Device Simulator')
  console.log(`Device ID: ${deviceId}`)
  console.log(`Server URL: ${SERVER_URL}`)
  console.log(`Interval: ${interval}ms`)
  console.log(`Max events: ${maxCount === Infinity ? 'infinite' : maxCount}`)
  console.log('')

  let count = 0

  // Send first event immediately
  await sendEvent(deviceId)
  count++

  if (count >= maxCount) {
    console.log('\nSimulation complete!')
    process.exit(0)
  }

  // Set up interval for subsequent events
  const intervalId = setInterval(async () => {
    await sendEvent(deviceId)
    count++

    if (count >= maxCount) {
      clearInterval(intervalId)
      console.log('\nSimulation complete!')
      process.exit(0)
    }
  }, interval)

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(intervalId)
    console.log('\nSimulation stopped')
    process.exit(0)
  })
}

main()
