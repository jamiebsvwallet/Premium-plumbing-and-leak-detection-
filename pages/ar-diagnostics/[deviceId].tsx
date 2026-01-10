import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../../lib/auth';

export default function ARDiagnostics() {
  const router = useRouter();
  const { deviceId } = router.query;
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    // Check for AR support
    if (typeof window !== 'undefined') {
      // @ts-ignore
      setArSupported('xr' in navigator);
    }
  }, [router]);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>AR Diagnostics - Device {deviceId?.slice(0, 8)}</h1>
        <button
          onClick={() => router.push('/devices')}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Back to Devices
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px' }}>
        <strong>AR Status:</strong> {arSupported ? '✅ WebXR Supported' : '⚠️ WebXR not supported, using AR.js fallback'}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>AR.js Marker-based AR</h2>
        <p>Print this Hiro marker and point your camera at it:</p>
        <img
          src="https://raw.githubusercontent.com/jeromeetienne/AR.js/master/data/images/hiro.png"
          alt="Hiro Marker"
          style={{ width: '200px', border: '1px solid #ddd', marginTop: '10px' }}
        />
      </div>

      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3>AR View Placeholder</h3>
        <div style={{ width: '100%', height: '400px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <div style={{ textAlign: 'center' }}>
            <p>📱 AR Camera View</p>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>TODO: Initialize AR.js with A-Frame</p>
            <p style={{ fontSize: '12px' }}>Display 3D plumbing overlay on marker detection</p>
            <p style={{ fontSize: '12px' }}>Show real-time sensor data in AR space</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Implementation Notes</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>Use AR.js with A-Frame for marker-based AR tracking</li>
          <li>Load glTF/USDZ plumbing models</li>
          <li>Display real-time sensor overlays</li>
          <li>Highlight leak detection points</li>
          <li>Interactive hotspots for detailed diagnostics</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Quick Start</h3>
        <pre style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
{`<!-- Add to page head -->
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>

<!-- AR Scene -->
<a-scene embedded arjs>
  <a-marker preset="hiro">
    <a-entity
      position="0 0 0"
      scale="0.05 0.05 0.05"
      gltf-model="url(/models/plumbing-system.gltf)"
    ></a-entity>
  </a-marker>
  <a-entity camera></a-entity>
</a-scene>`}
        </pre>
      </div>
    </div>
  );
}
