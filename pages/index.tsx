import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Premium Plumbing & Leak Detection</h1>
        <p>IoT-powered leak detection with blockchain-anchored data integrity</p>
      </header>

      <main>
        {user ? (
          <div className="welcome">
            <h2>Welcome, {user.email}</h2>
            <p>Role: {user.role}</p>
            <div className="actions">
              <Link href="/dashboard">
                <button className="btn-primary">Go to Dashboard</button>
              </Link>
              <button
                className="btn-secondary"
                onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-options">
            <Link href="/auth/login">
              <button className="btn-primary">Login</button>
            </Link>
            <Link href="/auth/signup">
              <button className="btn-secondary">Sign Up</button>
            </Link>
          </div>
        )}

        <section className="features">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔐 Secure Authentication</h3>
              <p>JWT-based authentication with role-based access control</p>
            </div>
            <div className="feature-card">
              <h3>📡 IoT Device Management</h3>
              <p>Register and monitor leak detection devices in real-time</p>
            </div>
            <div className="feature-card">
              <h3>🔗 Blockchain Anchoring</h3>
              <p>Immutable data integrity using BSV blockchain</p>
            </div>
            <div className="feature-card">
              <h3>🤝 Consent Management</h3>
              <p>Control data sharing with water companies and operators</p>
            </div>
            <div className="feature-card">
              <h3>🎮 Digital Twin</h3>
              <p>3D visualization of device state with real-time updates</p>
            </div>
            <div className="feature-card">
              <h3>🥽 AR Diagnostics</h3>
              <p>Augmented reality overlay for on-site diagnostics</p>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        header {
          text-align: center;
          margin-bottom: 3rem;
        }
        h1 {
          font-size: 2.5rem;
          color: #0070f3;
          margin-bottom: 0.5rem;
        }
        .welcome {
          text-align: center;
          padding: 2rem;
          background: #f5f5f5;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }
        .auth-options {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary {
          background: #0070f3;
          color: white;
        }
        .btn-primary:hover {
          background: #0051cc;
        }
        .btn-secondary {
          background: #fff;
          color: #0070f3;
          border: 1px solid #0070f3;
        }
        .btn-secondary:hover {
          background: #f5f5f5;
        }
        .features {
          margin-top: 3rem;
        }
        .features h2 {
          text-align: center;
          margin-bottom: 2rem;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: white;
        }
        .feature-card h3 {
          margin-bottom: 0.5rem;
          color: #333;
        }
        .feature-card p {
          color: #666;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
