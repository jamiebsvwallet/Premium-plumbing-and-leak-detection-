import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';

interface DeviceState {
  flowRate: number;
  pressure: number;
  temperature: number;
  alertType: string;
}

export default function DigitalTwin() {
  const router = useRouter();
  const { deviceId } = router.query;
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const deviceMeshRef = useRef<THREE.Mesh | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [deviceState, setDeviceState] = useState<DeviceState>({
    flowRate: 0,
    pressure: 0,
    temperature: 0,
    alertType: 'none',
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!deviceId || !containerRef.current) return;

    // Initialize Three.js scene
    initThreeScene();

    // Connect to Socket.IO for real-time updates
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO');
      setConnected(true);
      socket.emit('subscribe:device', deviceId);
    });

    socket.on('device:event', (event: any) => {
      console.log('Received device event:', event);
      setDeviceState({
        flowRate: event.metrics.flowRate || 0,
        pressure: event.metrics.pressure || 0,
        temperature: event.metrics.temperature || 0,
        alertType: event.alertType || 'none',
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
      setConnected(false);
    });

    // Animation loop
    const animate = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Rotate device mesh
        if (deviceMeshRef.current) {
          deviceMeshRef.current.rotation.y += 0.005;
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe:device', deviceId);
        socketRef.current.disconnect();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [deviceId]);

  // Update device visualization based on state
  useEffect(() => {
    updateDeviceVisualization();
  }, [deviceState]);

  const initThreeScene = () => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create device representation (cylinder for leak detector)
    const geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x2563eb });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    deviceMeshRef.current = mesh;

    // Add flow indicator (arrows)
    const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 16);
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 1.5, 0);
    arrow.rotation.z = Math.PI;
    mesh.add(arrow);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
  };

  const updateDeviceVisualization = () => {
    if (!deviceMeshRef.current) return;

    const material = deviceMeshRef.current.material as THREE.MeshPhongMaterial;

    // Update color based on alert type
    switch (deviceState.alertType) {
      case 'critical':
        material.color.setHex(0xdc2626); // Red
        break;
      case 'warning':
        material.color.setHex(0xf59e0b); // Yellow
        break;
      default:
        material.color.setHex(0x2563eb); // Blue
    }

    // Scale based on pressure (simulation)
    const scale = 1 + (deviceState.pressure / 100) * 0.2;
    deviceMeshRef.current.scale.set(scale, 1, scale);
  };

  const getStatusColor = () => {
    switch (deviceState.alertType) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Digital Twin</h1>
            <div className="flex gap-4">
              <Link
                href={`/ar-diagnostics/${deviceId}`}
                className="text-blue-600 hover:text-blue-700"
              >
                Open AR View
              </Link>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Device: {deviceId}</h2>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      connected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <div ref={containerRef} className="w-full h-[600px] bg-gray-100 rounded" />
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Live Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className={`text-2xl font-bold ${getStatusColor()}`}>
                    {deviceState.alertType.toUpperCase()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Flow Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deviceState.flowRate.toFixed(2)} <span className="text-base">L/min</span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Pressure</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deviceState.pressure.toFixed(2)} <span className="text-base">PSI</span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Temperature</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deviceState.temperature.toFixed(2)} <span className="text-base">°C</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> The 3D model changes color based on alert status and
                scales with pressure changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
