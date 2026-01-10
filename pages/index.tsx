import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div>
      <nav className="nav">
        <h1>Premium Plumbing & Leak Detection</h1>
        <div>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button
                className="button button-secondary"
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/');
                  setIsLoggedIn(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/signup">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <div className="container">
        <div className="card" style={{ marginTop: '50px', textAlign: 'center' }}>
          <h1>Welcome to Premium Plumbing</h1>
          <p style={{ margin: '20px 0', fontSize: '1.2rem' }}>
            IoT-enabled plumbing monitoring and leak detection with WebXR capabilities
          </p>
          
          <div style={{ marginTop: '40px' }}>
            <h2>Features</h2>
            <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
              <li style={{ margin: '10px 0' }}>📊 Real-time device monitoring</li>
              <li style={{ margin: '10px 0' }}>🔐 Secure authentication and consent management</li>
              <li style={{ margin: '10px 0' }}>⚓ BSV blockchain anchoring for data integrity</li>
              <li style={{ margin: '10px 0' }}>🌐 Digital twin visualization</li>
              <li style={{ margin: '10px 0' }}>📱 AR diagnostics (WebXR ready)</li>
              <li style={{ margin: '10px 0' }}>📝 Job reporting system</li>
            </ul>
          </div>

          {!isLoggedIn && (
            <div style={{ marginTop: '40px' }}>
              <Link href="/auth/signup">
                <button className="button" style={{ marginRight: '10px' }}>
                  Get Started
                </button>
              </Link>
              <Link href="/auth/login">
                <button className="button button-secondary">
                  Sign In
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
