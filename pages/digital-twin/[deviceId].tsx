import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';

interface DeviceMetrics {
  waterFlow: number;
  pressure: number;
  temperature: number;
  batteryLevel: number;
}

interface DeviceEvent {
  id: string;
  timestamp: string;
  metrics: DeviceMetrics;
  alertType: string | null;
}

export default function DigitalTwin() {
  const router = useRouter();
  const { deviceId } = router.query;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<DeviceMetrics | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    device: THREE.Mesh;
    waterFlow: THREE.Mesh;
  } | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || sceneRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Create device representation (cylinder for pipe)
    const deviceGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
    const deviceMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
    const device = new THREE.Mesh(deviceGeometry, deviceMaterial);
    device.rotation.z = Math.PI / 2;
    scene.add(device);

    // Create water flow indicator (inner cylinder)
    const waterFlowGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 32);
    const waterFlowMaterial = new THREE.MeshPhongMaterial({
      color: 0x00bfff,
      transparent: true,
      opacity: 0.6,
    });
    const waterFlow = new THREE.Mesh(waterFlowGeometry, waterFlowMaterial);
    waterFlow.rotation.z = Math.PI / 2;
    scene.add(waterFlow);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    sceneRef.current = { scene, camera, renderer, device, waterFlow };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      device.rotation.y += 0.005;
      waterFlow.rotation.y -= 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !sceneRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      sceneRef.current.camera.aspect = width / height;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update visuals based on metrics
  useEffect(() => {
    if (!latestMetrics || !sceneRef.current) return;

    const { waterFlow, device } = sceneRef.current;
    
    // Update water flow visualization
    const flowIntensity = Math.min(latestMetrics.waterFlow / 20, 1);
    waterFlow.scale.x = 0.5 + flowIntensity * 0.5;
    waterFlow.scale.z = 0.5 + flowIntensity * 0.5;

    // Change color based on alert
    const hasLeak = latestMetrics.waterFlow > 30;
    const color = hasLeak ? 0xff0000 : 0x4a90e2;
    (device.material as THREE.MeshPhongMaterial).color.setHex(color);
  }, [latestMetrics]);

  // Fetch events and setup Socket.IO
  useEffect(() => {
    if (!deviceId || typeof deviceId !== 'string') return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch initial events
    fetch(`/api/events/list?deviceId=${deviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          const parsedEvents = data.events.map((e: any) => ({
            ...e,
            metrics: JSON.parse(e.metrics),
          }));
          setEvents(parsedEvents);
          if (parsedEvents.length > 0) {
            setLatestMetrics(parsedEvents[0].metrics);
          }
        }
      })
      .catch(console.error);

    // Setup Socket.IO connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO');
      setConnected(true);
      socket.emit('subscribe-device', deviceId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
      setConnected(false);
    });

    socket.on('device-event', (data: any) => {
      if (data.deviceId === deviceId) {
        const newEvent = {
          ...data.event,
          metrics: data.event.metrics,
        };
        setEvents((prev) => [newEvent, ...prev].slice(0, 100));
        setLatestMetrics(data.event.metrics);
      }
    });

    return () => {
      socket.emit('unsubscribe-device', deviceId);
      socket.disconnect();
    };
  }, [deviceId, router]);

  if (!deviceId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Digital Twin - {deviceId}</h1>
        <div className="status">
          <span className={`indicator ${connected ? 'connected' : 'disconnected'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <div className="content">
        <div className="twin-view" ref={canvasRef} />

        <div className="metrics-panel">
          <h2>Live Metrics</h2>
          {latestMetrics ? (
            <div className="metrics">
              <div className="metric">
                <span className="label">Water Flow</span>
                <span className="value">
                  {latestMetrics.waterFlow.toFixed(2)} L/min
                </span>
              </div>
              <div className="metric">
                <span className="label">Pressure</span>
                <span className="value">
                  {latestMetrics.pressure.toFixed(2)} PSI
                </span>
              </div>
              <div className="metric">
                <span className="label">Temperature</span>
                <span className="value">
                  {latestMetrics.temperature.toFixed(2)}°C
                </span>
              </div>
              <div className="metric">
                <span className="label">Battery</span>
                <span className="value">
                  {latestMetrics.batteryLevel.toFixed(0)}%
                </span>
              </div>
            </div>
          ) : (
            <p>No data available</p>
          )}

          <h3>Recent Events</h3>
          <div className="events-list">
            {events.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className={`event ${event.alertType ? 'alert' : ''}`}
              >
                <div className="event-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                {event.alertType && (
                  <div className="alert-badge">{event.alertType}</div>
                )}
                <div className="event-data">
                  Flow: {event.metrics.waterFlow.toFixed(1)} L/min
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: #0f0f1e;
          color: white;
        }
        .header {
          padding: 1.5rem 2rem;
          background: #1a1a2e;
          border-bottom: 1px solid #2a2a3e;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .indicator.connected {
          background: #00ff00;
          box-shadow: 0 0 10px #00ff00;
        }
        .indicator.disconnected {
          background: #ff0000;
        }
        .content {
          display: grid;
          grid-template-columns: 1fr 400px;
          height: calc(100vh - 80px);
        }
        .twin-view {
          width: 100%;
          height: 100%;
        }
        .metrics-panel {
          background: #1a1a2e;
          padding: 2rem;
          overflow-y: auto;
          border-left: 1px solid #2a2a3e;
        }
        h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
        }
        h3 {
          margin: 2rem 0 1rem 0;
          font-size: 1rem;
        }
        .metrics {
          display: grid;
          gap: 1rem;
        }
        .metric {
          background: #0f0f1e;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .label {
          color: #888;
        }
        .value {
          font-size: 1.25rem;
          font-weight: bold;
          color: #4a90e2;
        }
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .event {
          background: #0f0f1e;
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .event.alert {
          border-left: 3px solid #ff0000;
        }
        .event-time {
          color: #888;
          margin-bottom: 0.25rem;
        }
        .alert-badge {
          display: inline-block;
          background: #ff0000;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          margin: 0.25rem 0;
        }
        .event-data {
          color: #aaa;
        }
      `}</style>
    </div>
  );
}
