import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!token || !userId) {
      router.push('/auth/login');
      return;
    }

    setUser({ id: userId, role: userRole });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: '#666' }}>Welcome! Role: {user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Logout
        </button>
      </header>

      <nav style={{ marginBottom: '2rem' }}>
        <Link href="/devices" style={{ marginRight: '1rem', color: '#0070f3' }}>
          My Devices
        </Link>
        <Link href="/job-reports" style={{ marginRight: '1rem', color: '#0070f3' }}>
          Job Reports
        </Link>
      </nav>

      <section>
        <h2>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Register Device</h3>
            <p>Add a new IoT device to your account</p>
            <Link href="/devices" style={{ color: '#0070f3' }}>Go to Devices →</Link>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>View Events</h3>
            <p>Monitor real-time device events</p>
            <Link href="/devices" style={{ color: '#0070f3' }}>View Devices →</Link>
          </div>
          {user?.role === 'OPERATOR' && (
            <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Create Report</h3>
              <p>Generate a job report for a device</p>
              <Link href="/job-reports" style={{ color: '#0070f3' }}>Job Reports →</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
