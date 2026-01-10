import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Device {
  id: string;
  deviceId: string;
  name: string;
  type: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch user info
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          return fetchDevices(token);
        } else {
          router.push('/auth/login');
        }
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchDevices = async (token: string) => {
    try {
      const response = await fetch('/api/devices/register', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.devices) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>Dashboard</h1>
          {user && (
            <p>
              {user.email} - <span className="role">{user.role}</span>
            </p>
          )}
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </header>

      <nav className="nav-menu">
        <Link href="/dashboard">Overview</Link>
        <Link href="/dashboard/devices">Devices</Link>
        <Link href="/dashboard/events">Events</Link>
        <Link href="/dashboard/consents">Consents</Link>
        {user?.role === 'operator' && (
          <Link href="/dashboard/job-reports">Job Reports</Link>
        )}
      </nav>

      <main className="main">
        <section className="welcome-section">
          <h2>Welcome to Your Dashboard</h2>
          <p>Manage your IoT leak detection devices and monitor real-time data.</p>
        </section>

        <section className="stats">
          <div className="stat-card">
            <h3>{devices.length}</h3>
            <p>Registered Devices</p>
          </div>
          <div className="stat-card">
            <h3>0</h3>
            <p>Active Alerts</p>
          </div>
          <div className="stat-card">
            <h3>0</h3>
            <p>Events Today</p>
          </div>
        </section>

        {devices.length === 0 ? (
          <div className="empty-state">
            <h3>No devices registered yet</h3>
            <p>Get started by registering your first leak detection device.</p>
            <Link href="/dashboard/devices">
              <button className="btn-primary">Register Device</button>
            </Link>
          </div>
        ) : (
          <section className="devices-section">
            <h2>Your Devices</h2>
            <div className="device-grid">
              {devices.map((device) => (
                <div key={device.id} className="device-card">
                  <h3>{device.name}</h3>
                  <p className="device-id">ID: {device.deviceId}</p>
                  <p className="device-type">Type: {device.type}</p>
                  <div className="device-actions">
                    <Link href={`/digital-twin/${device.deviceId}`}>
                      <button className="btn-small">Digital Twin</button>
                    </Link>
                    <Link href={`/ar-diagnostics/${device.deviceId}`}>
                      <button className="btn-small">AR View</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: #f5f5f5;
        }
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 1.25rem;
        }
        .header {
          background: white;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        h1 {
          margin: 0 0 0.25rem 0;
          color: #333;
        }
        .role {
          text-transform: capitalize;
          color: #667eea;
          font-weight: 600;
        }
        .nav-menu {
          background: white;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          gap: 2rem;
        }
        .nav-menu a {
          color: #666;
          text-decoration: none;
          padding: 0.5rem 0;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
        }
        .nav-menu a:hover {
          color: #667eea;
          border-bottom-color: #667eea;
        }
        .main {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .welcome-section {
          margin-bottom: 2rem;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card h3 {
          font-size: 2.5rem;
          color: #667eea;
          margin: 0 0 0.5rem 0;
        }
        .stat-card p {
          color: #666;
          margin: 0;
        }
        .empty-state {
          background: white;
          padding: 3rem;
          border-radius: 8px;
          text-align: center;
        }
        .devices-section {
          background: white;
          padding: 2rem;
          border-radius: 8px;
        }
        .device-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .device-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fafafa;
        }
        .device-card h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        .device-id,
        .device-type {
          font-size: 0.875rem;
          color: #666;
          margin: 0.25rem 0;
        }
        .device-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .btn-primary,
        .btn-secondary,
        .btn-small {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary {
          background: #667eea;
          color: white;
        }
        .btn-primary:hover {
          background: #5568d3;
        }
        .btn-secondary {
          background: white;
          color: #667eea;
          border: 1px solid #667eea;
        }
        .btn-secondary:hover {
          background: #f5f5f5;
        }
        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          background: #667eea;
          color: white;
        }
        .btn-small:hover {
          background: #5568d3;
        }
      `}</style>
    </div>
  );
}
