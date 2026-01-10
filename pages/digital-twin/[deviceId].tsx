import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'

interface DeviceEvent {
  deviceId: string
  eventId: string
  timestamp: string
  metrics: {
    temperature: number
    pressure: number
    flowRate: number
    humidity: number
    vibration: number
  }
  alertType: string | null
  anchorStatus: string
}

export default function DigitalTwin() {
  const router = useRouter()
  const { deviceId } = router.query
  const [events, setEvents] = useState<DeviceEvent[]>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!deviceId) return

    // Get auth token from cookie
    const getAuthToken = () => {
      const cookies = document.cookie.split(';')
      const authCookie = cookies.find(c => c.trim().startsWith('auth='))
      return authCookie ? authCookie.split('=')[1] : null
    }

    const token = getAuthToken()
    if (!token) {
      router.push('/login')
      return
    }

    // Connect to Socket.IO server
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server')
      setConnected(true)
      
      // Authenticate
      socket.emit('authenticate', token)
    })

    socket.on('authenticated', (data) => {
      console.log('Authenticated:', data)
    })

    socket.on('device:event', (event: DeviceEvent) => {
      console.log('New device event:', event)
      
      // Only show events for this device
      if (event.deviceId === deviceId) {
        setEvents((prev) => [event, ...prev].slice(0, 50)) // Keep last 50 events
      }
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
      setConnected(false)
    })

    socket.on('auth:error', (error) => {
      console.error('Authentication error:', error)
      router.push('/login')
    })

    return () => {
      socket.disconnect()
    }
  }, [deviceId, router])

  if (!deviceId) {
    return <div style={{ padding: '2rem' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Digital Twin - Device {deviceId}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: connected ? '#4CAF50' : '#f44336',
          }} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
          <Link href="/devices" style={{
            padding: '0.5rem 1rem',
            background: '#666',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none',
          }}>
            ← Back to Devices
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Visualization Area */}
        <div>
          <div style={{ 
            padding: '2rem', 
            background: '#1a1a1a', 
            color: 'white',
            borderRadius: '5px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h2>3D Visualization Placeholder</h2>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#999' }}>
              This is where a Three.js 3D visualization would render the device and its real-time metrics.
            </p>
            <p style={{ textAlign: 'center', color: '#999' }}>
              TODO: Implement Three.js scene with device model and animated metrics.
            </p>
            
            {events.length > 0 && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <h3>Latest Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '2rem' }}>🌡️</div>
                    <div>{events[0].metrics.temperature}°C</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem' }}>💧</div>
                    <div>{events[0].metrics.pressure} bar</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem' }}>💨</div>
                    <div>{events[0].metrics.flowRate} L/min</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem' }}>📊</div>
                    <div>{events[0].metrics.vibration} mm/s</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '5px' }}>
            <h3>Implementation Notes</h3>
            <ul>
              <li>Replace this placeholder with a Three.js scene</li>
              <li>Load 3D model of the device (glTF/GLB format)</li>
              <li>Animate based on real-time metrics from Socket.IO</li>
              <li>Add interactive controls (orbit, zoom)</li>
              <li>Visualize alerts with color changes or effects</li>
            </ul>
          </div>
        </div>

        {/* Events Feed */}
        <div>
          <div style={{ 
            padding: '1rem', 
            background: '#f9f9f9', 
            borderRadius: '5px',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <h2>Real-time Events</h2>
            
            {events.length === 0 ? (
              <p style={{ color: '#666', marginTop: '1rem' }}>
                Waiting for events... Run the IoT simulator to see real-time updates.
              </p>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                {events.map((event) => (
                  <div
                    key={event.eventId}
                    style={{
                      padding: '1rem',
                      marginBottom: '1rem',
                      background: 'white',
                      border: event.alertType ? '2px solid #f44336' : '1px solid #ddd',
                      borderRadius: '5px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>{new Date(event.timestamp).toLocaleTimeString()}</strong>
                      {event.alertType && (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: '#f44336', 
                          color: 'white',
                          borderRadius: '3px',
                          fontSize: '0.8rem'
                        }}>
                          {event.alertType}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      <div>Temp: {event.metrics.temperature}°C</div>
                      <div>Pressure: {event.metrics.pressure} bar</div>
                      <div>Flow: {event.metrics.flowRate} L/min</div>
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>BSV: {event.anchorStatus}</span>
                      {event.anchorStatus === 'PENDING' && '⏳'}
                      {event.anchorStatus === 'SENT' && '✅'}
                      {event.anchorStatus === 'FAILED' && '❌'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
