import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import * as THREE from 'three';

export default function ARDiagnostics() {
  const router = useRouter();
  const { deviceId } = router.query;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkXRSupport();
  }, []);

  const checkXRSupport = async () => {
    if ('xr' in navigator) {
      try {
        const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        setXrSupported(supported);
        if (supported) {
          initARScene();
        }
      } catch (err) {
        console.error('XR check failed:', err);
        setXrSupported(false);
        initFallbackScene();
      }
    } else {
      setXrSupported(false);
      initFallbackScene();
    }
  };

  const initARScene = () => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.xr.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);

    // Add lights
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Create AR content (device overlay)
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -1);
    scene.add(cube);

    // Add device info label (as plane with text texture)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.fillText(`Device: ${deviceId}`, 20, 60);
    ctx.fillText('Status: Active', 20, 120);
    ctx.fillText('Tap to view details', 20, 180);

    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(1, 0.5);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      map: labelTexture,
      transparent: true,
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 0.5, -1);
    scene.add(label);

    // Animation
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);
  };

  const initFallbackScene = () => {
    if (!canvasRef.current) return;

    // Create a simple Three.js scene as fallback
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create device model
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add text
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = 'black';
    ctx.font = '32px Arial';
    ctx.fillText('AR Preview', 150, 80);
    ctx.font = '24px Arial';
    ctx.fillText(`Device: ${deviceId}`, 100, 140);
    ctx.fillText('(WebXR not supported)', 80, 190);

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeometry = new THREE.PlaneGeometry(2, 1);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y = 2;
    scene.add(plane);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();
  };

  const startARSession = async () => {
    if (!xrSupported) {
      setError('AR is not supported on this device');
      return;
    }

    try {
      // Request AR session
      const session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
      });

      // The actual AR session would be handled by Three.js XR
      console.log('AR session started');
    } catch (err: any) {
      setError(`Failed to start AR session: ${err.message}`);
      console.error('AR session error:', err);
    }
  };

  return (
    <>
      <Head>
        <title>AR Diagnostics - {deviceId}</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">AR Diagnostics: {deviceId}</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* AR View */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div ref={canvasRef} style={{ width: '100%', height: '600px' }} />
          </div>

          {/* Controls */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold mb-4">AR Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">WebXR Support:</span>
                  <span className={xrSupported ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {xrSupported === null ? 'Checking...' : xrSupported ? '✓ Available' : '✗ Not Available'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device:</span>
                  <span className="font-mono">{deviceId}</span>
                </div>
              </div>

              {xrSupported && (
                <button
                  onClick={startARSession}
                  className="mt-6 w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  🥽 Start AR Session
                </button>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold mb-4">Instructions</h3>
              <div className="space-y-2 text-gray-700">
                <p className="font-bold">For AR-capable devices:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Start AR Session"</li>
                  <li>Point your camera at a flat surface</li>
                  <li>Tap to place the device overlay</li>
                  <li>View real-time diagnostics in AR</li>
                </ol>

                <p className="font-bold mt-4">Fallback options:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>iOS: Download USDZ model for Quick Look</li>
                  <li>Android: Use marker-based AR with AR.js</li>
                  <li>Desktop: View 3D preview above</li>
                </ul>

                <div className="mt-4 pt-4 border-t">
                  <a
                    href="/models/device-model.usdz"
                    rel="ar"
                    className="block w-full text-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  >
                    📱 Open in iOS Quick Look
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">💡 About AR Diagnostics</h3>
            <p className="text-gray-700">
              AR Diagnostics uses WebXR to overlay device information and diagnostics in augmented reality. 
              This allows technicians to see real-time data and instructions while working on physical equipment.
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Note:</strong> WebXR support requires a compatible device and browser. 
              For the best experience, use Chrome on Android or Safari on iOS 15+.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
