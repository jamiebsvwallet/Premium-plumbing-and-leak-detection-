import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Device {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
}

export default function ARDiagnostics() {
  const router = useRouter();
  const { deviceId } = router.query;
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    fetchDevice();
    checkXRSupport();
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/devices/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch device');

      const data = await response.json();
      setDevice(data);
    } catch (err) {
      console.error('Error fetching device:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkXRSupport = async () => {
    if ('xr' in navigator) {
      try {
        const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        setXrSupported(supported);
      } catch (err) {
        setXrSupported(false);
      }
    } else {
      setXrSupported(false);
    }
  };

  const launchARSession = async () => {
    if (!xrSupported) {
      alert('AR not supported on this device');
      return;
    }

    // TODO: Implement WebXR AR session
    alert('WebXR AR session would launch here. This is a placeholder for the AR experience.');
  };

  if (loading) return <div>Loading...</div>;
  if (!device) return <div>Device not found</div>;

  return (
    <div>
      <nav className="nav">
        <Link href="/dashboard"><h1>Premium Plumbing</h1></Link>
        <div>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/devices">Devices</Link>
          <Link href={`/digital-twin/${deviceId}`}>Digital Twin</Link>
        </div>
      </nav>

      <div className="container">
        <h1>AR Diagnostics: {device.name}</h1>

        <div className="card">
          <h2>WebXR AR View</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Device:</strong> {device.name}</p>
            <p><strong>Type:</strong> {device.type}</p>
            <p><strong>Serial:</strong> {device.serialNumber}</p>
          </div>

          <div style={{ 
            padding: '40px', 
            background: '#f0f0f0', 
            borderRadius: '8px', 
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🥽</div>
            <h3>AR Experience Placeholder</h3>
            <p>WebXR AR view would display here with:</p>
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto' }}>
              <li>3D visualization of plumbing system</li>
              <li>Real-time sensor data overlay</li>
              <li>Leak detection indicators</li>
              <li>Diagnostic information</li>
              <li>Interactive troubleshooting guides</li>
            </ul>
          </div>

          <div style={{ marginTop: '20px' }}>
            {xrSupported === null ? (
              <p>Checking AR support...</p>
            ) : xrSupported ? (
              <button className="button" onClick={launchARSession}>
                🥽 Launch AR Session
              </button>
            ) : (
              <div>
                <p style={{ color: '#d32f2f', marginBottom: '10px' }}>
                  AR not supported on this device/browser
                </p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Try using a device with AR capabilities or a WebXR-compatible browser
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Diagnostic Tools</h3>
          <div className="grid">
            <div>
              <h4>🌡️ Temperature Analysis</h4>
              <p>View temperature trends and anomalies</p>
              <button className="button" style={{ marginTop: '10px' }} disabled>
                Coming Soon
              </button>
            </div>
            <div>
              <h4>💧 Leak Detection</h4>
              <p>AI-powered leak detection and alerts</p>
              <button className="button" style={{ marginTop: '10px' }} disabled>
                Coming Soon
              </button>
            </div>
            <div>
              <h4>📊 Pressure Monitoring</h4>
              <p>Real-time pressure analysis</p>
              <button className="button" style={{ marginTop: '10px' }} disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
