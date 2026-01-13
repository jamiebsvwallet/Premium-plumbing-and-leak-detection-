import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>BSV Premium Plumbing and Leak Detection</h1>
        <p style={{ color: '#666' }}>IoT-powered leak detection with BSV blockchain anchoring</p>
      </header>

      <nav style={{ marginBottom: '2rem' }}>
        <Link href="/auth/login" style={{ marginRight: '1rem', color: '#0070f3' }}>
          Login
        </Link>
        <Link href="/auth/signup" style={{ marginRight: '1rem', color: '#0070f3' }}>
          Sign Up
        </Link>
        <Link href="/dashboard" style={{ marginRight: '1rem', color: '#0070f3' }}>
          Dashboard
        </Link>
      </nav>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Features</h2>
        <ul>
          <li>Real-time IoT device monitoring</li>
          <li>Digital twin visualization</li>
          <li>WebXR AR diagnostics</li>
          <li>BSV blockchain data anchoring</li>
          <li>Secure data sharing with consent management</li>
          <li>Job reports and PDF generation</li>
        </ul>
      </section>

      <section>
        <h2>Getting Started</h2>
        <ol>
          <li>Sign up for an account</li>
          <li>Register your IoT devices</li>
          <li>View real-time data on the digital twin</li>
          <li>Grant access to operators as needed</li>
        </ol>
      </section>
    </div>
  );
}
