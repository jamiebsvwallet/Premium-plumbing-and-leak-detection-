import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { io, Socket } from 'socket.io-client'
import Link from 'next/link'

interface DeviceEvent {
  id: string
  timestamp: string
  metrics: {
    temperature?: number
    pressure?: number
    flow?: number
    humidity?: number
  }
  alertType?: string
  sha256: string
}

export default function DigitalTwin() {
  const router = useRouter()
  const { deviceId } = router.query
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<DeviceEvent[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<any>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!deviceId) return

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const socket = io(socketUrl, {
      auth: { token },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to Socket.IO')
      setConnected(true)
      socket.emit('join-device', deviceId)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO')
      setConnected(false)
    })

    socket.on('device-event', (data: any) => {
      console.log('Received device event:', data)
      if (data.deviceId === deviceId) {
        const event = data.event
        setEvents((prev) => [event, ...prev].slice(0, 20))
        setCurrentMetrics(event.metrics)
      }
    })

    socket.on('error', (error: any) => {
      console.error('Socket error:', error)
    })

    return () => {
      socket.disconnect()
    }
  }, [deviceId, router])

  if (!deviceId) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Digital Twin</h1>
              <p className="text-gray-600 dark:text-gray-400">Device: {deviceId}</p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Current Metrics</h2>
            {currentMetrics ? (
              <div className="space-y-3">
                {currentMetrics.temperature !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded">
                    <span className="font-medium">Temperature</span>
                    <span className="text-2xl">{currentMetrics.temperature}°C</span>
                  </div>
                )}
                {currentMetrics.pressure !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded">
                    <span className="font-medium">Pressure</span>
                    <span className="text-2xl">{currentMetrics.pressure} bar</span>
                  </div>
                )}
                {currentMetrics.flow !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900 rounded">
                    <span className="font-medium">Flow</span>
                    <span className="text-2xl">{currentMetrics.flow} L/min</span>
                  </div>
                )}
                {currentMetrics.humidity !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
                    <span className="font-medium">Humidity</span>
                    <span className="text-2xl">{currentMetrics.humidity}%</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Waiting for data...</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">3D Visualization</h2>
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🚰</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Placeholder for Three.js scene
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Replace with actual 3D visualization
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg ${
                  event.alertType
                    ? 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                    {event.alertType && (
                      <span className="ml-3 px-2 py-1 bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 text-xs rounded">
                        {event.alertType}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {Object.entries(event.metrics).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-600 dark:text-gray-400">{key}: </span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 font-mono truncate">
                  Hash: {event.sha256}
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-gray-500 py-8">No events yet. Run the IoT simulator to generate events.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
