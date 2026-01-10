import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as THREE from 'three'

interface DeviceEvent {
  id: string
  timestamp: string
  metrics: any
  alertType: string | null
}

export default function ARDiagnostics() {
  const router = useRouter()
  const { deviceId } = router.query
  const canvasRef = useRef<HTMLDivElement>(null)
  const [latestMetrics, setLatestMetrics] = useState<any>(null)
  const [arSupported, setArSupported] = useState(false)
  const [arActive, setArActive] = useState(false)
  const [useMarkerBased, setUseMarkerBased] = useState(false)

  useEffect(() => {
    if (!deviceId) return

    // Check WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setArSupported(supported)
        if (!supported) {
          console.log('WebXR not supported, fallback to marker-based AR')
          setUseMarkerBased(true)
        }
      })
    } else {
      setUseMarkerBased(true)
    }

    // Fetch latest events
    fetchEvents()
  }, [deviceId])

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
    })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    renderer.xr.enabled = true
    canvasRef.current.appendChild(renderer.domElement)

    // Create AR overlay content
    const geometry = new THREE.SphereGeometry(0.3, 32, 32)
    const material = new THREE.MeshBasicMaterial({ 
      color: latestMetrics?.alertType ? 0xff0000 : 0x00ff00,
      wireframe: true,
    })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(0, 1.5, -2)
    scene.add(sphere)

    // Add text overlay (simplified for MVP)
    if (latestMetrics) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 512
      canvas.height = 512
      
      if (context) {
        context.fillStyle = latestMetrics.alertType ? '#ff0000' : '#00ff00'
        context.font = 'bold 48px Arial'
        context.fillText(`Status: ${latestMetrics.alertType || 'OK'}`, 50, 100)
        context.fillText(`Flow: ${latestMetrics.flow || 0}`, 50, 200)
        context.fillText(`Temp: ${latestMetrics.temperature || 0}°C`, 50, 300)
      }

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.set(0, 2, -2)
      sprite.scale.set(2, 2, 1)
      scene.add(sprite)
    }

    // Add ambient light
    const light = new THREE.AmbientLight(0xffffff)
    scene.add(light)

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      sphere.rotation.x += 0.01
      sphere.rotation.y += 0.01

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
        if (data.events.length > 0) {
          setLatestMetrics(data.events[0].metrics)
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  const startAR = async () => {
    if (!arSupported) {
      alert('WebXR AR not supported on this device. Using preview mode.')
      return
    }

    setArActive(true)
    // In a production app, you would activate XR session here
    // const session = await navigator.xr.requestSession('immersive-ar');
    // renderer.xr.setSession(session);
  }

  return (
    <>
      <Head>
        <title>AR Diagnostics - {deviceId}</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">AR Diagnostics</h1>
              <p className="text-gray-600">Device: {deviceId}</p>
            </div>
            <Link href="/devices">
              <button className="btn-secondary">← Back</button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">AR View</h2>
                  {arSupported && !arActive && (
                    <button onClick={startAR} className="btn-primary">
                      Start AR
                    </button>
                  )}
                </div>

                {useMarkerBased && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
                    <p className="font-semibold">Marker-based AR Mode</p>
                    <p className="text-sm">WebXR not supported. Using AR.js fallback.</p>
                    <p className="text-sm mt-2">
                      Print a Hiro marker or use the marker from{' '}
                      <a 
                        href="https://github.com/AR-js-org/AR.js" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        AR.js documentation
                      </a>
                    </p>
                  </div>
                )}

                <div ref={canvasRef} style={{ height: '500px', width: '100%' }} />

                <div className="mt-4 text-sm text-gray-600">
                  <p>📱 <strong>iOS:</strong> Use Safari and tap the AR icon for Quick Look</p>
                  <p>🤖 <strong>Android:</strong> Use Chrome with ARCore support</p>
                  <p>💻 <strong>Desktop:</strong> Preview mode shown above</p>
                </div>
              </div>
            </div>

            <div>
              <div className="card mb-6">
                <h2 className="text-2xl font-bold mb-4">Device Status</h2>
                {latestMetrics ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Flow Rate</p>
                      <p className="text-2xl font-bold">{latestMetrics.flow || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-2xl font-bold">{latestMetrics.temperature || 'N/A'}°C</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Pressure</p>
                      <p className="text-2xl font-bold">{latestMetrics.pressure || 'N/A'} PSI</p>
                    </div>
                    {latestMetrics.alertType && (
                      <div className="p-3 bg-red-100 rounded border border-red-400">
                        <p className="text-sm text-red-600">Alert Status</p>
                        <p className="text-2xl font-bold text-red-800">
                          {latestMetrics.alertType}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold mb-4">AR Instructions</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Grant camera permissions when prompted</li>
                  <li>Point your device at a flat surface</li>
                  <li>Tap to place the AR overlay</li>
                  <li>View real-time device diagnostics in AR</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
