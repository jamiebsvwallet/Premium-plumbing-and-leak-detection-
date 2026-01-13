import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isAuthenticated } from '../lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Premium Plumbing & Leak Detection</h1>
      <p>IoT-enabled plumbing diagnostics with WebXR visualization and BSV blockchain anchoring</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Features</h2>
        <ul>
          <li>Real-time device monitoring via Socket.IO</li>
          <li>Digital twin visualization</li>
          <li>AR diagnostics with AR.js</li>
          <li>BSV blockchain event anchoring</li>
          <li>Consent-based data sharing</li>
          <li>Job report management</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => router.push('/auth/login')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
        <button
          onClick={() => router.push('/auth/signup')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
