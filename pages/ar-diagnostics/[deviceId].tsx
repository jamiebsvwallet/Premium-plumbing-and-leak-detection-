import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function ARDiagnostics() {
  const router = useRouter()
  const { deviceId } = router.query
  const [webXRSupported, setWebXRSupported] = useState<boolean | null>(null)
  const [arSession, setArSession] = useState<any>(null)

  useEffect(() => {
    // Check WebXR support
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      (navigator as any).xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setWebXRSupported(supported)
      }).catch(() => {
        setWebXRSupported(false)
      })
    } else {
      setWebXRSupported(false)
    }
  }, [])

  const startARSession = async () => {
    if (!webXRSupported) {
      alert('WebXR not supported on this device. Try using AR.js marker-based fallback.')
      return
    }

    try {
      // Request AR session
      const session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      })

      setArSession(session)
      
      // TODO: Implement WebXR rendering loop
      // See: https://immersiveweb.dev/
      
      session.addEventListener('end', () => {
        setArSession(null)
      })

      alert('AR session started! (Implementation TODO)')
    } catch (error) {
      console.error('Error starting AR session:', error)
      alert('Failed to start AR session')
    }
  }

  const stopARSession = () => {
    if (arSession) {
      arSession.end()
      setArSession(null)
    }
  }

  if (!deviceId) {
    return <div style={{ padding: '2rem' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>AR Diagnostics - Device {deviceId}</h1>
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

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '5px' }}>
        <h2>WebXR Status</h2>
        <p>
          <strong>WebXR Support:</strong>{' '}
          {webXRSupported === null && '⏳ Checking...'}
          {webXRSupported === true && '✅ Supported'}
          {webXRSupported === false && '❌ Not Supported'}
        </p>
        
        {webXRSupported && !arSession && (
          <button
            onClick={startARSession}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            🚀 Start AR Session
          </button>
        )}

        {arSession && (
          <button
            onClick={stopARSession}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ⏹️ Stop AR Session
          </button>
        )}
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#e3f2fd', borderRadius: '5px' }}>
        <h2>WebXR Implementation Guide</h2>
        <ol>
          <li>
            <strong>WebXR Device API:</strong> Use the WebXR Device API for immersive AR experiences on compatible devices
            <ul>
              <li>Requires HTTPS (or localhost for development)</li>
              <li>Supported on Android devices with ARCore</li>
              <li>Supported on iOS 15+ with WebXR Viewer app or Safari 17.4+</li>
            </ul>
          </li>
          <li>
            <strong>Three.js with WebXR:</strong> Integrate Three.js for 3D rendering
            <pre style={{ background: 'white', padding: '0.5rem', marginTop: '0.5rem', overflow: 'auto' }}>
{`import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton'

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.xr.enabled = true

const arButton = ARButton.createButton(renderer, {
  requiredFeatures: ['hit-test']
})

document.body.appendChild(arButton)`}
            </pre>
          </li>
          <li>
            <strong>Device Model:</strong> Load 3D model of the device in glTF or GLB format
            <ul>
              <li>Place model at detected surface using hit-test</li>
              <li>Overlay real-time metrics from Socket.IO</li>
              <li>Highlight problem areas based on alerts</li>
            </ul>
          </li>
        </ol>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff3cd', borderRadius: '5px' }}>
        <h2>AR.js Fallback (Marker-based AR)</h2>
        <p>For devices without WebXR support, use AR.js with marker-based tracking:</p>
        
        <ol>
          <li>Print a Hiro marker or custom marker</li>
          <li>Point device camera at the marker</li>
          <li>3D model appears on top of the marker</li>
        </ol>

        <h3 style={{ marginTop: '1rem' }}>AR.js Implementation</h3>
        <pre style={{ background: 'white', padding: '0.5rem', overflow: 'auto' }}>
{`<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>

<a-scene embedded arjs>
  <a-marker preset="hiro">
    <a-box position="0 0.5 0" material="color: blue;"></a-box>
  </a-marker>
  <a-entity camera></a-entity>
</a-scene>`}
        </pre>

        <button
          onClick={() => {
            alert('AR.js marker-based mode not yet implemented. See implementation notes above.')
          }}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          📷 Launch Marker-based AR (TODO)
        </button>
      </div>

      <div style={{ padding: '1.5rem', background: '#f0f0f0', borderRadius: '5px' }}>
        <h2>3D Assets</h2>
        <p>Place your 3D models in the <code>public/models/</code> directory:</p>
        <ul>
          <li>
            <strong>glTF/GLB:</strong> For web-based AR (WebXR, AR.js)
            <ul>
              <li>Example: <code>public/models/device.glb</code></li>
            </ul>
          </li>
          <li>
            <strong>USDZ:</strong> For iOS Quick Look AR
            <ul>
              <li>Example: <code>public/models/device.usdz</code></li>
              <li>Use: <code>&lt;a rel="ar" href="/models/device.usdz"&gt;</code></li>
            </ul>
          </li>
        </ul>

        <h3 style={{ marginTop: '1rem' }}>Quick Look AR (iOS)</h3>
        <p>iOS devices can use Quick Look for AR without WebXR:</p>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            alert('Add a USDZ model to public/models/device.usdz and update this link')
          }}
          style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: '#007AFF',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none',
          }}
        >
          View in AR (iOS Quick Look)
        </a>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#ffebee', borderRadius: '5px' }}>
        <h3>⚠️ Important Notes</h3>
        <ul>
          <li>WebXR requires HTTPS in production (localhost works for development)</li>
          <li>Test on actual devices - AR experiences don't work in desktop browsers</li>
          <li>For Android: Use Chrome with ARCore support</li>
          <li>For iOS: Use Safari 17.4+ or dedicated WebXR apps</li>
          <li>Provide USDZ models for iOS Quick Look as fallback</li>
          <li>Consider using AR.js for broader device compatibility</li>
        </ul>
      </div>
    </div>
  )
}
