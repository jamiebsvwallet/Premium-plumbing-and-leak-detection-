import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userStr));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <nav className="nav">
        <Link href="/dashboard"><h1>Premium Plumbing</h1></Link>
        <div>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/devices">Devices</Link>
          <Link href="/job-reports">Job Reports</Link>
          <button className="button button-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <h1>Dashboard</h1>
        
        <div className="card">
          <h2>Welcome, {user?.email}</h2>
          <p>Role: <strong>{user?.role}</strong></p>
        </div>

        <div className="grid">
          <div className="card">
            <h3>🔧 Devices</h3>
            <p>Manage your IoT devices</p>
            <Link href="/devices">
              <button className="button" style={{ marginTop: '10px' }}>
                View Devices
              </button>
            </Link>
          </div>

          <div className="card">
            <h3>📝 Job Reports</h3>
            <p>Create and manage job reports</p>
            <Link href="/job-reports">
              <button className="button" style={{ marginTop: '10px' }}>
                View Reports
              </button>
            </Link>
          </div>

          <div className="card">
            <h3>📊 Analytics</h3>
            <p>View system analytics and insights</p>
            <button className="button" style={{ marginTop: '10px' }} disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
