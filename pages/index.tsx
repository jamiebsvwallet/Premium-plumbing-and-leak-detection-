import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>BSV Premium Plumbing & Leak Detection</h1>
      <p>
        Welcome to the BSV-anchored IoT monitoring platform for plumbing and leak detection.
      </p>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Link href="/login" style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#0070f3', 
          color: 'white', 
          borderRadius: '5px',
          textDecoration: 'none'
        }}>
          Login
        </Link>
        <Link href="/signup" style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#0070f3', 
          color: 'white', 
          borderRadius: '5px',
          textDecoration: 'none'
        }}>
          Sign Up
        </Link>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Features</h2>
        <ul>
          <li>Real-time IoT device monitoring</li>
          <li>BSV blockchain anchoring for data integrity</li>
          <li>Digital twin visualization</li>
          <li>AR-based diagnostics with WebXR</li>
          <li>Job reports and notifications</li>
          <li>Consent-based data sharing with operators</li>
        </ul>
      </div>
    </div>
  )
}
