import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as THREE from 'three'
import { io, Socket } from 'socket.io-client'

interface DeviceEvent {
  id: string
  timestamp: string
  metrics: any
  alertType: string | null
  dataHash: string
  bsvTxId: string | null
}

export default function DigitalTwin() {
  const router = useRouter()
  const { deviceId } = router.query
  const canvasRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<DeviceEvent[]>([])
  const [latestMetrics, setLatestMetrics] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!deviceId) return

    // Fetch initial events
    fetchEvents()

    // Initialize Socket.IO
    const token = localStorage.getItem('token')
    if (!token) return

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socket',
    })

    socket.on('connect', () => {
      console.log('Socket connected')
      setConnected(true)
      socket.emit('authenticate', token)
    })

    socket.on('authenticated', (data: any) => {
      if (data.success) {
        socket.emit('subscribe_device', deviceId)
      }
    })

    socket.on('device_event', (event: DeviceEvent) => {
      console.log('Received device event:', event)
      setEvents(prev => [event, ...prev.slice(0, 99)])
      if (event.metrics) {
        setLatestMetrics(event.metrics)
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })

    socketRef.current = socket

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe_device', deviceId)
        socketRef.current.disconnect()
      }
    }
  }, [deviceId])

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    canvasRef.current.appendChild(renderer.domElement)

    // Create device representation
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshPhongMaterial({ 
      color: latestMetrics?.alertType ? 0xff0000 : 0x0088ff,
      shininess: 100,
    })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1, 100)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    // Add metrics display
    if (latestMetrics) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 512
      canvas.height = 512
      
      if (context) {
        context.fillStyle = '#ffffff'
        context.font = 'bold 48px Arial'
        context.fillText(`Flow: ${latestMetrics.flow || 0}`, 50, 100)
        context.fillText(`Temp: ${latestMetrics.temperature || 0}°C`, 50, 200)
        context.fillText(`Press: ${latestMetrics.pressure || 0}`, 50, 300)
      }

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.set(0, 3, 0)
      sprite.scale.set(4, 4, 1)
      scene.add(sprite)
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01

      // Update color based on metrics
      if (latestMetrics?.alertType === 'leak') {
        material.color.setHex(0xff0000)
      } else if (latestMetrics?.alertType === 'anomaly') {
        material.color.setHex(0xffaa00)
      } else {
        material.color.setHex(0x0088ff)
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
    }
  }, [latestMetrics])

  const fetchEvents = async () => {
    const token = localStorage.getItem('token')
    if (!token || !deviceId) return

    try {
      const res = await fetch(`/api/events/query?deviceId=${deviceId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setEvents(data.events)
        if (data.events.length > 0) {
          setLatestMetrics(data.events[0].metrics)
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  return (
    <>
      <Head>
        <title>Digital Twin - {deviceId}</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Digital Twin</h1>
              <p className="text-gray-600">Device: {deviceId}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {connected ? '● Live' : '○ Disconnected'}
              </div>
              <Link href="/devices">
                <button className="btn-secondary">← Back</button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">3D Visualization</h2>
                <div ref={canvasRef} style={{ height: '500px', width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="card mb-6">
                <h2 className="text-2xl font-bold mb-4">Latest Metrics</h2>
                {latestMetrics ? (
                  <div className="space-y-2">
                    <p><strong>Flow:</strong> {latestMetrics.flow || 'N/A'}</p>
                    <p><strong>Temperature:</strong> {latestMetrics.temperature || 'N/A'}°C</p>
                    <p><strong>Pressure:</strong> {latestMetrics.pressure || 'N/A'} PSI</p>
                    {latestMetrics.alertType && (
                      <p className="text-red-600 font-bold">
                        Alert: {latestMetrics.alertType}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Recent Events</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {events.slice(0, 10).map((event) => (
                    <div key={event.id} className="text-sm p-2 bg-gray-50 rounded">
                      <p className="font-semibold">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.alertType && (
                        <p className="text-red-600">{event.alertType}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
