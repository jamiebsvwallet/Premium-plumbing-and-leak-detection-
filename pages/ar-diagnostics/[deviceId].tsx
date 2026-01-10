import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import * as THREE from 'three';

interface DeviceMetrics {
  waterFlow: number;
  pressure: number;
  temperature: number;
  batteryLevel: number;
}

export default function ARDiagnostics() {
  const router = useRouter();
  const { deviceId } = router.query;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [latestMetrics, setLatestMetrics] = useState<DeviceMetrics | null>(null);
  const [arSupported, setArSupported] = useState(false);
  const [useWebXR, setUseWebXR] = useState(false);

  useEffect(() => {
    // Check for WebXR support
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setArSupported(supported);
        setUseWebXR(supported);
      });
    }
  }, []);

  // Initialize Three.js scene for AR
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);

    // Create device overlay
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x4a90e2,
      wireframe: true,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -2);
    scene.add(cube);

    // Add info text (sprite)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 512;
      canvas.height = 256;
      context.fillStyle = '#ffffff';
      context.font = '48px Arial';
      context.fillText('Device: ' + (deviceId || 'Unknown'), 20, 60);
      context.fillText('Tap to view details', 20, 120);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(0, 0.8, -2);
    sprite.scale.set(2, 1, 1);
    scene.add(sprite);

    // Animation loop
    const animate = () => {
      renderer.setAnimationLoop(() => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      });
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, [deviceId]);

  // Fetch device metrics
  useEffect(() => {
    if (!deviceId || typeof deviceId !== 'string') return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch latest metrics
    fetch(`/api/events/list?deviceId=${deviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.events && data.events.length > 0) {
          const latest = data.events[0];
          setLatestMetrics(JSON.parse(latest.metrics));
        }
      })
      .catch(console.error);
  }, [deviceId, router]);

  const startARSession = async () => {
    if (!navigator.xr) {
      alert('WebXR not supported on this device');
      return;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local'],
        optionalFeatures: ['dom-overlay'],
      });
      alert('AR session started! (Feature requires AR-capable device)');
    } catch (error) {
      console.error('Failed to start AR session:', error);
      alert('Failed to start AR session. This feature requires an AR-capable device.');
    }
  };

  if (!deviceId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="overlay-ui">
        <div className="header">
          <h1>AR Diagnostics</h1>
          <button onClick={() => router.back()} className="btn-back">
            ← Back
          </button>
        </div>

        <div className="info-panel">
          <h2>Device: {deviceId}</h2>
          
          {latestMetrics && (
            <div className="metrics">
              <div className="metric-row">
                <span>Water Flow:</span>
                <strong>{latestMetrics.waterFlow.toFixed(2)} L/min</strong>
              </div>
              <div className="metric-row">
                <span>Pressure:</span>
                <strong>{latestMetrics.pressure.toFixed(2)} PSI</strong>
              </div>
              <div className="metric-row">
                <span>Temperature:</span>
                <strong>{latestMetrics.temperature.toFixed(2)}°C</strong>
              </div>
              <div className="metric-row">
                <span>Battery:</span>
                <strong>{latestMetrics.batteryLevel.toFixed(0)}%</strong>
              </div>
            </div>
          )}

          <div className="ar-controls">
            {arSupported ? (
              <button onClick={startARSession} className="btn-ar">
                🥽 Start AR Session
              </button>
            ) : (
              <div className="ar-info">
                <p>
                  <strong>WebXR AR not supported</strong>
                </p>
                <p>
                  For iOS devices, use the USDZ model below for Quick Look AR.
                </p>
                <a href="/models/device-model.usdz" rel="ar" className="btn-ar">
                  📱 View in AR (iOS)
                </a>
                <p className="note">
                  For Android devices with ARCore, open this page in Chrome or Firefox Reality.
                </p>
              </div>
            )}
          </div>

          <div className="instructions">
            <h3>Instructions</h3>
            <ul>
              <li>Point your device camera at the installation area</li>
              <li>Tap to place the virtual overlay</li>
              <li>View real-time diagnostics in AR</li>
            </ul>
          </div>
        </div>
      </div>

      <div ref={canvasRef} className="ar-canvas" />

      <style jsx>{`
        .container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000;
        }
        .ar-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .overlay-ui {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10;
        }
        .overlay-ui > * {
          pointer-events: auto;
        }
        .header {
          background: rgba(0, 0, 0, 0.8);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(10px);
        }
        h1 {
          color: white;
          margin: 0;
          font-size: 1.25rem;
        }
        .btn-back {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .info-panel {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.8);
          padding: 1.5rem;
          border-radius: 12px;
          color: white;
          max-width: 500px;
          backdrop-filter: blur(10px);
          max-height: 60vh;
          overflow-y: auto;
        }
        h2 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          color: #4a90e2;
        }
        h3 {
          margin: 1.5rem 0 0.5rem 0;
          font-size: 1rem;
        }
        .metrics {
          display: grid;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .ar-controls {
          margin: 1rem 0;
        }
        .btn-ar {
          width: 100%;
          padding: 1rem;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 0.5rem;
          text-decoration: none;
          display: block;
          text-align: center;
        }
        .btn-ar:hover {
          background: #357abd;
        }
        .ar-info {
          text-align: center;
        }
        .ar-info p {
          margin: 0.5rem 0;
          font-size: 0.875rem;
        }
        .note {
          color: #888;
          font-size: 0.75rem;
        }
        .instructions ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        .instructions li {
          margin: 0.5rem 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
