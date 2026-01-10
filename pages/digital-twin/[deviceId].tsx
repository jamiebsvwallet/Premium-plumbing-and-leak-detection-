import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';

interface DeviceEvent {
  id: string;
  timestamp: string;
  metrics: {
    flow: number;
    pressure: number;
    temperature: number;
    humidity: number;
  };
  alertType: string | null;
  eventHash: string;
}

export default function DigitalTwin() {
  const router = useRouter();
  const { deviceId } = router.query;
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [latestEvent, setLatestEvent] = useState<DeviceEvent | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!deviceId || typeof deviceId !== 'string') return;

    // Initialize Three.js scene
    initThreeScene();

    // Connect to Socket.IO
    const token = localStorage.getItem('token');
    if (token) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: { token },
      });

      socketInstance.on('connect', () => {
        console.log('Connected to Socket.IO');
        setIsConnected(true);
        socketInstance.emit('subscribe-device', deviceId);
      });

      socketInstance.on('subscribed', (data) => {
        console.log('Subscribed to device:', data.deviceId);
      });

      socketInstance.on('device-event', (data) => {
        console.log('Received event:', data);
        if (data.deviceId === deviceId) {
          setLatestEvent(data.event);
          updateVisualization(data.event);
        }
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from Socket.IO');
        setIsConnected(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.emit('unsubscribe-device', deviceId);
        socketInstance.disconnect();
      };
    }
  }, [deviceId]);

  const initThreeScene = () => {
    if (!canvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create device representation (cylinder for pipe)
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2,
      shininess: 100,
    });
    const pipe = new THREE.Mesh(geometry, material);
    pipe.name = 'pipe';
    scene.add(pipe);

    // Create flow indicator (sphere)
    const flowGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const flowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7,
    });
    const flowIndicator = new THREE.Mesh(flowGeometry, flowMaterial);
    flowIndicator.position.y = 2;
    flowIndicator.name = 'flowIndicator';
    scene.add(flowIndicator);

    // Add grid
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate pipe
      pipe.rotation.y += 0.005;

      // Animate flow indicator
      flowIndicator.position.y = Math.sin(Date.now() * 0.003) * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  };

  const updateVisualization = (event: DeviceEvent) => {
    if (!sceneRef.current) return;

    const pipe = sceneRef.current.getObjectByName('pipe') as THREE.Mesh;
    const flowIndicator = sceneRef.current.getObjectByName('flowIndicator') as THREE.Mesh;

    if (pipe && pipe.material instanceof THREE.MeshPhongMaterial) {
      // Change color based on alert
      if (event.alertType === 'leak') {
        pipe.material.color.setHex(0xff0000); // Red for leak
      } else {
        pipe.material.color.setHex(0x4a90e2); // Blue for normal
      }
    }

    if (flowIndicator && flowIndicator.material instanceof THREE.MeshBasicMaterial) {
      // Change flow indicator based on flow rate
      const flowRate = event.metrics.flow;
      if (flowRate > 50) {
        flowIndicator.material.color.setHex(0xff0000); // Red for high flow
        flowIndicator.scale.set(1.5, 1.5, 1.5);
      } else if (flowRate > 10) {
        flowIndicator.material.color.setHex(0xffff00); // Yellow for medium flow
        flowIndicator.scale.set(1.2, 1.2, 1.2);
      } else {
        flowIndicator.material.color.setHex(0x00ff00); // Green for normal flow
        flowIndicator.scale.set(1, 1, 1);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Digital Twin - {deviceId}</title>
      </Head>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <Link href="/dashboard" className="text-blue-400 hover:underline">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white mt-2">Digital Twin: {deviceId}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {isConnected ? '● Live' : '● Disconnected'}
              </span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 3D Visualization */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div ref={canvasRef} style={{ width: '100%', height: '600px' }} />
              </div>
            </div>

            {/* Stats Panel */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Live Metrics</h3>
                {latestEvent ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Flow Rate</p>
                      <p className="text-2xl font-bold">
                        {latestEvent.metrics.flow.toFixed(2)} L/min
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Pressure</p>
                      <p className="text-2xl font-bold">
                        {latestEvent.metrics.pressure.toFixed(1)} PSI
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Temperature</p>
                      <p className="text-2xl font-bold">
                        {latestEvent.metrics.temperature.toFixed(1)}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Humidity</p>
                      <p className="text-2xl font-bold">
                        {latestEvent.metrics.humidity.toFixed(1)}%
                      </p>
                    </div>
                    {latestEvent.alertType && (
                      <div className="mt-4 p-3 bg-red-600 rounded-lg">
                        <p className="font-bold">🚨 Alert: {latestEvent.alertType}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">Waiting for data...</p>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Controls</h3>
                <p className="text-sm text-gray-400 mb-4">
                  The 3D visualization updates in real-time as events are received.
                </p>
                <Link
                  href={`/ar-diagnostics/${deviceId}`}
                  className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Switch to AR View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
