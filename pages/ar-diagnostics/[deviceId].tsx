import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ARDiagnostics() {
  const router = useRouter();
  const { deviceId } = router.query;
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [webXRSupported, setWebXRSupported] = useState(false);

  useEffect(() => {
    // Check WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setWebXRSupported(supported);
      });
    }
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const fetchDevice = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch(`/api/devices?deviceId=${deviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setDevice(data.device);
        }
      } catch (error) {
        console.error('Error fetching device:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [deviceId, router]);

  const startWebXR = () => {
    alert('WebXR AR session would start here. TODO: Implement WebXR session initialization.');
    // TODO: Initialize WebXR session
    // navigator.xr.requestSession('immersive-ar')...
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!device) {
    return <div style={{ padding: '2rem' }}>Device not found</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>AR Diagnostics: {device.name}</h1>
        <p style={{ color: '#666' }}>Device Type: {device.type}</p>
        <p style={{ fontSize: '0.9rem', color: webXRSupported ? 'green' : 'orange' }}>
          WebXR Support: {webXRSupported ? '✅ Supported' : '⚠️ Not Available (Fallback to AR.js)'}
        </p>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Instructions</h2>
        <ol>
          <li>Position your device camera towards the physical equipment</li>
          <li>Look for AR markers or use surface detection</li>
          <li>View diagnostic overlays and real-time sensor data</li>
          <li>Follow guided repair instructions in AR</li>
        </ol>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        {webXRSupported ? (
          <div>
            <h3>WebXR AR Mode</h3>
            <button
              onClick={startWebXR}
              style={{ padding: '1rem 2rem', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            >
              Start AR Experience
            </button>
          </div>
        ) : (
          <div>
            <h3>AR.js Fallback Mode</h3>
            <p>WebXR is not supported on this device. Using AR.js marker-based AR.</p>
            <div
              style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#000',
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <p>📷 AR Camera View</p>
                <p style={{ fontSize: '0.9rem' }}>
                  TODO: Integrate AR.js for marker-based AR
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
                  Print AR marker and point camera at it to see device overlay
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2>3D Model Assets</h2>
        <p>Placeholder for glTF/USDZ model assets:</p>
        <ul>
          <li>📦 device-model.glb (for Android/WebXR)</li>
          <li>📦 device-model.usdz (for iOS AR Quick Look)</li>
          <li>📦 diagnostic-overlay.glb</li>
        </ul>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          TODO: Add actual 3D models for plumbing equipment
        </p>
      </section>
    </div>
  );
}
